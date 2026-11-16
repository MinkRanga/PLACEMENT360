from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import InterviewStatus
from app.schemas.application import ApplicationOut
from app.schemas.drive import InterviewRoundOut


class InterviewCreate(BaseModel):
    application_id: UUID
    round_id: UUID
    recruiter_id: Optional[UUID] = None
    scheduled_time: Optional[datetime] = None
    location_or_link: Optional[str] = Field(None, max_length=500)
    status: InterviewStatus = InterviewStatus.SCHEDULED


class InterviewUpdate(BaseModel):
    recruiter_id: Optional[UUID] = None
    scheduled_time: Optional[datetime] = None
    location_or_link: Optional[str] = None
    status: Optional[InterviewStatus] = None
    feedback: Optional[str] = None
    score: Optional[Decimal] = Field(None, ge=0.0, le=100.0)


class InterviewScoreUpdate(BaseModel):
    status: InterviewStatus
    feedback: Optional[str] = None
    score: Optional[Decimal] = Field(None, ge=0.0, le=100.0)


class InterviewOut(BaseModel):
    id: UUID
    application_id: UUID
    round_id: UUID
    recruiter_id: Optional[UUID] = None
    scheduled_time: Optional[datetime] = None
    location_or_link: Optional[str] = None
    status: InterviewStatus
    feedback: Optional[str] = None
    score: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InterviewDetailOut(InterviewOut):
    round: Optional[InterviewRoundOut] = None
    application: Optional[ApplicationOut] = None
