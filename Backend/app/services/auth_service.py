from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.tenant import Tenant
from app.models.bot import Bot
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterIn, LoginIn

def register_user(data: RegisterIn, db: Session):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)

    bot = Bot(tenant_id=tenant.id, name=f"{data.website_name} Bot")
    db.add(bot)

    db.commit()
    db.refresh(user)
    db.refresh(bot)

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
        "tenant": {"id": tenant.id, "name": tenant.name},
        "bot": {"id": bot.id, "name": bot.name, "widget_key": bot.widget_key},
    }

def login_user(data: LoginIn, db: Session):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if tenant and not tenant.is_active:
        raise HTTPException(status_code=403, detail="Tenant is suspended")

    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()

    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id, "is_superadmin": user.is_superadmin})
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
        "tenant": {"id": user.tenant_id, "name": tenant.name if tenant else ""},
        "bot": {"id": bot.id if bot else None, "name": bot.name if bot else None, "widget_key": bot.widget_key if bot else None},
    }
