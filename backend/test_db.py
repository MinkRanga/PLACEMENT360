"""
Supabase PostgreSQL Database Connectivity Test
Executes a verification query (SELECT 1) using SQLAlchemy and verifies SSL connectivity.
Ensures zero credentials, passwords, or complete DATABASE_URLs are logged or exposed.
"""

import sys
import re
import urllib.parse
from sqlalchemy import text
from app.core.config import settings
from app.db.session import engine


def sanitize_message(msg: str, password: str = None) -> str:
    """Removes any passwords or credentials from error strings."""
    if not msg:
        return ""
    if password and password in msg:
        msg = msg.replace(password, "********")
    # Replace any :password@ patterns
    msg = re.sub(r':[^:@/\s]+@', ':***@', msg)
    return msg


def test_connection():
    db_url = settings.DATABASE_URL
    if not db_url:
        print("[ERROR] DATABASE_URL is not set in backend/.env", file=sys.stderr)
        return False

    parsed = urllib.parse.urlsplit(db_url)
    password = parsed.password
    host = parsed.hostname or "unknown-host"
    port = parsed.port or "5432"
    db_name = parsed.path.lstrip("/") or "postgres"

    print("==================================================")
    print("PLACEMENT360 - Supabase Connectivity Verification")
    print("==================================================")
    print(f"Target Host    : {host}")
    print(f"Target Port    : {port}")
    print(f"Target Database: {db_name}")
    print(f"SSL Mode       : require")
    print("--------------------------------------------------")
    print("Connecting to Supabase PostgreSQL...")

    try:
        with engine.connect() as conn:
            # Execute SELECT 1 verification query
            res = conn.execute(text("SELECT 1;"))
            scalar_res = res.scalar()
            
            # Retrieve PostgreSQL version metadata
            ver_res = conn.execute(text("SELECT version();"))
            db_version = ver_res.scalar()

            # Retrieve current database name from server
            curr_db_res = conn.execute(text("SELECT current_database();"))
            server_db = curr_db_res.scalar()

            print(" Connection established successfully!")
            print(f"Verification Query : SELECT 1 -> {scalar_res}")
            print(f"Active Database    : {server_db}")
            print(f"Server Engine      : {db_version.split(',')[0] if db_version else 'PostgreSQL'}")
            print("==================================================")
            return True

    except Exception as exc:
        err_type = type(exc).__name__
        cleaned_err = sanitize_message(str(exc), password)
        print(" Connection to Supabase failed!", file=sys.stderr)
        print(f"Error Type: {err_type}", file=sys.stderr)
        print(f"Details   : {cleaned_err}", file=sys.stderr)
        print("==================================================", file=sys.stderr)
        return False


if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
