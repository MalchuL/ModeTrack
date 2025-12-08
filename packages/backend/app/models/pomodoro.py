from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, DateTime, Boolean, String, Float
from sqlalchemy.sql import func

from app.core.database import Base


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    phase = Column(String(16), nullable=False)  # "work" or "break"
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class PomodoroSettings(Base):
    __tablename__ = "pomodoro_settings"

    id = Column(Integer, primary_key=True, index=True)
    work_duration_minutes = Column(Integer, default=25, nullable=False)
    short_break_minutes = Column(Integer, default=5, nullable=False)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class PomodoroTimer(Base):
    __tablename__ = "pomodoro_timer"

    id = Column(Integer, primary_key=True, index=True)
    phase = Column(String(16), default="work", nullable=False)  # "work" or "break"
    remaining_seconds = Column(Integer, default=1500, nullable=False)  # 25 minutes default
    is_running = Column(Boolean, default=False, nullable=False)
    last_updated = Column(DateTime, server_default=func.now(), nullable=False)

