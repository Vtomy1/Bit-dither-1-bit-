export type DitherAlgorithm =
  | 'floyd-steinberg'
  | 'atkinson'
  | 'bayer-8'
  | 'bayer-4'
  | 'bayer-2'
  | 'stucki'
  | 'burkes'
  | 'sierra'
  | 'sierra-lite'
  | 'halftone'
  | 'threshold'
  | 'blue-noise';

export interface DigitPreset {
  id: string;
  name: string;
  zeroChar: string; // Represents black / off
  oneChar: string;  // Represents white / on
  description: string;
}

export interface DitherSettings {
  algorithm: DitherAlgorithm;
  width: number;
  maintainAspectRatio: boolean;
  charAspectRatio: number; // usually ~0.5 for monospace text, 1.0 for square
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  gamma: number; // 0.2 to 2.5
  invert: boolean; // Swap 0 and 1
  zeroChar: string;
  oneChar: string;
  spaceSeparated: boolean;
  serpentine: boolean; // Alternating scanline direction for error diffusion
  ditherStrength: number; // 0 to 100%
  includeHeaderComment: boolean;
}

export interface DitherStats {
  width: number;
  height: number;
  totalDigits: number;
  zeroCount: number;
  oneCount: number;
  zeroPercentage: number;
  onePercentage: number;
  fileSizeBytes: number;
  renderTimeMs: number;
}

export type PreviewTheme = 'matrix' | 'dark' | 'amber' | 'paper' | 'cyber';
export type ViewMode = 'text' | 'split' | 'bitmap' | 'side-by-side';
