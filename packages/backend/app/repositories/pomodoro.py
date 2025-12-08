from typing import Optional, List
from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.pomodoro import PomodoroSession, PomodoroSettings
from app.repositories.base import BaseRepository


class PomodoroSessionRepository(BaseRepository[PomodoroSession]):
    def __init__(self, db: Session):
        super().__init__(PomodoroSession, db)

    def get_recent_sessions(self, limit: int = 10) -> List[PomodoroSession]:
        return self.db.query(PomodoroSession).order_by(PomodoroSession.created_at.desc()).limit(limit).all()

    def get_sessions_by_date_range(self, start_date: datetime, end_date: datetime) -> List[PomodoroSession]:
        return self.db.query(PomodoroSession).filter(
            PomodoroSession.start_time >= start_date,
            PomodoroSession.start_time <= end_date
        ).all()

    def get_stats(self) -> dict:
        total_count = self.count()
        
        # Calculate total duration
        total_minutes = self.db.query(func.sum(PomodoroSession.duration_minutes)).scalar() or 0
        
        return {
            "total_sessions": total_count,
            "total_minutes": total_minutes,
            "total_work_seconds": (total_minutes or 0) * 60,
            "completed_phases": total_count,
        }


class PomodoroSettingsRepository(BaseRepository[PomodoroSettings]):
    def __init__(self, db: Session):
        super().__init__(PomodoroSettings, db)

    def get_settings(self) -> PomodoroSettings:
        """Get the single settings row, creating default if not exists."""
        settings = self.db.query(PomodoroSettings).first()
        if not settings:
            settings = PomodoroSettings()
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

