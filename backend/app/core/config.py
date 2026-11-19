import json
import os
from pathlib import Path
from typing import Any, List, Union
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve absolute path to backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

def parse_cors_origins(v: Any) -> List[str]:
    if isinstance(v, list):
        return [str(i).strip() for i in v if str(i).strip()]
    if not isinstance(v, str):
        return ["*"]
    s = v.strip().strip("'").strip('"')
    if not s:
        return ["*"]
    if s.startswith("["):
        try:
            parsed = json.loads(s)
            if isinstance(parsed, list):
                return [str(i).strip() for i in parsed if str(i).strip()]
        except Exception:
            s = s.strip("[]")
    return [i.strip().strip("'").strip('"') for i in s.split(",") if i.strip().strip("'").strip('"')]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_ignore_empty=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "Hospital Readmission Rate Prediction API"
    API_V1_STR: str = "/api/v1"
    ENV: str = "development"
    
    SECRET_KEY: str = "9a15f83ebca592f6b3ad42c75a468d6ff01235b2e987c2b3e8c89f53e6b12a8f"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    DATABASE_URL: str = "postgresql://postgres:postgres_password@localhost:5432/hospital_readmission"

    BACKEND_CORS_ORIGINS: Any = [
        "https://diapredict-ai.netlify.app",
        "http://diapredict-ai.netlify.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @model_validator(mode="after")
    def _normalize_cors_origins(self) -> "Settings":
        self.BACKEND_CORS_ORIGINS = parse_cors_origins(self.BACKEND_CORS_ORIGINS)
        return self

settings = Settings()
