from typing import List
from decimal import Decimal
from app.models.student import Student
from app.models.drive import PlacementDrive, EligibilityCriteria
from app.models.enums import GenderAllowed
from app.schemas.eligibility import EligibilityCheckItem, EligibilityCheckResult


def evaluate_eligibility(student: Student, drive: PlacementDrive) -> EligibilityCheckResult:
    """
    Automated Eligibility Checking Engine for PLACEMENT360.
    Evaluates academic scores, backlogs, department matching, gender restrictions,
    and university placement policy (tier & already-placed constraints).
    """
    criteria: EligibilityCriteria = drive.eligibility_criteria
    reasons: List[str] = []
    checks: List[EligibilityCheckItem] = []

    # 1. Department Check
    allowed_dept_ids = [dept.id for dept in drive.allowed_departments]
    dept_match = (not allowed_dept_ids) or (student.department_id in allowed_dept_ids)
    student_dept_code = student.department.code if student.department else "N/A"
    allowed_codes = ", ".join([d.code for d in drive.allowed_departments]) if allowed_dept_ids else "All Departments"
    checks.append(EligibilityCheckItem(
        criteria="Department Eligibility",
        requirement=f"Allowed: {allowed_codes}",
        actual_value=student_dept_code,
        is_met=dept_match
    ))
    if not dept_match:
        reasons.append(f"Student department ({student_dept_code}) is not eligible for this drive ({allowed_codes})")

    # If no specific criteria object was configured, check baseline department & batch year
    if not criteria:
        # Check drive batch year
        batch_match = (student.batch_year == drive.batch_year)
        checks.append(EligibilityCheckItem(
            criteria="Batch Year",
            requirement=str(drive.batch_year),
            actual_value=str(student.batch_year),
            is_met=batch_match
        ))
        if not batch_match:
            reasons.append(f"Batch year mismatch: student is {student.batch_year}, drive requires {drive.batch_year}")

        is_eligible = len(reasons) == 0
        return EligibilityCheckResult(
            student_id=student.id,
            drive_id=drive.id,
            is_eligible=is_eligible,
            reasons=reasons,
            checks=checks
        )

    # 2. CGPA Cutoff
    cgpa_met = Decimal(str(student.cgpa)) >= Decimal(str(criteria.min_cgpa))
    checks.append(EligibilityCheckItem(
        criteria="Minimum CGPA",
        requirement=f">= {criteria.min_cgpa}",
        actual_value=str(student.cgpa),
        is_met=cgpa_met
    ))
    if not cgpa_met:
        reasons.append(f"CGPA ({student.cgpa}) is below required minimum cutoff ({criteria.min_cgpa})")

    # 3. Active Backlogs Ceiling
    backlogs_met = student.active_backlogs <= criteria.max_active_backlogs
    checks.append(EligibilityCheckItem(
        criteria="Active Backlogs",
        requirement=f"<= {criteria.max_active_backlogs}",
        actual_value=str(student.active_backlogs),
        is_met=backlogs_met
    ))
    if not backlogs_met:
        reasons.append(f"Active backlogs count ({student.active_backlogs}) exceeds allowable limit ({criteria.max_active_backlogs})")

    # 4. History Backlogs Ceiling
    if criteria.max_history_backlogs > 0 or criteria.max_history_backlogs == 0:
        hist_met = student.history_backlogs <= criteria.max_history_backlogs
        checks.append(EligibilityCheckItem(
            criteria="History Backlogs",
            requirement=f"<= {criteria.max_history_backlogs}",
            actual_value=str(student.history_backlogs),
            is_met=hist_met
        ))
        if not hist_met:
            reasons.append(f"History backlogs ({student.history_backlogs}) exceeds allowable limit ({criteria.max_history_backlogs})")

    # 5. 10th Percentage Cutoff
    if criteria.min_tenth_percentage and criteria.min_tenth_percentage > 0:
        actual_tenth = Decimal(str(student.tenth_percentage or 0.0))
        tenth_met = actual_tenth >= Decimal(str(criteria.min_tenth_percentage))
        checks.append(EligibilityCheckItem(
            criteria="10th Percentage",
            requirement=f">= {criteria.min_tenth_percentage}%",
            actual_value=f"{actual_tenth}%",
            is_met=tenth_met
        ))
        if not tenth_met:
            reasons.append(f"10th standard percentage ({actual_tenth}%) is below minimum requirement ({criteria.min_tenth_percentage}%)")

    # 6. 12th Percentage Cutoff
    if criteria.min_twelfth_percentage and criteria.min_twelfth_percentage > 0:
        actual_twelfth = Decimal(str(student.twelfth_percentage or 0.0))
        twelfth_met = actual_twelfth >= Decimal(str(criteria.min_twelfth_percentage))
        checks.append(EligibilityCheckItem(
            criteria="12th / Diploma Percentage",
            requirement=f">= {criteria.min_twelfth_percentage}%",
            actual_value=f"{actual_twelfth}%",
            is_met=twelfth_met
        ))
        if not twelfth_met:
            reasons.append(f"12th standard percentage ({actual_twelfth}%) is below minimum requirement ({criteria.min_twelfth_percentage}%)")

    # 7. Batch Year Match
    if criteria.allowed_batch_years:
        batch_match = student.batch_year in criteria.allowed_batch_years
        checks.append(EligibilityCheckItem(
            criteria="Allowed Batch Year(s)",
            requirement=", ".join(map(str, criteria.allowed_batch_years)),
            actual_value=str(student.batch_year),
            is_met=batch_match
        ))
        if not batch_match:
            reasons.append(f"Student batch year ({student.batch_year}) is not in allowed batches ({criteria.allowed_batch_years})")
    else:
        batch_match = (student.batch_year == drive.batch_year)
        checks.append(EligibilityCheckItem(
            criteria="Drive Batch Year",
            requirement=str(drive.batch_year),
            actual_value=str(student.batch_year),
            is_met=batch_match
        ))
        if not batch_match:
            reasons.append(f"Batch year mismatch: student is {student.batch_year}, drive is {drive.batch_year}")

    # 8. Gender Restriction Check
    if criteria.gender_allowed != GenderAllowed.ALL:
        if criteria.gender_allowed == GenderAllowed.FEMALE_ONLY:
            gender_met = (student.gender.value == "FEMALE")
        elif criteria.gender_allowed == GenderAllowed.MALE_ONLY:
            gender_met = (student.gender.value == "MALE")
        else:
            gender_met = True
        
        checks.append(EligibilityCheckItem(
            criteria="Gender Criteria",
            requirement=criteria.gender_allowed.value,
            actual_value=student.gender.value,
            is_met=gender_met
        ))
        if not gender_met:
            reasons.append(f"Drive restricted to {criteria.gender_allowed.value}")

    # 9. Already Placed & University Placement Policy Check
    if student.is_placed:
        if not criteria.allow_already_placed:
            checks.append(EligibilityCheckItem(
                criteria="Placement Policy",
                requirement="Only Unplaced Students Allowed",
                actual_value="Already Placed",
                is_met=False
            ))
            reasons.append("Student is already placed and this drive does not permit already placed candidates")
        else:
            # Check package upgrade ceiling
            if criteria.max_existing_package_lpa and student.current_package_lpa:
                pkg_met = Decimal(str(student.current_package_lpa)) < Decimal(str(criteria.max_existing_package_lpa))
                checks.append(EligibilityCheckItem(
                    criteria="Package Upgrade Ceiling",
                    requirement=f"Current CTC < {criteria.max_existing_package_lpa} LPA",
                    actual_value=f"{student.current_package_lpa} LPA",
                    is_met=pkg_met
                ))
                if not pkg_met:
                    reasons.append(f"Student's current package ({student.current_package_lpa} LPA) exceeds maximum permitted threshold ({criteria.max_existing_package_lpa} LPA)")

    is_eligible = len(reasons) == 0
    return EligibilityCheckResult(
        student_id=student.id,
        drive_id=drive.id,
        is_eligible=is_eligible,
        reasons=reasons,
        checks=checks
    )
