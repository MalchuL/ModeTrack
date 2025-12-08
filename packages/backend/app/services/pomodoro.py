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
    PomodoroTimerPause,
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

    def _compute_next_long_break(self, cycles_completed: int, interval: int) -> int:
        if interval <= 0:
            return 0
        remainder = cycles_completed % interval
        return interval if remainder == 0 else interval - remainder

    def _attach_metadata(self, state: PomodoroTimerState) -> PomodoroTimerState:
        settings = self.settings_repo.get_settings()
        state.next_long_break_in = self._compute_next_long_break(
            cycles_completed=state.cycles_completed,
            interval=settings.long_break_interval,
        )
        return state

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
            total_hours=round(total_minutes / 60, 1),
            completed_phases=total_sessions,
            total_work_seconds=total_minutes * 60,
        )

    # Timer state helpers
    def _advance_phase(self, state: PomodoroTimerState) -> PomodoroTimerState:
        settings = self.settings_repo.get_settings()
        next_phase = "break" if state.phase == "work" else "work"
        if state.phase == "work":
            state.cycles_completed = state.cycles_completed + 1
            is_long_break = settings.long_break_interval > 0 and state.cycles_completed % settings.long_break_interval == 0
            next_phase = "long_break" if is_long_break else "break"

        if next_phase == "work":
            duration_minutes = settings.work_duration_minutes
        elif next_phase == "long_break":
            duration_minutes = settings.long_break_minutes
        else:
            duration_minutes = settings.short_break_minutes
        duration_seconds = duration_minutes * 60

        auto_start = (
            settings.auto_start_pomodoros if next_phase == "work" else settings.auto_start_breaks
        )

        state.phase = next_phase
        state.status = "active" if auto_start else "paused"
        state.is_running = auto_start
        state.elapsed_seconds = 0
        state.remaining_seconds = duration_seconds
        state.started_at = self._now() if auto_start else None
        state.ends_at = (self._now() + timedelta(seconds=duration_seconds)) if auto_start else None
        state = self.timer_repo.refresh_uuid(state)
        state = self.timer_repo.save(state)
        return self._attach_metadata(state)

    def _rehydrate_timer(self) -> PomodoroTimerState:
        state = self.timer_repo.get_state()
        state.ends_at = self._normalize_ends_at(state.ends_at)
        state.started_at = self._normalize_ends_at(state.started_at)
        # If running, reconcile remaining based on ends_at
        if state.is_running and state.ends_at:
            now = self._now()
            diff = (state.ends_at - now).total_seconds()
            if diff <= 0:
                # Auto-advance to next phase when time is up
                return self._advance_phase(state)
            state.remaining_seconds = int(diff)
            state.elapsed_seconds = max(0, int((now - (state.started_at or now)).total_seconds()))
        return self._attach_metadata(state)

    def get_timer(self) -> PomodoroTimerState:
        return self._rehydrate_timer()

    def _blocked_by_id(self, expected_id: str | None, state: PomodoroTimerState) -> bool:
        """
        Prevent stale tabs from mutating when an active timer exists with a different id.
        If no id is provided, allow the mutation (first tab load) to avoid dead clicks.
        """
        if expected_id is None:
            return False
        if state.status == "active":
            return expected_id != state.current_id
        return False

    def start_timer(self, payload: PomodoroTimerStart) -> PomodoroTimerState:
        state = self.timer_repo.get_state()
        if self._blocked_by_id(payload.state_id, state):
            return self._rehydrate_timer()

        state.phase = payload.phase
        state.status = "active"
        state.is_running = True
        state.remaining_seconds = payload.duration_seconds
        state.elapsed_seconds = 0
        state.started_at = self._now()
        state.ends_at = self._now() + timedelta(seconds=payload.duration_seconds)
        state = self.timer_repo.refresh_uuid(state)
        state = self.timer_repo.save(state)
        return self._attach_metadata(state)

    def pause_timer(self, payload: PomodoroTimerPause) -> PomodoroTimerState:
        state = self._rehydrate_timer()
        if self._blocked_by_id(payload.state_id, state):
            return state

        state.ends_at = self._normalize_ends_at(state.ends_at)
        if state.is_running and state.ends_at and state.started_at:
            now = self._now()
            remaining = max(0, int((state.ends_at - now).total_seconds()))
            elapsed = max(0, int((now - state.started_at).total_seconds()))
            state.remaining_seconds = remaining
            state.elapsed_seconds = state.elapsed_seconds + elapsed
        state.is_running = False
        state.status = "paused"
        state.ends_at = None
        state = self.timer_repo.save(state)
        return self._attach_metadata(state)

    def reset_timer(self, payload: PomodoroTimerReset) -> PomodoroTimerState:
        state = self.timer_repo.get_state()
        if self._blocked_by_id(payload.state_id, state):
            return state

        state.phase = payload.phase
        state.status = "not_started"
        state.is_running = False
        state.remaining_seconds = payload.duration_seconds
        state.elapsed_seconds = 0
        state.started_at = None
        state.ends_at = None
        state = self.timer_repo.save(state)
        return self._attach_metadata(state)

    def complete_phase(self) -> PomodoroTimerState:
        state = self._rehydrate_timer()
        state.status = "finished"
        state.is_running = False
        state.ends_at = None
        state = self.timer_repo.save(state)
        return self._attach_metadata(state)

