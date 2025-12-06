
# server.py
# Requires: pip install fastapi uvicorn psutil docker pyyaml
import os
import psutil
import yaml
import docker
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Dict, Optional
from pydantic import BaseModel
import argparse
import sys
from dotenv import load_dotenv
import threading
import webview

# Load environment variables from .env file
load_dotenv()

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
    print("Docker client initialized successfully.")
except Exception as e:
    client = None
    print(f"Warning: Docker client could not be initialized. Active containers will not be scanned. Error: {e}")

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
        print(f"System Scan Error: {e}")
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
        print(f"Docker Error: {e}")
    return ports

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
                                        # Handle various docker compose port formats
                                        # "8080:80" -> 8080
                                        # 8080 -> 8080
                                        host_port = None
                                        if isinstance(port_mapping, str) and ':' in port_mapping:
                                            host_port = port_mapping.split(':')[0]
                                        elif isinstance(port_mapping, int):
                                            host_port = port_mapping
                                        
                                        if host_port:
                                            found_ports.append({
                                                "port": int(host_port),
                                                "service": f"File: {os.path.basename(root)}/{svc_name}",
                                                "source": "docker_file",
                                                "path": full_path
                                            })
                except Exception as e:
                    print(f"Error parsing {full_path}: {e}")
    return found_ports

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "PortRegistry Backend is running"}

@app.get("/scan")
def scan_ports(path: str = r"D:\docker_apps"):
    print(f"Scanning path: {path}")
    system = get_system_ports()
    docker_active = get_docker_ports()
    file_ports = scan_compose_files(path)
    
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
    print(f"Received kill request: {req}")
    
    if req.source == 'system':
        if not req.id:
            raise HTTPException(status_code=400, detail="PID (id) is required for system processes")
        
        try:
            pid = int(req.id)
            if psutil.pid_exists(pid):
                p = psutil.Process(pid)
                p.terminate()
                return {"status": "success", "message": f"Process {pid} terminated"}
            else:
                return {"status": "error", "message": f"Process {pid} not found"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    elif req.source == 'docker_active':
        if not req.id:
            raise HTTPException(status_code=400, detail="Container ID is required")
            
        if not client:
             raise HTTPException(status_code=503, detail="Docker client unavailable")

        try:
            container = client.containers.get(req.id)
            container.stop()
            return {"status": "success", "message": f"Container {req.id[:12]} stopped"}
        except docker.errors.NotFound:
            return {"status": "error", "message": "Container not found"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    else:
        raise HTTPException(status_code=400, detail="Invalid source for kill operation")

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
async def custom_404_handler(request, __):
    # Fallback to index.html for SPA routing if file not found and strictly 404
    # But StaticFiles with html=True usually handles root. 
    # For client-side routing deep links, we might need a catch-all.
    if os.path.exists(os.path.join(DIST_DIR, "index.html")):
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
    return {"detail": "Not found"}

def start_server():
    import uvicorn
    print(f"Starting PortRegistry Backend on port {args.port}...")
    # Run uvicorn programmatically
    uvicorn.run(app, host="127.0.0.1", port=args.port)

if __name__ == "__main__":
    # 1. Start Backend in a separate thread
    t = threading.Thread(target=start_server, daemon=True)
    t.start()

    # 2. Wait a bit for server to start (optional, but good for UX)
    # real production code might poll the health check endpoint
    import time
    time.sleep(1)

    # 3. Create the Native Window
    # Point it to localhost
    url = f"http://127.0.0.1:{args.port}"
    
    webview.create_window(
        title="PortRegistry",
        url=url,
        width=1200,
        height=800,
        resizable=True
    )

    # 4. Start the GUI loop
    webview.start()
