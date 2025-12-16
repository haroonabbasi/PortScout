export interface PortInfo {
  port: number;
  service: string;
  source: 'system' | 'docker_active' | 'docker_file';
  path?: string;
  id?: string;
  status: 'occupied' | 'free';
}

export interface ScanResult {
  totalScanned: number;
  occupiedPorts: PortInfo[];
  freePorts: number[];
  timestamp: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PYTHON_SETUP = 'PYTHON_SETUP',
  SETTINGS = 'SETTINGS',
  GEMINI_INSIGHTS = 'GEMINI_INSIGHTS'
}

export interface ScanConfig {
  scanSystem: boolean;
  scanDocker: boolean;
  scanFiles: boolean;
  directoryPath: string;
}