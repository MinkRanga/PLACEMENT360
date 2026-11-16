from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin, require_admin_or_recruiter
from app.models.user import User
from app.schemas.reports import (
    ExecutiveDashboardStats,
    DepartmentPlacementStats,
    CompanyRecruitmentStats,
    PackageStats,
    FunnelStats,
    UnplacedStudentItem,
    PendingInterviewItem,
    PendingOfferItem,
)
from app.services.reporting import (
    get_executive_summary,
    get_department_placement_stats,
    get_company_recruitment_stats,
    get_package_stats,
    get_application_funnel_stats,
    get_unplaced_students,
    get_pending_interviews,
    get_pending_offers,
)

router = APIRouter()


@router.get("/summary", response_model=ExecutiveDashboardStats, summary="Executive Placement KPI Summary")
def report_executive_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Returns executive KPI summary: placement rate, counts, average CTC, active drives.
    """
    return get_executive_summary(db)


@router.get("/departments", response_model=List[DepartmentPlacementStats], summary="Department-Wise Placement Statistics")
def report_department_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Returns department-level breakdown: total students, placed count, placement %, avg and highest package.
    """
    return get_department_placement_stats(db)


@router.get("/companies", response_model=List[CompanyRecruitmentStats], summary="Company-Wise Recruitment Statistics")
def report_company_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Returns corporate recruitment metrics: total drives, applications received, offers released, conversion rate.
    """
    return get_company_recruitment_stats(db)


@router.get("/packages", response_model=PackageStats, summary="Salary & Package Distribution Metrics")
def report_package_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Returns statistical metrics on packages: average CTC, median CTC, highest, and lowest package.
    """
    return get_package_stats(db)


@router.get("/funnel", response_model=FunnelStats, summary="Application Selection Funnel Analytics")
def report_funnel_stats(
    drive_id: Optional[UUID] = Query(None, description="Optional drive ID to filter funnel"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Returns application stage distribution: Applied -> Eligible -> Shortlisted -> In-Process -> Selected -> Rejected.
    """
    return get_application_funnel_stats(db, drive_id=drive_id)


@router.get("/unplaced", response_model=List[UnplacedStudentItem], summary="Unplaced Student Exception Report")
def report_unplaced_students(
    department_id: Optional[UUID] = Query(None, description="Filter by department"),
    batch_year: Optional[int] = Query(None, description="Filter by batch year"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
) -> Any:
    """
    Generates actionable exception list of unplaced students for targeted interventions.
    """
    return get_unplaced_students(db, department_id=department_id, batch_year=batch_year)


@router.get("/pending-interviews", response_model=List[PendingInterviewItem], summary="Pending Interview Schedule Report")
def report_pending_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Lists upcoming and pending interview rounds needing attention or results recording.
    """
    return get_pending_interviews(db)


@router.get("/pending-offers", response_model=List[PendingOfferItem], summary="Pending Offer Acceptance Report")
def report_pending_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Lists released offers awaiting student decision.
    """
    return get_pending_offers(db)
