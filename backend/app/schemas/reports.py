from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class DepartmentPlacementStats(BaseModel):
    department_id: UUID
    department_code: str
    department_name: str
    total_students: int
    placed_students: int
    unplaced_students: int
    placement_percentage: float
    avg_package_lpa: Optional[float] = None
    highest_package_lpa: Optional[float] = None


class CompanyRecruitmentStats(BaseModel):
    company_id: UUID
    company_name: str
    industry: str
    tier: str
    total_drives: int
    total_applications: int
    total_offers_released: int
    total_offers_accepted: int
    avg_offered_package_lpa: Optional[float] = None


class PackageStats(BaseModel):
    average_package_lpa: float
    median_package_lpa: float
    highest_package_lpa: float
    lowest_package_lpa: float
    total_offers: int


class FunnelStageCount(BaseModel):
    stage: str
    count: int
    percentage_of_total: float


class FunnelStats(BaseModel):
    total_applications: int
    stages: List[FunnelStageCount]


class UnplacedStudentItem(BaseModel):
    student_id: UUID
    roll_number: str
    name: str
    department_code: str
    batch_year: int
    cgpa: float
    active_backlogs: int
    email: str
    phone: Optional[str] = None


class PendingInterviewItem(BaseModel):
    interview_id: UUID
    candidate_name: str
    roll_number: str
    company_name: str
    drive_title: str
    round_name: str
    round_order: int
    scheduled_time: Optional[datetime] = None
    status: str


class PendingOfferItem(BaseModel):
    offer_id: UUID
    student_name: str
    roll_number: str
    company_name: str
    designation: str
    package_lpa: float
    released_at: datetime
    valid_until: Optional[datetime] = None


class ExecutiveDashboardStats(BaseModel):
    total_students: int
    placed_students: int
    unplaced_students: int
    placement_percentage: float
    total_companies: int
    total_drives: int
    active_drives: int
    total_offers_released: int
    total_offers_accepted: int
    avg_package_lpa: float
    highest_package_lpa: float
