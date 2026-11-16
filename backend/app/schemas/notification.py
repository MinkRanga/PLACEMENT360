from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import NotificationType


class NotificationCreate(BaseModel):
    user_id: UUID
    title: str = Field(..., max_length=255)
    message: str
    notification_type: NotificationType = NotificationType.SYSTEM_ALERT
    link: Optional[str] = Field(None, max_length=500)


class NotificationOut(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    notification_type: NotificationType
    link: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListOut(BaseModel):
    unread_count: int
    items: List[NotificationOut]
