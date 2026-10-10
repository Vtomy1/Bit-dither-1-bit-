import React from 'react';
import { DitherAlgorithm, DitherSettings } from '../types/dither';
import { DIGIT_PRESETS } from '../utils/sampleImages';
import { Sliders, Grid, Type, Cpu, RotateCcw } from 'lucide-react';

interface ControlsProps {
  settings: DitherSettings;
  onChange: (updater: (prev: DitherSettings) => DitherSettings) => void;
  onReset: () => void;
}

const ALGORITHMS: { id: DitherAlgorithm; name: string; tag: string }[] = [
  { id: 'floyd-steinberg', name: 'Floyd-Steinberg', tag: 'Standard Diffusion' },
  { id: 'atkinson', name: 'Atkinson', tag: 'Classic Mac 1-Bit' },
  { id: 'bayer-8', name: 'Bayer 8×8', tag: 'Ordered Matrix' },
  { id: 'bayer-4', name: 'Bayer 4×4', tag: 'Coarse Matrix' },
  { id: 'bayer-2', name: 'Bayer 2×2', tag: 'Micro Checker' },
  { id: 'stucki', name: 'Stucki', tag: 'Smooth Diffusion' },
  { id: 'burkes', name: 'Burkes', tag: 'Clean Diffusion' },
  { id: 'sierra', name: 'Sierra', tag: '3-Row Diffusion' },
  { id: 'sierra-lite', name: 'Sierra Lite', tag: 'Fast Diffusion' },
  { id: 'halftone', name: 'Halftone', tag: 'Clustered Dot Screen' },
  { id: 'blue-noise', name: 'Blue Noise', tag: 'Organic Stipple' },
  { id: 'threshold', name: 'Threshold', tag: 'Raw Binary Cut' },
];

export const Controls: React.FC<ControlsProps> = ({
  settings,
  onChange,
  onReset,
}) => {
  const update = (partial: Partial<DitherSettings>) => {
    onChange((prev) => ({ ...prev, ...partial }));
  };

  const isErrorDiffusion = [
    'floyd-steinberg',
    'atkinson',
    'stucki',
    'burkes',
    'sierra',
    'sierra-lite',
  ].includes(settings.algorithm);

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 flex flex-col gap-6 text-sm">
      {/* 1. Algorithm Selection */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dithering Engine</span>
          </label>
        </div>

        <select
          value={settings.algorithm}
          onChange={(e) => update({ algorithm: e.target.value as DitherAlgorithm })}
          className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-medium cursor-pointer"
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.name} — {algo.tag}
            </option>
          ))}
        </select>

        {isErrorDiffusion && (
          <div className="flex items-center justify-between pt-1">
            <label className="text-xs text-neutral-400 cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.serpentine}
                onChange={(e) => update({ serpentine: e.target.checked })}
                className="rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Serpentine Scanning</span>
            </label>
            <span className="text-[11px] text-neutral-500">Alternating L↔R</span>
          </div>
        )}
      </div>

      {/* 2. Matrix Resolution & Aspect Ratio */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-emerald-400" />
            <span>Resolution (Columns)</span>
          </label>
          <span className="font-mono tabular-nums text-xs text-emerald-400 font-semibold">
            {settings.width} chars
          </span>
        </div>

        <input
          type="range"
          min="30"
          max="260"
          step="2"
          value={settings.width}
          onChange={(e) => update({ width: Number(e.target.value) })}
          className="w-full accent-emerald-400 cursor-pointer"
        />

        {/* Quick Resolution Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[50, 80, 110, 150, 200].map((w) => (
            <button
              key={w}
              onClick={() => update({ width: w })}
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                settings.width === w
                  ? 'bg-neutral-800 border-emerald-500 text-emerald-400'
                  : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Compensation */}
        <div className="flex flex-col gap-1.5 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Vertical Ratio Compensation:</span>
            <span className="font-mono tabular-nums text-neutral-300">
              {settings.charAspectRatio.toFixed(2)}×
            </span>
          </div>

          <input
            type="range"
            min="0.30"
            max="1.00"
            step="0.05"
            value={settings.charAspectRatio}
            onChange={(e) => update({ charAspectRatio: Number(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />

          <div className="flex items-center justify-between text-[11px] text-neutral-500">
            <button
              type="button"
              onClick={() => update({ charAspectRatio: 0.5 })}
              className={`cursor-pointer underline-offset-2 ${
                Math.abs(settings.charAspectRatio - 0.5) < 0.01
                  ? 'text-emerald-400 font-medium underline'
                  : 'hover:text-neutral-300'
              }`}
            >
              0.50 (Monospace TXT)
            </button>
            <button
              type="button"
              onClick={() => update({ charAspectRatio: 1.0 })}
              className={`cursor-pointer underline-offset-2 ${
                Math.abs(settings.charAspectRatio - 1.0) < 0.01
                  ? 'text-emerald-400 font-medium underline'
                  : 'hover:text-neutral-300'
              }`}
            >
              1.00 (Square Pixels)
            </button>
          </div>
        </div>
      </div>

      {/* 3. Digit Character Mapping */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800/80">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          <span>Digit / Symbol Mapping</span>
        </label>

        {/* Character Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-neutral-400">Dark Symbol (0):</span>
            <input
              type="text"
              maxLength={2}
              value={settings.zeroChar}
              onChange={(e) => update({ zeroChar: e.target.value || '0' })}
              className="bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono text-center text-sm py-1.5 rounded focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-neutral-400">Light Symbol (1):</span>
            <input
              type="text"
              maxLength={2}
              value={settings.oneChar}
              onChange={(e) => update({ oneChar: e.target.value || '1' })}
              className="bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono text-center text-sm py-1.5 rounded focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Symbol Presets */}
        <div className="flex flex-wrap gap-1.5">
          {DIGIT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                update({ zeroChar: preset.zeroChar, oneChar: preset.oneChar })
              }
              className={`px-2 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                settings.zeroChar === preset.zeroChar &&
                settings.oneChar === preset.oneChar
                  ? 'bg-neutral-800 border-emerald-500 text-emerald-400'
                  : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title={preset.description}
            >
              '{preset.zeroChar}' / '{preset.oneChar}'
            </button>
          ))}
        </div>

        {/* Output formatting toggles */}
        <div className="flex flex-col gap-2 pt-1 text-xs text-neutral-400">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.spaceSeparated}
              onChange={(e) => update({ spaceSeparated: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Add space between digits ('0 1 0 1')</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.invert}
              onChange={(e) => update({ invert: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Invert binary states (Invert 0 and 1)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.includeHeaderComment}
              onChange={(e) => update({ includeHeaderComment: e.target.checked })}
              className="rounded border-neutral-700 bg-neutral-950 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Include metadata comments in .TXT</span>
          </label>
        </div>
      </div>

      {/* 4. Tone Adjustments (Contrast, Brightness, Gamma) */}
      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800/80">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Luminance & Contrast</span>
          </label>
          <button
            onClick={onReset}
            className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset tone settings"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Contrast</span>
            <span className="font-mono tabular-nums text-neutral-300">
              {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
            </span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={settings.contrast}
            onChange={(e) => update({ contrast: Number(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Brightness</span>
            <span className="font-mono tabular-nums text-neutral-300">
              {settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-80"
            max="80"
            value={settings.brightness}
            onChange={(e) => update({ brightness: Number(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Gamma */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Gamma Curve</span>
            <span className="font-mono tabular-nums text-neutral-300">
              {settings.gamma.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.2"
            step="0.05"
            value={settings.gamma}
            onChange={(e) => update({ gamma: Number(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer"
          />
        </div>

        {/* Dither Strength */}
        {isErrorDiffusion && (
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400">Dither Diffusion Amount</span>
              <span className="font-mono tabular-nums text-neutral-300">
                {settings.ditherStrength}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={settings.ditherStrength}
              onChange={(e) => update({ ditherStrength: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        )}
      </div>
    </aside>
  );
};
