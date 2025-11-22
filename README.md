# Lecture Assistant Agent

AI-powered research assistant for lecture preparation using LangGraph with Human-in-the-Loop (HITL) capabilities.

## Overview

This full-stack application helps educators prepare comprehensive lecture materials by:
1. **Researching** topics using web search (Tavily API)
2. **Extracting** key claims with citations from credible sources
3. **Planning** lecture structure with AI assistance
4. **Human Review** at critical checkpoints (HITL)
5. **Generating** final research briefs with verified citations

## Architecture

- **Backend**: Python/FastAPI with LangGraph orchestration
- **Frontend**: Next.js/React with TypeScript
- **LLM**: Anthropic Claude (Sonnet 4)
- **Search**: Tavily API
- **Workflow**: LangGraph state machine with HITL checkpoints

## Project Structure

```
project/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── graph/
│   │   ├── state.py           # LangGraph state schema
│   │   ├── nodes.py           # Node implementations
│   │   └── workflow.py        # Graph construction
│   ├── prompts/               # LLM prompt templates
│   ├── services/
│   │   ├── search_service.py  # Tavily search integration
│   │   └── llm_service.py     # Claude LLM integration
│   └── utils/
│       └── logger.py          # Execution logging
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx       # Main page component
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/        # React components
│   │   └── services/
│   │       └── api.ts         # API client
│   └── package.json
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd Lecture-Assistant
```

### 2. Backend Setup

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
TAVILY_API_KEY=your_tavily_key_here
```

**Getting API Keys:**

- **Anthropic API Key**: Sign up at https://console.anthropic.com/
- **Tavily API Key**: Sign up at https://tavily.com/

### 3. Frontend Setup

#### Install Node Dependencies

```bash
cd frontend
npm install
```

#### Configure Frontend Environment

```bash
cp .env.local.example .env.local
```

The default configuration points to `http://localhost:8000` for the backend.

## Running the Application

### Start Backend (Terminal 1)

From the **project root** directory:

```bash
uvicorn backend.main:app --reload
```

The backend will start at `http://localhost:8000`

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Start Frontend (Terminal 2)

From the **frontend** directory:

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:3000`

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### Access Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Usage Guide

### 1. Enter Research Topic

On the main page, enter a lecture topic in the input field. Examples:
- "Model Context Protocol and Anthropic's innovations"
- "Introduction to Quantum Computing for CS Students"
- "Ethical Implications of Large Language Models"

Click **"Start Research"**

### 2. Research Phase (Automated)

The system will:
- Generate 3-5 search queries
- Perform web searches using Tavily
- Extract 8-15 key claims with citations
- Prioritize sources by credibility
- Create draft lecture plan

This takes approximately **30-60 seconds**.

### 3. HITL Checkpoint 1: Plan Review

The workflow **pauses** and presents the draft lecture plan for your review.

**Options:**
- ✓ **Approve** - Continue with current plan
- **+ Add More Sources** - Trigger additional research
- **🛠️ Emphasize Practical Examples** - Expand hands-on content
- **⚖️ Focus on Ethics** - Add ethics/societal implications
- **🔄 Rework Completely** - Generate new structure

You can also provide custom feedback in the text area.

**Click "Submit Decision"** to continue.

### 4. Processing (Automated)

The system refines the plan based on your feedback.

### 5. HITL Checkpoint 2: Fact Verification

The workflow **pauses** again and shows 3-6 top extracted claims.

For each claim, you can:
- **✓ Verify** - Include in final brief
- **✗ Reject** - Exclude from final brief

Each claim shows:
- The claim text
- Verbatim quote from source
- Source title and URL (clickable)
- Confidence level (high/medium/low)

**Click "Continue with X Verified Claims"** to proceed.

### 6. Final Brief Generation

The system generates a comprehensive research brief with:

- **Title** - Clear, descriptive lecture title
- **Introduction** - 2-3 paragraphs on context and relevance
- **Summary** - Executive summary of key points
- **Key Findings** - 3-6 bullet points with inline citations [1], [2]
- **Risks/Unknowns** - 3 potential challenges or gaps
- **Further Reading** - 5-8 curated sources with working URLs

### 7. Download and Use

- **📥 Download Brief** - Save as text file
- **🔄 New Research** - Start another research session

## API Documentation

### Endpoints

#### `POST /api/start-research`

Start a new research session.

**Request:**
```json
{
  "topic": "Model Context Protocol and Anthropic's innovations"
}
```

**Response:**
```json
{
  "research_id": "research_abc123",
  "status": "running",
  "message": "Research started successfully"
}
```

#### `GET /api/status/{research_id}`

Get current status of research session.

**Response:**
```json
{
  "research_id": "research_abc123",
  "status": "awaiting_human",
  "current_checkpoint": "plan_review",
  "error": null
}
```

#### `GET /api/checkpoint/{research_id}`

Get checkpoint data for human review.

**Response:**
```json
{
  "research_id": "research_abc123",
  "checkpoint_id": "cp_xyz789",
  "checkpoint_name": "plan_review",
  "data": {
    "draft_plan": {...},
    "topic": "...",
    "options": [...]
  },
  "status": "awaiting_human"
}
```

#### `POST /api/checkpoint/{research_id}/respond`

Submit human feedback to checkpoint.

**Request:**
```json
{
  "decision": "emphasize_practical",
  "custom_feedback": "Add more code examples",
  "approved_claims": [0, 1, 2, 3],
  "rejected_claims": [4]
}
```

#### `GET /api/brief/{research_id}`

Get final research brief (only when completed).

**Response:**
```json
{
  "research_id": "research_abc123",
  "brief": {
    "title": "...",
    "introduction": "...",
    "key_findings": [...],
    ...
  },
  "status": "completed"
}
```

#### `GET /api/logs/{research_id}`

Get execution logs for debugging and transparency.

## LangGraph Workflow

The workflow consists of these nodes:

1. **Input Node** - Validate topic
2. **Search Node** - Generate queries and search web
3. **Extract Node** - Extract claims with citations
4. **Prioritize Node** - Rank sources by credibility
5. **Synthesis Node** - Create draft plan → **CHECKPOINT**
6. **Refinement Node** - Adjust based on feedback
7. **Fact Verification Node** - Present claims → **CHECKPOINT**
8. **Final Brief Node** - Generate comprehensive brief

### HITL Implementation

**Critical Feature:** Checkpoints actually pause execution.

When a node sets `state["status"] = "awaiting_human"`:
1. Graph execution **stops**
2. State is saved in memory
3. Frontend polls and detects checkpoint
4. User sees checkpoint UI
5. User makes decision
6. Frontend POSTs to `/api/checkpoint/{id}/respond`
7. Backend updates state with feedback
8. Graph execution **resumes**

## Logging

All node executions are logged to `logs/{research_id}.json`:

```json
{
  "node_name": "synthesis",
  "timestamp": "2024-11-22T10:30:00Z",
  "inputs": {...},
  "prompt_used": "...",
  "model": "claude-sonnet-4-20250514",
  "temperature": 0.7,
  "output": {...},
  "human_decision": "emphasize_practical",
  "duration_ms": 1234.5
}
```

Access logs via:
- API: `GET /api/logs/{research_id}`
- File: `logs/{research_id}.json`

## Citation Verification

The system ensures citation integrity:

1. **URL Verification** - All source URLs are checked for accessibility
2. **Real Citations** - No invented sources
3. **Inline Format** - Claims use [1], [2] notation
4. **Further Reading** - All citations map to sources with working URLs

## Error Handling

The application handles:
- API rate limits (Tavily, Anthropic)
- Network failures
- Invalid checkpoint IDs
- LLM parsing errors
- Empty search results

Errors are displayed to users with clear messages.

## Troubleshooting

### Backend won't start

**Error:** `ANTHROPIC_API_KEY not found`

**Solution:** Ensure `.env` file exists with valid API keys

### Frontend can't connect to backend

**Error:** Network error in browser console

**Solution:**
1. Verify backend is running on port 8000
2. Check CORS settings in `backend/main.py`
3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### No search results

**Error:** `Search failed`

**Solution:**
1. Verify Tavily API key is valid
2. Check internet connection
3. Try a different topic

### Checkpoint not appearing

**Issue:** Workflow completes without human review

**Solution:**
1. Check browser console for errors
2. Verify polling is working (check Network tab)
3. Ensure backend status endpoint returns correctly

## Development

### Running Tests

```bash
# Backend tests (if implemented)
pytest backend/

# Frontend tests
cd frontend
npm test
```

### Adding New Nodes

1. Define node function in `backend/graph/nodes.py`
2. Add node to workflow in `backend/graph/workflow.py`
3. Update state schema if needed in `backend/graph/state.py`
4. Create prompt template in `backend/prompts/` if using LLM

### Adding New Checkpoints

1. Set `state["current_checkpoint"] = "checkpoint_name"` in node
2. Set `state["status"] = "awaiting_human"`
3. Add checkpoint handling in `backend/main.py` `get_checkpoint()`
4. Create React component in `frontend/src/components/`
5. Update main page component to handle new checkpoint

## Technologies Used

- **LangGraph** - Workflow orchestration
- **FastAPI** - Backend API framework
- **Next.js** - React framework
- **Anthropic Claude** - LLM for analysis and generation
- **Tavily** - Web search API
- **TypeScript** - Type-safe frontend development

## License

[Your License Here]

## Contributing

[Contribution Guidelines]

## Support

For issues or questions:
- GitHub Issues: [Your repo URL]
- Email: [Your email]

## Acknowledgments

Built as part of a LangGraph + HITL learning project.

---

**Happy Researching! 🎓📚**
