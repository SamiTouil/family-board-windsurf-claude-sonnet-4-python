from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    """Base user schema."""
    
    first_name: str
    last_name: str
    email: EmailStr
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""
    
    password: str


class UserUpdate(BaseModel):
    """User update schema."""
    
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = None


class UserInDB(UserBase):
    """User in database schema."""
    
    id: int
    hashed_password: str

    class Config:
        from_attributes = True


class User(UserBase):
    """User response schema."""
    
    id: int

    class Config:
        from_attributes = True
