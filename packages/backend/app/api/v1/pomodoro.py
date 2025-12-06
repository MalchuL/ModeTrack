from typing import List, Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.pomodoro import (
    PomodoroSessionCreate, 
    PomodoroSessionResponse, 
    PomodoroSettingsUpdate, 
    PomodoroSettingsResponse,
    PomodoroStats
)
from app.services.pomodoro import PomodoroService

router = APIRouter()


@router.get("/settings", response_model=PomodoroSettingsResponse)
def get_settings(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get Pomodoro settings.
    """
    service = PomodoroService(db)
    return service.get_settings()


@router.put("/settings", response_model=PomodoroSettingsResponse)
def update_settings(
    *,
    db: Session = Depends(deps.get_db),
    settings_in: PomodoroSettingsUpdate,
) -> Any:
    """
    Update Pomodoro settings.
    """
    service = PomodoroService(db)
    return service.update_settings(settings_in)


@router.post("/sessions", response_model=PomodoroSessionResponse, status_code=status.HTTP_201_CREATED)
def log_session(
    *,
    db: Session = Depends(deps.get_db),
    session_in: PomodoroSessionCreate,
) -> Any:
    """
    Log a completed Pomodoro session.
    """
    service = PomodoroService(db)
    return service.log_session(session_in)


@router.get("/sessions", response_model=List[PomodoroSessionResponse])
def get_session_history(
    *,
    db: Session = Depends(deps.get_db),
    limit: int = 50,
) -> Any:
    """
    Get recent session history.
    """
    service = PomodoroService(db)
    return service.get_history(limit)


@router.get("/stats", response_model=PomodoroStats)
def get_stats(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get Pomodoro statistics.
    """
    service = PomodoroService(db)
    return service.get_stats()

