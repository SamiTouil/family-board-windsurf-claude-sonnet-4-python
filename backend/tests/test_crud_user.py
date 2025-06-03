"""Unit tests for User CRUD operations."""

import pytest
from sqlalchemy.orm import Session
from app.crud.user import user_crud, pwd_context
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import User


class TestUserCRUD:
    """Test User CRUD operations."""

    def test_create_user(self, db: Session) -> None:
        """Test creating a user."""
        user_in = UserCreate(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            password="testpassword123",
            avatar_url="https://example.com/avatar.jpg"
        )
        
        user = user_crud.create(db, obj_in=user_in)
        
        assert user.first_name == user_in.first_name
        assert user.last_name == user_in.last_name
        assert user.email == user_in.email
        assert user.avatar_url == user_in.avatar_url
        assert hasattr(user, "id")
        assert user.hashed_password != user_in.password  # Password should be hashed
        assert user_crud.verify_password(user_in.password, user.hashed_password)

    def test_get_user(self, db: Session) -> None:
        """Test getting a user by ID."""
        user_in = UserCreate(
            first_name="Jane",
            last_name="Smith",
            email="jane.smith@example.com",
            password="testpassword123"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        retrieved_user = user_crud.get(db, id=created_user.id)
        
        assert retrieved_user
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == user_in.email
        assert retrieved_user.first_name == user_in.first_name

    def test_get_user_by_email(self, db: Session) -> None:
        """Test getting a user by email."""
        user_in = UserCreate(
            first_name="Bob",
            last_name="Wilson",
            email="bob.wilson@example.com",
            password="testpassword123"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        retrieved_user = user_crud.get_by_email(db, email=user_in.email)
        
        assert retrieved_user
        assert retrieved_user.id == created_user.id
        assert retrieved_user.email == user_in.email

    def test_get_user_by_email_not_found(self, db: Session) -> None:
        """Test getting a non-existent user by email."""
        user = user_crud.get_by_email(db, email="nonexistent@example.com")
        assert user is None

    def test_get_multi_users(self, db: Session) -> None:
        """Test getting multiple users."""
        # Create multiple users
        users_data = [
            UserCreate(
                first_name="User1",
                last_name="Test",
                email="user1@example.com",
                password="password123"
            ),
            UserCreate(
                first_name="User2",
                last_name="Test",
                email="user2@example.com",
                password="password123"
            ),
        ]
        
        created_users = [user_crud.create(db, obj_in=user_data) for user_data in users_data]
        retrieved_users = user_crud.get_multi(db, skip=0, limit=10)
        
        assert len(retrieved_users) >= len(created_users)
        created_emails = {user.email for user in created_users}
        retrieved_emails = {user.email for user in retrieved_users}
        assert created_emails.issubset(retrieved_emails)

    def test_update_user(self, db: Session) -> None:
        """Test updating a user."""
        user_in = UserCreate(
            first_name="Original",
            last_name="Name",
            email="original@example.com",
            password="originalpassword"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        
        user_update = UserUpdate(
            first_name="Updated",
            last_name="NewName",
            email="updated@example.com"
        )
        
        updated_user = user_crud.update(db, db_obj=created_user, obj_in=user_update)
        
        assert updated_user.id == created_user.id
        assert updated_user.first_name == "Updated"
        assert updated_user.last_name == "NewName"
        assert updated_user.email == "updated@example.com"
        # Password should remain the same
        assert user_crud.verify_password("originalpassword", updated_user.hashed_password)

    def test_update_user_password(self, db: Session) -> None:
        """Test updating a user's password."""
        user_in = UserCreate(
            first_name="Test",
            last_name="User",
            email="testuser@example.com",
            password="oldpassword"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        original_hash = created_user.hashed_password
        
        user_update = UserUpdate(password="newpassword")
        updated_user = user_crud.update(db, db_obj=created_user, obj_in=user_update)
        
        assert updated_user.hashed_password != original_hash
        assert not user_crud.verify_password("oldpassword", updated_user.hashed_password)
        assert user_crud.verify_password("newpassword", updated_user.hashed_password)

    def test_update_user_partial(self, db: Session) -> None:
        """Test partial update of a user."""
        user_in = UserCreate(
            first_name="Partial",
            last_name="Update",
            email="partial@example.com",
            password="password123",
            avatar_url="https://example.com/old.jpg"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        
        # Only update avatar_url
        user_update = UserUpdate(avatar_url="https://example.com/new.jpg")
        updated_user = user_crud.update(db, db_obj=created_user, obj_in=user_update)
        
        assert updated_user.first_name == "Partial"  # Unchanged
        assert updated_user.last_name == "Update"    # Unchanged
        assert updated_user.email == "partial@example.com"  # Unchanged
        assert updated_user.avatar_url == "https://example.com/new.jpg"  # Changed

    def test_delete_user(self, db: Session) -> None:
        """Test deleting a user."""
        user_in = UserCreate(
            first_name="Delete",
            last_name="Me",
            email="delete@example.com",
            password="password123"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        user_id = created_user.id
        
        deleted_user = user_crud.remove(db, id=user_id)
        
        assert deleted_user.id == user_id
        
        # Verify user is actually deleted
        retrieved_user = user_crud.get(db, id=user_id)
        assert retrieved_user is None

    def test_delete_nonexistent_user(self, db: Session) -> None:
        """Test deleting a non-existent user."""
        with pytest.raises(ValueError, match="Object with id 999999 not found"):
            user_crud.remove(db, id=999999)

    def test_authenticate_user(self, db: Session) -> None:
        """Test user authentication."""
        user_in = UserCreate(
            first_name="Auth",
            last_name="Test",
            email="auth@example.com",
            password="correctpassword"
        )
        
        created_user = user_crud.create(db, obj_in=user_in)
        
        # Test correct authentication
        authenticated_user = user_crud.authenticate(
            db, email="auth@example.com", password="correctpassword"
        )
        assert authenticated_user
        assert authenticated_user.id == created_user.id

    def test_authenticate_user_wrong_password(self, db: Session) -> None:
        """Test authentication with wrong password."""
        user_in = UserCreate(
            first_name="Auth",
            last_name="Test",
            email="auth2@example.com",
            password="correctpassword"
        )
        
        user_crud.create(db, obj_in=user_in)
        
        # Test wrong password
        authenticated_user = user_crud.authenticate(
            db, email="auth2@example.com", password="wrongpassword"
        )
        assert authenticated_user is None

    def test_authenticate_nonexistent_user(self, db: Session) -> None:
        """Test authentication with non-existent user."""
        authenticated_user = user_crud.authenticate(
            db, email="nonexistent@example.com", password="anypassword"
        )
        assert authenticated_user is None

    def test_verify_password(self) -> None:
        """Test password verification."""
        from app.crud.user import pwd_context
        
        password = "testpassword123"
        hashed = pwd_context.hash(password)
        
        assert user_crud.verify_password(password, hashed)
        assert not user_crud.verify_password("wrongpassword", hashed)

    def test_is_active(self, db: Session) -> None:
        """Test user active status."""
        user_in = UserCreate(
            first_name="Active",
            last_name="User",
            email="active@example.com",
            password="password123"
        )
        
        user = user_crud.create(db, obj_in=user_in)
        assert user_crud.is_active(user) is True

    def test_is_superuser(self, db: Session) -> None:
        """Test user superuser status."""
        user_in = UserCreate(
            first_name="Regular",
            last_name="User",
            email="regular@example.com",
            password="password123"
        )
        
        user = user_crud.create(db, obj_in=user_in)
        assert user_crud.is_superuser(user) is False

    def test_create_user_without_avatar(self, db: Session) -> None:
        """Test creating a user without avatar URL."""
        user_in = UserCreate(
            first_name="No",
            last_name="Avatar",
            email="noavatar@example.com",
            password="password123"
        )
        
        user = user_crud.create(db, obj_in=user_in)
        
        assert user.first_name == "No"
        assert user.last_name == "Avatar"
        assert user.email == "noavatar@example.com"
        assert user.avatar_url is None
