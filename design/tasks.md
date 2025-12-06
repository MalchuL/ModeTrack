- [x] 14. Enhancements
  - [x] 14.1 Implement Quick Add Task in Search Bar
    - Update TaskFilters/SearchBar to handle "Enter" key press
    - Implement parsing logic for task creation strings
    - Support tag prefixes: '#' and '№' (e.g., "#tag" or "№tag")
    - Support priority prefixes: '@' and '*' with numbers (e.g., "@1" or "*1")
    - Highlight parsed parameters within the search input
    - _Requirements: Enhancement 3_

  - [x] 14.2 Implement 12-Week Year Autofill
    - Auto-create 12-week cycle when page loads if none exists
    - Auto-fill/calculate heatmap data for current cycle
    - Maintain manual override for day tracking (past days)
    - _Requirements: Enhancement 1_

  - [x] 14.3 Implement Local Music Folder Config
    - Add configuration setting for local music folder path
    - Implement backend logic to scan folder for audio files
    - Add API endpoint to sync/list files from configured folder
    - _Requirements: Enhancement 2_
