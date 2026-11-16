import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import Gender, StudentPlacementStatus


class Student(Base):
    __tablename__ = "students"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    batch_year = Column(Integer, nullable=False, index=True)
    gender = Column(SQLEnum(Gender), nullable=False)
    
    cgpa = Column(Numeric(4, 2), nullable=False, index=True)
    tenth_percentage = Column(Numeric(5, 2), nullable=True)
    twelfth_percentage = Column(Numeric(5, 2), nullable=True)
    active_backlogs = Column(Integer, default=0, nullable=False, index=True)
    history_backlogs = Column(Integer, default=0, nullable=False)
    
    phone = Column(String(50), nullable=True)
    resume_url = Column(String(500), nullable=True)
    skills = Column(JSON, default=list, nullable=False)
    
    is_placed = Column(Boolean, default=False, nullable=False, index=True)
    placement_status = Column(SQLEnum(StudentPlacementStatus), default=StudentPlacementStatus.UNPLACED, nullable=False, index=True)
    current_package_lpa = Column(Numeric(6, 2), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    department = relationship("Department", back_populates="students")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    offers = relationship("PlacementOffer", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student {self.roll_number} - {self.first_name} {self.last_name}>"
