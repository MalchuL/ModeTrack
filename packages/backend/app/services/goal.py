from datetime import date, timedelta
from typing import List, Dict, Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.goal import Goal, Progress
from app.repositories.goal import GoalRepository
from app.repositories.progress import ProgressRepository
from app.repositories.cycle import CycleRepository
from app.schemas.goal import GoalCreate, GoalUpdate, ProgressResponse


class GoalService:
    def __init__(self, db: Session):
        self.goal_repo = GoalRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.cycle_repo = CycleRepository(db)

    def get_goal(self, goal_id: int) -> Goal:
        goal = self.goal_repo.get(goal_id)
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Goal with id {goal_id} not found"
            )
        return goal

    def create_goal(self, goal_in: GoalCreate) -> Goal:
        # Verify cycle exists
        cycle = self.cycle_repo.get(goal_in.cycle_id)
        if not cycle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cycle with id {goal_in.cycle_id} not found"
            )
            
        goal_data = goal_in.model_dump()
        goal = Goal(**goal_data)
        return self.goal_repo.create(goal)

    def get_goals_by_cycle(self, cycle_id: int) -> List[Goal]:
        return self.goal_repo.get_by_cycle(cycle_id)

    def mark_progress(self, goal_id: int, date_val: date) -> Progress:
        self.get_goal(goal_id) # Ensure exists
        return self.progress_repo.mark_day(goal_id, date_val)

    def unmark_progress(self, goal_id: int, date_val: date) -> bool:
        self.get_goal(goal_id) # Ensure exists
        return self.progress_repo.unmark_day(goal_id, date_val)

    def get_progress_heatmap(self, goal_id: int) -> List[Dict[str, Any]]:
        """
        Generate heatmap data for the goal's cycle.
        Returns a list of {date: str, completed: bool} for every day in the cycle.
        """
        goal = self.get_goal(goal_id)
        cycle = self.cycle_repo.get(goal.cycle_id)
        if not cycle:
             # Should be caught by database integrity, but good safety
             raise HTTPException(status_code=404, detail="Cycle not found for goal")

        progress_records = self.progress_repo.get_for_goal(goal_id)
        completed_dates = {p.date for p in progress_records}

        heatmap = []
        current = cycle.start_date
        while current <= cycle.end_date:
            heatmap.append({
                "date": current,
                "completed": current in completed_dates
            })
            current += timedelta(days=1)
            
        return heatmap

    def get_weekly_stats(self, goal_id: int) -> List[Dict[str, Any]]:
        """
        Calculate weekly completion percentages.
        """
        # Similar to heatmap but grouped by week
        goal = self.get_goal(goal_id)
        cycle = self.cycle_repo.get(goal.cycle_id)
        progress_records = self.progress_repo.get_for_goal(goal_id)
        completed_dates = {p.date for p in progress_records}
        
        weeks = []
        current = cycle.start_date
        week_num = 1
        
        while current <= cycle.end_date:
            week_end = min(current + timedelta(days=6), cycle.end_date)
            days_in_week = (week_end - current).days + 1
            
            completed_count = 0
            temp_date = current
            while temp_date <= week_end:
                if temp_date in completed_dates:
                    completed_count += 1
                temp_date += timedelta(days=1)
                
            weeks.append({
                "week": week_num,
                "start_date": current,
                "end_date": week_end,
                "total_days": days_in_week,
                "completed_days": completed_count,
                "percentage": (completed_count / days_in_week) * 100 if days_in_week > 0 else 0
            })
            
            current += timedelta(days=7)
            week_num += 1
            
        return weeks

