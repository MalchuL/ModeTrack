from datetime import date
from typing import List

from sqlalchemy import Column, Integer, Date, Boolean, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Cycle(Base):
    __tablename__ = "cycles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)  # Optional name like "Q4 2023"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    goals = relationship("Goal", back_populates="cycle", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Cycle(id={self.id}, start='{self.start_date}', end='{self.end_date}')>"

