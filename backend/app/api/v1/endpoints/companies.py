from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import (
    get_db, require_admin, require_admin_or_recruiter, get_current_active_user
)
from app.models.company import Company, Recruiter
from app.models.user import User
from app.models.enums import CompanyTier, UserRole
from app.schemas.company import (
    CompanyCreate, CompanyUpdate, CompanyOut, RecruiterOut
)
from app.schemas.drive import PlacementDriveOut

router = APIRouter()


@router.get("", response_model=List[CompanyOut], summary="List Companies")
def list_companies(
    search: Optional[str] = Query(None, description="Search by company name"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    tier: Optional[CompanyTier] = Query(None, description="Filter by company tier"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Returns directory of participating placement companies.
    """
    query = db.query(Company)
    if search:
        query = query.filter(Company.name.ilike(f"%{search.strip()}%"))
    if industry:
        query = query.filter(Company.industry == industry)
    if tier:
        query = query.filter(Company.tier == tier)

    return query.order_by(Company.name.asc()).all()


@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED, summary="Create Company")
def create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Onboards a new corporate partner company.
    """
    name = payload.name.strip()
    if db.query(Company).filter(Company.name.ilike(name)).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Company '{name}' already registered")

    company = Company(
        name=name,
        industry=payload.industry.strip(),
        tier=payload.tier,
        website=payload.website,
        address=payload.address,
        is_active=payload.is_active,
        is_verified=payload.is_verified,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


@router.get("/{id}", response_model=CompanyOut, summary="Get Company by ID")
def get_company(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company


@router.put("/{id}", response_model=CompanyOut, summary="Update Company")
def update_company(
    id: UUID,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    # If recruiter, verify they belong to this company
    if current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if not recruiter or recruiter.company_id != id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit other companies")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, val)

    db.commit()
    db.refresh(company)
    return company


@router.get("/{id}/recruiters", response_model=List[RecruiterOut], summary="List Company Recruiters")
def list_company_recruiters(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    return db.query(Recruiter).filter(Recruiter.company_id == id).all()


@router.get("/{id}/drives", response_model=List[PlacementDriveOut], summary="List Drives for Company")
def list_company_drives(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    company = db.query(Company).filter(Company.id == id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    return company.drives
