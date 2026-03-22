from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import User, Tenant, Bot, ChatLog
from app.api.admin.deps import verify_admin
import os, json

router = APIRouter()

def _count_docs(status_filter=None):
    try:
        from app.api.documents import STATUS_DIR
        count = 0
        if os.path.exists(STATUS_DIR):
            for f in os.listdir(STATUS_DIR):
                if f.endswith(".json"):
                    try:
                        data = json.load(open(os.path.join(STATUS_DIR, f)))
                        if status_filter is None or data.get("status") == status_filter:
                            count += 1
                    except Exception:
                        pass
        return count
    except Exception:
        return 0

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    total_tenants  = db.query(Tenant).count()
    active_tenants = db.query(Tenant).filter(Tenant.is_active == True).count()
    total_users    = db.query(User).count()
    total_bots     = db.query(Bot).count()
    total_messages = db.query(ChatLog).count()
    total_docs     = _count_docs()
    failed_docs    = _count_docs("failed")

    recent = db.query(ChatLog).order_by(ChatLog.created_at.desc()).limit(5).all()
    recent_activity = [
        {"tenant_id": r.tenant_id, "question": r.question[:80], "ts": r.created_at.isoformat()}
        for r in recent
    ]
    return {
        "total_tenants":  total_tenants, "active_tenants": active_tenants,
        "total_users":    total_users,    "total_bots":     total_bots,
        "total_messages": total_messages, "total_documents": total_docs,
        "failed_documents": failed_docs,  "recent_activity": recent_activity,
    }
