from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.task import TaskStatus, TaskPriority
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from pydantic import BaseModel, Field
from app.services.task import TaskService

router = APIRouter()


class TaskReorderPayload(BaseModel):
    status: TaskStatus = Field(..., description="Status group to reorder")
    ordered_ids: List[int] = Field(..., description="Task IDs in desired order for this status")


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    goal_id: Optional[int] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
) -> Any:
    """
    Retrieve tasks.
    """
    service = TaskService(db)
    return service.list_tasks(
        skip=skip, 
        limit=limit, 
        status=status, 
        priority=priority, 
        goal_id=goal_id, 
        tag=tag,
        search=search
    )


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    *,
    db: Session = Depends(deps.get_db),
    task_in: TaskCreate,
) -> Any:
    """
    Create new task.
    """
    service = TaskService(db)
    return service.create_task(task_in)


@router.put("/reorder", response_model=List[TaskResponse])
def reorder_tasks(
    *,
    db: Session = Depends(deps.get_db),
    payload: TaskReorderPayload,
) -> Any:
    """
    Reorder tasks within a status group.
    Position wins over computed ordering. Tasks not included will follow after, keeping their relative order.
    """
    service = TaskService(db)
    return service.reorder_tasks(payload.status, payload.ordered_ids)


@router.get("/{id}", response_model=TaskResponse)
def get_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get task by ID.
    """
    service = TaskService(db)
    return service.get_task(id)


@router.put("/{id}", response_model=TaskResponse)
def update_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    task_in: TaskUpdate,
) -> Any:
    """
    Update a task.
    """
    service = TaskService(db)
    return service.update_task(id, task_in)


@router.delete("/{id}", response_model=bool)
def delete_task(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Delete a task.
    """
    service = TaskService(db)
    return service.delete_task(id)

