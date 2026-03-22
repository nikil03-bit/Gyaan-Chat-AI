from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.core.database import get_db
from app.models import ChatLog, Tenant
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/conversations")

@router.get("")
def list_conversations(limit: int = 50, db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    rows = db.query(ChatLog).order_by(desc(ChatLog.created_at)).limit(limit).all()
    result = []
    for r in rows:
        tenant = db.query(Tenant).filter(Tenant.id == r.tenant_id).first()
        result.append({
            "id": r.id, "tenant_id": r.tenant_id,
            "tenant_name": tenant.name if tenant else "—",
            "bot_id": r.bot_id, "source_count": r.source_count,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result

@router.get("/summary")
def conversations_summary(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    rows = (
        db.query(ChatLog.tenant_id, func.count(ChatLog.id).label("count"))
        .group_by(ChatLog.tenant_id)
        .order_by(desc("count"))
        .all()
    )
    result = []
    for tenant_id, count in rows:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        result.append({"tenant_id": tenant_id, "tenant_name": tenant.name if tenant else "—", "messages": count})
    return result
