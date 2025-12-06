from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.goal import Progress
from app.repositories.base import BaseRepository


class ProgressRepository(BaseRepository[Progress]):
    def __init__(self, db: Session):
        super().__init__(Progress, db)

    def get_for_goal(self, goal_id: int) -> List[Progress]:
        """Get all progress records for a goal."""
        return self.db.query(Progress).filter(Progress.goal_id == goal_id).order_by(Progress.date).all()

    def get_by_date(self, goal_id: int, date_val: date) -> Optional[Progress]:
        """Get progress record for a specific date."""
        return self.db.query(Progress).filter(
            Progress.goal_id == goal_id, 
            Progress.date == date_val
        ).first()
        
    def mark_day(self, goal_id: int, date_val: date) -> Progress:
        """Mark a day as completed. Idempotent."""
        existing = self.get_by_date(goal_id, date_val)
        if existing:
            return existing
        
        progress = Progress(goal_id=goal_id, date=date_val)
        return self.create(progress)

    def unmark_day(self, goal_id: int, date_val: date) -> bool:
        """Unmark a day (delete progress record)."""
        existing = self.get_by_date(goal_id, date_val)
        if existing:
            self.db.delete(existing)
            self.db.commit()
            return True
        return False

