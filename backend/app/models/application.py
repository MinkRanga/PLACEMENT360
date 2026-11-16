import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Text, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import ApplicationStatus


class Application(Base):
    __tablename__ = "applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("placement_drives.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status = Column(SQLEnum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False, index=True)
    current_round_order = Column(Integer, default=1, nullable=False, index=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    rejection_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "drive_id", name="uq_student_drive_application"),
    )

    # Relationships
    student = relationship("Student", back_populates="applications")
    drive = relationship("PlacementDrive", back_populates="applications")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")
    offer = relationship("PlacementOffer", back_populates="application", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Application student_id={self.student_id} drive_id={self.drive_id} status={self.status}>"
