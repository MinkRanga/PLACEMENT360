import statistics
from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.student import Student
from app.models.department import Department
from app.models.company import Company
from app.models.drive import PlacementDrive
from app.models.application import Application
from app.models.interview import Interview
from app.models.offer import PlacementOffer
from app.models.enums import DriveStatus, OfferStatus, InterviewStatus, ApplicationStatus
from app.schemas.reports import (
    ExecutiveDashboardStats,
    DepartmentPlacementStats,
    CompanyRecruitmentStats,
    PackageStats,
    FunnelStats,
    FunnelStageCount,
    UnplacedStudentItem,
    PendingInterviewItem,
    PendingOfferItem,
)


def get_executive_summary(db: Session) -> ExecutiveDashboardStats:
    total_students = db.query(func.count(Student.id)).scalar() or 0
    placed_students = db.query(func.count(Student.id)).filter(Student.is_placed.is_(True)).scalar() or 0
    unplaced_students = max(0, total_students - placed_students)
    placement_percentage = round((placed_students / total_students * 100), 2) if total_students > 0 else 0.0

    total_companies = db.query(func.count(Company.id)).scalar() or 0
    total_drives = db.query(func.count(PlacementDrive.id)).scalar() or 0
    active_drives = db.query(func.count(PlacementDrive.id)).filter(
        PlacementDrive.status.in_([DriveStatus.REGISTRATION_OPEN, DriveStatus.IN_PROGRESS, DriveStatus.ANNOUNCED])
    ).scalar() or 0

    total_offers_released = db.query(func.count(PlacementOffer.id)).scalar() or 0
    total_offers_accepted = db.query(func.count(PlacementOffer.id)).filter(
        PlacementOffer.status == OfferStatus.ACCEPTED
    ).scalar() or 0

    avg_package = db.query(func.avg(PlacementOffer.package_lpa)).filter(
        PlacementOffer.status == OfferStatus.ACCEPTED
    ).scalar()
    highest_package = db.query(func.max(PlacementOffer.package_lpa)).filter(
        PlacementOffer.status == OfferStatus.ACCEPTED
    ).scalar()

    return ExecutiveDashboardStats(
        total_students=total_students,
        placed_students=placed_students,
        unplaced_students=unplaced_students,
        placement_percentage=placement_percentage,
        total_companies=total_companies,
        total_drives=total_drives,
        active_drives=active_drives,
        total_offers_released=total_offers_released,
        total_offers_accepted=total_offers_accepted,
        avg_package_lpa=round(float(avg_package), 2) if avg_package else 0.0,
        highest_package_lpa=round(float(highest_package), 2) if highest_package else 0.0,
    )


def get_department_placement_stats(db: Session) -> List[DepartmentPlacementStats]:
    departments = db.query(Department).all()
    results = []

    for dept in departments:
        total = db.query(func.count(Student.id)).filter(Student.department_id == dept.id).scalar() or 0
        placed = db.query(func.count(Student.id)).filter(
            Student.department_id == dept.id,
            Student.is_placed.is_(True)
        ).scalar() or 0
        unplaced = max(0, total - placed)
        pct = round((placed / total * 100), 2) if total > 0 else 0.0

        # Calculate average and highest package for this department from placed students
        avg_pkg = db.query(func.avg(Student.current_package_lpa)).filter(
            Student.department_id == dept.id,
            Student.is_placed.is_(True),
            Student.current_package_lpa.isnot(None)
        ).scalar()
        max_pkg = db.query(func.max(Student.current_package_lpa)).filter(
            Student.department_id == dept.id,
            Student.is_placed.is_(True),
            Student.current_package_lpa.isnot(None)
        ).scalar()

        results.append(DepartmentPlacementStats(
            department_id=dept.id,
            department_code=dept.code,
            department_name=dept.name,
            total_students=total,
            placed_students=placed,
            unplaced_students=unplaced,
            placement_percentage=pct,
            avg_package_lpa=round(float(avg_pkg), 2) if avg_pkg else None,
            highest_package_lpa=round(float(max_pkg), 2) if max_pkg else None,
        ))

    return results


def get_company_recruitment_stats(db: Session) -> List[CompanyRecruitmentStats]:
    companies = db.query(Company).all()
    results = []

    for comp in companies:
        total_drives = db.query(func.count(PlacementDrive.id)).filter(PlacementDrive.company_id == comp.id).scalar() or 0
        
        # Total applications submitted to company's drives
        total_apps = db.query(func.count(Application.id)).join(
            PlacementDrive, Application.drive_id == PlacementDrive.id
        ).filter(PlacementDrive.company_id == comp.id).scalar() or 0

        offers_released = db.query(func.count(PlacementOffer.id)).filter(PlacementOffer.company_id == comp.id).scalar() or 0
        offers_accepted = db.query(func.count(PlacementOffer.id)).filter(
            PlacementOffer.company_id == comp.id,
            PlacementOffer.status == OfferStatus.ACCEPTED
        ).scalar() or 0

        avg_offered = db.query(func.avg(PlacementOffer.package_lpa)).filter(
            PlacementOffer.company_id == comp.id
        ).scalar()

        results.append(CompanyRecruitmentStats(
            company_id=comp.id,
            company_name=comp.name,
            industry=comp.industry,
            tier=comp.tier.value if hasattr(comp.tier, "value") else str(comp.tier),
            total_drives=total_drives,
            total_applications=total_apps,
            total_offers_released=offers_released,
            total_offers_accepted=offers_accepted,
            avg_offered_package_lpa=round(float(avg_offered), 2) if avg_offered else None,
        ))

    return results


def get_package_stats(db: Session) -> PackageStats:
    offers = db.query(PlacementOffer.package_lpa).filter(
        PlacementOffer.status.in_([OfferStatus.ACCEPTED, OfferStatus.PENDING])
    ).all()
    packages = [float(o[0]) for o in offers if o[0] is not None]

    if not packages:
        return PackageStats(
            average_package_lpa=0.0,
            median_package_lpa=0.0,
            highest_package_lpa=0.0,
            lowest_package_lpa=0.0,
            total_offers=0,
        )

    return PackageStats(
        average_package_lpa=round(statistics.mean(packages), 2),
        median_package_lpa=round(statistics.median(packages), 2),
        highest_package_lpa=round(max(packages), 2),
        lowest_package_lpa=round(min(packages), 2),
        total_offers=len(packages),
    )


def get_application_funnel_stats(db: Session, drive_id: Optional[UUID] = None) -> FunnelStats:
    query = db.query(Application)
    if drive_id:
        query = query.filter(Application.drive_id == drive_id)

    total = query.count()
    if total == 0:
        return FunnelStats(total_applications=0, stages=[])

    stages_order = [
        ApplicationStatus.APPLIED,
        ApplicationStatus.ELIGIBLE,
        ApplicationStatus.SHORTLISTED,
        ApplicationStatus.IN_PROCESS,
        ApplicationStatus.SELECTED,
        ApplicationStatus.REJECTED,
        ApplicationStatus.WITHDRAWN,
    ]

    stages_list = []
    for st in stages_order:
        c = query.filter(Application.status == st).count()
        stages_list.append(FunnelStageCount(
            stage=st.value,
            count=c,
            percentage_of_total=round((c / total * 100), 2) if total > 0 else 0.0,
        ))

    return FunnelStats(total_applications=total, stages=stages_list)


def get_unplaced_students(
    db: Session, 
    department_id: Optional[UUID] = None, 
    batch_year: Optional[int] = None
) -> List[UnplacedStudentItem]:
    query = db.query(Student).filter(Student.is_placed.is_(False))
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if batch_year:
        query = query.filter(Student.batch_year == batch_year)

    students = query.order_by(desc(Student.cgpa)).all()
    results = []
    for s in students:
        dept_code = s.department.code if s.department else "N/A"
        email = s.user.email if s.user else "N/A"
        results.append(UnplacedStudentItem(
            student_id=s.id,
            roll_number=s.roll_number,
            name=f"{s.first_name} {s.last_name}",
            department_code=dept_code,
            batch_year=s.batch_year,
            cgpa=float(s.cgpa),
            active_backlogs=s.active_backlogs,
            email=email,
            phone=s.phone,
        ))
    return results


def get_pending_interviews(db: Session) -> List[PendingInterviewItem]:
    interviews = db.query(Interview).filter(
        Interview.status == InterviewStatus.SCHEDULED
    ).order_by(Interview.scheduled_time.asc()).all()

    results = []
    for it in interviews:
        app = it.application
        student = app.student if app else None
        drive = app.drive if app else None
        comp = drive.company if drive else None
        round_obj = it.round

        results.append(PendingInterviewItem(
            interview_id=it.id,
            candidate_name=f"{student.first_name} {student.last_name}" if student else "N/A",
            roll_number=student.roll_number if student else "N/A",
            company_name=comp.name if comp else "N/A",
            drive_title=drive.title if drive else "N/A",
            round_name=round_obj.name if round_obj else "N/A",
            round_order=round_obj.round_order if round_obj else 1,
            scheduled_time=it.scheduled_time,
            status=it.status.value,
        ))
    return results


def get_pending_offers(db: Session) -> List[PendingOfferItem]:
    offers = db.query(PlacementOffer).filter(
        PlacementOffer.status == OfferStatus.PENDING
    ).order_by(PlacementOffer.released_at.asc()).all()

    results = []
    for off in offers:
        student = off.student
        comp = off.company
        results.append(PendingOfferItem(
            offer_id=off.id,
            student_name=f"{student.first_name} {student.last_name}" if student else "N/A",
            roll_number=student.roll_number if student else "N/A",
            company_name=comp.name if comp else "N/A",
            designation=off.designation,
            package_lpa=float(off.package_lpa),
            released_at=off.released_at,
            valid_until=off.valid_until,
        ))
    return results
