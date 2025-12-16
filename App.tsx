import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings as SettingsIcon, Terminal } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PythonSetup from './components/PythonSetup';
import Settings, { PortRangeConfig } from './components/Settings';
import { AppView } from './types';

const DEFAULT_RANGES: PortRangeConfig[] = [
  { start: 3000, label: 'Web Development' },
  { start: 8000, label: 'Application Services' }
];

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
      <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              P
            </div>
            PortRegistry
          </h1>
          <p className="text-xs text-gray-500 mt-2">Docker & System Port Manager</p>
        </div>

        <nav className="p-4 space-y-2">
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