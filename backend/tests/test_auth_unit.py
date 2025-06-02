"""Unit tests for authentication functionality."""

import pytest
from datetime import datetime, timedelta
from jose import jwt
from app.core.security import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token
)
from app.core.config import settings


class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_hash_password(self):
        """Test password hashing."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert hashed != password
        assert len(hashed) > 50  # bcrypt hashes are long
        assert hashed.startswith("$2b$")  # bcrypt prefix
    
    def test_verify_correct_password(self):
        """Test password verification with correct password."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_incorrect_password(self):
        """Test password verification with incorrect password."""
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = get_password_hash(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_hash_different_passwords_produce_different_hashes(self):
        """Test that different passwords produce different hashes."""
        password1 = "password1"
        password2 = "password2"
        
        hash1 = get_password_hash(password1)
        hash2 = get_password_hash(password2)
        
        assert hash1 != hash2
    
    def test_same_password_produces_different_hashes(self):
        """Test that same password produces different hashes (salt)."""
        password = "testpassword123"
        
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token creation and verification."""
    
    def test_create_access_token(self):
        """Test JWT token creation."""
        data = {"sub": "test@example.com"}
        token = create_access_token(data)
        
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are long
        
        # Decode token to verify structure
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        assert payload["sub"] == "test@example.com"
        assert "exp" in payload
    
    def test_create_token_with_custom_expiry(self):
        """Test JWT token creation with custom expiry."""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        exp_time = datetime.fromtimestamp(payload["exp"])
        expected_time = datetime.utcnow() + expires_delta
        
        # Allow 1 minute tolerance for test execution time
        assert abs((exp_time - expected_time).total_seconds()) < 60
    
    def test_verify_valid_token(self):
        """Test token verification with valid token."""
        email = "test@example.com"
        data = {"sub": email}
        token = create_access_token(data)
        
        decoded_email = verify_token(token)
        assert decoded_email == email
    
    def test_verify_invalid_token(self):
        """Test token verification with invalid token."""
        invalid_token = "invalid.token.here"
        
        decoded_email = verify_token(invalid_token)
        assert decoded_email is None
    
    def test_verify_expired_token(self):
        """Test token verification with expired token."""
        data = {"sub": "test@example.com"}
        expires_delta = timedelta(seconds=-1)  # Already expired
        token = create_access_token(data, expires_delta)
        
        decoded_email = verify_token(token)
        assert decoded_email is None
    
    def test_verify_token_wrong_secret(self):
        """Test token verification with wrong secret key."""
        data = {"sub": "test@example.com"}
        # Create token with different secret
        wrong_token = jwt.encode(data, "wrong_secret", algorithm=settings.ALGORITHM)
        
        decoded_email = verify_token(wrong_token)
        assert decoded_email is None


class TestAuthenticationLogic:
    """Test authentication business logic."""
    
    def test_token_contains_correct_claims(self):
        """Test that tokens contain all required claims."""
        email = "user@example.com"
        data = {"sub": email}
        token = create_access_token(data)
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        assert payload["sub"] == email
        assert "exp" in payload
        assert isinstance(payload["exp"], int)
    
    def test_password_requirements(self):
        """Test password hashing with various password types."""
        passwords = [
            "short",
            "verylongpasswordwithlotsofcharacters",
            "password123!@#",
            "UPPERCASE",
            "lowercase",
            "MixedCase123",
            "special!@#$%^&*()",
            "unicode_ñáéíóú"
        ]
        
        for password in passwords:
            hashed = get_password_hash(password)
            assert verify_password(password, hashed) is True
            assert hashed != password
