# Quick Start Guide

Get the Lecture Assistant running in 5 minutes!

## Prerequisites

- Python 3.9+ installed
- Node.js 18+ installed
- Terminal access

## Step 1: Get API Keys (2 minutes)

### Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy the key (starts with `sk-ant-`)

### Tavily API Key
1. Go to https://tavily.com/
2. Sign up for free
3. Get your API key from dashboard
4. Copy the key (starts with `tvly-`)

## Step 2: Configure Environment (1 minute)

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your favorite editor
```

Replace the placeholders:
```env
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE
TAVILY_API_KEY=tvly-YOUR_ACTUAL_KEY_HERE
```

## Step 3: Test Configuration (30 seconds)

```bash
python test_api_keys.py
```

You should see:
```
✓ ANTHROPIC_API_KEY found and appears valid
✓ TAVILY_API_KEY found and appears valid
✓ All API keys configured correctly!
```

## Step 4: Install Backend Dependencies (1 minute)

```bash
pip install -r requirements.txt
```

## Step 5: Install Frontend Dependencies (1 minute)

```bash
cd frontend
npm install
cd ..
```

## Step 6: Start the Application

### Terminal 1 - Backend

```bash
uvicorn backend.main:app --reload
```

Wait for:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Wait for:
```
ready - started server on 0.0.0.0:3000
```

## Step 7: Use the Application

1. Open browser: http://localhost:3000
2. Enter a lecture topic (e.g., "Model Context Protocol and Anthropic's innovations")
3. Click "Start Research"
4. Wait ~30-60 seconds for research phase
5. **CHECKPOINT 1**: Review the draft plan and choose an option
6. **CHECKPOINT 2**: Verify the extracted claims
7. Download your final research brief!

## Troubleshooting

### "ANTHROPIC_API_KEY not found"
- Make sure `.env` file exists in project root
- Check that API key starts with `sk-ant-`

### "TAVILY_API_KEY not found"
- Make sure `.env` file exists in project root
- Check that API key starts with `tvly-`

### Backend won't start
- Verify Python 3.9+ is installed: `python --version`
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend won't start
- Verify Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Can't connect to backend
- Make sure backend is running on port 8000
- Check `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Example Topics to Try

- "Model Context Protocol and Anthropic's innovations"
- "Introduction to Quantum Computing for CS Students"
- "Ethical Implications of Large Language Models"
- "Modern Web Security Best Practices"
- "Climate Change Adaptation Strategies"

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Check the execution logs in `logs/` directory
- Customize prompts in `backend/prompts/`

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify API keys with `python test_api_keys.py`
3. Check terminal logs for error messages
4. Consult the full README.md

---

**Happy Researching! 🎓**
