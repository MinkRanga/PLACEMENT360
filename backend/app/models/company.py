import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.enums import CompanyTier


class Company(Base):
    __tablename__ = "companies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    industry = Column(String(100), index=True, nullable=False)
    tier = Column(SQLEnum(CompanyTier), default=CompanyTier.TIER_2, nullable=False, index=True)
    website = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    recruiters = relationship("Recruiter", back_populates="company", cascade="all, delete-orphan")
    drives = relationship("PlacementDrive", back_populates="company", cascade="all, delete-orphan")
    offers = relationship("PlacementOffer", back_populates="company")

    def __repr__(self):
        return f"<Company {self.name} tier={self.tier}>"


class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    
    designation = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    is_primary_contact = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company", back_populates="recruiters")
    interviews_conducted = relationship("Interview", back_populates="recruiter")

    def __repr__(self):
        return f"<Recruiter id={self.id} company_id={self.company_id}>"
