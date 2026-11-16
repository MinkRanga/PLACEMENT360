from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin, get_current_active_user
from app.models.department import Department
from app.models.user import User
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut

router = APIRouter()


@router.get("", response_model=List[DepartmentOut], summary="List Departments")
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Returns all registered academic departments.
    """
    return db.query(Department).order_by(Department.code.asc()).all()


@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED, summary="Create Department")
def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """
    Adds a new academic department (TPO Admin only).
    """
    code = payload.code.strip().upper()
    if db.query(Department).filter(Department.code == code).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Department code '{code}' already exists")

    dept = Department(
        code=code,
        name=payload.name.strip(),
        is_active=payload.is_active
    )
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("/{id}", response_model=DepartmentOut, summary="Get Department by ID")
def get_department(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")
    return dept


@router.put("/{id}", response_model=DepartmentOut, summary="Update Department")
def update_department(
    id: UUID,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """
    Updates an academic department (TPO Admin only).
    """
    dept = db.query(Department).filter(Department.id == id).first()
    if not dept:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Department not found")

    if payload.code is not None:
        new_code = payload.code.strip().upper()
        existing = db.query(Department).filter(Department.code == new_code, Department.id != id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Department code already taken")
        dept.code = new_code

    if payload.name is not None:
        dept.name = payload.name.strip()
    if payload.is_active is not None:
        dept.is_active = payload.is_active

    db.commit()
    db.refresh(dept)
    return dept
