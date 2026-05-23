import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional

# Local imports for database, models, and utility functions
from ..core.database import get_db
from ..models.user import User
from ..models.tenant import Tenant
from ..models.bot import Bot
from ..auth_utils import hash_password, verify_password, create_access_token, get_current_user
from ..utils.email import send_verification_email, send_reset_password_email

# Define the authentication router, all routes will start with /auth
router = APIRouter(prefix="/auth", tags=["auth"])

# --- Pydantic Schemas for Request Validation ---

class ForgotPasswordIn(BaseModel):
    # Validates that the input is a properly formatted email string
    email: EmailStr

class ResetPasswordIn(BaseModel):
    email: EmailStr
    code: str
    new_password: str

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # Used to create the associated tenant/workspace name

class VerifyEmailIn(BaseModel):
    email: EmailStr
    code: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    # Optional fields allow partial updates of the user profile
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# --- API Endpoints ---

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    """
    Register a new user, create their tenant (workspace), set up a default bot,
    and trigger a verification email containing a One-Time Password (OTP).
    """
    print(f"ENTERED register: {data.email}")
    
    # Check if a user with this email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        # If the user exists but hasn't verified their email yet, resend the OTP
        if not existing.is_verified:
            code = str(random.randint(100000, 999999))
            existing.verification_code = code
            db.commit()
            send_verification_email(data.email, code)
            return {"verification_required": True, "message": "Verification code resent"}
        # If they are already verified, prevent duplicate registration
        raise HTTPException(status_code=400, detail="Email already registered")

    # 1. Create a new Tenant (Workspace) for the user
    tenant = Tenant(name=data.website_name)
    db.add(tenant)
    db.flush()  # Flush pushes the tenant to DB to generate an ID without committing the transaction

    # Generate a 6-digit verification code
    code = str(random.randint(100000, 999999))

    # 2. Create the User, linking them to the newly created tenant
    user = User(
        tenant_id=tenant.id,
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),  # Hash passwords before saving!
        is_verified=False,
        verification_code=code
    )
    db.add(user)

    # 3. Create a default Bot for this tenant
    bot = Bot(tenant_id=tenant.id, name=f"{data.website_name} Bot")
    db.add(bot)

    # Commit all changes (Tenant, User, Bot) to the database atomically
    db.commit()
    db.refresh(user)

    # Send the OTP to the user's email for verification
    send_verification_email(data.email, code)

    return {"verification_required": True, "message": "Please check your email for the verification code"}

@router.post("/verify-email")
def verify_email(data: VerifyEmailIn, db: Session = Depends(get_db)):
    """
    Verify a user's email address using the 6-digit OTP sent to them.
    Upon successful verification, it automatically logs them in and returns a JWT token.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    # Validation checks
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")
    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    # Mark the user as verified and clear the verification code to prevent reuse
    user.is_verified = True
    user.verification_code = None
    db.commit()

    # Automatically log the user in by fetching their associated tenant and bot details
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()
    
    # Generate the JSON Web Token (JWT) for subsequent authenticated requests
    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
        "tenant": {"id": tenant.id, "name": tenant.name},
        "bot": {"id": bot.id, "name": bot.name, "widget_key": bot.widget_key},
    }

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    """
    Authenticate an existing user using email and password, returning a JWT token.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    # Verify both the user's existence and their password match
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Ensure they have completed email verification
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Please verify your email first.")

    # Check if the tenant (workspace) has been suspended
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    if tenant and not tenant.is_active:
        raise HTTPException(status_code=403, detail="Tenant is suspended")

    # Fetch associated bot to return in payload
    bot = db.query(Bot).filter(Bot.tenant_id == user.tenant_id).first()

    # Issue JWT token embedded with user id, tenant id, and superadmin flag
    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id, "is_superadmin": user.is_superadmin})
    
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_superadmin": user.is_superadmin},
        "tenant": {"id": user.tenant_id, "name": tenant.name if tenant else ""},
        "bot": {"id": bot.id if bot else None, "name": bot.name if bot else None, "widget_key": bot.widget_key if bot else None},
    }

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Retrieve the profile information of the currently authenticated user.
    """
    # Extract user ID (sub) from the current_user token payload provided by Depends(get_current_user)
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
    """
    Selectively update the current user's profile details such as name, email, or password.
    """
    user = db.query(User).filter(User.id == current_user["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Process partial updates depending on which fields were provided in the request
    if data.name is not None:
        user.name = data.name
        
    if data.email is not None:
        # Check against taking another user's email
        existing = db.query(User).filter(User.email == data.email, User.id != user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = data.email
        
    if data.password is not None:
        user.password_hash = hash_password(data.password)
    
    # Save the updated profile correctly
    db.commit()
    db.refresh(user)
    
    return {"name": user.name, "email": user.email}


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordIn, db: Session = Depends(get_db)):
    """
    Generate a 6-digit password reset OTP, set an expiration window, and email it to the user.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        # Security best practice: Prevent email enumeration by always returning the same response
        # regardless of whether the email actually exists in our database.
        return {"message": "If an account exists, a reset email was sent."}
    
    # Generate OTP and give it a 15-minute lifespan
    code = str(random.randint(100000, 999999))
    user.reset_code = code
    user.reset_code_expires = datetime.utcnow() + timedelta(minutes=15)
    db.commit()
    
    # Trigger the email with the reset code
    send_reset_password_email(user.email, code)
    
    return {"message": "If an account exists, a reset email was sent."}

@router.post("/reset-password")
def reset_password(data: ResetPasswordIn, db: Session = Depends(get_db)):
    """
    Verify the reset OTP and securely update the user's forgotten password.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid request")
        
    # Verify the code matches
    if not user.reset_code or user.reset_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid or missing verification code")
        
    # Ensure the code hasn't expired past the 15-minute window
    if not user.reset_code_expires or datetime.utcnow() > user.reset_code_expires:
        raise HTTPException(status_code=400, detail="Reset code has expired")
        
    # Valid code - update to new hashed password and invalidate the reset code
    user.password_hash = hash_password(data.new_password)
    user.reset_code = None
    user.reset_code_expires = None
    db.commit()
    
    return {"message": "Password successfully reset"}
