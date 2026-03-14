from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models import ChatHistory, ChatLog, User
from app.auth_utils import get_current_user

router = APIRouter()

# --- Existing endpoints (kept for backward compatibility) ---

@router.get("/stats")
def get_stats(tenant_id: str, db: Session = Depends(get_db)):
    """Legacy stats endpoint — returns message/conversation/user counts."""
    total_messages = db.query(ChatHistory).filter(ChatHistory.tenant_id == tenant_id).count()
    
    total_conversations = db.query(func.count(func.distinct(ChatHistory.session_id))).filter(
        ChatHistory.tenant_id == tenant_id, 
        ChatHistory.session_id.isnot(None)
    ).scalar() or 0
    
    users_count = db.query(User).filter(User.tenant_id == tenant_id).count()

    return {
        "total_messages": total_messages,
        "total_conversations": total_conversations,
        "users": users_count
    }

@router.get("/questions")
def get_recent_questions(tenant_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Legacy recent questions endpoint."""
    questions = db.query(ChatHistory).filter(
        ChatHistory.tenant_id == tenant_id,
        ChatHistory.sender == "user"
    ).order_by(desc(ChatHistory.created_at)).limit(limit).all()
    
    return [
        {
            "id": q.id,
            "question": q.message,
            "created_at": q.created_at,
            "session_id": q.session_id
        }
        for q in questions
    ]

# --- New endpoints using ChatLog (Task 3c) ---

@router.get("/summary")
def get_summary(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns analytics summary for the current tenant:
    total_messages, total_documents, avg_sources, messages_today.
    """
    tenant_id = current_user["tenant_id"]

    total_messages = db.query(ChatLog).filter(ChatLog.tenant_id == tenant_id).count()

    # Count documents from status files (simple approach)
    import os, json
    status_dir = os.path.join("uploads", "status")
    total_documents = 0
    if os.path.isdir(status_dir):
        for fname in os.listdir(status_dir):
            if fname.endswith(".json"):
                try:
                    with open(os.path.join(status_dir, fname)) as f:
                        data = json.load(f)
                        if data.get("tenant_id") == tenant_id:
                            total_documents += 1
                except Exception:
                    pass

    avg_sources_result = db.query(func.avg(ChatLog.source_count)).filter(
        ChatLog.tenant_id == tenant_id
    ).scalar()
    avg_sources = round(float(avg_sources_result), 2) if avg_sources_result else 0.0

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = db.query(ChatLog).filter(
        ChatLog.tenant_id == tenant_id,
        ChatLog.created_at >= today_start
    ).count()

    return {
        "total_messages": total_messages,
        "total_documents": total_documents,
        "avg_sources": avg_sources,
        "messages_today": messages_today,
    }

@router.get("/recent")
def get_recent(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns the last 20 ChatLog rows for analytics."""
    tenant_id = current_user["tenant_id"]

    logs = db.query(ChatLog).filter(
        ChatLog.tenant_id == tenant_id
    ).order_by(desc(ChatLog.created_at)).limit(20).all()

    return [
        {
            "question": log.question,
            "answer_preview": log.answer[:100] if log.answer else "",
            "source_count": log.source_count,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]

