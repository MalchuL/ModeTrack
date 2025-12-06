from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the goal")
    description: Optional[str] = Field(None, description="Detailed description")
    cycle_id: int = Field(..., description="ID of the cycle this goal belongs to")


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class GoalResponse(GoalBase):
    id: int
    
    class Config:
        from_attributes = True


class ProgressBase(BaseModel):
    goal_id: int
    date: date
    completed: bool = True


class ProgressResponse(ProgressBase):
    pass

