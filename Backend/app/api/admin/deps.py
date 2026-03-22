from fastapi import Depends, HTTPException
from app.auth_utils import get_current_user

def verify_admin(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_superadmin"):
        raise HTTPException(status_code=403, detail="Forbidden: Super-admin access required.")
    return current_user
