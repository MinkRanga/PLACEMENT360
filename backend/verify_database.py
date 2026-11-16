"""
Verification script for PLACEMENT360 Database Modeling & Migrations.
Queries the database to verify:
1. All created tables in the public schema
2. Foreign key constraints and table relationships
3. Unique constraints (e.g., student-drive uniqueness)
4. Alembic migration version
"""

from sqlalchemy import inspect, text
from app.db.session import engine


def verify_database():
    inspector = inspect(engine)
    
    # 1. Fetch all public table names
    tables = inspector.get_table_names(schema="public")
    print("==================================================")
    print("PLACEMENT360 DATABASE VERIFICATION REPORT")
    print("==================================================")
    print(f"Total Public Tables: {len(tables)}")
    print("Tables Created:")
    for t in sorted(tables):
        print(f"  - {t}")
    print("--------------------------------------------------")

    # 2. Check Alembic Version
    with engine.connect() as conn:
        rev_res = conn.execute(text("SELECT version_num FROM alembic_version;")).fetchone()
        alembic_version = rev_res[0] if rev_res else "None"
        print(f"Current Alembic Revision: {alembic_version}")
    print("--------------------------------------------------")

    # 3. Verify Foreign Keys and Relationships
    print("Foreign Key Relationships:")
    for table_name in sorted(tables):
        if table_name == "alembic_version":
            continue
        fks = inspector.get_foreign_keys(table_name)
        for fk in fks:
            constrained_cols = ", ".join(fk["constrained_columns"])
            referred_table = fk["referred_table"]
            referred_cols = ", ".join(fk["referred_columns"])
            print(f"  {table_name}.({constrained_cols}) -> {referred_table}.({referred_cols})")
    print("--------------------------------------------------")

    # 4. Verify Key Unique Constraints
    print("Key Unique Constraints:")
    for table_name in sorted(tables):
        if table_name == "alembic_version":
            continue
        uqs = inspector.get_unique_constraints(table_name)
        for uq in uqs:
            cols = ", ".join(uq["column_names"])
            print(f"  {table_name}: {uq['name']} on ({cols})")
    print("==================================================")


if __name__ == "__main__":
    verify_database()
