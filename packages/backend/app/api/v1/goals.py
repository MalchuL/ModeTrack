from datetime import date
from typing import List, Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.goal import GoalCreate, GoalResponse, ProgressResponse
from app.services.goal import GoalService

router = APIRouter()


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    *,
    db: Session = Depends(deps.get_db),
    goal_in: GoalCreate,
) -> Any:
    """
    Create a new goal.
    """
    service = GoalService(db)
    return service.create_goal(goal_in)


@router.get("/", response_model=List[GoalResponse])
def list_goals(
    *,
    db: Session = Depends(deps.get_db),
    cycle_id: int,
) -> Any:
    """
    List goals for a cycle.
    """
    service = GoalService(db)
    return service.get_goals_by_cycle(cycle_id)


@router.get("/{id}", response_model=GoalResponse)
def get_goal(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get goal by ID.
    """
    service = GoalService(db)
    return service.get_goal(id)


@router.get("/{id}/progress", response_model=List[Dict[str, Any]])
def get_goal_progress(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get progress heatmap data for a goal.
    """
    service = GoalService(db)
    return service.get_progress_heatmap(id)


@router.post("/{id}/progress", response_model=ProgressResponse)
def mark_progress(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    date_val: date = Body(..., embed=True, alias="date"),
) -> Any:
    """
    Mark a day as completed for a goal.
    Expects JSON body: {"date": "YYYY-MM-DD"}
    """
    service = GoalService(db)
    return service.mark_progress(id, date_val)


@router.delete("/{id}/progress/{date_val}", response_model=bool)
def unmark_progress(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    date_val: date,
) -> Any:
    """
    Unmark a day (delete progress).
    """
    service = GoalService(db)
    return service.unmark_progress(id, date_val)


@router.get("/{id}/stats", response_model=List[Dict[str, Any]])
def get_goal_stats(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get weekly stats for a goal.
    """
    service = GoalService(db)
    return service.get_weekly_stats(id)

