import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

from ..core.database import get_db
from ..models.user import User
from ..models.tenant import Tenant
from ..models.bot import Bot
from ..auth_utils import hash_password, verify_password, create_access_token, get_current_user
from ..utils.email import send_verification_email, send_reset_password_email

router = APIRouter(prefix="/auth", tags=["auth"])

class ForgotPasswordIn(BaseModel):
    email: EmailStr

class ResetPasswordIn(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # tenant name

class VerifyEmailIn(BaseModel):
    email: EmailStr
    code: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    """Register a new user, tenant, and bot, and send a verification email."""
    print(f"ENTERED register: {data.email}")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        if not existing.is_verified:
            # If not verified, just regenerate code and resend
            code = str(random.randint(100000, 999999))
            existing.verification_code = code
            db.commit()
            send_verification_email(data.email, code)
            return {"verification_required": True, "message": "Verification code resent"}
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()  # get tenant.id

    code = str(random.randint(100000, 999999))

    user = User(
        tenant_id=tenant.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        is_verified=False,
        verification_code=code
    )
    db.add(user)

    bot = Bot(tenant_id=tenant.id, name=f"{data.website_name} Bot")
    db.add(bot)

    db.commit()
    db.refresh(user)

    # Send OTP
    send_verification_email(data.email, code)

    return {"verification_required": True, "message": "Please check your email for the verification code"}

@router.post("/verify-email")
def verify_email(data: VerifyEmailIn, db: Session = Depends(get_db)):
    """Verify the user's email using the OTP."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")
    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Mark as verified
    user.is_verified = True
    user.verification_code = None
    db.commit()

    # Now automatically log them in just like the old register endpoint
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()
    
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
    
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email first.")

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


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    """Generate a password reset OTP and email it to the user."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Prevent email enumeration by returning a generic success message
        return {"message": "If an account exists, a reset email was sent."}
    
    code = str(random.randint(100000, 999999))
    user.reset_code = code
    user.reset_code_expires = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    send_reset_password_email(user.email, code)
    return {"message": "If an account exists, a reset email was sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)):
    """Verify the OTP and securely update the user's password."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
        
    if not user.reset_code or user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid or missing verification code")
        
    if not user.reset_code_expires or datetime.utcnow() > user.reset_code_expires:
        raise HTTPException(status_code=400, detail="Reset code has expired")
        
    # Valid code - update the password
    user.password_hash = hash_password(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()
    
    return {"message": "Password successfully reset"}

