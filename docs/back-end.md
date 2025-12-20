# Back-end (Python sidecar)

Overview
- FastAPI server that performs port scanning, process control and Docker integration.
- Launches a native window (PyWebView) in packaged builds and serves static frontend files when available.

Key files
- `back-end/server.py` — main entry point
- `back-end/requirements.txt` — Python dependencies

Install & run (development)

```bash
cd back-end
pip install -r requirements.txt
python server.py
```

Environment
- Create a `.env` next to `server.py` to set `PORT` or other settings.

Dependencies & tools
- `psutil` — process inspection and control
- `docker` SDK — inspect running containers and port mappings
- `pyinstaller` — for packaging into single-file executables

Packaging notes
- When packaging, frontend `dist/` is bundled into the executable using PyInstaller `--add-data`.
- The repo includes `build_exe.ps1` to automate Windows packaging.

Troubleshooting
- If Docker scanning fails, ensure Docker Desktop is running and accessible.
- For permission errors on process control, run with appropriate OS privileges.
