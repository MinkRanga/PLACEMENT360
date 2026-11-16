import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Text, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import OfferStatus


class PlacementOffer(Base):
    __tablename__ = "placement_offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    application_id = Column(UUID(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    drive_id = Column(UUID(as_uuid=True), ForeignKey("placement_drives.id", ondelete="CASCADE"), nullable=False, index=True)
    
    designation = Column(String(150), nullable=False)
    package_lpa = Column(Numeric(6, 2), nullable=False, index=True)
    ctc_breakdown = Column(JSON, nullable=True)
    offer_letter_url = Column(String(500), nullable=True)
    
    valid_until = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(OfferStatus), default=OfferStatus.PENDING, nullable=False, index=True)
    released_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    student_remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    application = relationship("Application", back_populates="offer")
    student = relationship("Student", back_populates="offers")
    company = relationship("Company", back_populates="offers")
    drive = relationship("PlacementDrive", back_populates="offers")

    def __repr__(self):
        return f"<PlacementOffer student_id={self.student_id} company_id={self.company_id} package={self.package_lpa}LPA status={self.status}>"
