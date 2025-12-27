
# server.py
# Requires: pip install fastapi uvicorn psutil docker pyyaml
import os
import psutil
import yaml
import docker
import logging
import socket
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Dict, Optional
from pydantic import BaseModel
import argparse
import sys
import subprocess
import re
from dotenv import load_dotenv
import threading
import webview

# Load environment variables from .env file
load_dotenv()

# Setup logging to file and console
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.environ.get('LOG_FILE', os.path.join(LOG_DIR, 'app.log'))

logger = logging.getLogger("portregistry")
logger.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

from logging.handlers import RotatingFileHandler
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=5*1024*1024, backupCount=3)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

logger.info("Logger initialized. Log file: %s", LOG_FILE)

app = FastAPI()

# Parse arguments for port
parser = argparse.ArgumentParser(description='PortRegistry Backend')
parser.add_argument('--port', type=int, default=int(os.environ.get("PORT", 8000)), help='Port to run the server on')
# Only parse known args to avoid conflict with uvicorn's own args if needed, 
# though usually we run this script directly.
args, unknown = parser.parse_known_args()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Docker client (fails gracefully if Docker not running)
try:
    client = docker.from_env()
    logger.info("Docker client initialized successfully.")
except Exception as e:
    client = None
    logger.warning("Docker client could not be initialized. Active containers will not be scanned. Error: %s", e)


def get_system_ports():
    ports = []
    try:
        # scan for listening TCP ports
        for conn in psutil.net_connections(kind='inet'):
            if conn.status == 'LISTEN':
                ports.append({
                    "port": conn.laddr.port, 
                    "service": "System Process", 
                    "source": "system",
                    "id": str(conn.pid)
                })
    except Exception as e:
        logger.exception("System Scan Error: %s", e)
    return ports

def get_docker_ports():
    ports = []
    if not client:
        return ports
    try:
        containers = client.containers.list()
        for container in containers:
            # Reload ensures we get fresh attributes including mapped ports
            try:
                container.reload()
            except:
                pass
            
            # Safely get ports
            net_settings = container.attrs.get('NetworkSettings', {})
            p = net_settings.get('Ports', {})
            
            if not p:
                continue

            # Iterate through all port mappings
            for port_key, bindings in p.items():
                # port_key is internal port (e.g., "80/tcp")
                # bindings is a list of dicts (e.g., [{'HostIp': '0.0.0.0', 'HostPort': '8080'}])
                if bindings:
                    for binding in bindings:
                        host_port = binding.get('HostPort')
                        if host_port:
                            ports.append({
                                "port": int(host_port), 
                                "service": f"Container: {container.name} ({port_key})", 
                                "source": "docker_active",
                                "id": container.id
                            })
    except Exception as e:
        logger.exception("Docker Error: %s", e)
    return ports

def _resolve_env_var_token(token: str) -> Optional[str]:
    """Resolve simple Docker Compose style env tokens like ${VAR}, ${VAR:-default} or ${VAR-default}.
    Returns the resolved string or None if nothing found."""
    m = re.match(r'^\$\{([^}]+)\}$', token)
    if not m:
        return None
    inner = m.group(1)
    # handle VAR:-default, VAR-default, VAR:default
    for sep in (':-', '-', ':'):
        if sep in inner:
            var, default = inner.split(sep, 1)
            var = var.strip()
            default = default.strip()
            return os.environ.get(var, default)
    var = inner.strip()
    return os.environ.get(var)


def _extract_candidate_port(candidate: str) -> Optional[int]:
    if candidate is None:
        return None
    s = candidate.strip()
    # strip protocol suffix if present (e.g., '80/tcp')
    s = s.split('/')[0]

    # direct integer or range like '8080-8089'
    m = re.match(r'^(\d+)(?:-\d+)?$', s)
    if m:
        return int(m.group(1))

    # environment variable token
    ev = _resolve_env_var_token(s)
    if ev:
        ev = ev.strip()
        try:
            return int(ev)
        except Exception:
            m2 = re.search(r"(\d+)", ev)
            if m2:
                return int(m2.group(1))
            return None

    # fallback: extract first integer appearing in the token
    m3 = re.search(r"(\d+)", s)
    if m3:
        return int(m3.group(1))
    return None


def _parse_port_mapping(port_mapping) -> Optional[int]:
    """Robustly parse a compose 'ports' mapping and return the host port if possible."""
    if isinstance(port_mapping, int):
        return port_mapping
    if isinstance(port_mapping, str):
        s = port_mapping.strip()
        parts = s.split(':')
        # If mapping contains IP:HOST:CONTAINER, host is the second from right
        if len(parts) >= 3:
            candidate = parts[-2]
            port = _extract_candidate_port(candidate)
            if port is not None:
                return port
        # If HOST:CONTAINER format
        if len(parts) == 2:
            candidate = parts[0]
            port = _extract_candidate_port(candidate)
            if port is not None:
                return port
        # Single value (maybe env var or number)
        candidate = parts[0]
        return _extract_candidate_port(candidate)
    return None


def scan_compose_files(root_dir):
    found_ports = []
    if not os.path.exists(root_dir):
        return found_ports

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file in ['docker-compose.yml', 'docker-compose.yaml']:
                full_path = os.path.join(root, file)
                try:
                    with open(full_path, 'r') as f:
                        data = yaml.safe_load(f)
                        if data and 'services' in data:
                            for svc_name, svc_data in data['services'].items():
                                if 'ports' in svc_data:
                                    for port_mapping in svc_data['ports']:
                                        try:
                                            port = _parse_port_mapping(port_mapping)
                                            if port is None:
                                                logger.debug("Skipping unresolved port mapping in %s: %s", full_path, port_mapping)
                                                continue
                                            found_ports.append({
                                                "port": int(port),
                                                "service": f"File: {os.path.basename(root)}/{svc_name}",
                                                "source": "docker_file",
                                                "path": full_path
                                            })
                                        except Exception as e:
                                            # parse errors for a specific mapping shouldn't abort parsing the file
                                            logger.warning("Could not parse port mapping '%s' in %s: %s", port_mapping, full_path, e)
                except Exception as e:
                    logger.exception("Error parsing %s: %s", full_path, e)
    return found_ports

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "PortRegistry Backend is running"}

class ScanRequest(BaseModel):
    paths: List[str]

@app.post("/scan")
def scan_ports(req: ScanRequest):
    logger.info("Scanning paths: %s", req.paths)
    system = get_system_ports()
    docker_active = get_docker_ports()
    
    file_ports = []
    for path in req.paths:
        file_ports.extend(scan_compose_files(path))
    
    
    # Priority: Docker Active > System > File
    # This ensures that if a port is mapped by Docker, it shows as Docker (Blue),
    # even if the System also sees the listening process (which is common).
    all_occupied = docker_active + system + file_ports
    
    # Deduplicate keeping the first occurrence
    seen_ports = set()
    unique_ports = []
    
    for p in all_occupied:
        if p['port'] not in seen_ports:
            seen_ports.add(p['port'])
            unique_ports.append(p)
    
    # Sort by port
    unique_ports.sort(key=lambda x: x['port'])
    
    return {"occupied": unique_ports}

class KillRequest(BaseModel):
    port: int
    source: str
    id: Optional[str] = None

@app.post("/kill")
def kill_process(req: KillRequest):
    logger.info("Received kill request: %s", req)
    
    if req.source == 'system':
        if not req.id:
            raise HTTPException(status_code=400, detail="PID (id) is required for system processes")
        
        try:
            pid = int(req.id)
            if psutil.pid_exists(pid):
                p = psutil.Process(pid)
                p.terminate()
                logger.info("Process %d terminated", pid)
                return {"status": "success", "message": f"Process {pid} terminated"}
            else:
                logger.warning("Process %d not found", pid)
                return {"status": "error", "message": f"Process {pid} not found"}
        except Exception as e:
            logger.exception("Error terminating process %s: %s", req.id, e)
            raise HTTPException(status_code=500, detail=str(e))
            
    elif req.source == 'docker_active':
        if not req.id:
            raise HTTPException(status_code=400, detail="Container ID is required")
            
        if not client:
             raise HTTPException(status_code=503, detail="Docker client unavailable")

        try:
            container = client.containers.get(req.id)
            container.stop()
            logger.info("Container %s stopped", req.id[:12])
            return {"status": "success", "message": f"Container {req.id[:12]} stopped"}
        except docker.errors.NotFound:
            logger.warning("Container %s not found", req.id)
            return {"status": "error", "message": "Container not found"}
        except Exception as e:
            logger.exception("Error stopping container %s: %s", req.id, e)
            raise HTTPException(status_code=500, detail=str(e))
            
    else:
        raise HTTPException(status_code=400, detail="Invalid source for kill operation")

class OpenRequest(BaseModel):
    path: str
    type: str # 'file' or 'location'

@app.post("/open")
def open_resource(req: OpenRequest):
    if not os.path.exists(req.path):
         logger.warning("Open requested for missing path: %s", req.path)
         raise HTTPException(status_code=404, detail="File path not found")

    try:
        if req.type == 'file':
            os.startfile(req.path)
        elif req.type == 'location':
            # Open explorer with file selected
            subprocess.Popen(['explorer', '/select,', req.path])
        logger.info("Opened resource %s", req.path)
        return {"status": "success"}
    except Exception as e:
        logger.exception("Error opening resource %s: %s", req.path, e)
        raise HTTPException(status_code=500, detail=str(e))

# Serve static files (Frontend)
if getattr(sys, 'frozen', False):
    # If running as executable
    BASE_DIR = sys._MEIPASS
else:
    # If running as script (assuming server.py is in back-end/)
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DIST_DIR = os.path.join(BASE_DIR, "dist")

if os.path.exists(DIST_DIR):
    app.mount("/", StaticFiles(directory=DIST_DIR, html=True), name="static")

@app.exception_handler(404)
async def custom_404_handler(request, exc):
    """Handle 404s by serving SPA index.html when available, otherwise return JSON 404.
    Also log the missing path for diagnostics."""
    logger.warning("404 Not Found: %s %s", request.method, request.url)
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return JSONResponse({"detail": "Not found"}, status_code=404)


# Add a short alias for /health (some callers request /health instead of /api/health)
@app.get("/health")
def health_check_root():
    logger.info("Health check (alias /health) called")
    return health_check()


# Global exception handler to ensure uncaught exceptions are logged and return 500 JSON
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception("Unhandled exception for request %s %s: %s", request.method, request.url, exc)
    return JSONResponse({"detail": "Internal Server Error"}, status_code=500)

def is_port_in_use(port: int, host: str = '127.0.0.1') -> bool:
    """Return True if port is already in use on given host."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind((host, port))
            return False
        except OSError:
            return True


def find_free_port(host: str = '127.0.0.1') -> int:
    """Ask OS for a free port by binding to port 0."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, 0))
        return s.getsockname()[1]


def choose_port(requested_port: int) -> int:
    """Try requested_port; if busy (including TIME_WAIT), get a fresh free port from OS."""
    if not is_port_in_use(requested_port):
        logger.info("Using requested port %s", requested_port)
        return requested_port
    else:
        logger.warning("Requested port %s is in use or in TIME_WAIT; getting a fresh free port from OS", requested_port)
        new_port = find_free_port()
        logger.info("Selected free port %s", new_port)
        return new_port


def start_server(port: int):
    import uvicorn
    logger.info("Starting PortRegistry Backend on port %s...", port)
    try:
        # Run uvicorn programmatically
        uvicorn.run(app, host="127.0.0.1", port=port)
    except Exception as e:
        logger.exception("Failed to start server on port %s: %s", port, e)
        raise

if __name__ == "__main__":
    # Determine final port (respect PORT env / --port, but fall back if in use)
    final_port = choose_port(args.port)

    # 1. Start Backend in a separate thread
    t = threading.Thread(target=start_server, kwargs={'port': final_port}, daemon=True)
    t.start()

    # 2. Wait a bit for server to start (optional, but good for UX)
    # real production code might poll the health check endpoint
    import time
    time.sleep(1)

    # 3. Create the Native Window
    # Point it to localhost
    url = f"http://127.0.0.1:{final_port}"
    logger.info("Opening webview to %s", url)
    
    webview.create_window(
        title="PortRegistry",
        url=url,
        width=1200,
        height=800,
        resizable=True
    )

    # 4. Start the GUI loop
    webview.start()
