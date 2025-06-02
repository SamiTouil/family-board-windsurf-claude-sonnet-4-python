import pytest
from datetime import timedelta
from app.core.security import (
    create_access_token,
    verify_password,
    get_password_hash,
    verify_token
)


class TestSecurity:
    """Test security functions."""

    def test_password_hashing(self):
        """Test password hashing and verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Hash should be different from original password
        assert hashed != password
        
        # Should verify correctly
        assert verify_password(password, hashed) is True
        
        # Should not verify with wrong password
        assert verify_password("wrongpassword", hashed) is False

    def test_create_access_token(self):
        """Test JWT token creation."""
        email = "test@example.com"
        token = create_access_token(subject=email)
        
        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_access_token_with_expiry(self):
        """Test JWT token creation with custom expiry."""
        email = "test@example.com"
        expires_delta = timedelta(minutes=15)
        token = create_access_token(subject=email, expires_delta=expires_delta)
        
        assert token is not None
        assert isinstance(token, str)

    def test_verify_token_valid(self):
        """Test token verification with valid token."""
        email = "test@example.com"
        token = create_access_token(subject=email)
        
        decoded_email = verify_token(token)
        assert decoded_email == email

    def test_verify_token_invalid(self):
        """Test token verification with invalid token."""
        invalid_token = "invalid.token.here"
        
        result = verify_token(invalid_token)
        assert result is None

    def test_verify_token_malformed(self):
        """Test token verification with malformed token."""
        malformed_token = "not.a.jwt"
        
        result = verify_token(malformed_token)
        assert result is None

    def test_password_hash_different_each_time(self):
        """Test that password hashing produces different hashes each time."""
        password = "samepassword"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Hashes should be different due to salt
        assert hash1 != hash2
        
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True

    def test_empty_password_handling(self):
        """Test handling of empty passwords."""
        empty_password = ""
        hashed = get_password_hash(empty_password)
        
        assert verify_password(empty_password, hashed) is True
        assert verify_password("notempty", hashed) is False
