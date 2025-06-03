from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.crud.user import user_crud
from app.schemas.auth import LoginRequest, SignupRequest, Token
from app.schemas.user import User, UserCreate
from app.models.user import User as UserModel

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Token:
    """
    Login user and return JWT token.
    """
    user = user_crud.get_by_email(db, email=login_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token = create_access_token(subject=user.email)
    return Token(access_token=access_token)


@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
def signup(
    signup_data: SignupRequest,
    db: Session = Depends(get_db)
) -> UserModel:
    """
    Create new user account.
    """
    # Check if user already exists
    db_user = user_crud.get_by_email(db, email=signup_data.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system."
        )
    
    # Create UserCreate object from signup data
    user_create = UserCreate(
        first_name=signup_data.first_name,
        last_name=signup_data.last_name,
        email=signup_data.email,
        password=signup_data.password,
        avatar_url=None
    )
    
    # Create user using CRUD
    user = user_crud.create(db, obj_in=user_create)
    return user


@router.get("/me", response_model=User)
def get_current_user_info(
    current_user: UserModel = Depends(get_current_user)
) -> UserModel:
    """Get current user information."""
    return current_user
