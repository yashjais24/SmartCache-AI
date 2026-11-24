# SmartCache AI 🚀

### Semantic Caching and Cost-Aware Routing for Large Language Models

SmartCache AI is an intelligent middleware system designed to optimize Large Language Model (LLM) usage through **semantic caching and cost-aware model routing**.

Instead of generating every response from scratch, SmartCache AI identifies semantically similar queries and retrieves previously generated responses whenever possible. For uncached queries, it intelligently selects an appropriate LLM based on query complexity.

The system helps reduce redundant API calls, improve response latency, and optimize LLM resource utilization.

---

## 🌐 Live Demo

- **Frontend:** https://smart-cache-ai.vercel.app/
- **Backend API:** https://smartcache-ai.onrender.com
- **API Documentation:** https://smartcache-ai.onrender.com/docs

---

## ✨ Key Features

- **Semantic Caching:** Identifies similar queries using vector embeddings rather than exact text matching.
- **Similarity-Based Retrieval:** Uses FAISS to retrieve previously cached responses.
- **Intelligent Model Routing:** Selects an appropriate LLM based on query complexity.
- **Multi-Provider LLM Integration:** Supports different providers for lightweight and complex queries.
- **Cache Hit/Miss Tracking:** Monitors cache performance and avoided model calls.
- **Latency Analytics:** Tracks query processing time and response latency.
- **Query History:** Maintains records of processed queries.
- **Analytics Dashboard:** Displays cache statistics, model usage, and performance metrics.
- **Cache Management:** Allows users to view and clear cached entries.
- **Cloud Deployment:** Frontend and backend are deployed independently.

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- HTTPX
- Uvicorn

### AI & Semantic Search
- Cloudflare Workers AI – Embedding Generation
- `@cf/baai/bge-small-en-v1.5` – Embedding Model
- FAISS – Vector Similarity Search
- 384-dimensional Embeddings
- Inner Product Similarity Search (`IndexFlatIP`)

### LLM Providers & Models

| Query Type | Provider | Model |
|---|---|---|
| Simple Queries | OpenRouter | `liquid/lfm-3-1.7b:free` |
| Complex Queries | Groq | `openai/gpt-oss-120b` |

### Deployment & Tools
- Vercel – Frontend Hosting
- Render – Backend Hosting
- PostgreSQL – Persistent Database
- Git & GitHub – Version Control

---

## 🏗️ System Architecture

```text
                  User Query
                      |
                      v
              Embedding Generation
                      |
                      v
              Semantic Cache Search
                   (FAISS)
                      |
                      v
              Similarity Threshold
                  (0.82)
                  /     \
                Hit     Miss
                 |        |
                 v        v
           Cached       Complexity
           Response      Analysis
                           |
                           v
                      Model Router
                       /       \
                  Simple       Complex
                    |             |
                    v             v
                OpenRouter      Groq
                  Liquid       GPT-OSS
                    |             |
                    +------+------+
                           |
                           v
                   Generated Response
                           |
                           v
                     Cache Storage
                           |
                           v
                      PostgreSQL
                           |
                           v
                    Response to User
```

---

## ⚙️ How It Works

### 1. Query Input
The user submits a natural language query through the React frontend.

### 2. Embedding Generation
The backend sends the query to Cloudflare Workers AI to generate a 384-dimensional semantic embedding.

### 3. Semantic Cache Search
FAISS searches for previously stored query embeddings using `IndexFlatIP`.

### 4. Similarity Evaluation
The system compares the highest similarity score against the configured threshold.

- **Cache Hit:** If similarity is greater than or equal to the configured threshold (0.82), the previously generated response is returned.
- **Cache Miss:** If no sufficiently similar query is found, the request proceeds to model routing.

### 5. Intelligent Model Routing
The query is analyzed and routed to an appropriate model.

- Simple queries → Liquid through OpenRouter.
- Complex queries → GPT-OSS through Groq.

### 6. Response Generation
The selected LLM processes the query and generates a response.

### 7. Cache Storage
The generated response and associated query information are stored for future reuse.

### 8. Analytics
The system tracks cache hits, misses, latency, token usage, and model utilization.

---

## 📁 Project Structure

```text
SmartCache-AI/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 🚀 Run Locally

### Prerequisites

Make sure the following are installed:

- Python 3.10+
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yashjais24/SmartCache-AI.git

cd SmartCache-AI
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the environment.

**Windows PowerShell:**

```powershell
.venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

Add the required configuration:

```env
DATABASE_URL=your_postgresql_database_url

# OpenRouter Configuration
LLM_API_KEY=your_openrouter_api_key
LLM_BASE_URL=https://openrouter.ai/api/v1

# Groq Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_LARGE_MODEL=openai/gpt-oss-120b

# Embedding Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Cache Configuration
CACHE_THRESHOLD=0.82
```

Use the exact environment variable names expected by your backend configuration. Keep all API keys private and never commit `.env` files to GitHub.

### 4. Start the Backend

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 5. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

Frontend will be available at:

```text
http://localhost:5173
```

---

## 📊 Performance Metrics

SmartCache AI tracks important metrics to evaluate caching efficiency and LLM performance.

| Metric | Description |
|---|---|
| Cache Hits | Number of queries served from cache |
| Cache Misses | Number of queries requiring model inference |
| Cache Hit Rate | Percentage of queries served from cache |
| Response Latency | Time taken to process a query |
| Model Usage | Distribution of requests across LLMs |
| Token Usage | Input and output tokens consumed |
| Estimated API Cost | Estimated inference expenditure |

### Cache Hit Rate

```text
Cache Hit Rate = (Cache Hits / Total Queries) × 100
```

### Cache Miss Rate

```text
Cache Miss Rate = (Cache Misses / Total Queries) × 100
```

---

## 🔮 Future Enhancements

- Adaptive similarity threshold optimization.
- Multi-level semantic caching.
- Cache expiration and automatic eviction policies.
- Advanced context-aware model routing.
- Dynamic cost and latency-based model selection.
- Response quality evaluation.
- User feedback-based cache validation.
- Distributed caching support.
- Additional LLM provider integrations.

---

## 🔐 Security

- API credentials are stored in backend environment variables.
- Provider API keys are never exposed in frontend code.
- Database credentials are maintained outside the source code.
- HTTPS is used for deployed application communication.

---

## 👨‍💻 Author

**Yash Jaiswal**

B.Tech | Computer Science and Engineering

GitHub: https://github.com/yashjais24

---

## 📄 License

This project is developed for educational and demonstration purposes.

