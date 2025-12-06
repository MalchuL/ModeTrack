from datetime import date
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.cycle import Cycle
from app.repositories.base import BaseRepository


class CycleRepository(BaseRepository[Cycle]):
    def __init__(self, db: Session):
        super().__init__(Cycle, db)

    def get_active_cycles(self) -> List[Cycle]:
        """Get all cycles that are not archived."""
        return self.db.query(Cycle).filter(Cycle.is_archived == False).order_by(Cycle.start_date.desc()).all()

    def get_archived_cycles(self) -> List[Cycle]:
        """Get all archived cycles."""
        return self.db.query(Cycle).filter(Cycle.is_archived == True).order_by(Cycle.start_date.desc()).all()

    def get_current_active_cycle(self, current_date: date) -> Optional[Cycle]:
        """Get the cycle active for a given date."""
        return self.db.query(Cycle).filter(
            Cycle.is_archived == False,
            Cycle.start_date <= current_date,
            Cycle.end_date >= current_date
        ).first()
    
    def get_overlapping_cycles(self, start: date, end: date) -> List[Cycle]:
        """Check for cycles overlapping with the given range (excluding archived?)."""
        # Typically we don't want overlapping active cycles.
        return self.db.query(Cycle).filter(
            Cycle.is_archived == False,
            Cycle.start_date <= end,
            Cycle.end_date >= start
        ).all()

