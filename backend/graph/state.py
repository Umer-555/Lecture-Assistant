"""
LangGraph State Schema for Lecture Assistant
Defines the state that flows through the graph nodes
"""

from typing import TypedDict, List, Optional, Dict, Any
from datetime import datetime


class Source(TypedDict):
    """Represents a single source/citation"""
    url: str
    title: str
    author: Optional[str]
    date: Optional[str]
    domain: str
    snippet: str
    credibility_score: float


class Claim(TypedDict):
    """Represents an extracted claim with citation"""
    text: str
    quote: str  # Verbatim quote from source
    source_url: str
    source_title: str
    confidence: str  # high/medium/low
    verified: Optional[bool]  # Set during HITL verification


class LogEntry(TypedDict):
    """Log entry for each node execution"""
    node_name: str
    timestamp: str
    inputs: Dict[str, Any]
    prompt_used: Optional[str]
    model: str
    temperature: float
    output: Any
    human_decision: Optional[str]
    duration_ms: Optional[float]


class HumanFeedback(TypedDict):
    """Feedback from human at checkpoints"""
    checkpoint_name: str
    decision: str
    custom_feedback: Optional[str]
    timestamp: str
    approved_claims: Optional[List[int]]  # Indices of approved claims
    rejected_claims: Optional[List[int]]  # Indices of rejected claims


class DraftPlan(TypedDict):
    """Draft lecture plan structure"""
    sections: List[Dict[str, Any]]  # [{title, duration_min, topics}]
    total_duration: int
    focus_areas: List[str]


class FinalBrief(TypedDict):
    """Final research brief structure"""
    title: str
    introduction: str
    summary: str
    key_findings: List[str]  # With inline citations [1], [2]
    risks_unknowns: List[str]
    further_reading: List[Dict[str, str]]  # [{title, url, description}]
    appendix: Optional[Dict[str, Any]]


class ResearchState(TypedDict):
    """Main state object that flows through LangGraph"""
    # Input
    topic: str
    research_id: str

    # Search phase
    search_queries: Optional[List[str]]
    search_results: Optional[List[Source]]

    # Extraction phase
    extracted_claims: Optional[List[Claim]]
    prioritized_sources: Optional[List[Source]]

    # Planning phase
    draft_plan: Optional[DraftPlan]

    # HITL phase
    human_feedback: Optional[List[HumanFeedback]]
    current_checkpoint: Optional[str]

    # Refinement phase
    refined_plan: Optional[DraftPlan]

    # Final output
    final_brief: Optional[FinalBrief]

    # Logging and metadata
    logs: List[LogEntry]
    created_at: str
    status: str  # running/awaiting_human/completed/error
    error: Optional[str]


def create_initial_state(topic: str, research_id: str) -> ResearchState:
    """Create initial state for a new research session"""
    return ResearchState(
        topic=topic,
        research_id=research_id,
        search_queries=None,
        search_results=None,
        extracted_claims=None,
        prioritized_sources=None,
        draft_plan=None,
        human_feedback=None,
        current_checkpoint=None,
        refined_plan=None,
        final_brief=None,
        logs=[],
        created_at=datetime.utcnow().isoformat(),
        status="running",
        error=None
    )
