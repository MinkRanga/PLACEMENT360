import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import InterviewStatus


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    round_id = Column(UUID(as_uuid=True), ForeignKey("interview_rounds.id", ondelete="CASCADE"), nullable=False, index=True)
    recruiter_id = Column(UUID(as_uuid=True), ForeignKey("recruiters.id", ondelete="SET NULL"), nullable=True, index=True)
    
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    location_or_link = Column(String(500), nullable=True)
    status = Column(SQLEnum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False, index=True)
    
    feedback = Column(Text, nullable=True)
    score = Column(Numeric(5, 2), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    application = relationship("Application", back_populates="interviews")
    round = relationship("InterviewRound", back_populates="interviews")
    recruiter = relationship("Recruiter", back_populates="interviews_conducted")

    def __repr__(self):
        return f"<Interview app_id={self.application_id} round_id={self.round_id} status={self.status}>"
