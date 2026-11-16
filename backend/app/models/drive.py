import uuid
from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Integer, 
    Numeric, Text, JSON, Enum as SQLEnum, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import DriveType, DriveStatus, GenderAllowed, RoundType
from app.models.department import drive_departments


class PlacementDrive(Base):
    __tablename__ = "placement_drives"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False, index=True)
    job_role = Column(String(150), nullable=False)
    job_description = Column(Text, nullable=False)
    job_location = Column(String(255), nullable=True)
    package_lpa = Column(Numeric(6, 2), nullable=False, index=True)
    ctc_breakdown = Column(JSON, nullable=True)
    
    drive_type = Column(SQLEnum(DriveType), default=DriveType.FULL_TIME, nullable=False)
    status = Column(SQLEnum(DriveStatus), default=DriveStatus.DRAFT, nullable=False, index=True)
    
    registration_start_date = Column(DateTime(timezone=True), nullable=True)
    registration_end_date = Column(DateTime(timezone=True), nullable=True, index=True)
    drive_date = Column(DateTime(timezone=True), nullable=True)
    batch_year = Column(Integer, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    company = relationship("Company", back_populates="drives")
    allowed_departments = relationship("Department", secondary=drive_departments, back_populates="drives")
    eligibility_criteria = relationship("EligibilityCriteria", back_populates="drive", uselist=False, cascade="all, delete-orphan")
    rounds = relationship("InterviewRound", back_populates="drive", order_by="InterviewRound.round_order", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="drive", cascade="all, delete-orphan")
    offers = relationship("PlacementOffer", back_populates="drive")

    def __repr__(self):
        return f"<PlacementDrive {self.title} status={self.status}>"


class EligibilityCriteria(Base):
    __tablename__ = "eligibility_criteria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("placement_drives.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    min_cgpa = Column(Numeric(4, 2), default=0.0, nullable=False)
    min_tenth_percentage = Column(Numeric(5, 2), default=0.0, nullable=False)
    min_twelfth_percentage = Column(Numeric(5, 2), default=0.0, nullable=False)
    max_active_backlogs = Column(Integer, default=0, nullable=False)
    max_history_backlogs = Column(Integer, default=0, nullable=False)
    
    gender_allowed = Column(SQLEnum(GenderAllowed), default=GenderAllowed.ALL, nullable=False)
    allowed_batch_years = Column(JSON, default=list, nullable=False)
    allow_already_placed = Column(Boolean, default=False, nullable=False)
    max_existing_package_lpa = Column(Numeric(6, 2), nullable=True)
    required_skills = Column(JSON, default=list, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    drive = relationship("PlacementDrive", back_populates="eligibility_criteria")

    def __repr__(self):
        return f"<EligibilityCriteria drive_id={self.drive_id} min_cgpa={self.min_cgpa}>"


class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("placement_drives.id", ondelete="CASCADE"), nullable=False, index=True)
    round_order = Column(Integer, nullable=False)
    name = Column(String(150), nullable=False)
    round_type = Column(SQLEnum(RoundType), nullable=False)
    description = Column(Text, nullable=True)
    is_elimination = Column(Boolean, default=True, nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("drive_id", "round_order", name="uq_drive_round_order"),
    )

    # Relationships
    drive = relationship("PlacementDrive", back_populates="rounds")
    interviews = relationship("Interview", back_populates="round", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewRound #{self.round_order} {self.name}>"
