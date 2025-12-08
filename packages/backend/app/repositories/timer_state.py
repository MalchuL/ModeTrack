from datetime import datetime

from sqlalchemy.orm import Session

from app.models.timer_state import PomodoroTimerState
from uuid import uuid4


class PomodoroTimerRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_state(self) -> PomodoroTimerState:
        state = self.db.query(PomodoroTimerState).first()
        if not state:
            state = PomodoroTimerState()
            self.db.add(state)
            self.db.commit()
            self.db.refresh(state)
        return state

    def refresh_uuid(self, state: PomodoroTimerState) -> PomodoroTimerState:
        state.current_id = str(uuid4())
        return state

    def save(self, state: PomodoroTimerState) -> PomodoroTimerState:
        self.db.add(state)
        self.db.commit()
        self.db.refresh(state)
        return state
