import React, { useState } from 'react';
import { Copy, Check, Terminal, AlertTriangle, Download, Server } from 'lucide-react';
import { PYTHON_BACKEND_SCRIPT } from '../constants';

const PythonSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_BACKEND_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_BACKEND_SCRIPT], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-amber-900/20 border border-amber-800/50 p-4 rounded-lg flex gap-4 items-start">
        <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-amber-400 font-semibold">How this app works</h3>
          <p className="text-amber-200/80 text-sm mt-1 leading-relaxed">
            Web browsers are sandboxed for security. They cannot directly read your <code className="bg-black/30 px-1 rounded">D:\</code> drive or scan your system ports.
            To bridge this gap, you need to run a small Python script on your machine. The web app talks to this script to get real data.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-mono text-gray-300">server.py</span>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs text-white transition-colors border border-indigo-500"
            >
                <Download className="w-3 h-3" />
                Download File
            </button>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white transition-colors"
            >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>
        </div>
        <div className="p-4 overflow-x-auto max-h-[400px]">
          <pre className="text-xs font-mono text-emerald-400 leading-relaxed">
            <code>{PYTHON_BACKEND_SCRIPT}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-white mb-4">1. Installation</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
            <li>Install Python 3.9+ if you haven't already.</li>
            <li>
              Install the required libraries:
              <div className="mt-2 bg-black/50 p-3 rounded font-mono text-gray-300 select-all border border-gray-700">
                pip install fastapi uvicorn psutil docker pyyaml
              </div>
            </li>
            <li>Download the <code className="text-white">server.py</code> file above.</li>
          </ol>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <h3 className="font-semibold text-white mb-4">2. Running</h3>
          <ol className="list-decimal list-inside space-y-3 text-sm text-gray-400">
            <li>
              Open a terminal where you saved the file and run:
              <div className="mt-2 bg-black/50 p-3 rounded font-mono text-gray-300 select-all border border-gray-700">
                python server.py
              </div>
            </li>
            <li>
              The API will start at <code className="text-emerald-400">http://localhost:8000</code>.
            </li>
            <li>Go back to the Dashboard and toggle <strong>"Live Mode"</strong>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PythonSetup;