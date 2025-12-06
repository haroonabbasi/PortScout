# PortRegistry Backend

The Python sidecar for PortRegistry. It bridges the gap between the web UI and your operating system.

## Features
- **FastAPI Server**: Exposes endpoints for scanning and process management.
- **PyWebView**: Launches the application in a native window.
- **Static File Serving**: Serves the React frontend (when built).
- **Process Control**: Uses `psutil` and `docker` SDK to kill/stop processes.

## Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

2.  Run the server:
    ```bash
    python server.py
    ```
    *This will launch the Desktop App window.*

## arguments

- `--port`: Specify the port to run on (default: `8000` or from `.env`).

## Environment Variables
Create a `.env` file in this directory to configure the server.

```ini
PORT=9000
```