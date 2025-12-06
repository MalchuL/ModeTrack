from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.playlist import PlaylistContext
from app.schemas.playlist import (
    PlaylistResponse, 
    AudioTrackCreate, 
    AudioTrackResponse,
    TrackReorder
)
from app.services.playlist import PlaylistService

router = APIRouter()


@router.get("/", response_model=List[PlaylistResponse])
def list_playlists(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    List all playlists.
    """
    service = PlaylistService(db)
    return service.list_playlists()


@router.get("/context/{context}", response_model=PlaylistResponse)
def get_playlist_by_context(
    *,
    db: Session = Depends(deps.get_db),
    context: PlaylistContext,
) -> Any:
    """
    Get playlist for a specific context (work/break).
    """
    service = PlaylistService(db)
    return service.get_playlist_by_context(context)


@router.get("/{id}", response_model=PlaylistResponse)
def get_playlist(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get playlist by ID.
    """
    service = PlaylistService(db)
    return service.get_playlist(id)


@router.post("/{id}/tracks", response_model=AudioTrackResponse)
def add_track(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    track_in: AudioTrackCreate,
) -> Any:
    """
    Add a track to a playlist.
    """
    service = PlaylistService(db)
    return service.add_track(id, track_in)


@router.delete("/{id}/tracks/{track_id}", response_model=bool)
def remove_track(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    track_id: int,
) -> Any:
    """
    Remove a track from a playlist.
    """
    service = PlaylistService(db)
    return service.remove_track(id, track_id)


@router.put("/{id}/tracks/reorder", response_model=bool)
def reorder_track(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    reorder_in: TrackReorder,
) -> Any:
    """
    Reorder a track in a playlist.
    """
    service = PlaylistService(db)
    return service.reorder_track(id, reorder_in)

