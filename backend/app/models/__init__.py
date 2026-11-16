"""
SQLAlchemy ORM Models Package for PLACEMENT360
"""

from app.db.session import Base
from app.models.enums import (
    UserRole,
    Gender,
    StudentPlacementStatus,
    CompanyTier,
    DriveType,
    DriveStatus,
    GenderAllowed,
    ApplicationStatus,
    RoundType,
    InterviewStatus,
    OfferStatus,
    NotificationType,
)
from app.models.user import User
from app.models.department import Department, drive_departments
from app.models.company import Company, Recruiter
from app.models.student import Student
from app.models.drive import PlacementDrive, EligibilityCriteria, InterviewRound
from app.models.application import Application
from app.models.interview import Interview
from app.models.offer import PlacementOffer
from app.models.notification import Notification
from app.models.activity_log import ActivityLog

__all__ = [
    "Base",
    "UserRole",
    "Gender",
    "StudentPlacementStatus",
    "CompanyTier",
    "DriveType",
    "DriveStatus",
    "GenderAllowed",
    "ApplicationStatus",
    "RoundType",
    "InterviewStatus",
    "OfferStatus",
    "NotificationType",
    "User",
    "Department",
    "drive_departments",
    "Company",
    "Recruiter",
    "Student",
    "PlacementDrive",
    "EligibilityCriteria",
    "InterviewRound",
    "Application",
    "Interview",
    "PlacementOffer",
    "Notification",
    "ActivityLog",
]
