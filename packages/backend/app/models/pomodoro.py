from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, DateTime, Boolean, Float
from sqlalchemy.sql import func

from app.core.database import Base


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)  # Completed duration in minutes
    completed = Column(Boolean, default=True) # Usually true if logged, but allows for interrupted tracking if needed
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<PomodoroSession(id={self.id}, duration={self.duration_minutes})>"


class PomodoroSettings(Base):
    __tablename__ = "pomodoro_settings"

    id = Column(Integer, primary_key=True, index=True)
    work_duration_minutes = Column(Integer, default=25, nullable=False)
    short_break_minutes = Column(Integer, default=5, nullable=False)
    long_break_minutes = Column(Integer, default=15, nullable=False)
    long_break_interval = Column(Integer, default=4, nullable=False) # Number of sessions before long break
    sound_enabled = Column(Boolean, default=True, nullable=False)
    auto_start_breaks = Column(Boolean, default=False, nullable=False)
    auto_start_pomodoros = Column(Boolean, default=False, nullable=False)

    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<PomodoroSettings(work={self.work_duration_minutes}, break={self.short_break_minutes})>"

