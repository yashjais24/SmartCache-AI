# SmartCache AI

Semantic Caching and Cost-Aware Routing for Large Language Models.

SmartCache AI is a system designed to reduce redundant LLM inference by
using semantic similarity to retrieve previously generated responses.

Instead of generating every response from scratch, SmartCache AI:

- Converts queries into embeddings.
- Searches for semantically similar cached queries.
- Returns cached responses when similarity exceeds a threshold.
- Routes uncached queries to an appropriate local LLM.
- Stores generated responses for future reuse.
- Tracks cache hits, misses, latency and analytics.

## Tech Stack

### Frontend
- React
- Vite
- Axios
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

### AI
- Sentence Transformers
- FAISS
- Ollama
- Llama 3.2

## Architecture

User Query
    ↓
Embedding Generation
    ↓
Semantic Cache Search (FAISS)
    ↓
Similarity Threshold
   / \
 Hit   Miss
 |      |
Cached  Model Router
Response    ↓
         Ollama
            ↓
      Generated Response
            ↓
       Cache Storage
            ↓
         Response

## Features

- Semantic caching
- Similarity-based retrieval
- Local LLM inference
- Intelligent model routing
- Cache hit/miss tracking
- Latency analytics
- Query history
- Cache management dashboard

## Models

- llama3.2:1b
- llama3.2:3b

## Run Locally

### Backend

```bash
cd backend

python -m venv .venv