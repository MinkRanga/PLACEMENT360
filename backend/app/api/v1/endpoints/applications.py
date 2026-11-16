from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import (
    get_db, require_student, require_admin, 
    require_admin_or_recruiter, get_current_active_user
)
from app.models.application import Application
from app.models.student import Student
from app.models.drive import PlacementDrive
from app.models.company import Recruiter
from app.models.user import User
from app.models.enums import ApplicationStatus, DriveStatus, UserRole, NotificationType
from app.schemas.application import (
    ApplicationCreate, ApplicationStatusUpdate, ApplicationOut, ApplicationDetailOut
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.eligibility import evaluate_eligibility
from app.services.notifications import create_notification

router = APIRouter()


@router.post("", response_model=ApplicationDetailOut, status_code=status.HTTP_201_CREATED, summary="Apply for Placement Drive")
def apply_for_drive(
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    """
    Submits a drive application for the authenticated student.
    Enforces automated eligibility validation and prevents duplicate applications.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

    drive = db.query(PlacementDrive).filter(PlacementDrive.id == payload.drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    # Verify drive status
    if drive.status not in [DriveStatus.REGISTRATION_OPEN, DriveStatus.ANNOUNCED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Applications are not open for this drive (current status: {drive.status.value})"
        )

    # Check deadline if configured
    now = datetime.now(timezone.utc)
    if drive.registration_end_date and drive.registration_end_date < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application deadline for this placement drive has passed"
        )

    # Check duplicate application
    existing_app = db.query(Application).filter(
        Application.student_id == student.id,
        Application.drive_id == drive.id
    ).first()
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already submitted an application for this placement drive"
        )

    # Automated Eligibility Evaluation
    result = evaluate_eligibility(student, drive)
    if not result.is_eligible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ineligible to apply: {'; '.join(result.reasons)}"
        )

    # Create application record
    app = Application(
        student_id=student.id,
        drive_id=drive.id,
        status=ApplicationStatus.APPLIED,
        current_round_order=1
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Trigger in-app notification
    create_notification(
        db=db,
        user_id=current_user.id,
        title="Application Submitted",
        message=f"Successfully applied to {drive.company.name} for {drive.job_role}.",
        notification_type=NotificationType.ELIGIBILITY_ALERT,
        link=f"/drives/{drive.id}"
    )

    return app


@router.get("", response_model=PaginatedResponse[ApplicationDetailOut], summary="List Applications")
def list_applications(
    drive_id: Optional[UUID] = Query(None, description="Filter by drive"),
    student_id: Optional[UUID] = Query(None, description="Filter by student"),
    status: Optional[ApplicationStatus] = Query(None, description="Filter by application status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Lists applications with filtering and role scope.
    """
    query = db.query(Application)

    if current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            return PaginatedResponse(items=[], total=0, skip=skip, limit=limit)
        query = query.filter(Application.student_id == student.id)
    elif current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if recruiter:
            query = query.join(PlacementDrive).filter(PlacementDrive.company_id == recruiter.company_id)

    if drive_id:
        query = query.filter(Application.drive_id == drive_id)
    if student_id and current_user.role != UserRole.STUDENT:
        query = query.filter(Application.student_id == student_id)
    if status:
        query = query.filter(Application.status == status)

    total = query.count()
    items = query.order_by(desc(Application.applied_at)).offset(skip).limit(limit).all()

    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/me", response_model=List[ApplicationDetailOut], summary="Get Current Student Applications")
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

    return db.query(Application).filter(Application.student_id == student.id).order_by(desc(Application.applied_at)).all()


@router.get("/{id}", response_model=ApplicationDetailOut, summary="Get Application Details")
def get_application(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Access control
    if current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or app.student_id != student.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return app


@router.patch("/{id}/status", response_model=ApplicationDetailOut, summary="Update Application Status / Advance Round")
def update_application_status(
    id: UUID,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Updates application status (Shortlist, In-Process, Reject, Select) and advances round.
    """
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    app.status = payload.status
    if payload.current_round_order is not None:
        app.current_round_order = payload.current_round_order
    if payload.rejection_reason is not None:
        app.rejection_reason = payload.rejection_reason
    if payload.notes is not None:
        app.notes = payload.notes

    db.commit()
    db.refresh(app)

    # Notify student
    student_user_id = app.student.user_id
    create_notification(
        db=db,
        user_id=student_user_id,
        title="Application Status Updated",
        message=f"Your application status for {app.drive.company.name} is now: {payload.status.value}",
        notification_type=NotificationType.ELIGIBILITY_ALERT,
        link=f"/applications/{app.id}"
    )

    return app


@router.post("/{id}/withdraw", response_model=MessageResponse, summary="Withdraw Application")
def withdraw_application(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if not student or app.student_id != student.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot withdraw someone else's application")

    if app.status in [ApplicationStatus.SELECTED, ApplicationStatus.REJECTED]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot withdraw finalized application")

    app.status = ApplicationStatus.WITHDRAWN
    db.commit()
    return MessageResponse(message="Application withdrawn successfully")
