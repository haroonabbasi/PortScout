
# server.py
# Requires: pip install fastapi uvicorn psutil docker pyyaml
import os
import psutil
import yaml
import docker
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

app = FastAPI()

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
                    "source": "system"
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
                                "source": "docker_active"
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

@app.get("/")
def health_check():
    return {"status": "ok", "message": "PortScout Backend is running"}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
