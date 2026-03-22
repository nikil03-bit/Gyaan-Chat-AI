from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import Bot, Tenant, ChatLog
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/bots")

@router.get("")
def list_bots(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    bots = db.query(Bot).order_by(desc(Bot.created_at)).all()
    result = []
    for b in bots:
        tenant = db.query(Tenant).filter(Tenant.id == b.tenant_id).first()
        msgs   = db.query(ChatLog).filter(ChatLog.bot_id == b.id).count()
        result.append({
            "id": b.id, "name": b.name,
            "tenant_id": b.tenant_id, "tenant_name": tenant.name if tenant else "—",
            "theme_color": b.theme_color, "temperature": b.temperature,
            "widget_key": b.widget_key, "messages": msgs,
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    return result
