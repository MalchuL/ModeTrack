from datetime import date, timedelta
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.cycle import Cycle
from app.repositories.cycle import CycleRepository
from app.schemas.cycle import CycleCreate, CycleUpdate


class CycleService:
    def __init__(self, db: Session):
        self.cycle_repo = CycleRepository(db)

    def list_cycles(self, active_only: bool = False) -> List[Cycle]:
        if active_only:
            return self.cycle_repo.get_active_cycles()
        return self.cycle_repo.get_all()

    def get_cycle(self, cycle_id: int) -> Cycle:
        cycle = self.cycle_repo.get(cycle_id)
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cycle with id {cycle_id} not found"
            )
        return cycle

    def create_cycle(self, cycle_in: CycleCreate) -> Cycle:
        # Calculate end date if not provided (12 weeks = 84 days)
        start_date = cycle_in.start_date
        end_date = cycle_in.end_date or (start_date + timedelta(days=83)) # 84 days total (inclusive)

        # Check for overlaps with other active cycles
        overlapping = self.cycle_repo.get_overlapping_cycles(start_date, end_date)
        if overlapping:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cycle overlaps with an existing active cycle"
            )

        cycle = Cycle(
            name=cycle_in.name,
            start_date=start_date,
            end_date=end_date,
            is_archived=False
        )
        return self.cycle_repo.create(cycle)

    def update_cycle(self, cycle_id: int, cycle_in: CycleUpdate) -> Cycle:
        cycle = self.get_cycle(cycle_id)
        update_data = cycle_in.model_dump(exclude_unset=True)
        return self.cycle_repo.update(cycle_id, update_data)

    def archive_cycle(self, cycle_id: int) -> Cycle:
        cycle = self.get_cycle(cycle_id)
        if cycle.is_archived:
            return cycle
        return self.cycle_repo.update(cycle_id, {"is_archived": True})

