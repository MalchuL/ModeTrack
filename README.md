# Personal Productivity App

A comprehensive productivity application combining Task Management, 12-Week Year Goal Tracking, Pomodoro Timer, and Context-Aware Music Player.

## Features

- **Task Management**: Create, organize, and prioritize daily tasks.
- **12-Week Year**: Track long-term goals in 12-week cycles with daily progress heatmaps.
- **Pomodoro Timer**: Focus timer with customizable work/break intervals and audio notifications.
- **Music Player**: Manage playlists for Work and Break contexts, with automatic switching based on timer phase.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query, Zustand.
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, SQLite.
- **Deployment**: Docker, Docker Compose.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

### Quick Start (Docker)

1. Clone the repository.
2. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. The API docs are available at [http://localhost:8000/docs](http://localhost:8000/docs).

### Running without Docker

For testing purposes or local development, you can run the backend and frontend separately in two terminal windows.

#### 1. Backend (Terminal 1)

1. Navigate to the backend directory:
   ```bash
   cd packages/backend
   ```
2. Install dependencies and set up environment with `uv`:
   ```bash
   uv sync
   ```
3. Start the server:
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`.

#### 2. Frontend (Terminal 2)

1. Navigate to the frontend directory:
   ```bash
   cd packages/frontend
   ```
2. Install dependencies (using pnpm):
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. Access the application at `http://localhost:3000`.

#### Troubleshooting

- **Port Conflicts**: Ensure ports 3000 (frontend) and 8000 (backend) are free.
- **Database**: If you encounter database errors, you can delete the `packages/backend/data/productivity.db` file to reset the database. It will be recreated on the next backend startup.

## Architecture

The project follows a monorepo structure:
- `packages/backend`: FastAPI application
- `packages/frontend`: Next.js application
- `packages/shared`: Shared types/utilities (if any)

## Database

The application uses SQLite by default. The database file is stored in `packages/backend/data/productivity.db` (or mapped volume in Docker).
On first run, the application initializes the database and creates default playlists and settings.
