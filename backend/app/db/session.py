import urllib.parse
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Parse connection URL to configure SSL securely
db_url = settings.sqlalchemy_database_uri

connect_args = {}
if db_url:
    parsed = urllib.parse.urlsplit(db_url)
    query_params = urllib.parse.parse_qs(parsed.query)
    # Ensure SSL is enforced for PostgreSQL / Supabase
    if "sslmode" not in query_params and "sqlite" not in parsed.scheme:
        connect_args["sslmode"] = "require"

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a SQLAlchemy database session
    and ensures it is cleanly closed after the request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
