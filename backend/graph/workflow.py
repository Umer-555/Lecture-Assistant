"""
LangGraph Workflow Construction
Defines the graph structure with nodes and edges
"""

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from backend.graph.state import ResearchState
from backend.graph import nodes


def should_continue_after_plan_review(state: ResearchState) -> str:
    """
    Conditional edge: Check if human has provided feedback on plan

    Returns:
        "continue" if feedback received, "wait" if still waiting
    """
    if state.get("status") == "awaiting_human":
        if state.get("current_checkpoint") == "plan_review":
            # Check if we have feedback for this checkpoint
            if state.get("human_feedback"):
                for feedback in state["human_feedback"]:
                    if feedback["checkpoint_name"] == "plan_review":
                        return "continue"
            return "wait"
    return "continue"


def should_continue_after_fact_verification(state: ResearchState) -> str:
    """
    Conditional edge: Check if human has verified facts

    Returns:
        "continue" if verification received, "wait" if still waiting
    """
    if state.get("status") == "awaiting_human":
        if state.get("current_checkpoint") == "fact_verification":
            # Check if we have feedback for this checkpoint
            if state.get("human_feedback"):
                for feedback in state["human_feedback"]:
                    if feedback["checkpoint_name"] == "fact_verification":
                        return "continue"
            return "wait"
    return "continue"


def needs_more_research(state: ResearchState) -> str:
    """
    Conditional edge: Check if more research is needed

    Returns:
        "research" if need more sources, "brief" if ready for final brief
    """
    if state.get("human_feedback"):
        latest_feedback = state["human_feedback"][-1]
        if latest_feedback.get("decision") == "add_more_sources":
            return "research"

    return "brief"


def create_workflow() -> StateGraph:
    """
    Create the LangGraph workflow with all nodes and edges

    Returns:
        Compiled StateGraph ready for execution
    """
    # Initialize workflow
    workflow = StateGraph(ResearchState)

    # Add all nodes
    workflow.add_node("input", nodes.input_node)
    workflow.add_node("search", nodes.search_node)
    workflow.add_node("extract", nodes.extract_node)
    workflow.add_node("prioritize", nodes.prioritize_sources_node)
    workflow.add_node("synthesis", nodes.synthesis_node)
    workflow.add_node("refinement", nodes.refinement_node)
    workflow.add_node("fact_verification", nodes.fact_verification_checkpoint_node)
    workflow.add_node("generate_brief", nodes.final_brief_node)

    # Define edges (workflow sequence)

    # Start: input -> search
    workflow.set_entry_point("input")
    workflow.add_edge("input", "search")

    # Search -> Extract
    workflow.add_edge("search", "extract")

    # Extract -> Prioritize
    workflow.add_edge("extract", "prioritize")

    # Prioritize -> Synthesis
    workflow.add_edge("prioritize", "synthesis")

    # Synthesis creates draft plan and sets checkpoint
    # After synthesis, we wait for human feedback
    # This is handled by the API - graph execution stops here
    workflow.add_edge("synthesis", "refinement")

    # After refinement, go to fact verification checkpoint
    workflow.add_edge("refinement", "fact_verification")

    # After fact verification, generate final brief
    # Again, graph stops and waits for human feedback
    # This is handled by the API
    workflow.add_edge("fact_verification", "generate_brief")

    # Final brief is the end
    workflow.add_edge("generate_brief", END)

    # Compile the graph with checkpointer for HITL support
    # MemorySaver allows the graph to save state and resume from checkpoints
    memory = MemorySaver()
    compiled_graph = workflow.compile(checkpointer=memory)

    return compiled_graph


# Create a global instance
graph = create_workflow()
