from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import User, Tenant, Bot, ChatLog, ChatHistory
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/tenants")

@router.get("")
def list_tenants(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    tenants = db.query(Tenant).order_by(desc(Tenant.created_at)).all()
    result = []
    for t in tenants:
        owner = db.query(User).filter(User.tenant_id == t.id).order_by(User.created_at).first()
        bots   = db.query(Bot).filter(Bot.tenant_id == t.id).count()
        msgs   = db.query(ChatLog).filter(ChatLog.tenant_id == t.id).count()
        users  = db.query(User).filter(User.tenant_id == t.id).count()
        result.append({
            "id": t.id, "name": t.name,
            "owner_email": owner.email if owner else "—",
            "owner_name":  owner.name  if owner else "—",
            "is_active":   t.is_active,
            "bots": bots, "messages": msgs, "users": users,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        })
    return result

@router.patch("/{tenant_id}/status")
def toggle_tenant(tenant_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not t: raise HTTPException(404, "Tenant not found")
    t.is_active = not t.is_active
    db.commit()
    return {"id": t.id, "is_active": t.is_active}

@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: str, db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not t: raise HTTPException(404, "Tenant not found")
    db.query(ChatHistory).filter(ChatHistory.tenant_id == tenant_id).delete()
    db.query(ChatLog).filter(ChatLog.tenant_id == tenant_id).delete()
    db.query(Bot).filter(Bot.tenant_id == tenant_id).delete()
    db.query(User).filter(User.tenant_id == tenant_id).delete()
    db.delete(t)
    db.commit()
    return {"detail": "Tenant deleted"}
