import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings as SettingsIcon, Terminal, HelpCircle, Github, Star, Coffee, ExternalLink, Info } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PythonSetup from './components/PythonSetup';
import Settings, { PortRangeConfig } from './components/Settings';
import { AppView } from './types';
import { startTour } from './services/tour';

const DEFAULT_RANGES: PortRangeConfig[] = [
  { start: 3000, label: 'Web Development' },
  { start: 8000, label: 'Application Services' }
];

// App version from package.json (injected by Vite)
const APP_VERSION = process.env.APP_VERSION || 'unknown';

// Creator & Support Links - Update these URLs as needed
const CREATOR_LINKS = {
  githubProfile: 'https://github.com/haroonabbasi',
  githubRepo: 'https://github.com/haroonabbasi/port-registry', // Update with your actual repo URL
  buyMeACoffee: 'https://buymeacoffee.com/haroonabbasi', // Update with your actual Buy Me a Coffee URL
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [portRanges, setPortRanges] = useState<PortRangeConfig[]>(() => {
    const saved = localStorage.getItem('port_ranges');
    return saved ? JSON.parse(saved) : DEFAULT_RANGES;
  });

  const handleSaveSettings = (ranges: PortRangeConfig[]) => {
    setPortRanges(ranges);
    localStorage.setItem('port_ranges', JSON.stringify(ranges));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 flex flex-col">
<div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <img src="/icon.png" alt="PortRegistry" className="w-8 h-8 rounded-lg" />
            PortRegistry
          </h1>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">Docker & System Port Manager</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Info className="w-3 h-3" />
              v{APP_VERSION}
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === AppView.DASHBOARD ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentView(AppView.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === AppView.SETTINGS ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>

          {/* <button 
            onClick={() => setCurrentView(AppView.PYTHON_SETUP)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${currentView === AppView.PYTHON_SETUP ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-600/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
          >
            <Terminal className="w-5 h-5" />
            Python Backend
          </button> */}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-3">
          <button
            onClick={() => {
              // Navigate to dashboard if not already there
              if (currentView !== AppView.DASHBOARD) {
                setCurrentView(AppView.DASHBOARD);
                // Wait for dashboard to render before starting tour
                setTimeout(() => {
                  startTour();
                }, 300);
              } else {
                // Start tour immediately if already on dashboard
                setTimeout(() => {
                  startTour();
                }, 100);
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <HelpCircle className="w-5 h-5" />
            Help / Tour
          </button>

          {/* Creator & Support Links */}
          <div className="pt-2 border-t border-gray-800/50">
            {/* <p className="text-xs text-gray-500 mb-3 px-1">Created by</p> */}
            <div className="space-y-2">
              <a
                href={CREATOR_LINKS.githubProfile}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors group"
              >
                <Github className="w-4 h-4" />
                <span className="flex-1">GitHub Profile</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a
                href={CREATOR_LINKS.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors group"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="flex-1">Star on GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              {/* <a
                href={CREATOR_LINKS.buyMeACoffee}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-amber-900/20 hover:text-amber-400 transition-colors group border border-gray-800 hover:border-amber-800/50"
              >
                <Coffee className="w-4 h-4" />
                <span className="flex-1">Support Project</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a> */}
            </div>
          </div>
        </div>

        {/* <div className="p-4 mt-auto">
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-500 border border-gray-800">
            <p className="font-semibold text-gray-400 mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Simulation Mode
            </div>
          </div>
        </div> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto max-h-screen p-6 md:p-10">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {currentView === AppView.DASHBOARD && 'Port Overview'}
              {currentView === AppView.PYTHON_SETUP && 'Backend Configuration'}
              {currentView === AppView.SETTINGS && 'Application Settings'}
            </h2>
            <p className="text-gray-400 mt-1">
              {currentView === AppView.DASHBOARD && 'Manage system, docker, and reserved ports.'}
              {currentView === AppView.PYTHON_SETUP && 'Setup the local python bridge to access system ports.'}
            </p>
          </div>
        </header>

        {currentView === AppView.DASHBOARD && <Dashboard ranges={portRanges} />}
        {currentView === AppView.PYTHON_SETUP && <PythonSetup />}
        {currentView === AppView.SETTINGS && <Settings ranges={portRanges} onSave={handleSaveSettings} />}
      </main>
    </div>
  );
};

export default App;