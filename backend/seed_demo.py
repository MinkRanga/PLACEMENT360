
from app.db.session import SessionLocal
from app.models import (
    User,
    Student,
    Company,
    Recruiter,
    Department,
    UserRole,
    Gender,
    StudentPlacementStatus,
    CompanyTier,
)
from app.core.security import hash_password


def get_or_create_user(db, email, password, role):
    user = db.query(User).filter(User.email == email).first()

    if user:
        if user.role != role:
            raise ValueError(
                f"{email} already exists with a different role: {user.role}"
            )

        # Reset the password for this development demo account.
        user.hashed_password = hash_password(password)
        user.is_active = True
        user.is_verified = True
        return user

    user = User(
        email=email,
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
        is_verified=True,
    )

    db.add(user)
    db.flush()
    return user


def seed_demo_accounts():
    db = SessionLocal()

    try:
        # 1. Create or retrieve CSE department
        department = (
            db.query(Department)
            .filter(Department.code == "DEMO-CSE")
            .first()
        )

        if not department:
            department = Department(
                code="DEMO-CSE",
                name="Computer Science and Engineering",
                is_active=True,
            )
            db.add(department)
            db.flush()

        # 2. Create or retrieve TechCorp company
        company = (
            db.query(Company)
            .filter(Company.name == "TechCorp")
            .first()
        )

        if not company:
            company = Company(
                name="TechCorp",
                industry="Information Technology",
                tier=CompanyTier.TIER_2,
                website="https://example.com",
                is_active=True,
                is_verified=True,
            )
            db.add(company)
            db.flush()

        # 3. Create TPO Administrator
        admin = get_or_create_user(
            db,
            "admin@placement360.edu",
            "AdminSecurePass2026!",
            UserRole.TPO_ADMIN,
        )

        # 4. Create Student account and profile
        student_user = get_or_create_user(
            db,
            "student@placement360.edu",
            "StudentPass2026!",
            UserRole.STUDENT,
        )

        student_profile = (
            db.query(Student)
            .filter(Student.user_id == student_user.id)
            .first()
        )

        if not student_profile:
            existing_roll = (
                db.query(Student)
                .filter(Student.roll_number == "DEMO2026CSE001")
                .first()
            )

            if existing_roll:
                raise ValueError(
                    "Demo student roll number already belongs to another account."
                )

            student_profile = Student(
                user_id=student_user.id,
                roll_number="DEMO2026CSE001",
                first_name="Demo",
                last_name="Student",
                department_id=department.id,
                batch_year=2028,
                gender=Gender.OTHER,
                cgpa=8.50,
                tenth_percentage=90.0,
                twelfth_percentage=88.0,
                active_backlogs=0,
                history_backlogs=0,
                skills=["Python", "Java", "SQL", "React"],
                is_placed=False,
                placement_status=StudentPlacementStatus.UNPLACED,
            )
            db.add(student_profile)

        # 5. Create Recruiter account and profile
        recruiter_user = get_or_create_user(
            db,
            "recruiter@techcorp.com",
            "RecruiterPass2026!",
            UserRole.RECRUITER,
        )

        recruiter_profile = (
            db.query(Recruiter)
            .filter(Recruiter.user_id == recruiter_user.id)
            .first()
        )

        if not recruiter_profile:
            recruiter_profile = Recruiter(
                user_id=recruiter_user.id,
                company_id=company.id,
                designation="Talent Acquisition Manager",
                is_primary_contact=True,
            )
            db.add(recruiter_profile)

        # Save everything together
        db.commit()

        print("\nDemo accounts seeded successfully!")
        print("TPO Admin: admin@placement360.edu")
        print("Student: student@placement360.edu")
        print("Recruiter: recruiter@techcorp.com")
        print("\nThe demo passwords are the ones configured in LoginPage.jsx.")
        print("Existing database records were preserved.")

    except Exception as error:
        db.rollback()
        print(f"\nSeeding failed: {error}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_accounts()
