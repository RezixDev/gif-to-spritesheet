import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { SpriteFrame } from '../lib/gif-processor';


interface FrameStripProps {
    frames: SpriteFrame[];
    onRemoveFrame: (index: number) => void;
}

export function FrameStrip({ frames, onRemoveFrame }: FrameStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Horizontal scroll with wheel
    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            const onWheel = (e: WheelEvent) => {
                if (e.deltaY === 0) return;
                e.preventDefault();
                el.scrollLeft += e.deltaY;
            };
            el.addEventListener('wheel', onWheel, { passive: false });
            return () => el.removeEventListener('wheel', onWheel);
        }
    }, []);

    if (frames.length === 0) return null;

    return (
        <div className="h-40 bg-slate-900 border-t border-slate-800 flex flex-col shrink-0">
            <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Frames ({frames.length})
                </span>
                <span className="text-xs text-slate-500">
                    Shift + Scroll to navigate
                </span>
            </div>
            <div
                ref={scrollRef}
                className="flex-1 overflow-x-auto overflow-y-hidden flex items-center gap-4 px-4 py-4 mask-fade-sides"
                style={{ scrollbarWidth: 'thin' }}
            >
                {frames.map((frame, index) => (
                    <FrameItem
                        key={`${frame.id}-${index}`}
                        frame={frame}
                        index={index}
                        onRemove={() => onRemoveFrame(index)}
                    />
                ))}
            </div>
        </div>
    );
}

function FrameItem({ frame, index, onRemove }: { frame: SpriteFrame, index: number, onRemove: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                // Clear and draw
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                // Draw the image data
                // We need to create a temporary canvas or use putImageData
                // But we want to scale it to fit the thumbnail
                // so we can't use putImageData directly if we want to scale.
                // Instead, create a bitmap or temp canvas.

                // Fast way: putImageData to temp canvas, then drawImage to thumbnail
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = frame.dims.width;
                tempCanvas.height = frame.dims.height;
                tempCanvas.getContext('2d')?.putImageData(frame.imageData, 0, 0);

                // Draw scaled to fit 80x80 container (keeping aspect ratio)
                const targetSize = 80;
                const scale = Math.min(targetSize / frame.dims.width, targetSize / frame.dims.height);
                const w = frame.dims.width * scale;
                const h = frame.dims.height * scale;
                const x = (targetSize - w) / 2;
                const y = (targetSize - h) / 2;

                ctx.imageSmoothingEnabled = false; // Pixel art friendly
                ctx.drawImage(tempCanvas, x, y, w, h);
            }
        }
    }, [frame]);

    return (
        <div className="relative group shrink-0">
            <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 overflow-hidden relative">
                {/* Checkerboard for transparency */}
                <div className="absolute inset-0 opacity-20 bg-[size:10px_10px] bg-[linear-gradient(45deg,#000_25%,transparent_25%),linear-gradient(-45deg,#000_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#000_75%),linear-gradient(-45deg,transparent_75%,#000_75%)] bg-[position:0_0,0_5px,5px_-5px,-5px_0px]" />

                <canvas
                    ref={canvasRef}
                    width={80}
                    height={80}
                    className="relative z-10"
                />

                <div className="absolute top-1 left-2 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-1 rounded z-20">
                    #{index + 1}
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-all z-30"
                title="Remove frame"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}
