from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class DepartmentBase(BaseModel):
    code: str = Field(..., max_length=50, json_schema_extra={"example": "CSE"})
    name: str = Field(..., max_length=255, json_schema_extra={"example": "Computer Science & Engineering"})
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    code: Optional[str] = Field(None, max_length=50)
    name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class DepartmentOut(DepartmentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
