import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import QueryRecord
from app.services.semantic_cache import semantic_cache
from app.services.model_router import model_router
from app.services.llm_service import llm_service
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    query: str


@router.post("/")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty."
        )

    start_time = time.perf_counter()

    # 1. Search semantic cache
    cache_result = semantic_cache.search(query)

    # 2. CACHE HIT
    if cache_result["hit"]:
        latency_ms = (time.perf_counter() - start_time) * 1000

        model_used = cache_result["model_used"]

        record = QueryRecord(
            query=query,
            response=cache_result["response"],
            model_used=model_used,
            cache_hit=True,
            similarity_score=cache_result["similarity"],
            latency_ms=latency_ms,
            estimated_cost=0.0
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "response": cache_result["response"],
            "cache_hit": True,
            "similarity": cache_result["similarity"],
            "matched_query": cache_result["matched_query"],
            "model_used": model_used,
            "complexity": "cached",
            "latency_ms": round(latency_ms, 2),
            "estimated_cost": 0.0,
            "message": "Response retrieved from semantic cache."
        }

    # 3. CACHE MISS - route query
    routing_info = model_router.get_routing_info(query)

    selected_model = routing_info["model"]
    complexity = routing_info["complexity"]

    # 4. Generate using OpenRouter
    try:
        llm_result = await llm_service.generate(
            prompt=query,
            model=selected_model
        )

        generated_response = llm_result["response"]
        actual_model = llm_result["model"]

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc)
        )

    # 5. Calculate latency and cost
    latency_ms = (time.perf_counter() - start_time) * 1000

    estimated_cost = analytics_service.estimate_cost(
        query,
        generated_response,
        actual_model
    )

    # 6. Store response in semantic cache
    semantic_cache.add(
        query=query,
        response=generated_response,
        model_used=actual_model,
        db=db
    )

    # 7. Save analytics record
    record = QueryRecord(
        query=query,
        response=generated_response,
        model_used=actual_model,
        cache_hit=False,
        similarity_score=cache_result["similarity"],
        latency_ms=latency_ms,
        estimated_cost=estimated_cost
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "response": generated_response,
        "cache_hit": False,
        "similarity": cache_result["similarity"],
        "matched_query": cache_result["matched_query"],
        "model_used": actual_model,
        "complexity": complexity,
        "latency_ms": round(latency_ms, 2),
        "estimated_cost": estimated_cost,
        "message": "Response generated using OpenRouter and cached."
    }