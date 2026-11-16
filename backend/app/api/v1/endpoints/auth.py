from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.student import Student
from app.models.company import Recruiter, Company
from app.models.enums import UserRole
from app.schemas.user import (
    Token, UserOut, UserPasswordUpdate, AdminRegisterRequest
)
from app.schemas.student import StudentRegisterRequest
from app.schemas.company import RecruiterRegisterRequest
from app.schemas.common import MessageResponse

router = APIRouter()


@router.post("/login", response_model=Token, summary="User Login")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login. Accepts username (email) and password.
    Returns signed JWT access token and user role.
    """
    email = form_data.username.strip().lower()
    user = db.query(User).filter(User.email == email).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact TPO Administrator."
        )

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
    }


@router.post("/register/student", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register Student")
def register_student(
    payload: StudentRegisterRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Registers a new student account and creates the corresponding Student profile.
    """
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    if db.query(Student).filter(Student.roll_number == payload.roll_number.strip().upper()).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Roll number already registered")

    # Create User
    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        role=UserRole.STUDENT,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()

    # Create Student profile
    student = Student(
        user_id=user.id,
        roll_number=payload.roll_number.strip().upper(),
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        department_id=payload.department_id,
        batch_year=payload.batch_year,
        gender=payload.gender,
        cgpa=payload.cgpa,
        tenth_percentage=payload.tenth_percentage,
        twelfth_percentage=payload.twelfth_percentage,
        active_backlogs=payload.active_backlogs,
        history_backlogs=payload.history_backlogs,
        phone=payload.phone,
        resume_url=payload.resume_url,
        skills=payload.skills,
        is_placed=False,
    )
    db.add(student)
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
    }


@router.post("/register/recruiter", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Register Recruiter")
def register_recruiter(
    payload: RecruiterRegisterRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Registers a corporate recruiter account for an existing company.
    """
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        role=UserRole.RECRUITER,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.flush()

    recruiter = Recruiter(
        user_id=user.id,
        company_id=payload.company_id,
        designation=payload.designation,
        phone=payload.phone,
        is_primary_contact=payload.is_primary_contact,
    )
    db.add(recruiter)
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
    }


@router.post("/register/admin", response_model=Token, status_code=status.HTTP_201_CREATED, summary="Seed / Register TPO Administrator")
def register_admin(
    payload: AdminRegisterRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Registers a TPO Administrator account.
    """
    email = payload.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        role=UserRole.TPO_ADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
    }


@router.get("/me", response_model=UserOut, summary="Get Current Authenticated User")
def get_user_me(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Returns current user session metadata.
    """
    return current_user


@router.post("/change-password", response_model=MessageResponse, summary="Change Password")
def change_password(
    payload: UserPasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Changes current user password after verifying existing password.
    """
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password updated successfully")
