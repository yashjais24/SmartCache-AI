"""
SmartCache AI — Pydantic Schemas (Request / Response shapes)
--------------------------------------------------------------
Pydantic schemas define what data looks like when it enters or leaves the API.

Why separate schemas from ORM models?
  - ORM models are for the database; schemas are for the API boundary.
  - You can expose fewer fields than are stored (e.g., hide internal IDs).
  - You can have different shapes for input (create) vs output (read).
  - Pydantic validates types automatically — bad input raises HTTP 422.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Chat Schemas ──────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    """What the frontend sends when the user submits a query."""
    query: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="The user's question or prompt",
        examples=["What is machine learning?"],
    )
    # Allow frontend to bypass cache for testing/debugging
    bypass_cache: bool = Field(
        default=False,
        description="If true, skip cache lookup and always call the LLM",
    )


class ChatResponse(BaseModel):
    """What the backend returns after processing a query."""
    query: str
    response: str

    # Did this come from the semantic cache?
    cache_hit: bool
    similarity_score: Optional[float] = None   # Only present on cache hits

    # Which model was used? "cache" if served from cache.
    model_used: str
    query_complexity: str                       # "simple" | "complex" | "cache"

    # How long the full request took
    response_latency_ms: float

    # Rough token / cost estimates
    estimated_tokens: int
    estimated_cost_usd: float

    # DB record ID — useful for debugging and cache management
    record_id: int


# ── Cache Schemas ─────────────────────────────────────────────────────────────

class CacheEntryRead(BaseModel):
    """Serialized view of a single cache entry for the cache management page."""
    id: int
    faiss_id: int
    query_text: str
    cached_response: str
    hit_count: int
    similarity_score: Optional[float] = None
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CacheStats(BaseModel):
    """High-level cache statistics for the dashboard."""
    total_entries: int
    active_entries: int
    total_hits: int
    hit_rate_percent: float


# ── Analytics Schemas ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    """
    All the numbers the analytics dashboard needs in one response.
    Having a single endpoint avoids the frontend making many parallel requests.
    """
    # Totals
    total_queries: int
    total_cache_hits: int
    total_cache_misses: int
    cache_hit_rate_percent: float

    # Latency (in milliseconds)
    avg_response_latency_ms: float
    avg_cache_latency_ms: float          # Average latency for cache hits
    avg_llm_latency_ms: float            # Average latency for cache misses (LLM calls)

    # Cost estimates
    total_estimated_cost_usd: float
    estimated_savings_usd: float         # How much was saved by using cache

    # Model info
    model_usage: dict                    # { model_name: call_count }

    # Recent queries for the history panel
    recent_queries: list


class LatencyDataPoint(BaseModel):
    """One data point for the latency-over-time chart."""
    timestamp: str                       # ISO format date/time string
    latency_ms: float
    cache_hit: bool


class QueryHistoryItem(BaseModel):
    """Compact representation of a past query for the history list."""
    id: int
    query_text: str
    cache_hit: bool
    model_used: Optional[str] = None
    query_complexity: Optional[str] = None
    response_latency_ms: Optional[float] = None
    similarity_score: Optional[float] = None
    estimated_cost_usd: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Health Schemas ─────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Response from the /health endpoint."""
    status: str                          # "healthy" | "degraded"
    database: bool
    ollama: bool
    embedding_model: bool
    faiss_index: bool
    version: str = "1.0.0"
