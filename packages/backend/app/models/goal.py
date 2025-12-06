from datetime import date
from typing import List

from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cycle_id = Column(Integer, ForeignKey("cycles.id"), nullable=False)
    
    # Relationships
    cycle = relationship("Cycle", back_populates="goals")
    progress = relationship("Progress", back_populates="goal", cascade="all, delete-orphan")
    
    # Relationship to Tasks (defined in Task model, but we can add back_populates here if we updated Task)
    # tasks = relationship("Task", back_populates="goal") 

    def __repr__(self):
        return f"<Goal(id={self.id}, title='{self.title}')>"


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=False)
    date = Column(Date, nullable=False)
    
    # Relationships
    goal = relationship("Goal", back_populates="progress")

    __table_args__ = (
        UniqueConstraint('goal_id', 'date', name='uq_goal_date_progress'),
    )

    def __repr__(self):
        return f"<Progress(goal_id={self.goal_id}, date='{self.date}')>"

