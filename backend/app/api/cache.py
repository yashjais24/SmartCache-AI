
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.connection import get_db
from app.database.models import CacheRecord
from app.services.semantic_cache import semantic_cache
from app.services.analytics_service import analytics_service


router = APIRouter(
    prefix="/api/cache",
    tags=["Cache"]
)


@router.get("/")
def get_cache(
    limit: int = 100,
    db: Session = Depends(get_db)
):

    limit = min(max(limit, 1), 500)

    records = (
        db.query(CacheRecord)
        .order_by(desc(CacheRecord.created_at))
        .limit(limit)
        .all()
    )

    return [
        {
            "id": record.id,
            "query": record.query,
            "response": record.response,
            "model_used": record.model_used,
            "created_at": (
                record.created_at.isoformat()
                if record.created_at
                else None
            )
        }
        for record in records
    ]


@router.get("/stats")
def get_cache_stats(db: Session = Depends(get_db)):
    return analytics_service.get_cache_stats(db)


@router.delete("/")
def clear_cache(db: Session = Depends(get_db)):

    semantic_cache.clear(db)

    return {
        "success": True,
        "message": "Semantic cache cleared successfully."
    }
