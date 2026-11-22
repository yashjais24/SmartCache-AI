
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.analytics_service import analytics_service


router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/overview")
def get_overview(db: Session = Depends(get_db)):
    return analytics_service.get_overview(db)


@router.get("/models")
def get_model_usage(db: Session = Depends(get_db)):
    return analytics_service.get_model_usage(db)


@router.get("/history")
def get_history(
    limit: int = 20,
    db: Session = Depends(get_db)
):
    limit = min(max(limit, 1), 100)

    return analytics_service.get_recent_history(
        db,
        limit
    )


@router.delete("/history/{history_id}")
def delete_history_record(
    history_id: int,
    db: Session = Depends(get_db)
):
    deleted = analytics_service.delete_history_record(
        db,
        history_id
    )

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="History record not found"
        )

    return {
        "message": "History record deleted successfully",
        "id": history_id
    }


@router.delete("/history")
def clear_history(db: Session = Depends(get_db)):
    deleted_count = analytics_service.clear_history(db)

    return {
        "message": "History cleared successfully",
        "deleted_count": deleted_count
    }


@router.get("/cache")
def get_cache_stats(db: Session = Depends(get_db)):
    return analytics_service.get_cache_stats(db)
