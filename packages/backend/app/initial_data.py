import logging

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.pomodoro import PomodoroSettings
from app.models.playlist import Playlist, PlaylistContext
from app.models.cycle import Cycle
from datetime import date, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_pomodoro_settings(db: Session) -> None:
    if not db.query(PomodoroSettings).first():
        settings = PomodoroSettings()
        db.add(settings)
        db.commit()
        logger.info("Created default Pomodoro settings")

def init_playlists(db: Session) -> None:
    if not db.query(Playlist).filter(Playlist.context == PlaylistContext.WORK).first():
        db.add(Playlist(name="Deep Work", context=PlaylistContext.WORK))
        logger.info("Created default Work playlist")
        
    if not db.query(Playlist).filter(Playlist.context == PlaylistContext.BREAK).first():
        db.add(Playlist(name="Chill Break", context=PlaylistContext.BREAK))
        logger.info("Created default Break playlist")
    
    db.commit()

def init_demo_data(db: Session) -> None:
    # Optional: Create a sample cycle if none exists
    if not db.query(Cycle).first():
        today = date.today()
        cycle = Cycle(
            name="Q1 Focus",
            start_date=today,
            end_date=today + timedelta(days=83),
            is_archived=False
        )
        db.add(cycle)
        db.commit()
        logger.info("Created sample 12-Week Cycle")

def init() -> None:
    db = SessionLocal()
    try:
        init_pomodoro_settings(db)
        init_playlists(db)
        # init_demo_data(db) # Uncomment if you want demo data
    finally:
        db.close()

def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")

if __name__ == "__main__":
    main()

