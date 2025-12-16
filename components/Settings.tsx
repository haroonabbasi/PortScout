import React, { useState } from 'react';
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react';

export interface PortRangeConfig {
    start: number;
    label: string;
}

interface SettingsProps {
    ranges: PortRangeConfig[];
    onSave: (ranges: PortRangeConfig[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ ranges, onSave }) => {
    const [localRanges, setLocalRanges] = useState<PortRangeConfig[]>(ranges);
    const [newStart, setNewStart] = useState('');
    const [newLabel, setNewLabel] = useState('');

    const handleAdd = () => {
        const start = parseInt(newStart);
        if (isNaN(start) || start < 1 || start > 65000) {
            alert("Invalid start port");
            return;
        }
        setLocalRanges([...localRanges, { start, label: newLabel || `Ports ${start}+` }]);
        setNewStart('');
        setNewLabel('');
    };

    const handleRemove = (index: number) => {
        setLocalRanges(localRanges.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(localRanges);
        alert("Settings saved!");
    };

    const handleReset = () => {
        if (confirm("Reset to default ranges?")) {
            const defaults = [
                { start: 3000, label: 'Web Development' },
                { start: 8000, label: 'Application Services' }
            ];
            setLocalRanges(defaults);
            onSave(defaults);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Port Scan Ranges</h3>
                        <p className="text-sm text-gray-400">Configure which port blocks appear on the dashboard.</p>
                    </div>
                    <button
                        onClick={handleReset}
                        className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset Defaults
                    </button>
                </div>

                <div className="space-y-3 mb-6">
                    {localRanges.map((range, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-800">
                            <div className="flex-1">
                                <span className="font-mono text-emerald-400 font-bold">{range.start}</span>
                                <span className="text-gray-500 text-sm mx-2">-</span>
                                <span className="font-mono text-gray-500">{range.start + 99}</span>
                            </div>
                            <div className="flex-[2]">
                                <span className="text-sm text-gray-300">{range.label}</span>
                            </div>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {localRanges.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm italic">
                            No ranges configured. Add one below.
                        </div>
                    )}
                </div>

                <div className="flex gap-4 items-end bg-gray-800/20 p-4 rounded-lg border border-gray-800/50 dashed">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs text-gray-500">Start Port</label>
                        <input
                            type="number"
                            placeholder="e.g. 5432"
                            value={newStart}
                            onChange={e => setNewStart(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex-[2] space-y-1">
                        <label className="text-xs text-gray-500">Label (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Database Ports"
                            value={newLabel}
                            onChange={e => setNewLabel(e.target.value)}
                            className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={handleAdd}
                        disabled={!newStart}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                    >
                        <Save className="w-4 h-4" /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
