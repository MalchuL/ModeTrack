import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class PlaylistContext(str, enum.Enum):
    WORK = "work"
    BREAK = "break"


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    context = Column(Enum(PlaylistContext), nullable=False, unique=True) # Ensure one playlist per context for simplicity
    
    # Relationships
    tracks = relationship("AudioTrack", back_populates="playlist", cascade="all, delete-orphan", order_by="AudioTrack.position")
    
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<Playlist(id={self.id}, name='{self.name}', context='{self.context}')>"


class AudioTrack(Base):
    __tablename__ = "audio_tracks"

    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=False)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    duration = Column(Integer, nullable=True) # Duration in seconds
    position = Column(Integer, nullable=False) # For ordering
    
    # Relationships
    playlist = relationship("Playlist", back_populates="tracks")

    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<AudioTrack(id={self.id}, title='{self.title}', position={self.position})>"

