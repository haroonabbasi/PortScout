import { ScanResult } from '../types';
import { scanPorts as mockScanPorts } from './mockService';

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1s timeout

    const res = await fetch(`/`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
};

export const killProcess = async (port: number, source: string, id?: string): Promise<boolean> => {
  const res = await fetch(`/kill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ port, source, id }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Failed to kill process');
  }

  const data = await res.json();
  return data.status === 'success';
};

export const openResource = async (path: string, type: 'file' | 'location'): Promise<boolean> => {
  const res = await fetch(`/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path, type }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Failed to open resource');
  }

  const data = await res.json();
  return data.status === 'success';
};

export const scanPortsLive = async (path: string): Promise<ScanResult> => {
  const res = await fetch(`/scan?path=${encodeURIComponent(path)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch from Python backend');
  }

  const data = await res.json();

  // The Python API currently returns { occupied: [...] }. We need to format it to ScanResult
  const occupied = data.occupied || [];

  // Calculate free ports (simple logic similar to mock for now, or just return basic info)
  const freePorts = [];
  let candidate = 8000;
  while (freePorts.length < 10) {
    if (!occupied.find((p: any) => p.port === candidate)) {
      freePorts.push(candidate);
    }
    candidate++;
  }

  return {
    totalScanned: 65535,
    occupiedPorts: occupied,
    freePorts,
    timestamp: new Date().toISOString()
  };
};

export const getScanData = async (path: string, useLive: boolean): Promise<ScanResult> => {
  if (useLive) {
    try {
      return await scanPortsLive(path);
    } catch (e) {
      console.error("Live scan failed, falling back to mock or throwing", e);
      throw e;
    }
  } else {
    return await mockScanPorts(path);
  }
};