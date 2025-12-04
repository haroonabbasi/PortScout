import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, RefreshCw, Server, ShieldCheck, Zap, ZapOff } from 'lucide-react';
import PortGrid from './PortGrid';
import { getScanData, checkBackendHealth } from '../services/api.ts';
import { ScanResult } from '../types';
import GeminiAdvisor from './GeminiAdvisor';

const Dashboard: React.FC = () => {
  const [path, setPath] = useState('D:\\docker_apps');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult | null>(null);
  
  // New state for connectivity
  const [isLive, setIsLive] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const alive = await checkBackendHealth();
      setBackendAvailable(alive);
      if (alive) setIsLive(true);
    };
    checkHealth();
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      const data = await getScanData(path, isLive);
      setResults(data);
    } catch (e) {
      console.error(e);
      alert("Scan failed. If using Live mode, ensure server.py is running.");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    // Initial scan
    handleScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]); // Re-scan if mode changes

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
             {/* Path and Scan Button */}
            <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
                <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                type="text" 
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                placeholder="Scan Directory Path (e.g., D:\docker_apps)"
                />
            </div>
            <button 
                onClick={handleScan}
                disabled={scanning}
                className="w-full md:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Scanning...' : 'Scan Ports'}
            </button>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-4 px-1">
                 <button 
                    onClick={() => setIsLive(!isLive)}
                    className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                        isLive 
                        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' 
                        : 'bg-amber-900/30 text-amber-400 border-amber-800'
                    }`}
                 >
                    {isLive ? <Zap className="w-3 h-3 fill-current" /> : <ZapOff className="w-3 h-3" />}
                    {isLive ? 'Live Mode Active' : 'Simulation Mode'}
                 </button>
                 {!backendAvailable && isLive && (
                     <span className="text-xs text-red-400 flex items-center gap-1">
                         (Backend not detected on localhost:8000)
                     </span>
                 )}
            </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Free Ports Found</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {results ? results.freePorts.length : '-'}
                </p>
            </div>
             <div className="h-10 w-10 bg-emerald-900/30 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
             </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-6">
             {/* Port Visualization */}
             {results && <PortGrid occupiedPorts={results.occupiedPorts} startRange={3000} />}
             {results && <PortGrid occupiedPorts={results.occupiedPorts} startRange={8000} />}

             {/* Detailed List */}
             <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-100">Occupied Ports Detail</h3>
                    <span className="text-xs text-gray-500">
                        {results?.occupiedPorts.length || 0} ports found
                    </span>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-950/50 sticky top-0 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-3">Port</th>
                                <th className="px-6 py-3">Service</th>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {results?.occupiedPorts.map((port, idx) => (
                                <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-3 font-mono text-emerald-400">{port.port}</td>
                                    <td className="px-6 py-3 text-gray-300">{port.service}</td>
                                    <td className="px-6 py-3">
                                        <span className={`
                                            px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide
                                            ${port.source === 'system' ? 'bg-red-900/30 text-red-400' : ''}
                                            ${port.source === 'docker_active' ? 'bg-blue-900/30 text-blue-400' : ''}
                                            ${port.source === 'docker_file' ? 'bg-amber-900/30 text-amber-400' : ''}
                                        `}>
                                            {port.source.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs truncate max-w-[200px]" title={port.path || ''}>
                                        {port.path ? port.path.split('\\').pop() : '-'}
                                    </td>
                                </tr>
                            ))}
                            {(!results || results.occupiedPorts.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                                        <Search className="w-6 h-6 opacity-50" />
                                        <span>No ports found or scan not run yet.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>

        {/* Right Column: Recommendations & AI */}
        <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-500" />
                    Recommended Free Ports
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    {results?.freePorts.map(port => (
                        <div key={port} className="bg-gray-950 border border-gray-800 p-3 rounded text-center">
                            <span className="text-xl font-mono text-emerald-400 font-bold">{port}</span>
                            <p className="text-[10px] text-gray-500 uppercase mt-1">Available</p>
                        </div>
                    ))}
                    {!results && <p className="text-gray-500 text-sm col-span-2 text-center">Scan to find ports</p>}
                </div>
            </div>

            {results && <GeminiAdvisor occupiedPorts={results.occupiedPorts} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;