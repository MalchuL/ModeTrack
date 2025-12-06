from fastapi import APIRouter

from app.api.v1 import tasks, cycles, goals, pomodoro, playlists

api_router = APIRouter()

api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(cycles.router, prefix="/cycles", tags=["cycles"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])
api_router.include_router(pomodoro.router, prefix="/pomodoro", tags=["pomodoro"])
api_router.include_router(playlists.router, prefix="/playlists", tags=["playlists"])
