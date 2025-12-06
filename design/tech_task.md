# Technical Specification for the Personal Productivity Application

## 1. Overview
This project is a **local-first**, **open-source**, monolithic (or two-service) personal productivity application. It runs **locally on a single user's machine** without authentication or multi-user logic.

The application combines several productivity tools into a single, cohesive interface:
- Pomodoro timer
- Task manager (similar to Todoist)
- 12-Week Year tracker
- Music player with phase‑aware playlists (Work/Break)

The system is designed for offline use, simplicity, and extensibility.

Preferred tech stack:
- **Frontend:** TypeScript, React, Next.js (with optional Electron wrapper)
- **Backend:** Python, FastAPI
- **Database:** SQLite (local file-based)

---

## 2. Functional Requirements
### 2.1 Pomodoro Timer
- Basic Pomodoro workflow: Work → Break → Work...
- Adjustable durations
- Visual indicators
- Optional sound notifications
- Progress tracking

### 2.2 Task Manager (Todoist-like)
- Create / read / update / delete tasks
- Task fields:
  - Title
  - Description
  - Priority
  - Status (todo / in-progress / done)
  - Tags
  - Due date (optional)
- Filtering by tags, priority, status
- Task grouping by day/week
- Integration with Pomodoro sessions (optional)

### 2.3 12 Week Year Tracker
- Create 12-week cycles
- Create goals inside cycles
- Attach tasks to goals
- Daily progress tracking (checkbox, dot punching)
- Visual calendar heatmap
- Progress reports per week

### 2.4 Music Player
- Local audio file playback (mp3, wav, m4a)
- Playlist management:
  - Work playlist
  - Break playlist
- Auto-switch playlist based on Pomodoro phase
- Shuffle mode
- Optional integration with external music services (Yandex Music, Spotify; via plugin in the future)

---

## 3. Non‑Functional Requirements
- Fully local storage
- Fast boot time
- Modular architecture
- Code simplicity → suitable for open-source contributions
- Optional offline-first sync mechanism (future scope)

---

## 4. Backlog
### Epic → Tasks → Subtasks

### **Epic 1: Application Foundation**
- **Initialize repository**
  - Setup root monorepo
  - Configure package managers
  - Setup scripts
- **Configure environments**
  - ESLint + Prettier
  - Python virtual environment
  - Shared types package
- **Database setup**
  - Initialize SQLite engine
  - Create base schemas

---

### **Epic 2: Pomodoro Module**
- **Core timer logic**
  - Implement state machine
  - Work/Break/Long break logic
  - Tick handler
- **UI implementation**
  - Timer view
  - Controls (start, pause, reset)
  - Settings panel
- **Statistics**
  - Number of completed sessions
  - Time spent

---

### **Epic 3: Task Manager**
- **Task model & API**
  - CRUD operations
  - Filtering
- **UI**
  - Task list
  - Editor modal
  - Daily grouping
- **Enhancements**
  - Tag management
  - Quick add form

---

### **Epic 4: 12-Week Year Tracker**
- **Cycle management**
  - Create cycle
  - Archive cycle
- **Goals and tasks**
  - Attach tasks to goals
- **Progress tracking**
  - Daily check‑in
  - Calendar heatmap
- **Analytics**
  - Weekly summaries

---

### **Epic 5: Music Player**
- **Local playback engine**
  - Read files
  - Play/pause/next
  - Shuffle
- **Playlists**
  - Work playlist
  - Break playlist
- **Pomodoro integration**
  - Automatic playlist switching when phase changes

---

## 5. Architecture Diagram (PlantUML)
```
@startuml

package "Local Productivity App" {

  [UI Layer] --> [Application Core]

  [Application Core] --> [Pomodoro Module]
  [Application Core] --> [Task Module]
  [Application Core] --> [12 Week Module]
  [Application Core] --> [Music Player]

  [Application Core] --> [Local SQLite Database]
}

@enduml
```

---

## 6. OpenAPI Specification (Draft)
```yaml
openapi: 3.1.0
info:
  title: Personal Productivity Local API
  version: 1.0.0

paths:
  /tasks:
    get:
      summary: Get all tasks
      responses:
        '200': { description: List of tasks }
    post:
      summary: Create task
      responses:
        '201': { description: Created }

  /tasks/{id}:
    get:
      summary: Get task by ID
    put:
      summary: Update task
    delete:
      summary: Delete task

  /pomodoro/state:
    get:
      summary: Get current Pomodoro timer state

  /pomodoro/start:
    post:
      summary: Start Pomodoro

  /pomodoro/stop:
    post:
      summary: Stop Pomodoro

  /weeks:
    get:
      summary: List all 12-week cycles

  /music/play:
    post:
      summary: Play audio track
```

---

## 7. Repository Structure
A monorepo using **pnpm workspaces** or **npm workspaces**:
```
root/
├── packages/
│   ├── frontend/           # Next.js + React application (optional Electron wrapper)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── pomodoro/
│   │   │   │   ├── tasks/
│   │   │   │   ├── weeks/
│   │   │   │   └── music/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── shared/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/            # Python FastAPI service
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── pomodoro.py
│   │   │   │   ├── tasks.py
│   │   │   │   ├── weeks.py
│   │   │   │   └── music.py
│   │   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── db/
│   │   ├── tests/
│   │   ├── main.py
│   │   └── pyproject.toml
│   │
│   └── shared/             # Shared interfaces, schemas, OpenAPI
│       ├── openapi/
│       ├── typescript/
│       ├── python/
│       └── utils/
│
├── infra/
│   ├── docker/
│   ├── scripts/
│   └── config/
│
├── .editorconfig
├── package.json
├── tsconfig.json
├── pyproject.toml
├── README.md
└── LICENSE
```

---

If you'd like, I can now prepare:
- full OpenAPI spec
- sequence diagrams
- UI wireframes
- detailed module architecture
- CI/CD setup for the repo

