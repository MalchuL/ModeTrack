from typing import List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.cycle import CycleCreate, CycleResponse, CycleUpdate
from app.services.cycle import CycleService

router = APIRouter()


@router.get("/", response_model=List[CycleResponse])
def list_cycles(
    db: Session = Depends(deps.get_db),
    active_only: bool = False,
) -> Any:
    """
    List cycles.
    """
    service = CycleService(db)
    return service.list_cycles(active_only=active_only)


@router.post("/", response_model=CycleResponse, status_code=status.HTTP_201_CREATED)
def create_cycle(
    *,
    db: Session = Depends(deps.get_db),
    cycle_in: CycleCreate,
) -> Any:
    """
    Create a new cycle.
    """
    service = CycleService(db)
    return service.create_cycle(cycle_in)


@router.get("/{id}", response_model=CycleResponse)
def get_cycle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get cycle by ID.
    """
    service = CycleService(db)
    return service.get_cycle(id)


@router.post("/{id}/archive", response_model=CycleResponse)
def archive_cycle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Archive a cycle.
    """
    service = CycleService(db)
    return service.archive_cycle(id)


@router.delete("/{id}", response_model=bool)
def delete_cycle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Delete a cycle.
    """
    service = CycleService(db)
    return service.delete_cycle(id)
