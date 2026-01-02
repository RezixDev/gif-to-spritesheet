import { Download, FileJson } from 'lucide-react';
import type { LayoutMode } from '../lib/gif-processor';
import { cn } from '../lib/utils';

interface SidebarProps {
    layout: LayoutMode;
    onLayoutChange: (layout: LayoutMode) => void;
    padding: number;
    onPaddingChange: (padding: number) => void;
    columns: number;
    onColumnsChange: (cols: number) => void;
    onDownloadPng: () => void;
    onDownloadJson: () => void;
    filename: string;
    onFilenameChange: (name: string) => void;
    disabled?: boolean;
}

export function Sidebar({
    layout,
    onLayoutChange,
    padding,
    onPaddingChange,
    columns,
    onColumnsChange,
    onDownloadPng,
    onDownloadJson,
    filename,
    onFilenameChange,
    disabled
}: SidebarProps) {
    return (
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-8 h-full overflow-y-auto">
            <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-1">
                    Settings
                </h2>
                <p className="text-sm text-slate-500">Configure output</p>
            </div>

            <div className="space-y-6">
                {/* Filename Input */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Filename</label>
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => onFilenameChange(e.target.value)}
                        placeholder="spritesheet"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                    />
                </div>

                {/* Layout Mode */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Layout</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['horizontal', 'vertical', 'grid'] as LayoutMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => onLayoutChange(mode)}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                                    layout === mode
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Columns (Conditionally Rendered) */}
                {layout === 'grid' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <label className="text-sm font-medium text-slate-300">
                            Grid Columns
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={columns}
                            onChange={(e) => onColumnsChange(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                )}

                {/* Padding */}
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <label className="text-sm font-medium text-slate-300">Padding</label>
                        <span className="text-xs text-slate-500">{padding}px</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={padding}
                        onChange={(e) => onPaddingChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <button
                    onClick={onDownloadPng}
                    disabled={disabled}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Download className="w-5 h-5" />
                    Download PNG
                </button>
                <button
                    onClick={onDownloadJson}
                    disabled={disabled}
                    className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <FileJson className="w-5 h-5" />
                    Generate JSON
                </button>
            </div>
        </div>
    );
}
