# PortRegistry — Overview

PortRegistry is a developer utility that scans and visualizes ports in use by system processes, Docker containers, and Docker Compose files. It is delivered as a desktop app (React frontend + Python backend) and includes packaging and installer scripts.

## What you'll learn from these docs
- Project purpose and user flows
- Frontend architecture and development (React + Vite)
- Backend design and system integration (Python, FastAPI)
- How packaging, installers, and releases are produced
- How to automate builds and releases using CI

## Quick start
See the full development instructions in the dedicated pages:
- Frontend: [front-end.md](front-end.md)
- Backend: [back-end.md](back-end.md)
- Installer: [installer.md](installer.md)
- Release: [release.md](release.md)

## Learning goals for new developers
- Understand how a modern Electron-like native wrapper is built using a web UI and a Python sidecar.
- Learn packaging with PyInstaller and creating OS-native installers (Inno Setup, dmg, AppImage).
- Explore cross-platform CI strategies for builds and releases.
