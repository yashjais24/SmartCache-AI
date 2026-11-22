from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

from app.database.connection import engine, Base, SessionLocal
from app.database import models

from app.services.semantic_cache import semantic_cache

from app.api.chat import router as chat_router
from app.api.cache import router as cache_router
from app.api.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting SmartCache AI...")

    # Create database tables
    Base.metadata.create_all(bind=engine)

    # Initialize semantic cache from PostgreSQL
    db = SessionLocal()

    try:
        semantic_cache.initialize(db)
    finally:
        db.close()

    print("SmartCache AI started successfully!")

    yield

    print("SmartCache AI shutting down...")


app = FastAPI(
    title="SmartCache AI",
    description="Semantic caching and cost-aware LLM routing system",
    version="1.0.0",
    lifespan=lifespan
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Register routes
app.include_router(chat_router)
app.include_router(cache_router)
app.include_router(analytics_router)


@app.get("/")
def root():

    return {
        "name": "SmartCache AI",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy"
    }