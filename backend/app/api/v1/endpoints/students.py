from typing import Any, List, Optional
from uuid import UUID
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from app.api.deps import (
    get_db, require_admin, require_student, 
    require_admin_or_recruiter, get_current_active_user
)
from app.models.student import Student
from app.models.user import User
from app.models.enums import UserRole, StudentPlacementStatus
from app.schemas.student import (
    StudentOut, StudentDetailOut, StudentUpdate, StudentPlacementUpdate
)
from app.schemas.common import PaginatedResponse, MessageResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[StudentDetailOut], summary="List and Filter Students")
def list_students(
    search: Optional[str] = Query(None, description="Search by roll number or student name"),
    department_id: Optional[UUID] = Query(None, description="Filter by department"),
    batch_year: Optional[int] = Query(None, description="Filter by batch year"),
    min_cgpa: Optional[Decimal] = Query(None, description="Minimum CGPA"),
    max_active_backlogs: Optional[int] = Query(None, description="Maximum active backlogs"),
    is_placed: Optional[bool] = Query(None, description="Filter by placement flag"),
    placement_status: Optional[StudentPlacementStatus] = Query(None, description="Filter by placement status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Search and filter students with pagination (TPO Admin and Recruiters).
    """
    query = db.query(Student)

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Student.roll_number.ilike(term),
                Student.first_name.ilike(term),
                Student.last_name.ilike(term),
            )
        )
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if batch_year:
        query = query.filter(Student.batch_year == batch_year)
    if min_cgpa is not None:
        query = query.filter(Student.cgpa >= min_cgpa)
    if max_active_backlogs is not None:
        query = query.filter(Student.active_backlogs <= max_active_backlogs)
    if is_placed is not None:
        query = query.filter(Student.is_placed == is_placed)
    if placement_status:
        query = query.filter(Student.placement_status == placement_status)

    total = query.count()
    items = query.order_by(Student.roll_number.asc()).offset(skip).limit(limit).all()

    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/me", response_model=StudentDetailOut, summary="Get Current Student Profile")
def get_student_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    """
    Retrieves the authenticated student's profile.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    return student


@router.put("/me", response_model=StudentDetailOut, summary="Update Current Student Profile")
def update_student_me(
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    """
    Allows a student to update their personal contact information, skills, and resume.
    Academic credentials (CGPA, backlogs, department) cannot be self-modified.
    """
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")

    if payload.phone is not None:
        student.phone = payload.phone
    if payload.resume_url is not None:
        student.resume_url = payload.resume_url
    if payload.skills is not None:
        student.skills = payload.skills
    if payload.first_name is not None:
        student.first_name = payload.first_name.strip()
    if payload.last_name is not None:
        student.last_name = payload.last_name.strip()

    db.commit()
    db.refresh(student)
    return student


@router.get("/{id}", response_model=StudentDetailOut, summary="Get Student by ID")
def get_student_by_id(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.put("/{id}", response_model=StudentDetailOut, summary="Admin Update Student Records")
def update_student_admin(
    id: UUID,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """
    Allows TPO Admin to update any student field including CGPA, backlogs, and department.
    """
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, val)

    db.commit()
    db.refresh(student)
    return student


@router.patch("/{id}/placement-status", response_model=StudentDetailOut, summary="Update Placement Status")
def update_student_placement_status(
    id: UUID,
    payload: StudentPlacementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """
    Administrative override of student placement status and package.
    """
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    student.is_placed = payload.is_placed
    student.placement_status = payload.placement_status
    if payload.current_package_lpa is not None:
        student.current_package_lpa = payload.current_package_lpa

    db.commit()
    db.refresh(student)
    return student


@router.patch("/{id}/deactivate", response_model=MessageResponse, summary="Deactivate Student Account")
def deactivate_student(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    student.user.is_active = False
    db.commit()
    return MessageResponse(message=f"Student account {student.roll_number} deactivated successfully")
