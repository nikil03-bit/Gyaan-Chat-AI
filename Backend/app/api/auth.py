from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..models import User, Tenant, Bot
from ..auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # tenant name

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    """Register a new user, tenant, and bot."""
    print(f"ENTERED register: {data.email}")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()  # get tenant.id

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
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
        "tenant": {"id": tenant.id, "name": tenant.name},
        "bot": {"id": bot.id, "name": bot.name, "widget_key": bot.widget_key},
    }

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT token."""
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

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the current user's profile information."""
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    return {
        "name": user.name,
        "email": user.email,
        "tenant_name": tenant.name if tenant else "",
    }

@router.patch("/profile")
def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update the current user's profile (name, email, password)."""
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        existing = db.query(User).filter(User.email == data.email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    
    db.commit()
    db.refresh(user)
    return {"name": user.name, "email": user.email}

