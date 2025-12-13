"""
LangGraph Node Implementations
Each node performs a specific task in the research workflow
"""

import json
import time
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

from backend.graph.state import ResearchState, Source, Claim, LogEntry, HumanFeedback, DraftPlan, FinalBrief
from backend.services.search_service import SearchService
from backend.services.llm_service import LLMService
from backend.utils.logger import NodeLogger


# Lazy service initialization
_search_service = None
_llm_service = None


def get_search_service():
    """Lazy initialization of search service"""
    global _search_service
    if _search_service is None:
        _search_service = SearchService()
    return _search_service


def get_llm_service():
    """Lazy initialization of LLM service"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service


def load_prompt(prompt_name: str) -> str:
    """Load prompt template from file"""
    prompt_path = Path(__file__).parent.parent / "prompts" / f"{prompt_name}.txt"
    with open(prompt_path, 'r') as f:
        return f.read()


def input_node(state: ResearchState) -> ResearchState:
    """
    Input Node: Parse and validate user's lecture topic
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    # Validate topic
    topic = state["topic"].strip()
    if not topic:
        state["error"] = "Topic cannot be empty"
        state["status"] = "error"
        return state

    # Log execution
    duration = (time.time() - start_time) * 1000
    logger.log_node_execution(
        node_name="input",
        inputs={"topic": topic},
        output={"validated": True},
        duration_ms=duration
    )

    state["status"] = "running"
    return state


def search_node(state: ResearchState) -> ResearchState:
    """
    Search Node: Generate search queries and perform web searches
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    try:
        # Load prompt and generate search queries
        prompt_template = load_prompt("search")
        prompt = prompt_template.format(topic=state["topic"])

        queries_response = get_llm_service().invoke_factual(prompt)

        # Parse JSON response
        try:
            # Extract JSON from response
            queries_json = queries_response.strip()
            if "```json" in queries_json:
                queries_json = queries_json.split("```json")[1].split("```")[0]
            elif "```" in queries_json:
                queries_json = queries_json.split("```")[1].split("```")[0]

            queries = json.loads(queries_json)
        except json.JSONDecodeError:
            # Fallback: create queries manually
            queries = [
                f"{state['topic']} overview fundamentals",
                f"{state['topic']} recent developments innovations",
                f"{state['topic']} practical applications examples",
                f"{state['topic']} challenges criticisms"
            ]

        # Perform searches
        search_results = get_search_service().multi_search(queries, max_per_query=3)

        # Sort by credibility score
        search_results.sort(key=lambda x: x["credibility_score"], reverse=True)

        # Take top 10 sources
        search_results = search_results[:10]

        # Update state
        state["search_queries"] = queries
        state["search_results"] = search_results

        # Log execution
        duration = (time.time() - start_time) * 1000
        model_info = get_llm_service().get_model_info(creative=False)
        logger.log_node_execution(
            node_name="search",
            inputs={"topic": state["topic"]},
            output={"num_queries": len(queries), "num_results": len(search_results)},
            prompt_used=prompt,
            model=model_info["model"],
            temperature=model_info["temperature"],
            duration_ms=duration
        )

    except Exception as e:
        state["error"] = f"Search failed: {str(e)}"
        state["status"] = "error"

    return state


def extract_node(state: ResearchState) -> ResearchState:
    """
    Extract Node: Extract key claims with citations from search results
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    try:
        # Format sources for prompt
        sources_text = ""
        for idx, source in enumerate(state["search_results"][:10], 1):
            sources_text += f"\n[{idx}] Title: {source['title']}\n"
            sources_text += f"    URL: {source['url']}\n"
            sources_text += f"    Domain: {source['domain']}\n"
            sources_text += f"    Credibility: {source['credibility_score']:.2f}\n"
            sources_text += f"    Content: {source['snippet']}\n"

        # Load prompt and extract claims
        prompt_template = load_prompt("extract")
        prompt = prompt_template.format(
            topic=state["topic"],
            sources=sources_text
        )

        claims_response = get_llm_service().invoke_factual(prompt)

        # Parse JSON response
        try:
            claims_json = claims_response.strip()
            if "```json" in claims_json:
                claims_json = claims_json.split("```json")[1].split("```")[0]
            elif "```" in claims_json:
                claims_json = claims_json.split("```")[1].split("```")[0]

            claims = json.loads(claims_json)

            # Add verified field (will be set during HITL)
            for claim in claims:
                claim["verified"] = None  # Not yet verified

        except json.JSONDecodeError:
            # Fallback: create basic claims from sources
            claims = []
            for source in state["search_results"][:5]:
                claims.append({
                    "text": f"Information from {source['domain']}",
                    "quote": source["snippet"][:100] + "...",
                    "source_url": source["url"],
                    "source_title": source["title"],
                    "confidence": "medium",
                    "verified": None
                })

        # Verify URLs are accessible
        verified_claims = []
        for claim in claims:
            if get_search_service().verify_url(claim["source_url"]):
                verified_claims.append(claim)

        state["extracted_claims"] = verified_claims[:15]  # Keep top 15

        # Log execution
        duration = (time.time() - start_time) * 1000
        model_info = get_llm_service().get_model_info(creative=False)
        logger.log_node_execution(
            node_name="extract",
            inputs={"num_sources": len(state["search_results"])},
            output={"num_claims": len(verified_claims)},
            prompt_used=prompt,
            model=model_info["model"],
            temperature=model_info["temperature"],
            duration_ms=duration
        )

    except Exception as e:
        state["error"] = f"Extraction failed: {str(e)}"
        state["status"] = "error"

    return state


def prioritize_sources_node(state: ResearchState) -> ResearchState:
    """
    Author Prioritization Node: Rank sources by credibility and recency
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    try:
        # Already sorted by credibility in search_node
        # Here we can add additional ranking logic
        prioritized = state["search_results"][:8]  # Top 8 sources

        state["prioritized_sources"] = prioritized

        # Log execution
        duration = (time.time() - start_time) * 1000
        logger.log_node_execution(
            node_name="prioritize_sources",
            inputs={"num_sources": len(state["search_results"])},
            output={"num_prioritized": len(prioritized)},
            duration_ms=duration
        )

    except Exception as e:
        state["error"] = f"Prioritization failed: {str(e)}"
        state["status"] = "error"

    return state


def synthesis_node(state: ResearchState) -> ResearchState:
    """
    Synthesis Node: Create draft lecture plan
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    try:
        # Format claims for prompt
        claims_text = ""
        for idx, claim in enumerate(state["extracted_claims"], 1):
            claims_text += f"{idx}. {claim['text']}\n"
            claims_text += f"   Quote: \"{claim['quote']}\"\n"
            claims_text += f"   Source: {claim['source_title']}\n"
            claims_text += f"   Confidence: {claim['confidence']}\n\n"

        # Format sources
        sources_text = ""
        for source in state["prioritized_sources"]:
            sources_text += f"- {source['title']} ({source['domain']}, score: {source['credibility_score']:.2f})\n"

        # Load prompt and generate plan
        prompt_template = load_prompt("synthesize")
        prompt = prompt_template.format(
            topic=state["topic"],
            claims=claims_text,
            sources=sources_text
        )

        plan_response = get_llm_service().invoke_creative(prompt)

        # Parse JSON response
        try:
            plan_json = plan_response.strip()
            if "```json" in plan_json:
                plan_json = plan_json.split("```json")[1].split("```")[0]
            elif "```" in plan_json:
                plan_json = plan_json.split("```")[1].split("```")[0]

            plan_data = json.loads(plan_json)

        except json.JSONDecodeError:
            # Fallback: create basic slides
            plan_data = {
                "slides": [
                    {
                        "slide_number": 1,
                        "title": "Introduction to " + state["topic"],
                        "content": ["Overview of key concepts", "Why this topic matters", "What we'll cover today"],
                        "speaker_notes": "Start with engaging opening to capture attention",
                        "visual_suggestions": "Title slide with topic name",
                        "citations": [],
                        "duration_min": 3
                    },
                    {
                        "slide_number": 2,
                        "title": "Core Concepts",
                        "content": ["Fundamental principles", "Key terminology", "Basic framework"],
                        "speaker_notes": "Build foundational understanding",
                        "visual_suggestions": "Diagram showing main concepts",
                        "citations": [],
                        "duration_min": 5
                    },
                    {
                        "slide_number": 3,
                        "title": "Summary",
                        "content": ["Key takeaways", "Further resources", "Questions"],
                        "speaker_notes": "Wrap up and engage with audience",
                        "visual_suggestions": "Summary bullet points",
                        "citations": [],
                        "duration_min": 2
                    }
                ],
                "total_slides": 3,
                "total_duration": 10,
                "learning_objectives": ["Understand basic concepts of " + state["topic"]]
            }

        state["draft_plan"] = plan_data

        # Set checkpoint status - CRITICAL: This pauses execution
        state["current_checkpoint"] = "plan_review"
        state["status"] = "awaiting_human"

        # Log execution
        duration = (time.time() - start_time) * 1000
        model_info = get_llm_service().get_model_info(creative=True)
        logger.log_node_execution(
            node_name="synthesis",
            inputs={"num_claims": len(state["extracted_claims"])},
            output={"num_slides": len(plan_data.get("slides", []))},
            prompt_used=prompt,
            model=model_info["model"],
            temperature=model_info["temperature"],
            duration_ms=duration
        )

    except Exception as e:
        state["error"] = f"Synthesis failed: {str(e)}"
        state["status"] = "error"

    return state


def refinement_node(state: ResearchState) -> ResearchState:
    """
    Refinement Node: Adjust plan based on human feedback
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    try:
        # Get the latest human feedback
        if not state.get("human_feedback"):
            state["refined_plan"] = state["draft_plan"]
            return state

        latest_feedback = state["human_feedback"][-1]
        decision = latest_feedback["decision"]
        custom_feedback = latest_feedback.get("custom_feedback", "")

        # If approved, use draft as-is
        if decision == "approve":
            state["refined_plan"] = state["draft_plan"]
            logger.log_node_execution(
                node_name="refinement",
                inputs={"decision": decision},
                output={"action": "approved_as_is"},
                human_decision=decision,
                duration_ms=(time.time() - start_time) * 1000
            )
            return state

        # Otherwise, refine using LLM
        claims_text = "\n".join([f"- {c['text']}" for c in state["extracted_claims"]])

        prompt_template = load_prompt("refine")
        prompt = prompt_template.format(
            topic=state["topic"],
            original_plan=json.dumps(state["draft_plan"], indent=2),
            decision=decision,
            custom_feedback=custom_feedback,
            claims=claims_text
        )

        refined_response = get_llm_service().invoke_creative(prompt)

        # Parse JSON response
        try:
            refined_json = refined_response.strip()
            if "```json" in refined_json:
                refined_json = refined_json.split("```json")[1].split("```")[0]
            elif "```" in refined_json:
                refined_json = refined_json.split("```")[1].split("```")[0]

            refined_plan = json.loads(refined_json)

        except json.JSONDecodeError:
            # Fallback: modify original plan manually based on decision
            refined_plan = state["draft_plan"].copy()
            if decision == "emphasize_practical" and "slides" in refined_plan:
                # Find and expand practical slides by adding an extra example slide
                example_slide = {
                    "slide_number": len(refined_plan["slides"]) + 1,
                    "title": "Practical Example",
                    "content": ["Real-world application", "Step-by-step demonstration", "Key takeaways"],
                    "speaker_notes": "Walk through concrete example",
                    "visual_suggestions": "Diagram or workflow chart",
                    "citations": [],
                    "duration_min": 5
                }
                refined_plan["slides"].append(example_slide)
                refined_plan["total_slides"] = len(refined_plan["slides"])
                refined_plan["total_duration"] = refined_plan.get("total_duration", 90) + 5

        state["refined_plan"] = refined_plan

        # CRITICAL: If plan was modified, we need human to approve the NEW plan
        # Set checkpoint again to show the refined plan
        state["draft_plan"] = refined_plan  # Update draft with refined version
        state["status"] = "awaiting_human"
        state["current_checkpoint"] = "plan_review"

        # Log execution
        duration = (time.time() - start_time) * 1000
        model_info = get_llm_service().get_model_info(creative=True)
        logger.log_node_execution(
            node_name="refinement",
            inputs={"decision": decision},
            output={"refined": True, "requires_reapproval": True},
            prompt_used=prompt if decision != "approve" else None,
            model=model_info["model"],
            temperature=model_info["temperature"],
            human_decision=decision,
            duration_ms=duration
        )

    except Exception as e:
        state["error"] = f"Refinement failed: {str(e)}"
        state["status"] = "error"

    return state


def fact_verification_checkpoint_node(state: ResearchState) -> ResearchState:
    """
    HITL Checkpoint: Present claims for human verification
    """
    logger = NodeLogger(state["research_id"])

    # Set checkpoint status - CRITICAL: This pauses execution
    state["current_checkpoint"] = "fact_verification"
    state["status"] = "awaiting_human"

    logger.log_node_execution(
        node_name="fact_verification_checkpoint",
        inputs={"num_claims": len(state["extracted_claims"])},
        output={"awaiting_verification": True},
        duration_ms=0
    )

    return state


def final_brief_node(state: ResearchState) -> ResearchState:
    """
    Final Brief Node: Generate comprehensive research brief
    """
    start_time = time.time()
    logger = NodeLogger(state["research_id"])

    try:
        # Get verified claims (those approved during HITL)
        verified_claims = []
        if state.get("human_feedback"):
            for feedback in state["human_feedback"]:
                if feedback["checkpoint_name"] == "fact_verification":
                    approved_indices = feedback.get("approved_claims", [])
                    verified_claims = [
                        state["extracted_claims"][i]
                        for i in approved_indices
                        if i < len(state["extracted_claims"])
                    ]
                    break

        # If no verification feedback, use all claims with high confidence
        if not verified_claims:
            verified_claims = [
                c for c in state["extracted_claims"]
                if c["confidence"] in ["high", "medium"]
            ][:6]

        # Format verified claims
        claims_text = ""
        for idx, claim in enumerate(verified_claims, 1):
            claims_text += f"[{idx}] {claim['text']}\n"
            claims_text += f"    Quote: \"{claim['quote']}\"\n"
            claims_text += f"    Source: {claim['source_title']} ({claim['source_url']})\n\n"

        # Format all sources
        sources_text = ""
        for idx, claim in enumerate(verified_claims, 1):
            sources_text += f"[{idx}] {claim['source_title']}: {claim['source_url']}\n"

        # Get final plan
        final_plan = state.get("refined_plan") or state.get("draft_plan")

        # Load prompt and generate brief
        prompt_template = load_prompt("brief")
        prompt = prompt_template.format(
            topic=state["topic"],
            final_plan=json.dumps(final_plan, indent=2),
            verified_claims=claims_text,
            all_sources=sources_text
        )

        brief_response = get_llm_service().invoke_creative(prompt)

        # Parse JSON response
        try:
            brief_json = brief_response.strip()
            if "```json" in brief_json:
                brief_json = brief_json.split("```json")[1].split("```")[0]
            elif "```" in brief_json:
                brief_json = brief_json.split("```")[1].split("```")[0]

            brief_data = json.loads(brief_json)

        except json.JSONDecodeError:
            # Fallback: create basic presentation format from final_plan
            slides_from_plan = final_plan.get("slides", [])

            # Add cover slide
            all_slides = [{
                "slide_number": 1,
                "title": f"Lecture: {state['topic']}",
                "content": [f"Topic: {state['topic']}", "Prepared by: Lecture Assistant", "Date: Today"],
                "speaker_notes": "",
                "visual_suggestions": "Title slide",
                "citations": [],
                "duration_min": 1
            }]

            # Add content slides from plan
            for i, slide in enumerate(slides_from_plan, 2):
                slide_copy = slide.copy()
                slide_copy["slide_number"] = i
                all_slides.append(slide_copy)

            # Add references slide
            all_slides.append({
                "slide_number": len(all_slides) + 1,
                "title": "References",
                "content": [f"[{i+1}] {c['source_title']}" for i, c in enumerate(verified_claims[:6])],
                "speaker_notes": "",
                "visual_suggestions": "Reference list",
                "citations": [],
                "duration_min": 1
            })

            brief_data = {
                "title": f"Lecture: {state['topic']}",
                "author": "Generated by Lecture Assistant",
                "date": "Today",
                "slides": all_slides,
                "references": [
                    {
                        "number": i+1,
                        "title": claim["source_title"],
                        "url": claim["source_url"],
                        "description": claim["text"][:100]
                    }
                    for i, claim in enumerate(verified_claims[:6])
                ],
                "total_slides": len(all_slides)
            }

        # Add appendix with execution logs
        brief_data["appendix"] = {
            "execution_trace": logger.get_logs(),
            "total_sources": len(state.get("search_results", [])),
            "total_claims_extracted": len(state.get("extracted_claims", [])),
            "verified_claims": len(verified_claims)
        }

        state["final_brief"] = brief_data
        state["status"] = "completed"

        # Log execution
        duration = (time.time() - start_time) * 1000
        model_info = get_llm_service().get_model_info(creative=True)
        logger.log_node_execution(
            node_name="final_brief",
            inputs={"num_verified_claims": len(verified_claims)},
            output={"brief_created": True},
            prompt_used=prompt,
            model=model_info["model"],
            temperature=model_info["temperature"],
            duration_ms=duration
        )

    except Exception as e:
        state["error"] = f"Brief generation failed: {str(e)}"
        state["status"] = "error"

    return state
