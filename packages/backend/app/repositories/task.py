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

    # --- Ordering helpers ---
    @staticmethod
    def _is_due_arrived(task: Task) -> bool:
        if not task.due_date:
            return False
        now = datetime.now(task.due_date.tzinfo) if task.due_date.tzinfo else datetime.now()
        return task.due_date.date() <= now.date()

    @staticmethod
    def _status_weight(task: Task) -> int:
        weights = {
            TaskStatus.IN_PROGRESS: 2,
            TaskStatus.TODO: 1,
            TaskStatus.COMPLETED: 0,
        }
        return weights.get(task.status, 0)

    @staticmethod
    def _priority_weight(task: Task) -> int:
        weights = {
            TaskPriority.URGENT: 4,
            TaskPriority.HIGH: 3,
            TaskPriority.MEDIUM: 2,
            TaskPriority.LOW: 1,
        }
        return weights.get(task.priority, 0)

    def sort_tasks(self, tasks: List[Task]) -> List[Task]:
        """
        Deterministic ordering matching frontend:
        Ordering priority:
        1) Due-arrived (overdue/today) first across all tasks
        2) Status: In Progress > Todo > Completed
        3) Position (asc when set; nulls after)
        4) Due-date presence (dated before undated)
        5) If due date: due_date asc
        6) If no due date: created_at desc (newest first)
        7) Priority desc
        8) created_at asc tie-breaker
        """

        def sort_key(t: Task):
            status_rank = {
                TaskStatus.IN_PROGRESS: 0,
                TaskStatus.TODO: 1,
                TaskStatus.COMPLETED: 2,
            }.get(t.status, 3)

            due_arrived = 0 if self._is_due_arrived(t) else 1  # arrived first
            pos_flag = 0 if t.position is not None else 1
            pos_val = t.position if t.position is not None else 10**9
            has_due = 0 if t.due_date else 1
            due_ts = t.due_date.timestamp() if t.due_date else float("inf")
            created_ts = t.created_at.timestamp() if t.created_at else 0
            priority = self._priority_weight(t)  # higher number = higher priority

            if t.due_date:
                return (due_arrived, status_rank, pos_flag, pos_val, has_due, due_ts, -priority, created_ts)
            else:
                # No due date: newest first after status
                return (due_arrived, status_rank, pos_flag, pos_val, has_due, -created_ts, -priority, created_ts)

        return sorted(tasks, key=sort_key)

    def reorder_within_status(self, status: TaskStatus, ordered_ids: List[int]) -> List[Task]:
        """
        Apply manual ordering for tasks of a given status.
        Tasks not present in ordered_ids keep their relative order after the provided list.
        """
        tasks = self.db.query(Task).filter(Task.status == status).all()
        id_to_task = {t.id: t for t in tasks}

        # Preserve remaining order (by existing position, then created_at) for untouched tasks
        remaining = [
            t for t in tasks if t.id not in ordered_ids
        ]
        remaining.sort(
            key=lambda t: (
                t.position if t.position is not None else float("inf"),
                t.created_at or datetime.min,
            )
        )

        ordered_list = []
        for idx, task_id in enumerate(ordered_ids):
            task = id_to_task.get(task_id)
            if task:
                task.position = idx + 1
                ordered_list.append(task)

        start_idx = len(ordered_list)
        for offset, task in enumerate(remaining, start=1):
            task.position = start_idx + offset
            ordered_list.append(task)

        self.db.commit()
        return ordered_list

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

