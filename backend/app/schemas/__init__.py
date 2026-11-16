"""
Pydantic Schemas Package for PLACEMENT360
"""

from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.user import (
    Token, TokenPayload, UserBase, UserCreate, UserUpdate, 
    UserPasswordUpdate, UserOut, AdminRegisterRequest
)
from app.schemas.department import (
    DepartmentBase, DepartmentCreate, DepartmentUpdate, DepartmentOut
)
from app.schemas.company import (
    CompanyBase, CompanyCreate, CompanyUpdate, CompanyOut,
    RecruiterBase, RecruiterCreate, RecruiterRegisterRequest, RecruiterUpdate, RecruiterOut
)
from app.schemas.student import (
    StudentBase, StudentCreate, StudentRegisterRequest, 
    StudentUpdate, StudentPlacementUpdate, StudentOut, StudentDetailOut
)
from app.schemas.drive import (
    EligibilityCriteriaBase, EligibilityCriteriaCreate, EligibilityCriteriaUpdate, EligibilityCriteriaOut,
    InterviewRoundBase, InterviewRoundCreate, InterviewRoundUpdate, InterviewRoundOut,
    PlacementDriveBase, PlacementDriveCreate, PlacementDriveUpdate, PlacementDriveStatusUpdate,
    PlacementDriveOut, PlacementDriveDetailOut
)
from app.schemas.eligibility import EligibilityCheckItem, EligibilityCheckResult
from app.schemas.application import (
    ApplicationCreate, ApplicationStatusUpdate, ApplicationOut, ApplicationDetailOut
)
from app.schemas.interview import (
    InterviewCreate, InterviewUpdate, InterviewScoreUpdate, InterviewOut, InterviewDetailOut
)
from app.schemas.offer import (
    PlacementOfferCreate, PlacementOfferUpdate, PlacementOfferResponse, 
    PlacementOfferOut, PlacementOfferDetailOut
)
from app.schemas.notification import (
    NotificationCreate, NotificationOut, NotificationListOut
)
from app.schemas.reports import (
    DepartmentPlacementStats, CompanyRecruitmentStats, PackageStats,
    FunnelStageCount, FunnelStats, UnplacedStudentItem, PendingInterviewItem,
    PendingOfferItem, ExecutiveDashboardStats
)

__all__ = [
    "MessageResponse",
    "PaginatedResponse",
    "Token",
    "TokenPayload",
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserPasswordUpdate",
    "UserOut",
    "AdminRegisterRequest",
    "DepartmentBase",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentOut",
    "CompanyBase",
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyOut",
    "RecruiterBase",
    "RecruiterCreate",
    "RecruiterRegisterRequest",
    "RecruiterUpdate",
    "RecruiterOut",
    "StudentBase",
    "StudentCreate",
    "StudentRegisterRequest",
    "StudentUpdate",
    "StudentPlacementUpdate",
    "StudentOut",
    "StudentDetailOut",
    "EligibilityCriteriaBase",
    "EligibilityCriteriaCreate",
    "EligibilityCriteriaUpdate",
    "EligibilityCriteriaOut",
    "InterviewRoundBase",
    "InterviewRoundCreate",
    "InterviewRoundUpdate",
    "InterviewRoundOut",
    "PlacementDriveBase",
    "PlacementDriveCreate",
    "PlacementDriveUpdate",
    "PlacementDriveStatusUpdate",
    "PlacementDriveOut",
    "PlacementDriveDetailOut",
    "EligibilityCheckItem",
    "EligibilityCheckResult",
    "ApplicationCreate",
    "ApplicationStatusUpdate",
    "ApplicationOut",
    "ApplicationDetailOut",
    "InterviewCreate",
    "InterviewUpdate",
    "InterviewScoreUpdate",
    "InterviewOut",
    "InterviewDetailOut",
    "PlacementOfferCreate",
    "PlacementOfferUpdate",
    "PlacementOfferResponse",
    "PlacementOfferOut",
    "PlacementOfferDetailOut",
    "NotificationCreate",
    "NotificationOut",
    "NotificationListOut",
    "DepartmentPlacementStats",
    "CompanyRecruitmentStats",
    "PackageStats",
    "FunnelStageCount",
    "FunnelStats",
    "UnplacedStudentItem",
    "PendingInterviewItem",
    "PendingOfferItem",
    "ExecutiveDashboardStats",
]
