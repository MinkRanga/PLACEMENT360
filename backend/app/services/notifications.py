from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.models.enums import NotificationType


def create_notification(
    db: Session,
    user_id: UUID,
    title: str,
    message: str,
    notification_type: NotificationType = NotificationType.SYSTEM_ALERT,
    link: Optional[str] = None
) -> Notification:
    """
    Creates and persists a notification for a user.
    """
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
