# Implementation Plan

- [x] 1. Initialize project structure and configuration
  - Create monorepo structure with packages for frontend, backend, and shared
  - Configure pnpm workspaces in root package.json
  - Set up TypeScript configuration with shared tsconfig.base.json
  - Create .gitignore and .editorconfig files
  - Initialize README.md with project overview and setup instructions
  - _Requirements: 9.1, 9.2_

- [ ] 2. Set up backend foundation
  - [x] 2.1 Create FastAPI application structure
    - Initialize Python project with pyproject.toml and requirements.txt
    - Create main FastAPI app with CORS middleware configuration
    - Set up application configuration using Pydantic Settings
    - Create health check endpoint at /health
    - _Requirements: 9.1, 9.4_

  - [x] 2.2 Configure SQLite database with SQLAlchemy
    - Create database connection module with SQLAlchemy engine
    - Implement session management with dependency injection
    - Set up database initialization function
    - Configure database file path in user's application data directory
    - _Requirements: 9.1, 9.5_

  - [x] 2.3 Set up Alembic for database migrations
    - Initialize Alembic configuration
    - Create initial migration script
    - Implement migration runner in application startup
    - _Requirements: 9.1_

  - [x] 2.4 Implement base repository pattern
    - Create BaseRepository class with generic CRUD operations
    - Implement get, get_all, create, update, and delete methods
    - Add error handling for database operations
    - _Requirements: 9.1, 9.3_

- [x] 3. Implement task management backend
  - [x] 3.1 Create task data models
    - Define Task SQLAlchemy model with all fields (title, description, priority, status, tags, due_date)
    - Create Pydantic schemas for TaskCreate, TaskUpdate, and TaskResponse
    - Add database indexes on status and due_date columns
    - _Requirements: 3.1, 3.5_

  - [x] 3.2 Implement task repository
    - Create TaskRepository extending BaseRepository
    - Implement filter_tasks method with support for tags, priority, status, and goal_id filters
    - Add method for grouping tasks by day and week
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 3.3 Create task service layer
    - Implement TaskService with business logic for task operations
    - Add validation for task creation and updates
    - Implement complex filtering logic
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

  - [x] 3.4 Build task API endpoints
    - Create GET /api/v1/tasks endpoint with query parameters for filtering
    - Create POST /api/v1/tasks endpoint for task creation
    - Create GET /api/v1/tasks/{id} endpoint
    - Create PUT /api/v1/tasks/{id} endpoint for updates
    - Create DELETE /api/v1/tasks/{id} endpoint
    - Add error handling and validation
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

- [x] 4. Implement 12-Week Year backend
  - [x] 4.1 Create cycle and goal data models
    - Define Cycle SQLAlchemy model with start_date, end_date, and is_archived
    - Define Goal SQLAlchemy model with relationship to Cycle
    - Define Progress SQLAlchemy model with unique constraint on goal_id and completion_date
    - Create Pydantic schemas for all models
    - _Requirements: 5.1, 5.2, 5.5, 6.1_

  - [x] 4.2 Implement cycle and goal repositories
    - Create CycleRepository with methods for active and archived cycles
    - Create GoalRepository with methods for goals by cycle
    - Create ProgressRepository with methods for tracking daily completions
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 6.1, 6.4_

  - [x] 4.3 Create cycle service with business logic
    - Implement cycle creation with automatic end_date calculation (start_date + 84 days)
    - Add validation to prevent overlapping active cycles
    - Implement cycle archival logic
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 4.4 Implement progress tracking service
    - Create method to mark/unmark day completion for a goal
    - Implement heatmap data generation for 84-day cycle
    - Calculate weekly completion percentages
    - Calculate total days completed vs elapsed
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.5 Build 12-Week Year API endpoints
    - Create GET /api/v1/cycles endpoint for listing cycles
    - Create POST /api/v1/cycles endpoint for creating cycles
    - Create POST /api/v1/cycles/{id}/archive endpoint
    - Create POST /api/v1/goals endpoint for creating goals
    - Create GET /api/v1/goals/{id}/progress endpoint for heatmap data
    - Create POST /api/v1/goals/{id}/progress endpoint for marking day completion
    - Create DELETE /api/v1/goals/{id}/progress/{date} endpoint for unmarking
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.4, 6.5_

- [x] 5. Implement Pomodoro timer backend
  - [x] 5.1 Create Pomodoro data models
    - Define PomodoroSession SQLAlchemy model for tracking completed sessions
    - Define PomodoroSettings SQLAlchemy model for user preferences
    - Create Pydantic schemas for settings and session data
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4, 2.5_

  - [x] 5.2 Implement Pomodoro service
    - Create method to save completed Pomodoro sessions
    - Implement settings persistence (work duration, break duration, sound enabled)
    - Add method to retrieve session statistics (count, total time)
    - _Requirements: 1.1, 2.1, 2.2, 2.4, 2.5_

  - [x] 5.3 Build Pomodoro API endpoints
    - Create GET /api/v1/pomodoro/settings endpoint
    - Create PUT /api/v1/pomodoro/settings endpoint
    - Create POST /api/v1/pomodoro/sessions endpoint for logging completed sessions
    - Create GET /api/v1/pomodoro/sessions endpoint for session history
    - Create GET /api/v1/pomodoro/stats endpoint for statistics
    - _Requirements: 1.1, 2.1, 2.2, 2.4, 2.5_

- [x] 6. Implement music player backend
  - [x] 6.1 Create playlist data models
    - Define Playlist SQLAlchemy model with context field (work/break)
    - Define AudioTrack SQLAlchemy model with file_path and position
    - Create Pydantic schemas for playlist and track data
    - _Requirements: 7.1, 7.2, 8.1, 8.4_

  - [x] 6.2 Implement playlist service
    - Create method to add tracks to playlists
    - Implement track reordering within playlists
    - Add method to remove tracks from playlists
    - Implement playlist retrieval by context (work/break)
    - _Requirements: 7.2, 8.1, 8.4_

  - [x] 6.3 Build music API endpoints
    - Create GET /api/v1/playlists endpoint for listing playlists
    - Create GET /api/v1/playlists/{context} endpoint for work/break playlists
    - Create POST /api/v1/playlists/{id}/tracks endpoint for adding tracks
    - Create DELETE /api/v1/playlists/{id}/tracks/{track_id} endpoint
    - Create PUT /api/v1/playlists/{id}/tracks/reorder endpoint
    - _Requirements: 7.2, 8.1, 8.4_

- [x] 7. Set up frontend foundation
  - [x] 7.1 Initialize Next.js application
    - Create Next.js app with TypeScript and App Router
    - Configure tailwindcss for styling
    - Set up ESLint and Prettier
    - Create basic layout component with navigation
    - _Requirements: 10.1, 10.5_

  - [x] 7.2 Configure API client and state management
    - Install and configure TanStack Query (React Query)
    - Create axios instance with base URL configuration
    - Set up Zustand stores for global state
    - Create API client utilities for type-safe requests
    - _Requirements: 9.2, 10.2_

  - [x] 7.3 Create shared UI components
    - Build Button component with variants
    - Build Input component with validation states
    - Build Modal component with portal rendering
    - Build Select component for dropdowns
    - Build Card component for content containers
    - _Requirements: 10.2, 10.5_

  - [x] 7.4 Implement error handling and loading states
    - Create ErrorBoundary component for React errors
    - Build LoadingSpinner component
    - Create toast notification system
    - Implement global error handler for API errors
    - _Requirements: 10.2_

- [x] 8. Implement task management frontend
  - [x] 8.1 Create task data layer
    - Define TypeScript interfaces matching backend schemas
    - Create React Query hooks for task CRUD operations (useTasksQuery, useCreateTask, useUpdateTask, useDeleteTask)
    - Implement optimistic updates for task mutations
    - _Requirements: 3.1, 3.2, 3.3, 10.2_

  - [x] 8.2 Build task list components
    - Create TaskList component with grouping support
    - Build TaskItem component with inline actions
    - Implement TaskFilters component with tag, priority, and status filters
    - Add empty state for no tasks
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 4.4, 4.5, 10.3_

  - [x] 8.3 Create task editor modal
    - Build TaskEditor modal component with form
    - Implement form validation using React Hook Form and Zod
    - Add date picker for due date selection
    - Create tag input with autocomplete
    - Handle create and edit modes
    - _Requirements: 3.1, 3.2, 10.2_

  - [x] 8.4 Implement task filtering logic
    - Create useTaskFilters hook for managing filter state
    - Implement URL query parameter synchronization for filters
    - Add filter persistence to localStorage
    - Build filter UI with clear all functionality
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Implement 12-Week Year frontend
  - [x] 9.1 Create cycle and goal data layer
    - Define TypeScript interfaces for Cycle, Goal, and Progress
    - Create React Query hooks for cycle operations (useCyclesQuery, useCreateCycle, useArchiveCycle)
    - Create hooks for goal operations (useGoalsQuery, useCreateGoal)
    - Create hooks for progress tracking (useProgressQuery, useToggleProgress)
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 6.1, 6.4_

  - [x] 9.2 Build cycle management components
    - Create CycleList component showing active and archived cycles
    - Build CycleCard component with progress summary
    - Implement CreateCycleModal with date selection
    - Add archive confirmation dialog
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 9.3 Create goal management components
    - Build GoalList component within cycle view
    - Create GoalEditor modal for creating/editing goals
    - Implement goal-task association UI
    - Add goal deletion with confirmation
    - _Requirements: 5.2, 5.5_

  - [x] 9.4 Implement progress heatmap visualization
    - Create ProgressHeatmap component with 7-column grid layout
    - Implement day cells with click-to-toggle functionality
    - Add color coding for completed vs incomplete days
    - Create tooltip showing date and completion status
    - Calculate and display weekly completion percentages
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 9.5 Build weekly summary component
    - Create WeeklySummary component showing progress by week
    - Display completion percentage for each week
    - Show total days completed vs elapsed
    - Add visual progress bars
    - _Requirements: 6.3, 6.5_

- [x] 10. Implement Pomodoro timer frontend
  - [x] 10.1 Create Pomodoro state management
    - Create Zustand store for timer state (phase, remainingSeconds, isRunning, sessionCount)
    - Implement timer tick logic with setInterval
    - Add state machine transitions (idle → work → break → work)
    - Implement pause/resume functionality
    - Add reset functionality
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 10.2 Create Pomodoro data layer
    - Define TypeScript interfaces for settings and sessions
    - Create React Query hooks for settings (useSettingsQuery, useUpdateSettings)
    - Create hook for logging completed sessions (useLogSession)
    - Create hook for session statistics (useSessionStats)
    - _Requirements: 2.1, 2.2, 2.4, 2.5_

  - [x] 10.3 Build timer display component
    - Create Timer component showing remaining time in MM:SS format
    - Display current phase (Work/Break) with visual distinction
    - Add circular progress indicator
    - Implement smooth countdown animation
    - _Requirements: 1.1, 1.5, 10.4_

  - [x] 10.4 Create timer controls
    - Build Controls component with Start/Pause/Reset buttons
    - Implement keyboard shortcuts (Space for start/pause, R for reset)
    - Add session counter display
    - Show total time spent today
    - _Requirements: 1.1, 1.3, 1.4, 2.5_

  - [x] 10.5 Implement settings panel
    - Create Settings modal for configuring durations
    - Add number inputs for work and break duration (with min/max validation)
    - Implement sound notification toggle
    - Add settings persistence
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 10.6 Add phase completion notifications
    - Implement audio notification using Web Audio API
    - Play sound when work phase completes
    - Play sound when break phase completes
    - Respect sound enabled setting
    - Add browser notification API integration (with permission request)
    - _Requirements: 2.3_

- [x] 11. Implement music player frontend
  - [x] 11.1 Create audio playback engine
    - Create useAudioPlayer hook using HTML5 Audio API
    - Implement play, pause, next, and previous functions
    - Add current track state management
    - Implement playback progress tracking
    - Handle audio loading and error states
    - _Requirements: 7.1, 7.3, 7.5_

  - [x] 11.2 Create playlist data layer
    - Define TypeScript interfaces for Playlist and AudioTrack
    - Create React Query hooks for playlist operations (usePlaylistsQuery, useAddTrack, useRemoveTrack)
    - Implement file selection and path storage
    - _Requirements: 7.2, 8.4_

  - [x] 11.3 Build player UI components
    - Create Player component with playback controls
    - Display currently playing track title and elapsed time
    - Add progress bar with seek functionality
    - Implement volume control
    - _Requirements: 7.3, 7.5_

  - [x] 11.4 Implement playlist management UI
    - Create PlaylistManager component for work and break playlists
    - Build track list with drag-and-drop reordering
    - Add file picker for adding local audio files
    - Implement track removal functionality
    - Show playlist context (Work/Break) indicator
    - _Requirements: 7.2, 8.1, 8.4_

  - [x] 11.5 Add shuffle functionality
    - Implement Fisher-Yates shuffle algorithm
    - Create shuffle toggle button
    - Maintain shuffle state in Zustand store
    - Regenerate shuffle order when playlist changes
    - _Requirements: 7.4_

  - [x] 11.6 Implement phase-aware playlist switching
    - Subscribe to Pomodoro phase changes in Zustand store
    - Automatically switch to work playlist when work phase starts
    - Automatically switch to break playlist when break phase starts
    - Preserve playback state during playlist switch
    - Add toggle to enable/disable automatic switching
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 12. Set up Docker configuration
  - [x] 12.1 Create backend Docker setup
    - Write Dockerfile for Python backend with multi-stage build
    - Create requirements.txt with pinned dependencies
    - Configure Uvicorn server for container environment
    - Set up health check endpoint
    - _Requirements: 9.1, 9.4_

  - [x] 12.2 Create frontend Docker setup
    - Write Dockerfile for Next.js frontend
    - Create production Dockerfile with optimized build
    - Configure environment variable handling
    - _Requirements: 10.1_

  - [x] 12.3 Configure Docker Compose
    - Create docker-compose.yml for development environment
    - Create docker-compose.prod.yml for production
    - Set up volume mounts for database persistence
    - Configure service dependencies and networking
    - Add environment variable configuration
    - _Requirements: 9.1, 9.5_

  - [x] 12.4 Add Docker ignore files
    - Create .dockerignore for backend (exclude __pycache__, venv, etc.)
    - Create .dockerignore for frontend (exclude node_modules, .next, etc.)
    - _Requirements: 10.1_

- [x] 13. Integration and polish
  - [x] 13.1 Connect all modules in main layout
    - Create navigation between Pomodoro, Tasks, 12-Week, and Music modules
    - Implement responsive layout with sidebar
    - Add module icons and labels
    - Ensure consistent styling across modules
    - _Requirements: 10.5_

  - [x] 13.2 Implement cross-module integrations
    - Link tasks to goals in task editor
    - Show task count in goal cards
    - Display active Pomodoro timer in app header
    - Ensure music player persists across module navigation
    - _Requirements: 5.5, 8.2, 8.3_

  - [x] 13.3 Add data initialization and seeding
    - Create database initialization script
    - Add default Pomodoro settings on first run
    - Create default work and break playlists
    - Add sample data for development environment
    - _Requirements: 9.1, 9.2_

  - [ ] 13.4 Implement application startup optimization
    - Add lazy loading for feature modules
    - Implement code splitting for routes
    - Optimize initial bundle size
    - Add loading states for initial data fetch
    - _Requirements: 10.1, 10.5_

  - [x] 13.5 Create documentation
    - Write comprehensive README with setup instructions
    - Document API endpoints in OpenAPI format
    - Create user guide for each feature
    - Add developer documentation for contributing
    - Document Docker setup and deployment
    - _Requirements: 9.1_
