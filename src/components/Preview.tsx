
import { useState, useEffect, useRef } from "react";
import type { SpriteFrame } from "../lib/gif-processor";

interface PreviewProps {
    url: string | null;
    width: number;
    height: number;
    frames?: SpriteFrame[];
}

type ViewMode = 'sheet' | 'animation';

export function Preview({ url, width, height, frames = [] }: PreviewProps) {
    const [mode, setMode] = useState<ViewMode>('sheet');
    const [isPlaying, setIsPlaying] = useState(true);
    const [frameIndex, setFrameIndex] = useState(0);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || mode !== 'animation' || frames.length === 0) return;

        let timeoutId: number;

        const animate = () => {
            const currentDelay = frames[frameIndex].delay || 100; // Default 100ms if 0

            timeoutId = window.setTimeout(() => {
                setFrameIndex((prev) => (prev + 1) % frames.length);
            }, currentDelay);
        };

        animate();

        return () => window.clearTimeout(timeoutId);
    }, [isPlaying, mode, frames, frameIndex]);

    // Reset to frame 0 when frames change
    useEffect(() => {
        setFrameIndex(0);
    }, [frames]);

    const bgSize = 20;

    const renderContent = () => {
        if (!url && mode === 'sheet') {
            return (
                <div className="flex-1 flex items-center justify-center p-10 select-none">
                    <div className="text-center space-y-2 opacity-20">
                        <div className="w-24 h-24 mx-auto border-4 border-dashed border-slate-400 rounded-xl" />
                        <p className="text-xl font-bold text-slate-400">Preview Area</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 overflow-auto bg-[url('https://transparent-textures.patterns.velvethammer.net/subtle_dots.png')] relative flex items-center justify-center p-8 bg-slate-950/50">
                {/* Checkerboard background for transparency */}
                <div
                    className="relative shadow-2xl shadow-black rounded-lg overflow-hidden border border-slate-800 bg-[#1e293b]"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                    }}
                >
                    <div
                        className="inset-0 absolute z-0 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)`,
                            backgroundSize: `${bgSize}px ${bgSize}px`,
                            backgroundPosition: `0 0, 0 ${bgSize / 2}px, ${bgSize / 2}px -${bgSize / 2}px, -${bgSize / 2}px 0px`
                        }}
                    />

                    {mode === 'sheet' && url && (
                        <img
                            src={url}
                            alt="Spritesheet Preview"
                            className="relative z-10 block max-w-none"
                        />
                    )}

                    {mode === 'animation' && frames.length > 0 && (
                        <div className="relative z-10">
                            <img
                                src={URL.createObjectURL(new Blob([frames[frameIndex].imageData.data], { type: 'image/raw' /* This won't work directly with ImageData */ }))}
                                // Wait, simple IMG src cannot support ImageData directly. We need a canvas.
                                style={{ display: 'none' }}
                            />
                            {/* We need a Canvas to render ImageData */}
                            <FrameRenderer frame={frames[frameIndex]} />
                        </div>
                    )}
                </div>

                {mode === 'sheet' && (
                    <div className="absolute bottom-4 right-4 bg-slate-900/90 text-slate-400 text-xs px-2 py-1 rounded backdrop-blur border border-slate-800 font-mono">
                        {width} x {height} px
                    </div>
                )}

                {mode === 'animation' && (
                    <div className="absolute bottom-4 right-4 bg-slate-900/90 text-slate-400 text-xs px-2 py-1 rounded backdrop-blur border border-slate-800 font-mono flex gap-2 items-center">
                        <span>Frame: {frameIndex + 1} / {frames.length}</span>
                        <span>Delay: {frames[frameIndex]?.delay}ms</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center px-4 justify-between shrink-0">
                <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('sheet')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${mode === 'sheet'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        Spritesheet
                    </button>
                    <button
                        onClick={() => setMode('animation')}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${mode === 'animation'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                        disabled={frames.length === 0}
                    >
                        Animation
                    </button>
                </div>

                {mode === 'animation' && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                            title={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {renderContent()}
        </div>
    );
}

function FrameRenderer({ frame }: { frame: SpriteFrame }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !frame) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = frame.dims.width;
        canvas.height = frame.dims.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(frame.imageData, 0, 0);

    }, [frame]);

    return <canvas ref={canvasRef} className="block" />;
}

