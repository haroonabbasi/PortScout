# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-12-27

### Added
- None specific for this release (see Changed/Fixed).

### Changed
- Documentation migrated and improved (vite-press docs, config and theme updates).
- CI/workflow improvements: release automation and GitHub Actions updates.
- Assets and icons: image renames and path fixes for frontend assets.
- Version and packaging metadata updated to 2.0.0.

### Fixed
- Fixed backend port selection so the app chooses a working free port when the default is unavailable, preventing bind failures.
- Fixed Docker Compose YAML scanning logic to properly handle environment-variable placeholders and complex port mappings.
- Various minor bug fixes and stability improvements.

### Security / CI
- Added permissions and release workflow improvements for automated release creation.


## [1.0.5] - 2025-12-17

### Added
-- **Help/Tour** User can click on Help/Tour on on leftsidebar to get tour how to use this app
- **Configurable Port Ranges**: Users can now define custom port ranges in a new Settings page, supporting ranges beyond the default 3000 and 8000 blocks.
- **Settings Page**: Dedicated view for application configuration, accessible via the sidebar.
- **Open File Integration**: Added "Open File" and "Open Location" buttons to the Occupied Ports detail view for Docker Compose projects.
- **Quick Copy**: Click on any "Recommended Free Port" to instantly copy the port number to the clipboard.
- **Collapsible Grids**: Port grids can now be collapsed to save space and focus on specific ranges.

### Changed
- **UI Polish**: Improved styling for action buttons in the ports table, converting them to badges for better readability.
- **Sidebar**: Updated navigation to include the new Settings route.
- **Dashboard**: Refactored to support dynamic rendering of port grids based on user configuration.

## [1.0.0] - 2025-12-7

### Added
- **Initial Release**: First stable release of PortRegistry.
- **Port Scanning**: detect occupied system and Docker ports.
- **Visualization**: Visual grid 3000-3099 and 8000-8099.
- **Live Mode**: Real-time updates via Python backend.
- **System Kill**: Ability to kill system processes directly from the UI.
- **Docker Control**: Stop Docker containers directly from the UI.
