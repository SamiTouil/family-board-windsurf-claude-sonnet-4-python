from sqlalchemy import create_engine
from app.core.config import settings
from app.db.database import Base
from app.models.user import User  # Import to register the model


def init_db() -> None:
    """Initialize database tables."""
    engine = create_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()
