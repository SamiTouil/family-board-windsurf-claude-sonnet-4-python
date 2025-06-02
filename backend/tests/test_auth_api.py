import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.core.deps import get_db
from app.core.security import get_password_hash
from app.crud.user import user_crud
from app.schemas.user import UserCreate
from tests.conftest import TestingSessionLocal


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


class TestAuthAPI:
    """Test authentication API endpoints."""

    def test_signup_success(self, db: Session):
        """Test successful user signup."""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/signup", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["first_name"] == user_data["first_name"]
        assert data["last_name"] == user_data["last_name"]
        assert "id" in data
        assert "hashed_password" not in data  # Should not expose password

    def test_signup_duplicate_email(self, db: Session):
        """Test signup with duplicate email."""
        # Create first user
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "duplicate@example.com",
            "password": "password123"
        }
        client.post("/api/v1/auth/signup", json=user_data)
        
        # Try to create user with same email
        response = client.post("/api/v1/auth/signup", json=user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_signup_invalid_password(self, db: Session):
        """Test signup with invalid password."""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "password": "123"  # Too short
        }
        
        response = client.post("/api/v1/auth/signup", json=user_data)
        
        assert response.status_code == 422
        assert "at least 6 characters" in str(response.json())

    def test_signup_invalid_email(self, db: Session):
        """Test signup with invalid email."""
        user_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "invalid-email",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/signup", json=user_data)
        
        assert response.status_code == 422

    def test_login_success(self, db: Session):
        """Test successful login."""
        # Create a user first using UserCreate
        user_create = UserCreate(
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            password="password123"
        )
        user_crud.create(db, obj_in=user_create)
        
        # Login
        login_data = {
            "email": "jane@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, db: Session):
        """Test login with wrong password."""
        # Create a user first using UserCreate
        user_create = UserCreate(
            first_name="Bob",
            last_name="Wilson",
            email="bob@example.com",
            password="password123"
        )
        user_crud.create(db, obj_in=user_create)
        
        # Login with wrong password
        login_data = {
            "email": "bob@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, db: Session):
        """Test login with nonexistent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["detail"]

    def test_login_invalid_email_format(self, db: Session):
        """Test login with invalid email format."""
        login_data = {
            "email": "invalid-email",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 422

    def test_full_auth_flow(self, db: Session):
        """Test complete authentication flow: signup -> login."""
        # Signup
        signup_data = {
            "first_name": "Alice",
            "last_name": "Johnson",
            "email": "alice@example.com",
            "password": "password123"
        }
        
        signup_response = client.post("/api/v1/auth/signup", json=signup_data)
        assert signup_response.status_code == 201
        
        # Login
        login_data = {
            "email": "alice@example.com",
            "password": "password123"
        }
        
        login_response = client.post("/api/v1/auth/login", json=login_data)
        assert login_response.status_code == 200
        
        token_data = login_response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
