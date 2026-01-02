import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { DropZone } from './components/DropZone';
import { Preview } from './components/Preview';
import { FrameStrip } from './components/FrameStrip';
import {
  extractFrames,
  generateSpritesheet,
  type LayoutMode,
  type SpriteFrame,
  type SpriteSheetResult
} from './lib/gif-processor';

function App() {
  const [frames, setFrames] = useState<SpriteFrame[]>([]);
  const [layout, setLayout] = useState<LayoutMode>('horizontal');
  const [padding, setPadding] = useState(0);
  const [columns, setColumns] = useState(5);
  const [result, setResult] = useState<SpriteSheetResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [filename, setFilename] = useState("spritesheet");

  // Reprocess when config changes
  useEffect(() => {
    if (frames.length > 0) {
      setIsProcessing(true);
      // Debounce slightly to avoid heavy processing on slider drag
      const timer = setTimeout(() => {
        generateSpritesheet(frames, { layout, padding, columns })
          .then(setResult)
          .catch(console.error)
          .finally(() => setIsProcessing(false));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [frames, layout, padding, columns]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setDragActive(false); // Reset drag state immediately
      setIsProcessing(true);
      const extractedFrames = await extractFrames(file);
      setFrames(extractedFrames);
      setResult(null); // Reset result while regenerating

      // Default filename to original name without extension
      const safeName = file.name.split('.').slice(0, -1).join('.') || 'spritesheet';
      setFilename(safeName);

    } catch (err) {
      console.error(err);
      alert('Failed to parse GIF. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownloadPng = useCallback(() => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.url;
      link.download = `${filename || 'spritesheet'}.png`;
      link.click();
    }
  }, [result, filename]);

  const handleDownloadJson = useCallback(() => {
    if (result) {
      const jsonStr = JSON.stringify({
        meta: {
          app: "https://gif-to-spritesheet.com",   // Placeholder
          version: "1.0.0",
          image: `${filename || 'spritesheet'}.png`,
          format: "RGBA8888",
          size: { w: result.width, h: result.height },
          scale: "1"
        },
        frames: result.frames
      }, null, 2);

      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'spritesheet'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, [result, filename]);

  return (
    <div
      className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden"
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only disable if we are leaving the window
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
      }}
    >
      {/* Global Drag Overlay */}
      {dragActive && frames.length > 0 && (
        <div
          className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-sm flex items-center justify-center border-4 border-blue-500 border-dashed m-4 rounded-xl"
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => { e.preventDefault(); }}
        >
          <p className="text-2xl font-bold text-white drop-shadow-md pointer-events-none">Drop new GIF to replace</p>
        </div>
      )}

      <Sidebar
        layout={layout}
        onLayoutChange={setLayout}
        padding={padding}
        onPaddingChange={setPadding}
        columns={columns}
        onColumnsChange={setColumns}
        onDownloadPng={handleDownloadPng}
        onDownloadJson={handleDownloadJson}
        filename={filename}
        onFilenameChange={setFilename}
        disabled={!result}
      />

      <main className="flex-1 flex flex-col relative">
        {frames.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <DropZone onFileSelect={handleFileSelect} className="w-full max-w-2xl h-96" />
          </div>
        ) : (
          <>
            <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center px-6 justify-between shrink-0">
              <h1 className="font-bold text-lg">Preview</h1>
              {isProcessing && (
                <span className="text-xs text-blue-400 animate-pulse font-mono">Processing...</span>
              )}
            </div>
            <Preview
              url={result?.url ?? null}
              width={result?.width ?? 0}
              height={result?.height ?? 0}
              frames={frames}
            />
            <FrameStrip
              frames={frames}
              onRemoveFrame={(index) => {
                setFrames(prev => prev.filter((_, i) => i !== index));
              }}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
