import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base

# Association table for Placement Drives and Allowed Departments
drive_departments = Table(
    "drive_departments",
    Base.metadata,
    Column("drive_id", UUID(as_uuid=True), ForeignKey("placement_drives.id", ondelete="CASCADE"), primary_key=True),
    Column("department_id", UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True),
)


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    students = relationship("Student", back_populates="department")
    drives = relationship("PlacementDrive", secondary=drive_departments, back_populates="allowed_departments")

    def __repr__(self):
        return f"<Department {self.code} - {self.name}>"
