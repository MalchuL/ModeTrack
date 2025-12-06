# Requirements Document

## Introduction

This document defines the requirements for a local-first, open-source personal productivity application that combines multiple productivity tools into a cohesive interface. The application runs locally on a single user's machine without authentication or multi-user logic, using SQLite for data storage, FastAPI for the backend, and Next.js/React for the frontend.

## Glossary

- **Productivity System**: The complete application combining Pomodoro timer, task manager, 12-Week Year tracker, and music player
- **Pomodoro Session**: A timed work interval following the Pomodoro Technique (work phase followed by break phase)
- **Task Entity**: A discrete unit of work with properties including title, description, priority, status, tags, and due date
- **12-Week Cycle**: A 12-week planning period containing goals and associated tasks
- **Goal Entity**: A specific objective within a 12-Week Cycle that can have multiple tasks attached
- **Playlist Context**: A collection of audio files associated with either work or break phases
- **Phase Transition**: The automatic change from work to break phase or vice versa in the Pomodoro timer
- **Local Storage**: SQLite database file stored on the user's local machine
- **Progress Heatmap**: Visual calendar representation showing daily completion status

## Requirements

### Requirement 1: Pomodoro Timer Management

**User Story:** As a user, I want to run Pomodoro sessions with customizable work and break durations, so that I can maintain focus and take regular breaks.

#### Acceptance Criteria

1. WHEN the user starts a Pomodoro session, THE Productivity System SHALL begin counting down from the configured work duration
2. WHEN a work phase completes, THE Productivity System SHALL automatically transition to a break phase and begin counting down from the configured break duration
3. WHEN the user pauses an active timer, THE Productivity System SHALL preserve the remaining time and allow resumption from that point
4. WHEN the user resets the timer, THE Productivity System SHALL return to the initial work duration and stop counting
5. THE Productivity System SHALL display the current phase type (work or break) and remaining time in minutes and seconds

### Requirement 2: Pomodoro Configuration and Notifications

**User Story:** As a user, I want to configure timer durations and receive notifications when phases complete, so that I can customize the system to my workflow.

#### Acceptance Criteria

1. THE Productivity System SHALL allow users to configure work phase duration between 1 and 60 minutes
2. THE Productivity System SHALL allow users to configure break phase duration between 1 and 30 minutes
3. WHEN a phase completes, THE Productivity System SHALL emit an audio notification if notifications are enabled
4. THE Productivity System SHALL persist timer configuration settings to Local Storage
5. THE Productivity System SHALL track and display the count of completed Pomodoro sessions

### Requirement 3: Task Creation and Management

**User Story:** As a user, I want to create and manage tasks with various properties, so that I can organize my work effectively.

#### Acceptance Criteria

1. WHEN the user creates a task, THE Productivity System SHALL store a Task Entity with title, description, priority, status, tags, and optional due date
2. THE Productivity System SHALL allow users to update any property of an existing Task Entity
3. WHEN the user deletes a task, THE Productivity System SHALL remove the Task Entity from Local Storage
4. THE Productivity System SHALL support task status values of todo, in-progress, and done
5. THE Productivity System SHALL support priority levels of low, medium, and high for each Task Entity

### Requirement 4: Task Filtering and Organization

**User Story:** As a user, I want to filter and group tasks by different criteria, so that I can focus on relevant work.

#### Acceptance Criteria

1. WHEN the user applies a tag filter, THE Productivity System SHALL display only Task Entities containing the selected tags
2. WHEN the user applies a priority filter, THE Productivity System SHALL display only Task Entities matching the selected priority level
3. WHEN the user applies a status filter, THE Productivity System SHALL display only Task Entities matching the selected status
4. THE Productivity System SHALL allow grouping Task Entities by day based on due date
5. THE Productivity System SHALL allow grouping Task Entities by week based on due date

### Requirement 5: 12-Week Cycle Management

**User Story:** As a user, I want to create and manage 12-week planning cycles, so that I can work toward long-term goals.

#### Acceptance Criteria

1. WHEN the user creates a 12-Week Cycle, THE Productivity System SHALL store the cycle with a start date and calculated end date 84 days later
2. THE Productivity System SHALL allow users to create multiple Goal Entities within a 12-Week Cycle
3. WHEN the user archives a cycle, THE Productivity System SHALL mark the 12-Week Cycle as archived while preserving all data
4. THE Productivity System SHALL display all active 12-Week Cycles with their remaining duration
5. THE Productivity System SHALL allow users to attach existing Task Entities to Goal Entities within a cycle

### Requirement 6: Daily Progress Tracking

**User Story:** As a user, I want to track daily progress on my goals, so that I can maintain accountability and visualize my consistency.

#### Acceptance Criteria

1. WHEN the user marks a day as complete for a goal, THE Productivity System SHALL record the completion timestamp in Local Storage
2. THE Productivity System SHALL display a Progress Heatmap showing completion status for each day of the 12-Week Cycle
3. THE Productivity System SHALL calculate and display weekly completion percentage for each Goal Entity
4. THE Productivity System SHALL allow users to mark or unmark any day within the current 12-Week Cycle
5. WHEN viewing a 12-Week Cycle, THE Productivity System SHALL display the total number of days completed versus total days elapsed

### Requirement 7: Music Player Functionality

**User Story:** As a user, I want to play local audio files organized in playlists, so that I can listen to music while working.

#### Acceptance Criteria

1. THE Productivity System SHALL support playback of mp3, wav, and m4a audio file formats
2. WHEN the user adds an audio file, THE Productivity System SHALL store the file path in a Playlist Context
3. THE Productivity System SHALL provide play, pause, next track, and previous track controls
4. WHEN shuffle mode is enabled, THE Productivity System SHALL randomize the playback order within the current Playlist Context
5. THE Productivity System SHALL display the currently playing track title and elapsed time

### Requirement 8: Phase-Aware Playlist Management

**User Story:** As a user, I want the music player to automatically switch playlists based on Pomodoro phases, so that I can have appropriate music for work and breaks.

#### Acceptance Criteria

1. THE Productivity System SHALL maintain separate Playlist Contexts for work phase and break phase
2. WHEN a Phase Transition occurs from work to break, THE Productivity System SHALL switch to the break Playlist Context and begin playback
3. WHEN a Phase Transition occurs from break to work, THE Productivity System SHALL switch to the work Playlist Context and begin playback
4. THE Productivity System SHALL allow users to add or remove audio files from each Playlist Context independently
5. WHERE automatic playlist switching is disabled, THE Productivity System SHALL continue playing the current Playlist Context regardless of phase changes

### Requirement 9: Local Data Persistence

**User Story:** As a user, I want all my data stored locally on my machine, so that I can use the application offline without external dependencies.

#### Acceptance Criteria

1. THE Productivity System SHALL store all Task Entities, Goal Entities, 12-Week Cycles, and configuration data in a Local Storage SQLite database file
2. WHEN the application starts, THE Productivity System SHALL load all data from the Local Storage database file
3. WHEN any data changes occur, THE Productivity System SHALL persist the changes to Local Storage within 1 second
4. THE Productivity System SHALL operate without requiring network connectivity
5. THE Productivity System SHALL store the Local Storage database file in the user's application data directory

### Requirement 10: Application Performance

**User Story:** As a user, I want the application to start quickly and respond immediately to my actions, so that it doesn't interrupt my workflow.

#### Acceptance Criteria

1. THE Productivity System SHALL complete initial application startup within 3 seconds on standard hardware
2. WHEN the user performs any UI action, THE Productivity System SHALL provide visual feedback within 100 milliseconds
3. WHEN loading task lists with up to 1000 Task Entities, THE Productivity System SHALL render the list within 500 milliseconds
4. THE Productivity System SHALL update the Pomodoro timer display every 1 second with no visible lag
5. WHEN switching between application modules, THE Productivity System SHALL complete the transition within 200 milliseconds
