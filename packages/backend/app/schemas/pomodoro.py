from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator
from pydantic import ConfigDict


class PomodoroSessionBase(BaseModel):
    start_time: datetime
    end_time: datetime
    duration_minutes: int = Field(..., gt=0)
    completed: bool = True


class PomodoroSessionCreate(PomodoroSessionBase):
    pass


class PomodoroSessionResponse(PomodoroSessionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class PomodoroSettingsBase(BaseModel):
    work_duration_minutes: int = Field(25, ge=1, le=60)
    short_break_minutes: int = Field(5, ge=1, le=30)
    long_break_minutes: int = Field(15, ge=1, le=60)
    long_break_interval: int = Field(4, ge=1, le=10)
    sound_enabled: bool = True
    auto_start_breaks: bool = False
    auto_start_pomodoros: bool = False


class PomodoroSettingsUpdate(PomodoroSettingsBase):
    pass


class PomodoroSettingsResponse(PomodoroSettingsBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class PomodoroStats(BaseModel):
    total_sessions: int
    total_minutes: int
    daily_average: float
    total_hours: float
    completed_phases: int
    total_work_seconds: int


class PomodoroPhase(BaseModel):
    phase: str


class PomodoroTimerState(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str = Field(..., validation_alias="current_id", serialization_alias="id")
    phase: str
    status: str
    is_running: bool
    remaining_seconds: int
    elapsed_seconds: int
    started_at: datetime | None
    ends_at: datetime | None
    updated_at: datetime


class PomodoroTimerStart(BaseModel):
    phase: str
    duration_seconds: int = Field(..., gt=0)
    state_id: str | None = None


class PomodoroTimerPause(BaseModel):
    state_id: str


class PomodoroTimerReset(BaseModel):
    phase: str
    duration_seconds: int = Field(..., gt=0)
    state_id: str | None = None

