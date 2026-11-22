import faiss
import numpy as np

from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.models import CacheRecord
from app.services.embedding import embedding_service


class SemanticCache:

    def __init__(self):
        self.index = None
        self.records = []
        self.dimension = 384
        self.initialized = False

    def initialize(self, db: Session):
        """
        Load existing cache records from PostgreSQL
        and rebuild the FAISS index.
        """

        if self.initialized:
            return

        print("Initializing semantic cache...")

        self.index = faiss.IndexFlatIP(self.dimension)

        cached_records = (
            db.query(CacheRecord)
            .order_by(CacheRecord.id.asc())
            .all()
        )

        if cached_records:

            queries = [
                record.query
                for record in cached_records
            ]

            embeddings = embedding_service.generate_embeddings(
                queries
            )

            embeddings = np.asarray(
                embeddings,
                dtype=np.float32
            )

            self.index.add(embeddings)

            # Store plain dictionaries instead of SQLAlchemy objects
            self.records = [
                {
                    "query": record.query,
                    "response": record.response,
                    "model_used": record.model_used
                }
                for record in cached_records
            ]

            print(f"Loaded {len(self.records)} cached records.")

        else:
            print("No existing cache records found.")

        self.initialized = True

    def search(self, query: str):

        if not self.initialized:
            raise RuntimeError(
                "Semantic cache has not been initialized."
            )

        if self.index.ntotal == 0:

            return {
                "hit": False,
                "response": None,
                "similarity": 0.0,
                "matched_query": None,
                "model_used": None
            }

        query_embedding = embedding_service.generate_embedding(
            query
        )

        query_embedding = np.asarray(
            [query_embedding],
            dtype=np.float32
        )

        scores, indices = self.index.search(
            query_embedding,
            1
        )

        similarity = float(scores[0][0])

        index_position = int(indices[0][0])

        if index_position == -1:

            return {
                "hit": False,
                "response": None,
                "similarity": 0.0,
                "matched_query": None,
                "model_used": None
            }

        matched_record = self.records[index_position]

        is_hit = similarity >= settings.CACHE_THRESHOLD

        if is_hit:

            return {
                "hit": True,
                "response": matched_record["response"],
                "similarity": similarity,
                "matched_query": matched_record["query"],
                "model_used": matched_record["model_used"]
            }

        return {
            "hit": False,
            "response": None,
            "similarity": similarity,
            "matched_query": matched_record["query"],
            "model_used": matched_record["model_used"]
        }

    def add(
        self,
        query: str,
        response: str,
        model_used: str,
        db: Session
    ):

        if not self.initialized:
            raise RuntimeError(
                "Semantic cache has not been initialized."
            )

        embedding = embedding_service.generate_embedding(
            query
        )

        embedding = np.asarray(
            [embedding],
            dtype=np.float32
        )

        cache_record = CacheRecord(
            query=query,
            response=response,
            model_used=model_used
        )

        db.add(cache_record)
        db.commit()
        db.refresh(cache_record)

        # Add vector to FAISS
        self.index.add(embedding)

        # Store plain dictionary to maintain alignment
        self.records.append({
            "query": query,
            "response": response,
            "model_used": model_used
        })

        print(f"Cached query: {query[:80]}")

    def clear(self, db: Session):

        db.query(CacheRecord).delete()

        db.commit()

        self.index = faiss.IndexFlatIP(
            self.dimension
        )

        self.records = []

        self.initialized = True

        print("Semantic cache cleared.")


# Global cache instance
semantic_cache = SemanticCache()