from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.task import Task, TaskStatus, TaskPriority
from app.repositories.task import TaskRepository
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
    def __init__(self, db: Session):
        self.task_repo = TaskRepository(db)

    def get_task(self, task_id: int) -> Task:
        task = self.task_repo.get(task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Task with id {task_id} not found"
            )
        return task

    def list_tasks(self, 
                   skip: int = 0, 
                   limit: int = 100,
                   status: Optional[TaskStatus] = None, 
                   priority: Optional[TaskPriority] = None, 
                   goal_id: Optional[int] = None, 
                   tag: Optional[str] = None,
                   search: Optional[str] = None,
                   start_date: Optional[datetime] = None,
                   end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """
        List tasks with filtering options and include total count.
        """
        tasks = self.task_repo.filter_tasks(
            status=status, 
            priority=priority, 
            goal_id=goal_id, 
            tag=tag,
            search=search,
            start_date=start_date,
            end_date=end_date
        )

        ordered = self.task_repo.sort_tasks(tasks)
        total_count = len(ordered)
        paged = ordered[skip : skip + limit] if limit else ordered[skip:]

        return {"items": paged, "count": total_count}

    def create_task(self, task_in: TaskCreate) -> Task:
        # Validate business rules here if any
        # e.g. Max tasks per day?
        
        task_data = task_in.model_dump()
        task = Task(**task_data)
        return self.task_repo.create(task)

    def update_task(self, task_id: int, task_in: TaskUpdate) -> Task:
        task = self.get_task(task_id)
        update_data = task_in.model_dump(exclude_unset=True)
        
        # Business validation: cannot move a completed task to Todo? (Just an example, not implemented)
        
        updated_task = self.task_repo.update(task_id, update_data)
        if not updated_task:
            # Should be caught by get_task but just in case
            raise HTTPException(status_code=404, detail="Task not found")
        return updated_task

    def delete_task(self, task_id: int) -> bool:
        self.get_task(task_id)  # Ensure exists
        return self.task_repo.delete(task_id)

    def get_tasks_by_week(self) -> Dict[str, List[Task]]:
        return self.task_repo.get_tasks_grouped_by_week()

    def get_tasks_by_day(self) -> Dict[Any, List[Task]]:
        return self.task_repo.get_tasks_grouped_by_date()

    def reorder_tasks(self, status_value: TaskStatus, ordered_ids: List[int]) -> List[Task]:
        if not ordered_ids:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ordered_ids cannot be empty")

        tasks = self.task_repo.reorder_within_status(status_value, ordered_ids)
        # Return freshly sorted list for that status
        status_tasks = [t for t in tasks if t.status == status_value]
        return self.task_repo.sort_tasks(status_tasks)

