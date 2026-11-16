from .health import router as health_router
from .auth import router as auth_router
from .departments import router as departments_router
from .students import router as students_router
from .companies import router as companies_router
from .drives import router as drives_router
from .applications import router as applications_router
from .interviews import router as interviews_router
from .offers import router as offers_router
from .notifications import router as notifications_router
from .reports import router as reports_router

__all__ = [
    "health_router",
    "auth_router",
    "departments_router",
    "students_router",
    "companies_router",
    "drives_router",
    "applications_router",
    "interviews_router",
    "offers_router",
    "notifications_router",
    "reports_router",
]
