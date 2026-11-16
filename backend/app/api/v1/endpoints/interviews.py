from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import (
    get_db, require_admin, require_recruiter, 
    require_admin_or_recruiter, get_current_active_user
)
from app.models.interview import Interview
from app.models.drive import InterviewRound, PlacementDrive
from app.models.application import Application
from app.models.student import Student
from app.models.company import Recruiter
from app.models.user import User
from app.models.enums import InterviewStatus, ApplicationStatus, UserRole, NotificationType
from app.schemas.interview import (
    InterviewCreate, InterviewUpdate, InterviewScoreUpdate, 
    InterviewOut, InterviewDetailOut
)
from app.schemas.drive import InterviewRoundCreate, InterviewRoundOut
from app.schemas.common import PaginatedResponse
from app.services.notifications import create_notification

router = APIRouter()


# ------------------------------------------------------------------------------
# Interview Rounds Management
# ------------------------------------------------------------------------------
@router.post("/rounds", response_model=InterviewRoundOut, status_code=status.HTTP_201_CREATED, summary="Create Interview Round for Drive")
def create_interview_round(
    drive_id: UUID,
    payload: InterviewRoundCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    # Check unique round order for drive
    existing = db.query(InterviewRound).filter(
        InterviewRound.drive_id == drive_id,
        InterviewRound.round_order == payload.round_order
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Round order #{payload.round_order} already exists for this drive"
        )

    round_obj = InterviewRound(
        drive_id=drive_id,
        round_order=payload.round_order,
        name=payload.name.strip(),
        round_type=payload.round_type,
        description=payload.description,
        is_elimination=payload.is_elimination,
        scheduled_date=payload.scheduled_date
    )
    db.add(round_obj)
    db.commit()
    db.refresh(round_obj)
    return round_obj


@router.get("/rounds", response_model=List[InterviewRoundOut], summary="List Rounds for Drive")
def list_rounds_for_drive(
    drive_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return db.query(InterviewRound).filter(
        InterviewRound.drive_id == drive_id
    ).order_by(InterviewRound.round_order.asc()).all()


# ------------------------------------------------------------------------------
# Candidate Interview Scheduling & Evaluation
# ------------------------------------------------------------------------------
@router.post("", response_model=InterviewDetailOut, status_code=status.HTTP_201_CREATED, summary="Schedule Interview")
def schedule_interview(
    payload: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Schedules an interview slot for an application within an interview round.
    """
    app = db.query(Application).filter(Application.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    round_obj = db.query(InterviewRound).filter(InterviewRound.id == payload.round_id).first()
    if not round_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview round not found")

    interview = Interview(
        application_id=payload.application_id,
        round_id=payload.round_id,
        recruiter_id=payload.recruiter_id,
        scheduled_time=payload.scheduled_time,
        location_or_link=payload.location_or_link,
        status=payload.status,
    )
    db.add(interview)

    # Transition application status to IN_PROCESS if still APPLIED or ELIGIBLE
    if app.status in [ApplicationStatus.APPLIED, ApplicationStatus.ELIGIBLE]:
        app.status = ApplicationStatus.IN_PROCESS
    app.current_round_order = round_obj.round_order

    db.commit()
    db.refresh(interview)

    # Notify student
    student_user_id = app.student.user_id
    create_notification(
        db=db,
        user_id=student_user_id,
        title="Interview Scheduled",
        message=f"You have been scheduled for {round_obj.name} with {app.drive.company.name}.",
        notification_type=NotificationType.INTERVIEW_SCHEDULED,
        link=f"/interviews/{interview.id}"
    )

    return interview


@router.get("", response_model=PaginatedResponse[InterviewDetailOut], summary="List Interviews")
def list_interviews(
    application_id: Optional[UUID] = Query(None, description="Filter by application"),
    round_id: Optional[UUID] = Query(None, description="Filter by round"),
    status: Optional[InterviewStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    query = db.query(Interview)

    if current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            return PaginatedResponse(items=[], total=0, skip=skip, limit=limit)
        query = query.join(Application).filter(Application.student_id == student.id)
    elif current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if recruiter:
            query = query.join(Application).join(PlacementDrive).filter(PlacementDrive.company_id == recruiter.company_id)

    if application_id:
        query = query.filter(Interview.application_id == application_id)
    if round_id:
        query = query.filter(Interview.round_id == round_id)
    if status:
        query = query.filter(Interview.status == status)

    total = query.count()
    items = query.order_by(desc(Interview.scheduled_time)).offset(skip).limit(limit).all()

    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=InterviewDetailOut, summary="Get Interview Details")
def get_interview(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    interview = db.query(Interview).filter(Interview.id == id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    return interview


@router.patch("/{id}/result", response_model=InterviewDetailOut, summary="Submit Interview Evaluation & Result")
def update_interview_result(
    id: UUID,
    payload: InterviewScoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Submits score, feedback, and result status (PASSED, FAILED, ABSENT).
    If round is elimination and candidate FAILED, marks application REJECTED.
    """
    interview = db.query(Interview).filter(Interview.id == id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    interview.status = payload.status
    if payload.feedback is not None:
        interview.feedback = payload.feedback
    if payload.score is not None:
        interview.score = payload.score

    app = interview.application
    round_obj = interview.round

    if payload.status == InterviewStatus.FAILED and round_obj.is_elimination:
        app.status = ApplicationStatus.REJECTED
        app.rejection_reason = f"Eliminated in {round_obj.name}"
    elif payload.status == InterviewStatus.PASSED:
        app.status = ApplicationStatus.SHORTLISTED

    db.commit()
    db.refresh(interview)

    # Notify student
    create_notification(
        db=db,
        user_id=app.student.user_id,
        title="Interview Result Recorded",
        message=f"Your result for {round_obj.name} with {app.drive.company.name}: {payload.status.value}",
        notification_type=NotificationType.INTERVIEW_SCHEDULED,
        link=f"/interviews/{interview.id}"
    )

    return interview
