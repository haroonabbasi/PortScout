import React, { useState } from 'react';
import { Copy, Check, Terminal, AlertTriangle } from 'lucide-react';
import { PYTHON_BACKEND_SCRIPT } from '../constants';

const PythonSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_BACKEND_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-amber-900/20 border border-amber-800/50 p-4 rounded-lg flex gap-4 items-start">
        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-amber-400 font-semibold">Browser Sandbox Limitation</h3>
          <p className="text-amber-200/80 text-sm mt-1">
            This web application cannot directly access your hard drive (`D:\`) or system ports due to browser security restrictions. 
            To make this functional, you need to run the Python bridge script below on your machine.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-mono text-gray-300">server.py</span>
          </div>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
            <code>{PYTHON_BACKEND_SCRIPT}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-white mb-4">Installation</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
            <li>Install Python 3.9+</li>
            <li>
              Install dependencies:
              <div className="mt-2 bg-black/50 p-2 rounded font-mono text-gray-300 select-all">
                pip install fastapi uvicorn psutil docker pyyaml
              </div>
            </li>
            <li>Save the code above as <code className="text-white">server.py</code></li>
          </ol>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-white mb-4">Running</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
            <li>
              Run the server:
              <div className="mt-2 bg-black/50 p-2 rounded font-mono text-gray-300 select-all">
                python server.py
              </div>
            </li>
            <li>The API will start at <code className="text-white">http://localhost:8000</code></li>
            <li>This UI is currently in <span className="text-emerald-400">Simulation Mode</span>. In a real build, it would fetch from that URL.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PythonSetup;