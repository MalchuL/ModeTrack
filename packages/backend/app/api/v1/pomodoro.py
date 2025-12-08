from typing import List, Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.pomodoro import (
    PomodoroSessionCreate, 
    PomodoroSessionResponse, 
    PomodoroSettingsUpdate, 
    PomodoroSettingsResponse,
    PomodoroStats,
    PomodoroTimerState,
    PomodoroTimerStart,
    PomodoroTimerReset,
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


@router.get("/timer", response_model=PomodoroTimerState)
def get_timer(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get current timer state.
    """
    service = PomodoroService(db)
    return service.get_timer()


@router.post("/timer/start", response_model=PomodoroTimerState)
def start_timer(
    payload: PomodoroTimerStart,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Start (or restart) the timer with a phase and duration.
    """
    service = PomodoroService(db)
    return service.start_timer(payload)


@router.post("/timer/pause", response_model=PomodoroTimerState)
def pause_timer(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Pause the timer; remaining time is persisted.
    """
    service = PomodoroService(db)
    return service.pause_timer()


@router.post("/timer/reset", response_model=PomodoroTimerState)
def reset_timer(
    payload: PomodoroTimerReset,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset the timer to a phase and duration; does not start running.
    """
    service = PomodoroService(db)
    return service.reset_timer(payload)


@router.post("/timer/complete", response_model=PomodoroTimerState)
def complete_phase(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Complete current phase and start the next one automatically.
    """
    service = PomodoroService(db)
    return service.complete_phase()

