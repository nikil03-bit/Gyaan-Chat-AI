from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ...core.database import get_db
from ...schemas.auth import RegisterIn, LoginIn
from ...services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    return auth_service.register_user(data, db)

@router.post("/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    return auth_service.login_user(data, db)
