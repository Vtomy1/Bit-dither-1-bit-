import React from 'react';
import { DitherStats } from '../types/dither';

interface StatsBarProps {
  stats: DitherStats;
  zeroChar: string;
  oneChar: string;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, zeroChar, oneChar }) => {
  const kbSize = (stats.fileSizeBytes / 1024).toFixed(1);

  return (
    <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-y-3 gap-x-6 text-xs text-neutral-400">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Matrix:</span>
          <span className="font-mono tabular-nums text-neutral-200 font-medium">
            {stats.width} × {stats.height}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Total Digits:</span>
          <span className="font-mono tabular-nums text-neutral-200 font-medium">
            {stats.totalDigits.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Payload:</span>
          <span className="font-mono tabular-nums text-neutral-200 font-medium">
            {kbSize} KB
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500">Latency:</span>
          <span className="font-mono tabular-nums text-neutral-200 font-medium">
            {stats.renderTimeMs}ms
          </span>
        </div>
      </div>

      {/* Distribution visual indicator */}
      <div className="flex items-center gap-3">
        <span className="text-neutral-500">Density:</span>
        <div className="flex items-center gap-2 font-mono tabular-nums text-[11px]">
          <span className="text-neutral-400">
            '{zeroChar}' {stats.zeroPercentage.toFixed(0)}%
          </span>
          <div className="w-20 h-2 bg-neutral-800 rounded-sm overflow-hidden flex border border-neutral-700/60">
            <div
              className="bg-neutral-600 transition-all duration-300"
              style={{ width: `${stats.zeroPercentage}%` }}
              title={`'${zeroChar}': ${stats.zeroPercentage.toFixed(1)}%`}
            />
            <div
              className="bg-emerald-400 transition-all duration-300"
              style={{ width: `${stats.onePercentage}%` }}
              title={`'${oneChar}': ${stats.onePercentage.toFixed(1)}%`}
            />
          </div>
          <span className="text-emerald-400">
            '{oneChar}' {stats.onePercentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
};
