from datetime import datetime

from sqlalchemy import Column, Integer, Boolean, String, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class PomodoroTimerState(Base):
    __tablename__ = "pomodoro_timer_state"

    id = Column(Integer, primary_key=True, index=True)
    phase = Column(String(16), default="work", nullable=False)  # "work" or "break"
    is_running = Column(Boolean, default=False, nullable=False)
    remaining_seconds = Column(Integer, default=25 * 60, nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<TimerState(phase={self.phase}, running={self.is_running}, remaining={self.remaining_seconds})>"
