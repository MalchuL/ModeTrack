from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, Integer, Boolean, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class PomodoroTimerState(Base):
    __tablename__ = "pomodoro_timer_state"

    id = Column(Integer, primary_key=True, index=True)
    current_id = Column(String(36), default=lambda: str(uuid4()), nullable=False, unique=True)
    phase = Column(String(32), default="work", nullable=False)  # "work" or "break"
    status = Column(String(16), default="not_started", nullable=False)  # active, finished, paused, not_started
    is_running = Column(Boolean, default=False, nullable=False)
    remaining_seconds = Column(Integer, default=25 * 60, nullable=False)
    elapsed_seconds = Column(Integer, default=0, nullable=False)
    cycles_completed = Column(Integer, default=0, nullable=False)  # completed work sessions
    started_at = Column(DateTime(timezone=True), nullable=True)
    ends_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<TimerState(phase={self.phase}, running={self.is_running}, remaining={self.remaining_seconds})>"
