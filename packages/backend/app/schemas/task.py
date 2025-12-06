from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.task import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the task")
    description: Optional[str] = Field(None, description="Detailed description of the task")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Priority level of the task")
    status: TaskStatus = Field(default=TaskStatus.TODO, description="Current status of the task")
    due_date: Optional[datetime] = Field(None, description="Due date for the task")
    position: Optional[int] = Field(None, description="Manual ordering position within a status group")
    tags: List[str] = Field(default_factory=list, description="List of tags associated with the task")
    goal_id: Optional[int] = Field(None, description="ID of the associated goal")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    position: Optional[int] = None
    tags: Optional[List[str]] = None
    goal_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

