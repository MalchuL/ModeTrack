"""Base repository with generic CRUD operations."""
from typing import Generic, TypeVar, Type, Optional, List, Any, Dict

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository class with generic CRUD operations."""

    def __init__(self, model: Type[ModelType], db: Session):
        """
        Initialize repository with model and database session.
        
        Args:
            model: SQLAlchemy model class
            db: Database session
        """
        self.model = model
        self.db = db

    def get(self, id: int) -> Optional[ModelType]:
        """
        Get a single record by ID.
        
        Args:
            id: Record ID
            
        Returns:
            Model instance or None if not found
        """
        try:
            return self.db.query(self.model).filter(self.model.id == id).first()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error fetching {self.model.__name__} with id {id}: {str(e)}")

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """
        Get all records with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of model instances
        """
        try:
            return self.db.query(self.model).offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error fetching {self.model.__name__} records: {str(e)}")

    def create(self, obj: ModelType) -> ModelType:
        """
        Create a new record.
        
        Args:
            obj: Model instance to create
            
        Returns:
            Created model instance
        """
        try:
            self.db.add(obj)
            self.db.commit()
            self.db.refresh(obj)
            return obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error creating {self.model.__name__}: {str(e)}")

    def update(self, id: int, data: Dict[str, Any]) -> Optional[ModelType]:
        """
        Update a record by ID.
        
        Args:
            id: Record ID
            data: Dictionary of fields to update
            
        Returns:
            Updated model instance or None if not found
        """
        try:
            obj = self.get(id)
            if not obj:
                return None
            
            for key, value in data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)
            
            self.db.commit()
            self.db.refresh(obj)
            return obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error updating {self.model.__name__} with id {id}: {str(e)}")

    def delete(self, id: int) -> bool:
        """
        Delete a record by ID.
        
        Args:
            id: Record ID
            
        Returns:
            True if deleted, False if not found
        """
        try:
            obj = self.get(id)
            if not obj:
                return False
            
            self.db.delete(obj)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error deleting {self.model.__name__} with id {id}: {str(e)}")

    def count(self) -> int:
        """
        Count total number of records.
        
        Returns:
            Total count
        """
        try:
            return self.db.query(self.model).count()
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error counting {self.model.__name__} records: {str(e)}")

    def exists(self, id: int) -> bool:
        """
        Check if a record exists by ID.
        
        Args:
            id: Record ID
            
        Returns:
            True if exists, False otherwise
        """
        try:
            return self.db.query(self.model).filter(self.model.id == id).first() is not None
        except SQLAlchemyError as e:
            self.db.rollback()
            raise Exception(f"Error checking existence of {self.model.__name__} with id {id}: {str(e)}")
