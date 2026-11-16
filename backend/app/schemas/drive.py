from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import DriveType, DriveStatus, GenderAllowed, RoundType
from app.schemas.department import DepartmentOut
from app.schemas.company import CompanyOut


# Eligibility Criteria Schemas
class EligibilityCriteriaBase(BaseModel):
    min_cgpa: Decimal = Field(Decimal("0.0"), ge=0.0, le=10.0)
    min_tenth_percentage: Decimal = Field(Decimal("0.0"), ge=0.0, le=100.0)
    min_twelfth_percentage: Decimal = Field(Decimal("0.0"), ge=0.0, le=100.0)
    max_active_backlogs: int = Field(0, ge=0)
    max_history_backlogs: int = Field(0, ge=0)
    gender_allowed: GenderAllowed = GenderAllowed.ALL
    allowed_batch_years: List[int] = []
    allow_already_placed: bool = False
    max_existing_package_lpa: Optional[Decimal] = None
    required_skills: List[str] = []


class EligibilityCriteriaCreate(EligibilityCriteriaBase):
    pass


class EligibilityCriteriaUpdate(BaseModel):
    min_cgpa: Optional[Decimal] = None
    min_tenth_percentage: Optional[Decimal] = None
    min_twelfth_percentage: Optional[Decimal] = None
    max_active_backlogs: Optional[int] = None
    max_history_backlogs: Optional[int] = None
    gender_allowed: Optional[GenderAllowed] = None
    allowed_batch_years: Optional[List[int]] = None
    allow_already_placed: Optional[bool] = None
    max_existing_package_lpa: Optional[Decimal] = None
    required_skills: Optional[List[str]] = None


class EligibilityCriteriaOut(EligibilityCriteriaBase):
    id: UUID
    drive_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Interview Round Schemas
class InterviewRoundBase(BaseModel):
    round_order: int = Field(..., ge=1)
    name: str = Field(..., max_length=150)
    round_type: RoundType
    description: Optional[str] = None
    is_elimination: bool = True
    scheduled_date: Optional[datetime] = None


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRoundUpdate(BaseModel):
    round_order: Optional[int] = None
    name: Optional[str] = None
    round_type: Optional[RoundType] = None
    description: Optional[str] = None
    is_elimination: Optional[bool] = None
    scheduled_date: Optional[datetime] = None


class InterviewRoundOut(InterviewRoundBase):
    id: UUID
    drive_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Placement Drive Schemas
class PlacementDriveBase(BaseModel):
    company_id: UUID
    title: str = Field(..., max_length=255)
    job_role: str = Field(..., max_length=150)
    job_description: str
    job_location: Optional[str] = None
    package_lpa: Decimal = Field(..., ge=0.0)
    ctc_breakdown: Optional[Dict[str, Any]] = None
    drive_type: DriveType = DriveType.FULL_TIME
    status: DriveStatus = DriveStatus.DRAFT
    registration_start_date: Optional[datetime] = None
    registration_end_date: Optional[datetime] = None
    drive_date: Optional[datetime] = None
    batch_year: int = Field(..., ge=2020, le=2040)


class PlacementDriveCreate(PlacementDriveBase):
    allowed_department_ids: List[UUID] = []
    eligibility_criteria: Optional[EligibilityCriteriaCreate] = None


class PlacementDriveUpdate(BaseModel):
    title: Optional[str] = None
    job_role: Optional[str] = None
    job_description: Optional[str] = None
    job_location: Optional[str] = None
    package_lpa: Optional[Decimal] = None
    ctc_breakdown: Optional[Dict[str, Any]] = None
    drive_type: Optional[DriveType] = None
    status: Optional[DriveStatus] = None
    registration_start_date: Optional[datetime] = None
    registration_end_date: Optional[datetime] = None
    drive_date: Optional[datetime] = None
    batch_year: Optional[int] = None
    allowed_department_ids: Optional[List[UUID]] = None
    eligibility_criteria: Optional[EligibilityCriteriaUpdate] = None


class PlacementDriveStatusUpdate(BaseModel):
    status: DriveStatus


class PlacementDriveOut(PlacementDriveBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlacementDriveDetailOut(PlacementDriveOut):
    company: Optional[CompanyOut] = None
    allowed_departments: List[DepartmentOut] = []
    eligibility_criteria: Optional[EligibilityCriteriaOut] = None
    rounds: List[InterviewRoundOut] = []
