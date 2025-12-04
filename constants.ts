export const MOCK_DELAY = 1500;

export const PYTHON_BACKEND_SCRIPT = `
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = docker.from_env()

def get_system_ports():
    ports = []
    for conn in psutil.net_connections(kind='inet'):
        if conn.status == 'LISTEN':
            ports.append({"port": conn.laddr.port, "service": "System Process", "source": "system"})
    return ports

def get_docker_ports():
    ports = []
    try:
        containers = client.containers.list()
        for container in containers:
            p = container.attrs['NetworkSettings']['Ports']
            for port_key in p:
                if p[port_key]:
                    host_port = p[port_key][0]['HostPort']
                    ports.append({
                        "port": int(host_port), 
                        "service": f"Container: {container.name}", 
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
                        # Basic parsing logic for services -> ports
                        if 'services' in data:
                            for svc_name, svc_data in data['services'].items():
                                if 'ports' in svc_data:
                                    for port_mapping in svc_data['ports']:
                                        # Handle "8080:80" string format
                                        if isinstance(port_mapping, str) and ':' in port_mapping:
                                            host_port = port_mapping.split(':')[0]
                                            found_ports.append({
                                                "port": int(host_port),
                                                "service": f"File: {os.path.basename(root)}/{svc_name}",
                                                "source": "docker_file",
                                                "path": full_path
                                            })
                except Exception as e:
                    print(f"Error parsing {full_path}: {e}")
    return found_ports

@app.get("/scan")
def scan_ports(path: str = "D:\\docker_apps"):
    system = get_system_ports()
    docker_active = get_docker_ports()
    file_ports = scan_compose_files(path)
    
    # Merge and deduplicate
    all_occupied = system + docker_active + file_ports
    unique_ports = {p['port']: p for p in all_occupied}.values()
    
    return {"occupied": list(unique_ports)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
