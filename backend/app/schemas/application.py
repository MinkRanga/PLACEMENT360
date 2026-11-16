from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import ApplicationStatus
from app.schemas.student import StudentOut
from app.schemas.drive import PlacementDriveOut


class ApplicationCreate(BaseModel):
    drive_id: UUID


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    current_round_order: Optional[int] = None
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None


class ApplicationOut(BaseModel):
    id: UUID
    student_id: UUID
    drive_id: UUID
    status: ApplicationStatus
    current_round_order: int
    applied_at: datetime
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationDetailOut(ApplicationOut):
    student: Optional[StudentOut] = None
    drive: Optional[PlacementDriveOut] = None
