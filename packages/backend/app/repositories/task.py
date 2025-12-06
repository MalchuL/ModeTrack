from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from collections import defaultdict

from sqlalchemy import cast, String, func
from sqlalchemy.orm import Session

from app.core.database import Base
from app.models.task import Task, TaskPriority, TaskStatus
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    def __init__(self, db: Session):
        super().__init__(Task, db)

    def filter_tasks(self, 
                     status: Optional[TaskStatus] = None, 
                     priority: Optional[TaskPriority] = None, 
                     goal_id: Optional[int] = None, 
                     tag: Optional[str] = None,
                     search: Optional[str] = None,
                     start_date: Optional[datetime] = None,
                     end_date: Optional[datetime] = None) -> List[Task]:
        """
        Filter tasks by various criteria.
        
        Args:
            status: Filter by task status
            priority: Filter by task priority
            goal_id: Filter by associated goal
            tag: Filter by tag presence
            search: Search text in title or description
            start_date: Filter by due date range start
            end_date: Filter by due date range end
            
        Returns:
            List of matching tasks
        """
        query = self.db.query(Task)
        
        if status:
            query = query.filter(Task.status == status)
        
        if priority:
            query = query.filter(Task.priority == priority)
            
        if goal_id:
            query = query.filter(Task.goal_id == goal_id)

        if start_date:
            query = query.filter(Task.due_date >= start_date)
            
        if end_date:
            query = query.filter(Task.due_date <= end_date)
            
        if tag:
            # Simple text-based check for SQLite compatibility
            # Matches "tag" inside the JSON string representation
            query = query.filter(cast(Task.tags, String).like(f'%"{tag}"%'))
            
        results = query.all()

        if search:
            s = search.lower()
            results = [
                t
                for t in results
                if (t.title and s in t.title.lower())
                or (t.description and s in t.description.lower())
                or any(s in (tag or "").lower() for tag in t.tags)
            ]

        return results

    def get_tasks_grouped_by_date(self, 
                                  start_date: Optional[datetime] = None, 
                                  end_date: Optional[datetime] = None) -> Dict[Optional[date], List[Task]]:
        """
        Get tasks grouped by their due date.
        Tasks without due dates are grouped under None.
        
        Args:
            start_date: Range start
            end_date: Range end
            
        Returns:
            Dictionary mapping dates to lists of tasks
        """
        tasks = self.filter_tasks(start_date=start_date, end_date=end_date)
        grouped: Dict[Optional[date], List[Task]] = defaultdict(list)
        
        for task in tasks:
            if task.due_date:
                # Group by date component only
                grouped[task.due_date.date()].append(task)
            else:
                # Handle tasks with no due date if needed, or put in a special key
                # For type safety using Optional[date] as key
                grouped[None].append(task)
                
        return dict(grouped)

    def get_tasks_grouped_by_week(self, 
                                  start_date: Optional[datetime] = None, 
                                  end_date: Optional[datetime] = None) -> Dict[str, List[Task]]:
        """
        Get tasks grouped by week (ISO calendar week).
        
        Args:
            start_date: Range start
            end_date: Range end
            
        Returns:
            Dictionary mapping "YYYY-Www" strings to lists of tasks
        """
        tasks = self.filter_tasks(start_date=start_date, end_date=end_date)
        grouped: Dict[str, List[Task]] = defaultdict(list)
        
        for task in tasks:
            if task.due_date:
                iso_cal = task.due_date.isocalendar()
                week_key = f"{iso_cal.year}-W{iso_cal.week:02d}"
                grouped[week_key].append(task)
            else:
                grouped["No Date"].append(task)
                
        return dict(grouped)

