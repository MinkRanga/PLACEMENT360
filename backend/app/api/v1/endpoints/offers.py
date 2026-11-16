from typing import Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.api.deps import (
    get_db, require_admin, require_recruiter, 
    require_admin_or_recruiter, require_student, get_current_active_user
)
from app.models.offer import PlacementOffer
from app.models.application import Application
from app.models.student import Student
from app.models.company import Company, Recruiter
from app.models.user import User
from app.models.enums import OfferStatus, StudentPlacementStatus, ApplicationStatus, UserRole, NotificationType
from app.schemas.offer import (
    PlacementOfferCreate, PlacementOfferUpdate, PlacementOfferResponse,
    PlacementOfferOut, PlacementOfferDetailOut
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.services.notifications import create_notification

router = APIRouter()


@router.post("", response_model=PlacementOfferDetailOut, status_code=status.HTTP_201_CREATED, summary="Create and Issue Placement Offer")
def issue_offer(
    payload: PlacementOfferCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_recruiter)
) -> Any:
    """
    Issues a formal placement offer to a candidate application.
    """
    app = db.query(Application).filter(Application.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    existing_offer = db.query(PlacementOffer).filter(PlacementOffer.application_id == payload.application_id).first()
    if existing_offer:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An offer has already been issued for this application"
        )

    drive = app.drive
    student = app.student

    offer = PlacementOffer(
        application_id=app.id,
        student_id=student.id,
        company_id=drive.company_id,
        drive_id=drive.id,
        designation=payload.designation.strip(),
        package_lpa=payload.package_lpa,
        ctc_breakdown=payload.ctc_breakdown,
        offer_letter_url=payload.offer_letter_url,
        valid_until=payload.valid_until,
        status=OfferStatus.PENDING,
        released_at=datetime.now(timezone.utc),
    )
    db.add(offer)

    # Mark application status as SELECTED
    app.status = ApplicationStatus.SELECTED

    db.commit()
    db.refresh(offer)

    # Trigger celebration notification for the student
    create_notification(
        db=db,
        user_id=student.user_id,
        title="Congratulations! Placement Offer Released",
        message=f"{drive.company.name} has released a placement offer for {payload.designation} ({payload.package_lpa} LPA).",
        notification_type=NotificationType.OFFER_RELEASED,
        link=f"/offers/{offer.id}"
    )

    return offer


@router.get("", response_model=PaginatedResponse[PlacementOfferDetailOut], summary="List Placement Offers")
def list_offers(
    status: Optional[OfferStatus] = Query(None, description="Filter by offer status"),
    company_id: Optional[UUID] = Query(None, description="Filter by company"),
    student_id: Optional[UUID] = Query(None, description="Filter by student"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    query = db.query(PlacementOffer)

    if current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student:
            return PaginatedResponse(items=[], total=0, skip=skip, limit=limit)
        query = query.filter(PlacementOffer.student_id == student.id)
    elif current_user.role == UserRole.RECRUITER:
        recruiter = db.query(Recruiter).filter(Recruiter.user_id == current_user.id).first()
        if recruiter:
            query = query.filter(PlacementOffer.company_id == recruiter.company_id)

    if status:
        query = query.filter(PlacementOffer.status == status)
    if company_id:
        query = query.filter(PlacementOffer.company_id == company_id)
    if student_id and current_user.role != UserRole.STUDENT:
        query = query.filter(PlacementOffer.student_id == student_id)

    total = query.count()
    items = query.order_by(desc(PlacementOffer.released_at)).offset(skip).limit(limit).all()

    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=PlacementOfferDetailOut, summary="Get Placement Offer Details")
def get_offer(
    id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    offer = db.query(PlacementOffer).filter(PlacementOffer.id == id).first()
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.user_id == current_user.id).first()
        if not student or offer.student_id != student.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return offer


@router.post("/{id}/respond", response_model=PlacementOfferDetailOut, summary="Student Respond to Placement Offer (Accept/Reject)")
def respond_to_offer(
    id: UUID,
    payload: PlacementOfferResponse,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
) -> Any:
    """
    Student accepts or rejects a placement offer.
    If ACCEPTED: Updates student placement status to PLACED, logs current package, and locks eligibility accordingly.
    """
    if payload.status not in [OfferStatus.ACCEPTED, OfferStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be either ACCEPTED or REJECTED"
        )

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    offer = db.query(PlacementOffer).filter(PlacementOffer.id == id).first()

    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    if not student or offer.student_id != student.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot respond to another student's offer")

    if offer.status != OfferStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot respond to an offer with status: {offer.status.value}"
        )

    offer.status = payload.status
    offer.responded_at = datetime.now(timezone.utc)
    if payload.student_remarks:
        offer.student_remarks = payload.student_remarks

    # If accepted, mark student placed
    if payload.status == OfferStatus.ACCEPTED:
        student.is_placed = True
        student.placement_status = StudentPlacementStatus.PLACED
        if not student.current_package_lpa or offer.package_lpa > student.current_package_lpa:
            student.current_package_lpa = offer.package_lpa

    db.commit()
    db.refresh(offer)
    return offer
