from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import (
    get_db, require_admin, require_recruiter, 
    require_admin_or_recruiter, get_current_active_user, require_student
)
from app.models.drive import PlacementDrive, EligibilityCriteria, InterviewRound
from app.models.company import Company, Recruiter
from app.models.department import Department
from app.models.student import Student
from app.models.user import User
from app.models.enums import DriveStatus, UserRole
from app.schemas.drive import (
    PlacementDriveCreate, PlacementDriveUpdate, PlacementDriveStatusUpdate,
    PlacementDriveOut, PlacementDriveDetailOut
)
from app.schemas.eligibility import EligibilityCheckResult
from app.schemas.common import PaginatedResponse
from app.services.eligibility import evaluate_eligibility
from app.services.notifications import create_notification
from app.models.enums import NotificationType

router = APIRouter()


@router.get("", response_model=PaginatedResponse[PlacementDriveDetailOut], summary="List Placement Drives")
def list_drives(
    company_id: Optional[UUID] = Query(None, description="Filter by company"),
    status: Optional[DriveStatus] = Query(None, description="Filter by status"),
    batch_year: Optional[int] = Query(None, description="Filter by target batch year"),
    eligible_only: bool = Query(False, description="For students: show only eligible drives"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Lists placement drives with filtering and pagination.
    """
    query = db.query(PlacementDrive)

    # Recruiters only see their own company drives unless Admin
    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if recruiter:
            query = query.filter(PlacementDrive.company_id == recruiter.company_id)

    # Students only see drives that are active/announced
    if current_user.role == UserRole.STUDENT:
        query = query.filter(PlacementDrive.status.in_([
            DriveStatus.ANNOUNCED, 
            DriveStatus.REGISTRATION_OPEN, 
            DriveStatus.REGISTRATION_CLOSED,
            DriveStatus.IN_PROGRESS,
            DriveStatus.COMPLETED
        ]))

    if company_id:
        query = query.filter(PlacementDrive.company_id == company_id)
    if status:
        query = query.filter(PlacementDrive.status == status)
    if batch_year:
        query = query.filter(PlacementDrive.batch_year == batch_year)

    all_drives = query.order_by(desc(PlacementDrive.created_at)).all()

    # Optional student eligibility filter
    if eligible_only and current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if student:
            all_drives = [d for d in all_drives if evaluate_eligibility(student, d).is_eligible]

    total = len(all_drives)
    paginated_items = all_drives[skip : skip + limit]

    return PaginatedResponse(items=paginated_items, total=total, skip=skip, limit=limit)


@router.post("", response_model=PlacementDriveDetailOut, status_code=status.HTTP_201_CREATED, summary="Create Placement Drive")
def create_drive(
    payload: PlacementDriveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Creates a new placement drive, sets eligibility criteria, and assigns allowed departments.
    """
    # Verify company
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if not recruiter or recruiter.company_id != payload.company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create drive for another company")

    drive = PlacementDrive(
        company_id=payload.company_id,
        title=payload.title.strip(),
        job_role=payload.job_role.strip(),
        job_description=payload.job_description,
        job_location=payload.job_location,
        package_lpa=payload.package_lpa,
        ctc_breakdown=payload.ctc_breakdown,
        drive_type=payload.drive_type,
        status=payload.status,
        registration_start_date=payload.registration_start_date,
        registration_end_date=payload.registration_end_date,
        drive_date=payload.drive_date,
        batch_year=payload.batch_year,
    )

    # Attach departments
    if payload.allowed_department_ids:
        depts = db.query(Department).filter(Department.id.in_(payload.allowed_department_ids)).all()
        drive.allowed_departments = depts

    db.add(drive)
    db.flush()

    # Create Eligibility Criteria
    if payload.eligibility_criteria:
        crit_data = payload.eligibility_criteria.model_dump()
        criteria = EligibilityCriteria(
            drive_id=drive.id,
            **crit_data
        )
        db.add(criteria)

    db.commit()
    db.refresh(drive)
    return drive


@router.get("/{id}", response_model=PlacementDriveDetailOut, summary="Get Placement Drive Details")
def get_drive(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")
    return drive


@router.put("/{id}", response_model=PlacementDriveDetailOut, summary="Update Placement Drive")
def update_drive(
    id: UUID,
    payload: PlacementDriveUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if not recruiter or recruiter.company_id != drive.company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit this drive")

    update_dict = payload.model_dump(exclude_unset=True)
    dept_ids = update_dict.pop("allowed_department_ids", None)
    crit_update = update_dict.pop("eligibility_criteria", None)

    for field, val in update_dict.items():
        setattr(drive, field, val)

    if dept_ids is not None:
        depts = db.query(Department).filter(Department.id.in_(dept_ids)).all()
        drive.allowed_departments = depts

    if crit_update is not None:
        if drive.eligibility_criteria:
            for c_field, c_val in crit_update.items():
                if c_val is not None:
                    setattr(drive.eligibility_criteria, c_field, c_val)
        else:
            criteria = EligibilityCriteria(drive_id=drive.id, **crit_update)
            db.add(criteria)

    db.commit()
    db.refresh(drive)
    return drive


@router.patch("/{id}/status", response_model=PlacementDriveDetailOut, summary="Update Drive Status")
def update_drive_status(
    id: UUID,
    payload: PlacementDriveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    drive.status = payload.status
    db.commit()
    db.refresh(drive)
    return drive


@router.get("/{id}/check-eligibility", response_model=EligibilityCheckResult, summary="Check Real-Time Student Eligibility")
def check_drive_eligibility(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    """
    Evaluates whether the currently authenticated student is eligible for this drive.
    Returns clear pass/fail breakdown of all criteria.
    """
    drive = db.query(PlacementDrive).filter(PlacementDrive.id == id).first()
    if not drive:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Placement drive not found")

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student record not found")

    return evaluate_eligibility(student, drive)
