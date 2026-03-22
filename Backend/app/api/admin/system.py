from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.api.admin.deps import verify_admin
import os, requests as req

router = APIRouter(prefix="/system")

@router.get("/health")
def system_health(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    health = []
    try:
        db.execute(text("SELECT 1"))
        health.append({"service": "PostgreSQL", "status": "Connected", "ok": True})
    except Exception as e:
        health.append({"service": "PostgreSQL", "status": f"Error: {e}", "ok": False})

    health.append({"service": "Backend API", "status": "Healthy", "ok": True})

    try:
        from app.services.vector_store import _client as chroma_client
        chroma_client.heartbeat()
        health.append({"service": "ChromaDB", "status": "Connected", "ok": True})
    except Exception as e:
        health.append({"service": "ChromaDB", "status": f"Error: {e}", "ok": False})

    try:
        OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        r = req.get(f"{OLLAMA_URL}/api/tags", timeout=3)
        health.append({"service": "Ollama", "status": "Running" if r.status_code == 200 else f"HTTP {r.status_code}", "ok": r.status_code == 200})
    except Exception:
        health.append({"service": "Ollama", "status": "Unreachable", "ok": False})

    return health

@router.get("/settings")
def get_settings(_: dict = Depends(verify_admin)):
    return {
        "platform_name": os.getenv("PLATFORM_NAME", "GyaanChat"),
        "environment": os.getenv("APP_ENV", "development"),
        "jwt_expire_minutes": os.getenv("JWT_EXPIRE_MINUTES", "10080"),
        "allowed_origins": os.getenv("ALLOWED_ORIGINS", ""),
    }
