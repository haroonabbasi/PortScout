# PortScout - Docker & System Port Manager

PortScout is a hybrid Web/Python utility designed to help developers manage local ports. It scans your active system ports, running Docker containers, and static Docker Compose files on your hard drive to provide a comprehensive map of occupied ports.

## 🚀 Features

*   **System Scan**: Detects ports used by OS processes.
*   **Docker Scan**: Detects ports mapped by currently running containers.
*   **File Scan**: Recursively parses `docker-compose.yml` files in a specified directory (e.g., `D:\docker_apps`) to find reserved ports.
*   **AI Advisor**: Uses Gemini AI to analyze your port usage and recommend conflict-free port blocks for new stacks.
*   **Visual Grid**: A heatmap visualization of port availability.

## 🛠️ Architecture

This app uses a **React Frontend** for the UI and a **Python Sidecar** for system access.

1.  **Frontend (React)**: Runs in your browser. Visualizes data.
2.  **Backend (Python)**: Runs locally on your machine. Accesses the file system and network interfaces.

## 📦 Installation & Setup

### Prerequisite
*   Node.js (for the frontend development, if running from source)
*   Python 3.9+ (for the backend agent)
*   Docker Desktop (optional, for container scanning)

### 1. Start the Python Backend
The web interface cannot access your file system directly. You need to run the bridge script.

1.  Open the web application.
2.  Navigate to the **Python Backend** tab in the sidebar.
3.  Click **Download server.py** (or copy the code manually).
4.  Install the required Python libraries:
    ```bash
    pip install fastapi uvicorn psutil docker pyyaml
    ```
5.  Run the server:
    ```bash
    python server.py
    ```
    *The server will start on `http://localhost:8000`.*

### 2. Use the App
1.  Go back to the **Dashboard**.
2.  Toggle the **Live Connection** switch (or wait for auto-detection).
3.  Enter your projects folder path (e.g., `D:\docker_apps`).
4.  Click **Scan Ports**.

## 🤖 Gemini AI Setup

To use the AI Advisor features:
1.  Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2.  The app expects this key to be available in the environment. In a production build, you would supply this securely.

## ⚠️ Troubleshooting

*   **Connection Failed**: Ensure `server.py` is running and the console says `Uvicorn running on http://0.0.0.0:8000`.
*   **Docker Error**: Ensure Docker Desktop is running if you want to scan active containers.
*   **CORS Error**: The provided `server.py` includes CORS headers to allow the browser to talk to localhost. Ensure you didn't modify the `allow_origins` section.
