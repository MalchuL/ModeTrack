from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.playlist import Playlist, AudioTrack, PlaylistContext
from app.repositories.base import BaseRepository


class PlaylistRepository(BaseRepository[Playlist]):
    def __init__(self, db: Session):
        super().__init__(Playlist, db)

    def get_by_context(self, context: PlaylistContext) -> Optional[Playlist]:
        return self.db.query(Playlist).filter(Playlist.context == context).first()


class AudioTrackRepository(BaseRepository[AudioTrack]):
    def __init__(self, db: Session):
        super().__init__(AudioTrack, db)

    def get_max_position(self, playlist_id: int) -> int:
        result = self.db.query(func.max(AudioTrack.position)).filter(AudioTrack.playlist_id == playlist_id).scalar()
        return result if result is not None else -1

    def reorder_tracks(self, playlist_id: int, track_id: int, new_position: int) -> None:
        """
        Reorder a track within a playlist.
        This is a simplified implementation. A full implementation would shift other tracks.
        """
        # Simple swap or shift logic is complex in SQL. 
        # For now, we'll rely on the service to handle logic or just update the position directly.
        # However, proper reordering requires shifting items between old and new positions.
        
        track = self.get(track_id)
        if not track or track.playlist_id != playlist_id:
            return

        old_position = track.position
        if old_position == new_position:
            return

        if new_position > old_position:
            # Moving down: shift items between old+1 and new down by 1
            self.db.query(AudioTrack).filter(
                AudioTrack.playlist_id == playlist_id,
                AudioTrack.position > old_position,
                AudioTrack.position <= new_position
            ).update({AudioTrack.position: AudioTrack.position - 1})
        else:
            # Moving up: shift items between new and old-1 up by 1
            self.db.query(AudioTrack).filter(
                AudioTrack.playlist_id == playlist_id,
                AudioTrack.position >= new_position,
                AudioTrack.position < old_position
            ).update({AudioTrack.position: AudioTrack.position + 1})

        track.position = new_position
        self.db.commit()

