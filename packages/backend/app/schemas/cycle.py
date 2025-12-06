from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class CycleBase(BaseModel):
    name: Optional[str] = Field(None, description="Optional name for the cycle")
    start_date: date = Field(..., description="Start date of the cycle")
    end_date: Optional[date] = Field(None, description="End date of the cycle (calculated if not provided)")
    is_archived: bool = Field(default=False, description="Whether the cycle is archived")


class CycleCreate(BaseModel):
    name: Optional[str] = None
    start_date: date
    # End date is usually calculated, but we can allow override
    end_date: Optional[date] = None


class CycleUpdate(BaseModel):
    name: Optional[str] = None
    is_archived: Optional[bool] = None


class CycleResponse(CycleBase):
    id: int
    end_date: date  # Always present in response

    class Config:
        from_attributes = True

