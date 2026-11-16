import json
import os
from pathlib import Path
from typing import List, Union
from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

# Resolve absolute path to backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

def parse_cors_origins(v: Union[str, List[str]]) -> List[str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",") if i.strip()]
    elif isinstance(v, str) and v.startswith("["):
        return json.loads(v)
    elif isinstance(v, list):
        return v
    raise ValueError(v)

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

    BACKEND_CORS_ORIGINS: Annotated[
        List[str], BeforeValidator(parse_cors_origins)
    ] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]

settings = Settings()
