from typing import Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import get_db, get_current_active_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationOut, NotificationListOut
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("", response_model=NotificationListOut, summary="List Current User Notifications")
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Returns all notifications for the authenticated user along with total unread count.
    """
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(desc(Notification.created_at)).limit(100).all()

    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False)
    ).count()

    return NotificationListOut(unread_count=unread_count, items=notifs)


@router.patch("/{id}/read", response_model=NotificationOut, summary="Mark Notification as Read")
def mark_notification_read(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/read-all", response_model=MessageResponse, summary="Mark All Notifications as Read")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read.is_(False)
    ).update({"is_read": True})
    db.commit()
    return MessageResponse(message="All notifications marked as read")
