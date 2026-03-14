from pydantic import BaseModel, EmailStr

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    website_name: str  # tenant name

class LoginIn(BaseModel):
    email: EmailStr
    password: str
