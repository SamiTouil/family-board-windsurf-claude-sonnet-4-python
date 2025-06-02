from typing import Optional
from pydantic import BaseModel, EmailStr, validator


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token data schema."""
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Signup request schema."""
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    
    @validator('password')
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if not v.strip():
            raise ValueError('Password cannot be empty')
        return v
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
