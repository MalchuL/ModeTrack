from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from app.models.playlist import PlaylistContext


class AudioTrackBase(BaseModel):
    title: str = Field(..., min_length=1)
    file_path: str = Field(..., min_length=1)
    duration: Optional[int] = None


class AudioTrackCreate(AudioTrackBase):
    pass


class AudioTrackResponse(AudioTrackBase):
    id: int
    playlist_id: int
    position: int
    created_at: datetime

    class Config:
        from_attributes = True


class PlaylistBase(BaseModel):
    name: str = Field(..., min_length=1)
    context: PlaylistContext


class PlaylistCreate(PlaylistBase):
    pass


class PlaylistResponse(PlaylistBase):
    id: int
    tracks: List[AudioTrackResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TrackReorder(BaseModel):
    track_id: int
    new_position: int

