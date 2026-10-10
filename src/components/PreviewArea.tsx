import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, PreviewTheme } from '../types/dither';
import { ProcessResult } from '../utils/dithering';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Download,
  Columns,
  Eye,
  FileCode,
  Layers,
  Palette,
} from 'lucide-react';

interface PreviewAreaProps {
  result: ProcessResult | null;
  originalImageSrc: string | null;
  onDownloadTxt: () => void;
  onCopyText: () => void;
  isCopied: boolean;
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
  result,
  originalImageSrc,
  onDownloadTxt,
  onCopyText,
  isCopied,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('text');
  const [theme, setTheme] = useState<PreviewTheme>('matrix');
  const [fontSize, setFontSize] = useState<number>(10);
  const [zoom, setZoom] = useState<number>(1);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage for split view
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bitmapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Render 1-bit bitmap to canvas whenever result changes
  useEffect(() => {
    if (!result || !bitmapCanvasRef.current) return;
    const canvas = bitmapCanvasRef.current;
    canvas.width = result.targetWidth;
    canvas.height = result.targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(result.targetWidth, result.targetHeight);
    const data = imgData.data;
    const grid = result.binaryGrid;

    for (let i = 0; i < grid.length; i++) {
      const idx = i * 4;
      const bit = grid[i]; // 0 is dark, 1 is light
      const val = bit === 1 ? 255 : 0;
      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
      data[idx + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
  }, [result]);

  if (!result) {
    return (
      <div className="flex-1 bg-neutral-900/30 border border-neutral-800 rounded-xl flex items-center justify-center p-12 text-neutral-500">
        <p className="text-sm">Processing image...</p>
      </div>
    );
  }

  // Theme styling for text preview
  const themeClasses: Record<PreviewTheme, { bg: string; text: string; border: string }> = {
    matrix: {
      bg: 'bg-[#040d06]',
      text: 'text-[#00ff66]',
      border: 'border-emerald-950',
    },
    amber: {
      bg: 'bg-[#0f0802]',
      text: 'text-[#ffb300]',
      border: 'border-amber-950',
    },
    dark: {
      bg: 'bg-[#0d1117]',
      text: 'text-[#c9d1d9]',
      border: 'border-neutral-800',
    },
    paper: {
      bg: 'bg-[#f6f6f4]',
      text: 'text-[#18181b]',
      border: 'border-neutral-300',
    },
    cyber: {
      bg: 'bg-[#030914]',
      text: 'text-[#00f0ff]',
      border: 'border-cyan-950',
    },
  };

  const activeTheme = themeClasses[theme];

  return (
    <div className="flex-1 flex flex-col bg-neutral-900/40 border border-neutral-800 rounded-xl overflow-hidden min-h-[500px]">
      {/* Top Controls Toolbar */}
      <div className="bg-neutral-950/70 border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-3 gap-x-4">
        {/* View Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setViewMode('text')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'text'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digits Grid</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'split'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-emerald-400" />
            <span>Split Slider</span>
          </button>

          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Side-by-Side</span>
          </button>

          <button
            onClick={() => setViewMode('bitmap')}
            className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'bitmap'
                ? 'bg-neutral-800 text-white font-medium shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-Bit Bitmap</span>
          </button>
        </div>

        {/* View Settings: Themes, Font size, Zoom */}
        <div className="flex items-center gap-3">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 text-xs">
            <Palette className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as PreviewTheme)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs rounded px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="matrix">Matrix Green</option>
              <option value="amber">Amber CRT</option>
              <option value="dark">Charcoal Terminal</option>
              <option value="paper">Paper Ink</option>
              <option value="cyber">Cyber Cyan</option>
            </select>
          </div>

          {/* Font Size controls */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <button
              onClick={() => setFontSize((s) => Math.max(6, s - 1))}
              className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              title="Decrease font size"
            >
              A-
            </button>
            <span className="font-mono tabular-nums text-[11px] w-6 text-center">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="font-mono tabular-nums text-[11px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Line Numbers Toggle */}
          <button
            onClick={() => setShowLineNumbers((prev) => !prev)}
            className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
              showLineNumbers
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            # Lines
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-auto p-4 transition-colors ${activeTheme.bg}`}
      >
        {/* VIEW 1: TEXT MONOSPACE GRID */}
        {viewMode === 'text' && (
          <div
            className="w-fit min-w-full flex justify-center transition-transform origin-top-left"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
          >
            <div className="font-mono select-text whitespace-pre leading-none tracking-tight">
              {result.digitLines.map((line, idx) => (
                <div key={idx} className="flex items-center">
                  {showLineNumbers && (
                    <span
                      className="select-none text-[10px] text-neutral-500/70 mr-3 w-8 text-right shrink-0"
                      style={{ fontSize: `${Math.max(8, fontSize - 2)}px` }}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span
                    className={`${activeTheme.text} transition-colors`}
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.05',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: SPLIT SLIDER VIEW */}
        {viewMode === 'split' && originalImageSrc && (
          <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
            {/* Background: Original Image */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={originalImageSrc}
                alt="Original"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Foreground: Dithered Digit Grid clipped by slider */}
            <div
              className={`absolute inset-0 flex items-center justify-center overflow-hidden ${activeTheme.bg}`}
              style={{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }}
            >
              <div
                className="font-mono select-text whitespace-pre leading-none p-4"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.05',
                  transform: `scale(${zoom})`,
                }}
              >
                {result.digitLines.map((line, idx) => (
                  <div key={idx} className={activeTheme.text}>
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Split Slider Divider Bar */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-20 pointer-events-none"
              style={{ left: `${splitPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-neutral-900 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-[10px] shadow-lg pointer-events-auto cursor-ew-resize">
                ↔
              </div>
            </div>

            {/* Hidden Range Input overlay for smooth drag */}
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize z-30"
            />

            {/* Labels */}
            <div className="absolute top-3 left-3 bg-neutral-900/80 px-2 py-1 rounded text-[11px] text-emerald-400 font-mono z-10 border border-neutral-800 pointer-events-none">
              1-Bit Digits ({splitPos}%)
            </div>
            <div className="absolute top-3 right-3 bg-neutral-900/80 px-2 py-1 rounded text-[11px] text-neutral-300 font-mono z-10 border border-neutral-800 pointer-events-none">
              Original Image
            </div>
          </div>
        )}

        {/* VIEW 3: SIDE-BY-SIDE */}
        {viewMode === 'side-by-side' && originalImageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Left: Original */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-4 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-neutral-400 mb-2">
                Original Image
              </span>
              <img
                src={originalImageSrc}
                alt="Source"
                className="max-h-[500px] object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right: Dithered Text */}
            <div
              className={`border border-neutral-800 rounded-lg p-4 overflow-auto ${activeTheme.bg}`}
            >
              <span className="text-xs font-semibold text-neutral-400 mb-2 block">
                1-Bit Dithered Digit Matrix
              </span>
              <div
                className="font-mono whitespace-pre leading-none"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.05',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                {result.digitLines.map((line, idx) => (
                  <div key={idx} className={activeTheme.text}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: 1-BIT RASTER BITMAP */}
        {viewMode === 'bitmap' && (
          <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
            <span className="text-xs text-neutral-400 font-medium">
              1-Bit Binary Bitmap Pixel Render ({result.targetWidth} ×{' '}
              {result.targetHeight} px)
            </span>
            <div
              className="border border-neutral-800 rounded shadow-2xl p-2 bg-neutral-950 overflow-auto max-w-full"
              style={{
                imageRendering: 'pixelated',
              }}
            >
              <canvas
                ref={bitmapCanvasRef}
                style={{
                  width: `${result.targetWidth * Math.max(1, Math.round(zoom * 2))}px`,
                  height: `${result.targetHeight * Math.max(1, Math.round(zoom * 2))}px`,
                  imageRendering: 'pixelated',
                }}
                className="rounded-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer for Quick Actions */}
      <div className="bg-neutral-950/90 border-t border-neutral-800 px-4 py-2 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <span>
            Dimensions:{' '}
            <strong className="text-neutral-200 font-mono">
              {result.targetWidth}×{result.targetHeight}
            </strong>
          </span>
          <span className="text-neutral-600">·</span>
          <span>
            Chars:{' '}
            <strong className="text-neutral-200 font-mono">
              {result.stats.totalDigits.toLocaleString()}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All</span>
              </>
            )}
          </button>

          <button
            onClick={onDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded bg-emerald-400 hover:bg-emerald-300 text-neutral-950 font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
