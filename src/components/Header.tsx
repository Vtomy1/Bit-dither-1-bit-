import React from 'react';
import { Download, Copy, Check, FileText } from 'lucide-react';

interface HeaderProps {
  onDownloadTxt: () => void;
  onCopyText: () => void;
  isCopied: boolean;
  onOpenInfo: () => void;
  statsText: string;
}

export const Header: React.FC<HeaderProps> = ({
  onDownloadTxt,
  onCopyText,
  isCopied,
  onOpenInfo,
  statsText,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, no pills) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-neutral-800 border border-neutral-700 flex items-center justify-center font-mono text-emerald-400 font-bold text-sm tracking-tighter">
            01
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            BitDigit
          </span>
        </div>

        {/* Zone 2: Navigation Links (single-line, subtle hover underlines) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={onOpenInfo}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
          >
            How 1-Bit Dithering Works
          </button>
          <span className="text-xs text-neutral-600 font-mono whitespace-nowrap shrink-0">
            {statsText}
          </span>
        </nav>

        {/* Zone 3: Primary Action (Single-line actions) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 hover:text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Copy digits to clipboard"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy TXT</span>
              </>
            )}
          </button>

          <button
            onClick={onDownloadTxt}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-emerald-950 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .TXT</span>
          </button>
        </div>
      </div>
    </header>
  );
};
