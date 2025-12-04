import React from 'react';
import { PortInfo } from '../types';

interface PortGridProps {
  occupiedPorts: PortInfo[];
  startRange?: number;
}

const PortGrid: React.FC<PortGridProps> = ({ occupiedPorts, startRange = 3000 }) => {
  // Generate a grid of 100 ports starting from startRange
  const portsToDisplay = Array.from({ length: 100 }, (_, i) => startRange + i);

  const getPortStatus = (port: number) => {
    return occupiedPorts.find(p => p.port === port);
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-100">Port Map ({startRange} - {startRange + 99})</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Free</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> System</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Docker</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Files</div>
        </div>
      </div>
      
      <div className="grid grid-cols-10 gap-2">
        {portsToDisplay.map(port => {
          const info = getPortStatus(port);
          let bgColor = 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800';
          let textColor = 'text-emerald-500';

          if (info) {
            textColor = 'text-white';
            if (info.source === 'system') bgColor = 'bg-red-900/50 border-red-800';
            else if (info.source === 'docker_active') bgColor = 'bg-blue-900/50 border-blue-800';
            else if (info.source === 'docker_file') bgColor = 'bg-amber-900/50 border-amber-800';
          }

          return (
            <div 
              key={port}
              className={`
                aspect-square rounded flex flex-col items-center justify-center text-[10px] font-mono border cursor-help transition-all
                ${bgColor} ${textColor}
              `}
              title={info ? `${port}: ${info.service} (${info.source})` : `${port}: Available`}
            >
              {port}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortGrid;