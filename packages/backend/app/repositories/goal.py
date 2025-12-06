from typing import List

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.repositories.base import BaseRepository


class GoalRepository(BaseRepository[Goal]):
    def __init__(self, db: Session):
        super().__init__(Goal, db)

    def get_by_cycle(self, cycle_id: int) -> List[Goal]:
        """Get all goals for a specific cycle."""
        return self.db.query(Goal).filter(Goal.cycle_id == cycle_id).all()

