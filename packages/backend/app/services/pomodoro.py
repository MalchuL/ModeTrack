from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.models.pomodoro import PomodoroSession, PomodoroSettings
from app.repositories.pomodoro import PomodoroSessionRepository, PomodoroSettingsRepository
from app.schemas.pomodoro import PomodoroSessionCreate, PomodoroSettingsUpdate, PomodoroStats


class PomodoroService:
    def __init__(self, db: Session):
        self.session_repo = PomodoroSessionRepository(db)
        self.settings_repo = PomodoroSettingsRepository(db)

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

