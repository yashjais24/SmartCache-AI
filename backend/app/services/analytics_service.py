
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.models import QueryRecord, CacheRecord


class AnalyticsService:

    # Current models are free-tier models.
    MODEL_COST_PER_1K = {
        "liquid/lfm-3-1.7b:free": 0.0,
        "inclusionai/ling-3.2-flash:free": 0.0,
    }

    DEFAULT_COST_PER_1K = 0.001

    # --------------------------------------------------
    # COST ESTIMATION
    # --------------------------------------------------

    def estimate_cost(
        self,
        query: str,
        response: str,
        model: str
    ) -> float:

        if ":free" in model.lower():
            return 0.0

        cost_per_1k = self.MODEL_COST_PER_1K.get(
            model,
            self.DEFAULT_COST_PER_1K
        )

        input_tokens = len(query.split()) * 1.33
        output_tokens = len(response.split()) * 1.33

        total_tokens = input_tokens + output_tokens

        cost = (total_tokens / 1000) * cost_per_1k

        return round(cost, 6)

    # --------------------------------------------------
    # OVERVIEW ANALYTICS
    # --------------------------------------------------

    def get_overview(self, db: Session):

        records = db.query(QueryRecord).all()

        total_queries = len(records)

        cache_hits = sum(
            1 for record in records
            if record.cache_hit
        )

        cache_misses = total_queries - cache_hits

        cache_hit_rate = (
            (cache_hits / total_queries) * 100
            if total_queries > 0
            else 0
        )

        total_latency = sum(
            record.latency_ms or 0
            for record in records
        )

        average_latency = (
            total_latency / total_queries
            if total_queries > 0
            else 0
        )

        total_cost = sum(
            record.estimated_cost or 0
            for record in records
        )

        return {
            "total_queries": total_queries,
            "cache_hits": cache_hits,
            "cache_misses": cache_misses,
            "cache_hit_rate": round(cache_hit_rate, 2),
            "average_latency_ms": round(average_latency, 2),
            "total_latency_ms": round(total_latency, 2),
            "total_estimated_cost": round(total_cost, 6),
        }

    # --------------------------------------------------
    # MODEL USAGE
    # --------------------------------------------------

    def get_model_usage(self, db: Session):

        records = db.query(QueryRecord).all()

        usage = {}

        for record in records:

            model = record.model_used

            if model not in usage:
                usage[model] = {
                    "model_name": model,
                    "total_requests": 0,
                    "cache_hits": 0,
                    "cache_misses": 0,
                    "total_latency_ms": 0.0,
                    "estimated_cost": 0.0
                }

            usage[model]["total_requests"] += 1

            if record.cache_hit:
                usage[model]["cache_hits"] += 1
            else:
                usage[model]["cache_misses"] += 1

            usage[model]["total_latency_ms"] += (
                record.latency_ms or 0
            )

            usage[model]["estimated_cost"] += (
                record.estimated_cost or 0
            )

        result = []

        for model_data in usage.values():

            requests = model_data["total_requests"]

            model_data["average_latency_ms"] = round(
                model_data["total_latency_ms"] / requests,
                2
            )

            model_data["total_latency_ms"] = round(
                model_data["total_latency_ms"],
                2
            )

            model_data["estimated_cost"] = round(
                model_data["estimated_cost"],
                6
            )

            result.append(model_data)

        result.sort(
            key=lambda item: item["total_requests"],
            reverse=True
        )

        return result

    # --------------------------------------------------
    # RECENT QUERY HISTORY
    # --------------------------------------------------

    def get_recent_history(
        self,
        db: Session,
        limit: int = 20
    ):

        records = (
            db.query(QueryRecord)
            .order_by(desc(QueryRecord.created_at))
            .limit(limit)
            .all()
        )

        return [
            {
                "id": record.id,
                "query": record.query,
                "response": record.response,
                "model_used": record.model_used,
                "cache_hit": record.cache_hit,
                "similarity_score": record.similarity_score,
                "latency_ms": round(
                    record.latency_ms or 0,
                    2
                ),
                "estimated_cost": round(
                    record.estimated_cost or 0,
                    6
                ),
                "created_at": (
                    record.created_at.isoformat()
                    if record.created_at
                    else None
                )
            }
            for record in records
        ]

        # --------------------------------------------------
    # DELETE QUERY HISTORY
    # --------------------------------------------------

    def delete_history_record(self, db: Session, history_id: int):

        record = (
            db.query(QueryRecord)
            .filter(QueryRecord.id == history_id)
            .first()
        )

        if not record:
            return False

        db.delete(record)
        db.commit()

        return True

    def clear_history(self, db: Session):

        deleted_count = (
            db.query(QueryRecord)
            .delete(synchronize_session=False)
        )

        db.commit()

        return deleted_count

    # --------------------------------------------------
    # CACHE STATISTICS
    # --------------------------------------------------

    def get_cache_stats(self, db: Session):

        cache_records = db.query(CacheRecord).all()
        query_records = db.query(QueryRecord).all()

        total_cached_items = len(cache_records)

        total_queries = len(query_records)

        cache_hits = sum(
            1 for record in query_records
            if record.cache_hit
        )

        cache_misses = total_queries - cache_hits

        hit_rate = (
            (cache_hits / total_queries) * 100
            if total_queries > 0
            else 0
        )

        return {
            "total_cached_items": total_cached_items,
            "total_queries": total_queries,
            "cache_hits": cache_hits,
            "cache_misses": cache_misses,
            "cache_hit_rate": round(hit_rate, 2)
        }


analytics_service = AnalyticsService()
