import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../lib/utils';

interface DropZoneProps {
    onFileSelect: (file: File) => void;
    className?: string;
}

export function DropZone({ onFileSelect, className }: DropZoneProps) {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.type === 'image/gif') {
                    onFileSelect(file);
                } else {
                    alert('Please upload a GIF file');
                }
            }
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={cn(
                "border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-10 transition-colors cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center gap-4 text-center group",
                className
            )}
            onClick={() => document.getElementById('file-input')?.click()}
        >
            <input
                type="file"
                id="file-input"
                className="hidden"
                accept="image/gif"
                onChange={handleChange}
            />
            <div className="p-4 rounded-full bg-slate-800 group-hover:bg-blue-500/10 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
            </div>
            <div>
                <p className="font-medium text-lg text-slate-200">
                    Drop your GIF here
                </p>
                <p className="text-sm text-slate-500 mt-1">
                    or click to browse
                </p>
            </div>
        </div>
    );
}
