import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, RefreshCw, Server, ShieldCheck, Zap, ZapOff, FileText, Folder, ChevronDown, ChevronRight, Plus, X } from 'lucide-react';
import PortGrid from './PortGrid';
import { getScanData, checkBackendHealth, killProcess, openResource } from '../services/api.ts';
import { ScanResult } from '../types';
import GeminiAdvisor from './GeminiAdvisor';
import { PortRangeConfig } from './Settings';

interface DashboardProps {
    ranges?: PortRangeConfig[];
}

const Dashboard: React.FC<DashboardProps> = ({ ranges = [{ start: 3000, label: 'Default' }, { start: 8000, label: 'Default' }] }) => {
    const [paths, setPaths] = useState<string[]>(['D:\\docker_apps']);
    const [newPath, setNewPath] = useState('');
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState<ScanResult | null>(null);
    const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

    const toggleCollapse = (startPort: number) => {
        setCollapsed(prev => ({ ...prev, [startPort]: !prev[startPort] }));
    };

    const handleAddPath = () => {
        if (newPath && !paths.includes(newPath)) {
            setPaths([...paths, newPath]);
            setNewPath('');
        }
    };

    const handleRemovePath = (pathToRemove: string) => {
        setPaths(paths.filter(p => p !== pathToRemove));
    };

    // New state for connectivity
    const [isLive, setIsLive] = useState(true);
    const [backendAvailable, setBackendAvailable] = useState(false);
    const [copiedPort, setCopiedPort] = useState<number | null>(null);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

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
            const data = await getScanData(paths, isLive);
            setResults(data);
        } catch (e) {
            console.error(e);
            alert("Scan failed. If using Live mode, ensure server.py is running.");
        } finally {
            setScanning(false);
        }
    };

    const handleKill = async (port: number, source: string, id?: string) => {
        if (!id) return;

        const action = source === 'docker_active' ? 'stop container' : 'kill process';
        if (!window.confirm(`Are you sure you want to ${action} on port ${port}?`)) {
            return;
        }

        try {
            const success = await killProcess(port, source, id);
            if (success) {
                handleScan(); // Refresh data
            } else {
                alert(`Failed to ${action}`);
            }
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };



    const handleOpen = async (path: string, type: 'file' | 'location') => {
        try {
            await openResource(path, type);
        } catch (e: any) {
            alert(`Error opening resource: ${e.message}`);
        }
    };

    const handleCopy = (port: number) => {
        navigator.clipboard.writeText(port.toString());
        setCopiedPort(port);
        setTimeout(() => setCopiedPort(null), 2000);
    };

    useEffect(() => {
        // Initial scan
        handleScan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLive]); // Re-scan if mode changes

    // Filter ports based on search term
    const filteredPorts = results?.occupiedPorts.filter(port => {
        const searchLower = searchTerm.toLowerCase();
        return (
            port.port.toString().includes(searchLower) ||
            port.service.toLowerCase().includes(searchLower) ||
            port.source.toLowerCase().includes(searchLower) ||
            (port.path && port.path.toLowerCase().includes(searchLower))
        );
    }) || [];

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    {/* Path and Scan Button */}
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex flex-col gap-4" data-tour="path-input">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-500 font-medium ml-1">Scan Locations</label>
                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                {paths.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-950 border border-gray-700 rounded-full text-xs text-gray-200 group">
                                        <FolderOpen className="w-3 h-3 text-emerald-500" />
                                        <span className="max-w-[150px] truncate" title={p}>{p}</span>
                                        <button onClick={() => handleRemovePath(p)} className="hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newPath}
                                    onChange={(e) => setNewPath(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddPath()}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-lg py-2 px-4 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    placeholder="Add directory path (e.g., D:\projects)..."
                                />
                            </div>
                            <button
                                onClick={handleAddPath}
                                disabled={!newPath}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 rounded-lg flex items-center justify-center disabled:opacity-50 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleScan}
                                disabled={scanning || paths.length === 0}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                data-tour="scan-button"
                            >
                                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                                {scanning ? 'Scanning...' : 'Scan Ports'}
                            </button>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-4 px-1">
                        <button
                            onClick={() => setIsLive(!isLive)}
                            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${isLive
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
                    {/* Port Visualization - Dynamic Ranges */}
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-sm font-medium text-gray-400">Port Maps</h3>
                        <div className="flex gap-4 text-[10px] uppercase font-bold tracking-wider">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Free</div>
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> System</div>
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Docker</div>
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Files</div>
                        </div>
                    </div>
                    {results && ranges.map((range, idx) => (
                        <div key={range.start} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden" data-tour={idx === 0 ? "port-grid" : undefined}>
                            <button
                                onClick={() => toggleCollapse(range.start)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
                            >
                                <div>
                                    <h3 className="font-semibold text-gray-100 flex items-center gap-2">
                                        {range.label} <span className="text-gray-500 font-normal">({range.start} - {range.start + 99})</span>
                                    </h3>
                                </div>
                                {collapsed[range.start] ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                            </button>

                            {!collapsed[range.start] && (
                                <div className="p-6 border-t border-gray-800">
                                    <PortGrid occupiedPorts={results.occupiedPorts} startRange={range.start} />
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Detailed List */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" data-tour="detail-table">
                        <div className="px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="font-semibold text-gray-100">Occupied Ports Detail</h3>
                                <span className="text-xs text-gray-500">
                                    {filteredPorts.length} ports found
                                </span>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search ports, services..."
                                    className="w-full bg-gray-950/50 border border-gray-700 rounded-md py-1.5 pl-8 pr-3 text-xs text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-gray-950/50 sticky top-0 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-3">Port</th>
                                        <th className="px-6 py-3">Service</th>
                                        <th className="px-6 py-3">Source</th>
                                        <th className="px-6 py-3">Details</th>
                                        <th className="px-6 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {filteredPorts.map((port, idx) => (
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
                                                <div className="flex flex-col gap-1.5 align-start">
                                                    <span className="font-mono text-gray-300">{port.path ? port.path.split('\\').pop() : '-'}</span>
                                                    {port.path && (
                                                        <div className="flex flex-wrap gap-2">
                                                            <button
                                                                onClick={() => handleOpen(port.path!, 'file')}
                                                                className="flex items-center gap-1.5 px-2 py-1 bg-emerald-900/30 text-emerald-400 text-[10px] font-medium rounded hover:bg-emerald-900/50 transition-colors border border-emerald-900/50"
                                                                title="Open File"
                                                            >
                                                                <FileText className="w-3 h-3" /> File
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpen(port.path!, 'location')}
                                                                className="flex items-center gap-1.5 px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-medium rounded hover:bg-blue-900/50 transition-colors border border-blue-900/50"
                                                                title="Open Location"
                                                            >
                                                                <Folder className="w-3 h-3" /> Folder
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                {(port.source === 'system' || port.source === 'docker_active') && port.id && (
                                                    <button
                                                        onClick={() => handleKill(port.port, port.source, port.id)}
                                                        className="px-3 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-400 text-xs rounded border border-red-900/50 transition-colors"
                                                    >
                                                        {port.source === 'docker_active' ? 'Stop' : 'Kill'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPorts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
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
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800" data-tour="recommended-ports">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Server className="w-4 h-4 text-emerald-500" />
                            Recommended Free Ports
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {results?.freePorts.map(port => (
                                <div
                                    key={port}
                                    onClick={() => handleCopy(port)}
                                    className={`
                                        bg-gray-950 border p-3 rounded text-center cursor-pointer transition-all
                                        ${copiedPort === port
                                            ? 'border-emerald-500 bg-emerald-900/20'
                                            : 'border-gray-800 hover:border-emerald-500/50 hover:bg-gray-900'
                                        }
                                    `}
                                >
                                    <span className="text-xl font-mono text-emerald-400 font-bold">{port}</span>
                                    <p className={`text-[10px] uppercase mt-1 ${copiedPort === port ? 'text-emerald-400 font-bold' : 'text-gray-500'}`}>
                                        {copiedPort === port ? 'Copied!' : 'Available'}
                                    </p>
                                </div>
                            ))}
                            {!results && <p className="text-gray-500 text-sm col-span-2 text-center">Scan to find ports</p>}
                        </div>
                    </div>

                    {/* {results && <GeminiAdvisor occupiedPorts={results.occupiedPorts} />} */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;