from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    Boolean,
    DateTime
)
from sqlalchemy.sql import func

from app.database.connection import Base


class QueryRecord(Base):
    __tablename__ = "query_records"

    id = Column(Integer, primary_key=True, index=True)

    query = Column(Text, nullable=False)

    response = Column(Text, nullable=False)

    model_used = Column(String(100), nullable=False)

    cache_hit = Column(Boolean, default=False, nullable=False)

    similarity_score = Column(Float, default=0.0)

    latency_ms = Column(Float, default=0.0)

    estimated_cost = Column(Float, default=0.0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


class CacheRecord(Base):
    __tablename__ = "cache_records"

    id = Column(Integer, primary_key=True, index=True)

    query = Column(Text, nullable=False)

    response = Column(Text, nullable=False)

    embedding_id = Column(Integer, nullable=True)

    model_used = Column(String(100), nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


class ModelUsage(Base):
    __tablename__ = "model_usage"

    id = Column(Integer, primary_key=True, index=True)

    model_name = Column(String(100), nullable=False)

    total_requests = Column(Integer, default=0)

    total_latency_ms = Column(Float, default=0.0)

    estimated_cost = Column(Float, default=0.0)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )