from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.enums import CompanyTier


class CompanyBase(BaseModel):
    name: str = Field(..., max_length=255)
    industry: str = Field(..., max_length=100)
    tier: CompanyTier = CompanyTier.TIER_2
    website: Optional[str] = Field(None, max_length=255)
    address: Optional[str] = None
    is_active: bool = True
    is_verified: bool = True


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    industry: Optional[str] = Field(None, max_length=100)
    tier: Optional[CompanyTier] = None
    website: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


class CompanyOut(CompanyBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecruiterBase(BaseModel):
    company_id: UUID
    designation: Optional[str] = Field(None, max_length=150)
    phone: Optional[str] = Field(None, max_length=50)
    is_primary_contact: bool = False


class RecruiterCreate(RecruiterBase):
    user_id: UUID


class RecruiterRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    company_id: UUID
    designation: Optional[str] = None
    phone: Optional[str] = None
    is_primary_contact: bool = False


class RecruiterUpdate(BaseModel):
    designation: Optional[str] = None
    phone: Optional[str] = None
    is_primary_contact: Optional[bool] = None


class RecruiterOut(RecruiterBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
