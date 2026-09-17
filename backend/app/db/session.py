import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Attempt primary PostgreSQL connection or fallback to SQLite
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        connect_args=connect_args
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    # Fallback to local SQLite DB if PostgreSQL service is offline during local dev
    sqlite_url = "sqlite:///./hospital_readmission.db"
    print(f"[DB Session] Could not connect to {db_url}. Falling back to local SQLite database: {sqlite_url}")
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
