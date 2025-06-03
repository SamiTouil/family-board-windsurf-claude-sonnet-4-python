from typing import Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from sqlalchemy import select
from passlib.context import CryptContext
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.crud.base import CRUDBase

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD operations for User."""

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Get user by email."""
        stmt = select(User).where(User.email == email)
        return db.execute(stmt).scalar_one_or_none()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """Create user with hashed password."""
        hashed_password = pwd_context.hash(obj_in.password)
        db_obj = User(
            first_name=obj_in.first_name,
            last_name=obj_in.last_name,
            email=obj_in.email,
            avatar_url=obj_in.avatar_url,
            hashed_password=hashed_password,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """Update user with password hashing if password is provided."""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        # Hash password if it's being updated
        if "password" in update_data:
            hashed_password = pwd_context.hash(update_data["password"])
            update_data["hashed_password"] = hashed_password
            del update_data["password"]
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password."""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password."""
        return pwd_context.verify(plain_password, hashed_password)

    def is_active(self, user: User) -> bool:
        """Check if user is active (for future use)."""
        return True  # For now, all users are active

    def is_superuser(self, user: User) -> bool:
        """Check if user is superuser (for future use)."""
        return False  # For now, no superusers


user_crud = CRUDUser(User)
