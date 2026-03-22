from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models import User, Tenant, ChatLog
from app.api.admin.deps import verify_admin

router = APIRouter(prefix="/users")

@router.get("")
def list_users(db: Session = Depends(get_db), _: dict = Depends(verify_admin)):
    users = db.query(User).order_by(desc(User.created_at)).all()
    result = []
    for u in users:
        tenant = db.query(Tenant).filter(Tenant.id == u.tenant_id).first()
        msgs   = db.query(ChatLog).filter(ChatLog.tenant_id == u.tenant_id).count()
        result.append({
            "id": u.id, "name": u.name, "email": u.email,
            "is_superadmin": u.is_superadmin,
            "tenant_id": u.tenant_id,
            "tenant_name": tenant.name if tenant else "—",
            "tenant_active": tenant.is_active if tenant else False,
            "messages": msgs,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return result

@router.patch("/{user_id}/role")
def toggle_user_role(user_id: str, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin)):
    if user_id == current_admin.get("sub"):
        raise HTTPException(400, "Cannot change your own role.")
    
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    
    u.is_superadmin = not u.is_superadmin
    db.commit()
    return {"id": u.id, "is_superadmin": u.is_superadmin}

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), current_admin: dict = Depends(verify_admin)):
    if user_id == current_admin.get("sub"):
        raise HTTPException(400, "Cannot delete yourself.")
        
    u = db.query(User).filter(User.id == user_id).first()
    if not u: raise HTTPException(404, "User not found")
    db.delete(u)
    db.commit()
    return {"detail": "User deleted"}
