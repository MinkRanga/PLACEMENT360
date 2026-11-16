from typing import List, Dict
from uuid import UUID
from pydantic import BaseModel


class EligibilityCheckItem(BaseModel):
    criteria: str
    requirement: str
    actual_value: str
    is_met: bool


class EligibilityCheckResult(BaseModel):
    student_id: UUID
    drive_id: UUID
    is_eligible: bool
    reasons: List[str]
    checks: List[EligibilityCheckItem]
