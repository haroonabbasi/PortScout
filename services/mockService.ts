import { PortInfo, ScanResult } from '../types';
import { MOCK_DELAY } from '../constants';

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const scanPorts = async (path: string): Promise<ScanResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const occupied: PortInfo[] = [];

      // Mock System Ports
      [80, 443, 22, 53, 3306, 5432].forEach(p => {
        occupied.push({ port: p, service: 'System/OS', source: 'system', status: 'occupied' });
      });

      // Mock Docker Active
      occupied.push({ port: 8080, service: 'portainer', source: 'docker_active', status: 'occupied' });
      occupied.push({ port: 6379, service: 'redis-cache', source: 'docker_active', status: 'occupied' });

      // Mock File Scan
      occupied.push({ 
        port: 3000, 
        service: 'web-app-v1', 
        source: 'docker_file', 
        path: `${path}\\web_app\\docker-compose.yml`,
        status: 'occupied'
      });
       occupied.push({ 
        port: 9090, 
        service: 'prometheus', 
        source: 'docker_file', 
        path: `${path}\\monitoring\\docker-compose.yml`,
        status: 'occupied'
      });

      // Generate random free ports for suggestion
      const freePorts = [];
      let candidate = 8000;
      while (freePorts.length < 10) {
        if (!occupied.find(p => p.port === candidate)) {
          freePorts.push(candidate);
        }
        candidate++;
      }

      resolve({
        totalScanned: 65535,
        occupiedPorts: occupied.sort((a, b) => a.port - b.port),
        freePorts,
        timestamp: new Date().toISOString()
      });
    }, MOCK_DELAY);
  });
};
