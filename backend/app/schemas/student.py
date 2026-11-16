from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.enums import Gender, StudentPlacementStatus
from app.schemas.department import DepartmentOut


class StudentBase(BaseModel):
    roll_number: str = Field(..., max_length=50)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    department_id: UUID
    batch_year: int = Field(..., ge=2020, le=2040)
    gender: Gender
    cgpa: Decimal = Field(..., ge=0.0, le=10.0)
    tenth_percentage: Optional[Decimal] = Field(None, ge=0.0, le=100.0)
    twelfth_percentage: Optional[Decimal] = Field(None, ge=0.0, le=100.0)
    active_backlogs: int = Field(0, ge=0)
    history_backlogs: int = Field(0, ge=0)
    phone: Optional[str] = Field(None, max_length=50)
    resume_url: Optional[str] = Field(None, max_length=500)
    skills: List[str] = []


class StudentCreate(StudentBase):
    user_id: UUID


class StudentRegisterRequest(StudentBase):
    email: EmailStr
    password: str = Field(..., min_length=6)


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department_id: Optional[UUID] = None
    batch_year: Optional[int] = None
    gender: Optional[Gender] = None
    cgpa: Optional[Decimal] = None
    tenth_percentage: Optional[Decimal] = None
    twelfth_percentage: Optional[Decimal] = None
    active_backlogs: Optional[int] = None
    history_backlogs: Optional[int] = None
    phone: Optional[str] = None
    resume_url: Optional[str] = None
    skills: Optional[List[str]] = None


class StudentPlacementUpdate(BaseModel):
    is_placed: bool
    placement_status: StudentPlacementStatus
    current_package_lpa: Optional[Decimal] = None


class StudentOut(StudentBase):
    id: UUID
    user_id: UUID
    is_placed: bool
    placement_status: StudentPlacementStatus
    current_package_lpa: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentDetailOut(StudentOut):
    department: Optional[DepartmentOut] = None
