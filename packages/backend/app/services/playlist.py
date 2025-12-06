from typing import List, Optional, Dict, Any
import os
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.playlist import Playlist, AudioTrack, PlaylistContext
from app.repositories.playlist import PlaylistRepository, AudioTrackRepository
from app.schemas.playlist import AudioTrackCreate, PlaylistCreate, TrackReorder


class PlaylistService:
    def __init__(self, db: Session):
        self.playlist_repo = PlaylistRepository(db)
        self.track_repo = AudioTrackRepository(db)

    def get_playlist(self, playlist_id: int) -> Playlist:
        playlist = self.playlist_repo.get(playlist_id)
        if not playlist:
            raise HTTPException(status_code=404, detail="Playlist not found")
        return playlist

    def get_playlist_by_context(self, context: PlaylistContext) -> Playlist:
        playlist = self.playlist_repo.get_by_context(context)
        if not playlist:
            # Auto-create if missing for the context
            playlist = Playlist(name=f"{context.value.title()} Playlist", context=context)
            playlist = self.playlist_repo.create(playlist)
        return playlist

    def list_playlists(self) -> List[Playlist]:
        return self.playlist_repo.get_all()

    def add_track(self, playlist_id: int, track_in: AudioTrackCreate) -> AudioTrack:
        self.get_playlist(playlist_id) # Ensure exists
        
        max_pos = self.track_repo.get_max_position(playlist_id)
        
        track = AudioTrack(
            playlist_id=playlist_id,
            title=track_in.title,
            file_path=track_in.file_path,
            duration=track_in.duration,
            position=max_pos + 1
        )
        return self.track_repo.create(track)

    def remove_track(self, playlist_id: int, track_id: int) -> bool:
        track = self.track_repo.get(track_id)
        if not track or track.playlist_id != playlist_id:
            raise HTTPException(status_code=404, detail="Track not found in playlist")
            
        return self.track_repo.delete(track_id)

    def reorder_track(self, playlist_id: int, reorder_data: TrackReorder) -> bool:
        track = self.track_repo.get(reorder_data.track_id)
        if not track or track.playlist_id != playlist_id:
            raise HTTPException(status_code=404, detail="Track not found in playlist")
            
        self.track_repo.reorder_tracks(playlist_id, reorder_data.track_id, reorder_data.new_position)
        return True

    def list_local_tracks(self) -> List[Dict[str, str]]:
        """
        Scan configured music directory for audio files.
        Returns list of {title: str, file_path: str}
        """
        if not settings.music_dir:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Music directory not configured"
            )
            
        music_path = Path(settings.music_dir)
        if not music_path.exists() or not music_path.is_dir():
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Music directory {music_path} does not exist"
            )

        tracks = []
        extensions = {".mp3", ".wav", ".ogg", ".m4a", ".flac"}
        
        for root, _, files in os.walk(music_path):
            for file in files:
                if Path(file).suffix.lower() in extensions:
                    full_path = Path(root) / file
                    # We need a way to serve these files. 
                    # For now, we assume the frontend can access them via file:// if local (electron style)
                    # OR we need a static file server.
                    # Since this is a web app, browsers block file:// access.
                    # So we should probably expose them via an API endpoint or static mount.
                    # Let's return the absolute path for now, assuming user might run this locally.
                    # BUT browsers won't play absolute paths.
                    # We should map this to a static URL if possible.
                    # For MVP, let's just list them. 
                    # Or better, we add a /stream endpoint?
                    # Let's stick to returning the path and the filename as title.
                    
                    tracks.append({
                        "title": file,
                        "file_path": str(full_path.absolute())
                    })
                    
        return sorted(tracks, key=lambda x: x["title"])
