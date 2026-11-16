from fastapi import APIRouter
from app.api.v1.endpoints import (
    health_router,
    auth_router,
    departments_router,
    students_router,
    companies_router,
    drives_router,
    applications_router,
    interviews_router,
    offers_router,
    notifications_router,
    reports_router,
)

api_router = APIRouter()

# Register endpoint modules
api_router.include_router(health_router, tags=["System Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication & Accounts"])
api_router.include_router(departments_router, prefix="/departments", tags=["Department Management"])
api_router.include_router(students_router, prefix="/students", tags=["Student Management"])
api_router.include_router(companies_router, prefix="/companies", tags=["Company & Recruiter Management"])
api_router.include_router(drives_router, prefix="/drives", tags=["Placement Drives & Eligibility"])
api_router.include_router(applications_router, prefix="/applications", tags=["Application Management"])
api_router.include_router(interviews_router, prefix="/interviews", tags=["Interview Management"])
api_router.include_router(offers_router, prefix="/offers", tags=["Placement Offers"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(reports_router, prefix="/reports", tags=["MIS Reports & Analytics"])
