from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import OfferStatus
from app.schemas.student import StudentOut
from app.schemas.company import CompanyOut
from app.schemas.drive import PlacementDriveOut


class PlacementOfferCreate(BaseModel):
    application_id: UUID
    designation: str = Field(..., max_length=150)
    package_lpa: Decimal = Field(..., ge=0.0)
    ctc_breakdown: Optional[Dict[str, Any]] = None
    offer_letter_url: Optional[str] = Field(None, max_length=500)
    valid_until: Optional[datetime] = None


class PlacementOfferUpdate(BaseModel):
    designation: Optional[str] = None
    package_lpa: Optional[Decimal] = None
    ctc_breakdown: Optional[Dict[str, Any]] = None
    offer_letter_url: Optional[str] = None
    valid_until: Optional[datetime] = None
    status: Optional[OfferStatus] = None


class PlacementOfferResponse(BaseModel):
    status: OfferStatus  # ACCEPTED or REJECTED
    student_remarks: Optional[str] = None


class PlacementOfferOut(BaseModel):
    id: UUID
    application_id: UUID
    student_id: UUID
    company_id: UUID
    drive_id: UUID
    designation: str
    package_lpa: Decimal
    ctc_breakdown: Optional[Dict[str, Any]] = None
    offer_letter_url: Optional[str] = None
    valid_until: Optional[datetime] = None
    status: OfferStatus
    released_at: datetime
    responded_at: Optional[datetime] = None
    student_remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlacementOfferDetailOut(PlacementOfferOut):
    student: Optional[StudentOut] = None
    company: Optional[CompanyOut] = None
    drive: Optional[PlacementDriveOut] = None
