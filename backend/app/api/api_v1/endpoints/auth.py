from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import LoginRequest, SignupRequest, Token
from app.schemas.user import User
from app.crud.user import user_crud
from app.core.security import create_access_token
from app.core.config import settings
from app.models.user import User as UserModel

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Token:
    """Authenticate user and return access token."""
    user = user_crud.authenticate(
        db, email=login_data.email, password=login_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
def signup(
    signup_data: SignupRequest,
    db: Session = Depends(get_db)
) -> UserModel:
    """Register new user."""
    # Check if user already exists
    db_user = user_crud.get_by_email(db, email=signup_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    # Create new user
    from app.schemas.user import UserCreate
    user_create = UserCreate(
        first_name=signup_data.first_name,
        last_name=signup_data.last_name,
        email=signup_data.email,
        password=signup_data.password
    )
    
    user = user_crud.create(db, obj_in=user_create)
    return user
