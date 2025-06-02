from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.crud.user import user_crud
from app.schemas.user import UserCreate


def test_create_user(client: TestClient) -> None:
    """Test creating a new user."""
    user_data = {
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "password": "testpassword123",
        "avatar_url": "https://example.com/avatar.jpg"
    }
    
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 201
    
    data = response.json()
    assert data["first_name"] == user_data["first_name"]
    assert data["last_name"] == user_data["last_name"]
    assert data["email"] == user_data["email"]
    assert data["avatar_url"] == user_data["avatar_url"]
    assert "id" in data
    assert "password" not in data  # Password should not be returned


def test_get_users(client: TestClient, db: Session) -> None:
    """Test getting all users."""
    # Create a test user
    user_data = UserCreate(
        first_name="Jane",
        last_name="Smith",
        email="jane.smith@example.com",
        password="testpassword123"
    )
    user_crud.create(db, obj_in=user_data)
    
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["email"] == "jane.smith@example.com"


def test_get_user_by_id(client: TestClient, db: Session) -> None:
    """Test getting a user by ID."""
    # Create a test user
    user_data = UserCreate(
        first_name="Bob",
        last_name="Johnson",
        email="bob.johnson@example.com",
        password="testpassword123"
    )
    user = user_crud.create(db, obj_in=user_data)
    
    response = client.get(f"/api/v1/users/{user.id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == user.id
    assert data["email"] == "bob.johnson@example.com"


def test_update_user(client: TestClient, db: Session) -> None:
    """Test updating a user."""
    # Create a test user
    user_data = UserCreate(
        first_name="Alice",
        last_name="Brown",
        email="alice.brown@example.com",
        password="testpassword123"
    )
    user = user_crud.create(db, obj_in=user_data)
    
    # Update the user
    update_data = {
        "first_name": "Alicia",
        "last_name": "Brown-Smith"
    }
    
    response = client.put(f"/api/v1/users/{user.id}", json=update_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["first_name"] == "Alicia"
    assert data["last_name"] == "Brown-Smith"
    assert data["email"] == "alice.brown@example.com"  # Should remain unchanged


def test_delete_user(client: TestClient, db: Session) -> None:
    """Test deleting a user."""
    # Create a test user
    user_data = UserCreate(
        first_name="Charlie",
        last_name="Wilson",
        email="charlie.wilson@example.com",
        password="testpassword123"
    )
    user = user_crud.create(db, obj_in=user_data)
    
    # Delete the user
    response = client.delete(f"/api/v1/users/{user.id}")
    assert response.status_code == 200
    assert response.json() == {"message": "User deleted successfully"}
    
    # Verify user is deleted
    response = client.get(f"/api/v1/users/{user.id}")
    assert response.status_code == 404


def test_create_user_duplicate_email(client: TestClient) -> None:
    """Test creating a user with duplicate email."""
    user_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "duplicate@example.com",
        "password": "testpassword123"
    }
    
    # Create first user
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 201
    
    # Try to create second user with same email
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_get_nonexistent_user(client: TestClient) -> None:
    """Test getting a non-existent user."""
    response = client.get("/api/v1/users/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"
