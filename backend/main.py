"""
FastAPI Application for Lecture Assistant
Handles API endpoints and manages HITL checkpoints
"""

import os
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.graph.state import ResearchState, create_initial_state, HumanFeedback
from backend.graph.workflow import graph
from backend.utils.logger import NodeLogger

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Lecture Assistant API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for research sessions
# In production, use Redis or a database
research_sessions: Dict[str, ResearchState] = {}
checkpoint_queue: Dict[str, str] = {}  # checkpoint_id -> research_id


# Pydantic models for API
class StartResearchRequest(BaseModel):
    topic: str


class StartResearchResponse(BaseModel):
    research_id: str
    status: str
    message: str


class CheckpointResponse(BaseModel):
    research_id: str
    checkpoint_id: str
    checkpoint_name: str
    data: Dict[str, Any]
    status: str


class CheckpointDecisionRequest(BaseModel):
    decision: str
    custom_feedback: Optional[str] = None
    approved_claims: Optional[List[int]] = None
    rejected_claims: Optional[List[int]] = None


class BriefResponse(BaseModel):
    research_id: str
    brief: Dict[str, Any]
    status: str


class StatusResponse(BaseModel):
    research_id: str
    status: str
    current_checkpoint: Optional[str]
    error: Optional[str]


def run_graph_until_checkpoint(research_id: str):
    """
    Run the graph until it hits a checkpoint or completes

    This function executes the graph step by step and stops when
    status becomes "awaiting_human"
    """
    state = research_sessions.get(research_id)
    if not state:
        return

    try:
        # Stream through the graph node by node
        # This allows us to check for checkpoints after each node
        for event in graph.stream(state):
            # Update state after each node execution
            if event:
                # Extract the state from the event
                for node_name, node_output in event.items():
                    # Update our stored state
                    research_sessions[research_id] = node_output

                    # Check if we hit a checkpoint
                    if node_output.get("status") == "awaiting_human":
                        checkpoint_id = f"cp_{uuid.uuid4().hex[:12]}"
                        checkpoint_queue[checkpoint_id] = research_id
                        node_output["_checkpoint_id"] = checkpoint_id
                        research_sessions[research_id] = node_output
                        # Stop execution - wait for human input
                        return

        # If we get here, graph completed without checkpoints
        # Get final state
        final_state = research_sessions.get(research_id)
        if final_state and final_state.get("status") != "awaiting_human":
            # Mark as completed if no error
            if not final_state.get("error"):
                final_state["status"] = "completed"
                research_sessions[research_id] = final_state

    except Exception as e:
        state["status"] = "error"
        state["error"] = str(e)
        research_sessions[research_id] = state


@app.get("/")
def read_root():
    """Health check endpoint"""
    return {
        "service": "Lecture Assistant API",
        "status": "running",
        "version": "1.0.0"
    }


@app.post("/api/start-research", response_model=StartResearchResponse)
def start_research(request: StartResearchRequest, background_tasks: BackgroundTasks):
    """
    Start a new research session

    Creates initial state and begins graph execution in background
    """
    # Generate unique research ID
    research_id = f"research_{uuid.uuid4().hex[:12]}"

    # Create initial state
    initial_state = create_initial_state(topic=request.topic, research_id=research_id)

    # Store in sessions
    research_sessions[research_id] = initial_state

    # Run graph in background until first checkpoint
    background_tasks.add_task(run_graph_until_checkpoint, research_id)

    return StartResearchResponse(
        research_id=research_id,
        status="running",
        message="Research started successfully"
    )


@app.get("/api/status/{research_id}", response_model=StatusResponse)
def get_status(research_id: str):
    """
    Get the current status of a research session
    """
    state = research_sessions.get(research_id)
    if not state:
        raise HTTPException(status_code=404, detail="Research session not found")

    return StatusResponse(
        research_id=research_id,
        status=state.get("status", "unknown"),
        current_checkpoint=state.get("current_checkpoint"),
        error=state.get("error")
    )


@app.get("/api/checkpoint/{research_id}", response_model=CheckpointResponse)
def get_checkpoint(research_id: str):
    """
    Get checkpoint data for human review

    Returns the current checkpoint information that needs human input
    """
    state = research_sessions.get(research_id)
    if not state:
        raise HTTPException(status_code=404, detail="Research session not found")

    if state.get("status") != "awaiting_human":
        raise HTTPException(status_code=400, detail="No active checkpoint")

    checkpoint_name = state.get("current_checkpoint")
    checkpoint_id = state.get("_checkpoint_id", f"cp_{uuid.uuid4().hex[:12]}")

    # Prepare checkpoint data based on type
    checkpoint_data = {}

    if checkpoint_name == "plan_review":
        # Return draft plan for review
        checkpoint_data = {
            "draft_plan": state.get("draft_plan"),
            "topic": state.get("topic"),
            "num_sources": len(state.get("search_results", [])),
            "options": [
                "approve",
                "add_more_sources",
                "emphasize_practical",
                "focus_ethics",
                "rework_completely"
            ]
        }

    elif checkpoint_name == "fact_verification":
        # Return top claims for verification
        all_claims = state.get("extracted_claims", [])
        # Show top 6 claims to user
        top_claims = all_claims[:6]
        checkpoint_data = {
            "claims": top_claims,
            "topic": state.get("topic"),
            "total_claims": len(all_claims)
        }

    return CheckpointResponse(
        research_id=research_id,
        checkpoint_id=checkpoint_id,
        checkpoint_name=checkpoint_name,
        data=checkpoint_data,
        status="awaiting_human"
    )


@app.post("/api/checkpoint/{research_id}/respond")
def respond_to_checkpoint(
    research_id: str,
    response: CheckpointDecisionRequest,
    background_tasks: BackgroundTasks
):
    """
    Submit human feedback to a checkpoint and resume graph execution

    This is the CRITICAL endpoint that allows HITL to work properly
    """
    state = research_sessions.get(research_id)
    if not state:
        raise HTTPException(status_code=404, detail="Research session not found")

    if state.get("status") != "awaiting_human":
        raise HTTPException(status_code=400, detail="No active checkpoint")

    checkpoint_name = state.get("current_checkpoint")

    # Create feedback record
    feedback = HumanFeedback(
        checkpoint_name=checkpoint_name,
        decision=response.decision,
        custom_feedback=response.custom_feedback,
        timestamp=datetime.utcnow().isoformat(),
        approved_claims=response.approved_claims,
        rejected_claims=response.rejected_claims
    )

    # Add feedback to state
    if not state.get("human_feedback"):
        state["human_feedback"] = []
    state["human_feedback"].append(feedback)

    # Update verified status for claims if this is fact verification
    if checkpoint_name == "fact_verification" and response.approved_claims is not None:
        for i, claim in enumerate(state.get("extracted_claims", [])):
            if i in response.approved_claims:
                claim["verified"] = True
            elif i in (response.rejected_claims or []):
                claim["verified"] = False

    # Clear checkpoint and resume execution
    state["current_checkpoint"] = None
    state["status"] = "running"
    state.pop("_checkpoint_id", None)

    # Update session
    research_sessions[research_id] = state

    # Continue graph execution in background
    background_tasks.add_task(run_graph_until_checkpoint, research_id)

    return {
        "message": "Feedback received, resuming execution",
        "research_id": research_id,
        "status": "running"
    }


@app.get("/api/brief/{research_id}", response_model=BriefResponse)
def get_brief(research_id: str):
    """
    Get the final research brief

    Only available after graph execution completes
    """
    state = research_sessions.get(research_id)
    if not state:
        raise HTTPException(status_code=404, detail="Research session not found")

    if state.get("status") != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Brief not ready yet. Current status: {state.get('status')}"
        )

    brief = state.get("final_brief")
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")

    return BriefResponse(
        research_id=research_id,
        brief=brief,
        status="completed"
    )


@app.get("/api/logs/{research_id}")
def get_logs(research_id: str):
    """
    Get execution logs for a research session
    """
    state = research_sessions.get(research_id)
    if not state:
        raise HTTPException(status_code=404, detail="Research session not found")

    # Also load from file
    file_logs = NodeLogger.load_logs(research_id)

    return {
        "research_id": research_id,
        "logs": file_logs or state.get("logs", [])
    }


@app.delete("/api/session/{research_id}")
def delete_session(research_id: str):
    """
    Delete a research session from memory
    """
    if research_id in research_sessions:
        del research_sessions[research_id]
        return {"message": "Session deleted", "research_id": research_id}
    else:
        raise HTTPException(status_code=404, detail="Research session not found")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
