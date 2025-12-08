from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.models.pomodoro import PomodoroSession, PomodoroSettings
from app.repositories.pomodoro import PomodoroSessionRepository, PomodoroSettingsRepository
from app.repositories.timer_state import PomodoroTimerRepository
from app.schemas.pomodoro import (
    PomodoroSessionCreate,
    PomodoroSettingsUpdate,
    PomodoroStats,
    PomodoroTimerState,
    PomodoroTimerStart,
    PomodoroTimerReset,
)
from datetime import datetime, timedelta, timezone


class PomodoroService:
    def __init__(self, db: Session):
        self.session_repo = PomodoroSessionRepository(db)
        self.settings_repo = PomodoroSettingsRepository(db)
        self.timer_repo = PomodoroTimerRepository(db)

    def _now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _normalize_ends_at(self, dt: datetime | None) -> datetime | None:
        if dt is None:
            return None
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt

    def get_settings(self) -> PomodoroSettings:
        return self.settings_repo.get_settings()

    def update_settings(self, settings_in: PomodoroSettingsUpdate) -> PomodoroSettings:
        settings = self.settings_repo.get_settings()
        update_data = settings_in.model_dump(exclude_unset=True)
        return self.settings_repo.update(settings.id, update_data)

    def log_session(self, session_in: PomodoroSessionCreate) -> PomodoroSession:
        session_data = session_in.model_dump()
        session = PomodoroSession(**session_data)
        return self.session_repo.create(session)

    def get_history(self, limit: int = 50) -> List[PomodoroSession]:
        return self.session_repo.get_recent_sessions(limit)

    def get_stats(self) -> PomodoroStats:
        repo_stats = self.session_repo.get_stats()
        
        total_sessions = repo_stats["total_sessions"]
        total_minutes = repo_stats["total_minutes"]
        
        # Simple average calculation (this could be improved with more date logic)
        # For now, just avoid division by zero if needed, or calculate based on active days
        # Let's assume simple stats for now.
        
        return PomodoroStats(
            total_sessions=total_sessions,
            total_minutes=total_minutes,
            daily_average=0.0, # Placeholder: requires more complex query grouping by day
            total_hours=round(total_minutes / 60, 1)
        )

    # Timer state helpers
    def _advance_phase(self, state: PomodoroTimerState) -> PomodoroTimerState:
        settings = self.settings_repo.get_settings()
        next_phase = "break" if state.phase == "work" else "work"
        duration_minutes = settings.work_duration_minutes if next_phase == "work" else settings.short_break_minutes
        duration_seconds = duration_minutes * 60
        state.phase = next_phase
        state.is_running = True
        state.remaining_seconds = duration_seconds
        state.ends_at = self._now() + timedelta(seconds=duration_seconds)
        return self.timer_repo.save(state)

    def _rehydrate_timer(self) -> PomodoroTimerState:
        state = self.timer_repo.get_state()
        state.ends_at = self._normalize_ends_at(state.ends_at)
        # If running, reconcile remaining based on ends_at
        if state.is_running and state.ends_at:
            now = self._now()
            diff = (state.ends_at - now).total_seconds()
            if diff <= 0:
                # Auto-advance to next phase when time is up
                return self._advance_phase(state)
            state.remaining_seconds = int(diff)
        return state

    def get_timer(self) -> PomodoroTimerState:
        return self._rehydrate_timer()

    def start_timer(self, payload: PomodoroTimerStart) -> PomodoroTimerState:
        state = self.timer_repo.get_state()
        state.phase = payload.phase
        state.is_running = True
        state.remaining_seconds = payload.duration_seconds
        state.ends_at = self._now() + timedelta(seconds=payload.duration_seconds)
        return self.timer_repo.save(state)

    def pause_timer(self) -> PomodoroTimerState:
        state = self._rehydrate_timer()
        state.ends_at = self._normalize_ends_at(state.ends_at)
        if state.is_running and state.ends_at:
            now = self._now()
            remaining = max(0, int((state.ends_at - now).total_seconds()))
            state.remaining_seconds = remaining
        state.is_running = False
        state.ends_at = None
        return self.timer_repo.save(state)

    def reset_timer(self, payload: PomodoroTimerReset) -> PomodoroTimerState:
        state = self.timer_repo.get_state()
        state.phase = payload.phase
        state.is_running = False
        state.remaining_seconds = payload.duration_seconds
        state.ends_at = None
        return self.timer_repo.save(state)

    def complete_phase(self) -> PomodoroTimerState:
        state = self._rehydrate_timer()
        return self._advance_phase(state)

