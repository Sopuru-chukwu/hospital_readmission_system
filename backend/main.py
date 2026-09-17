import sys
from pathlib import Path

# Add backend directory to path to ensure app module can be found
sys.path.append(str(Path(__file__).resolve().parent))

# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent system to predict diabetic patient readmission rates and risk variables.",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Production Security Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} backend!",
        "docs_url": "/docs",
        "status": "healthy"
    }

# Health check endpoint under API v1
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "environment": settings.ENV,
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
