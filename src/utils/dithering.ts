import { DitherAlgorithm, DitherSettings, DitherStats } from '../types/dither';

// Standard Bayer Matrices
const BAYER_2: number[][] = [
  [0, 2],
  [3, 1],
];

const BAYER_4: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8: number[][] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export interface ProcessResult {
  digitLines: string[];
  fullText: string;
  binaryGrid: Uint8Array; // 0 or 1 for each (w * h)
  targetWidth: number;
  targetHeight: number;
  stats: DitherStats;
}

/**
 * Resize and extract grayscale luminance buffer from an image/canvas.
 */
export function extractLuminance(
  source: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  contrast: number,
  brightness: number,
  gamma: number
): Float32Array {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new Float32Array(targetWidth * targetHeight);

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
  const data = imgData.data;
  const len = targetWidth * targetHeight;
  const buffer = new Float32Array(len);

  // Contrast factor: contrast range -100..100
  const cFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const bShift = (brightness / 100) * 255;
  const gammaExp = 1 / Math.max(0.01, gamma);

  for (let i = 0; i < len; i++) {
    const idx = i * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3] / 255;

    // Standard perceptual Rec. 709 luminance
    let lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Blend with white background if semi-transparent
    if (a < 1) {
      lum = lum * a + 255 * (1 - a);
    }

    // Apply brightness
    lum += bShift;

    // Apply contrast
    lum = cFactor * (lum - 128) + 128;

    // Clamp
    lum = Math.max(0, Math.min(255, lum));

    // Apply gamma
    lum = 255 * Math.pow(lum / 255, gammaExp);

    buffer[i] = Math.max(0, Math.min(255, lum));
  }

  return buffer;
}

/**
 * Apply 1-bit dithering algorithm to grayscale luminance buffer.
 * Returns Uint8Array where 0 = dark/off, 1 = light/on.
 */
export function ditherBuffer(
  lum: Float32Array,
  w: number,
  h: number,
  algorithm: DitherAlgorithm,
  serpentine: boolean = true,
  strengthFactor: number = 1.0
): Uint8Array {
  const output = new Uint8Array(w * h);
  // Clone luminance buffer for error diffusion algorithms
  const pixels = new Float32Array(lum);

  const addError = (x: number, y: number, err: number, weight: number) => {
    if (x >= 0 && x < w && y >= 0 && y < h) {
      pixels[y * w + x] += err * weight * strengthFactor;
    }
  };

  switch (algorithm) {
    case 'threshold': {
      for (let i = 0; i < w * h; i++) {
        output[i] = pixels[i] >= 128 ? 1 : 0;
      }
      break;
    }

    case 'bayer-2': {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const thresh = ((BAYER_2[y % 2][x % 2] + 0.5) / 4) * 255;
          output[y * w + x] = pixels[y * w + x] >= thresh ? 1 : 0;
        }
      }
      break;
    }

    case 'bayer-4': {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const thresh = ((BAYER_4[y % 4][x % 4] + 0.5) / 16) * 255;
          output[y * w + x] = pixels[y * w + x] >= thresh ? 1 : 0;
        }
      }
      break;
    }

    case 'bayer-8': {
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const thresh = ((BAYER_8[y % 8][x % 8] + 0.5) / 64) * 255;
          output[y * w + x] = pixels[y * w + x] >= thresh ? 1 : 0;
        }
      }
      break;
    }

    case 'halftone': {
      // Clustered-dot screen (4x4 cell)
      const cellSize = 4;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const cx = (x % cellSize) - (cellSize - 1) / 2;
          const cy = (y % cellSize) - (cellSize - 1) / 2;
          const dist = Math.sqrt(cx * cx + cy * cy);
          const maxDist = Math.sqrt(2 * Math.pow((cellSize - 1) / 2, 2));
          const thresh = (1 - dist / maxDist) * 255;
          output[y * w + x] = pixels[y * w + x] >= thresh ? 1 : 0;
        }
      }
      break;
    }

    case 'blue-noise': {
      // High-frequency pseudo-random threshold with triangular distribution
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Deterministic coordinate-based hash for steady jitter
          const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
          const noise = (seed - Math.floor(seed)) * 255;
          output[y * w + x] = pixels[y * w + x] >= noise ? 1 : 0;
        }
      }
      break;
    }

    case 'atkinson': {
      // Bill Atkinson dithering (MacPaint)
      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && y % 2 === 1;
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const step = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += step) {
          const idx = y * w + x;
          const oldVal = pixels[idx];
          const newVal = oldVal >= 128 ? 255 : 0;
          output[idx] = newVal === 255 ? 1 : 0;
          const err = oldVal - newVal;

          // Atkinson diffuses 6/8 of error, leaving 2/8 (sharp contrast!)
          const dir = isReverse ? -1 : 1;
          addError(x + 1 * dir, y, err, 1 / 8);
          addError(x + 2 * dir, y, err, 1 / 8);
          addError(x - 1 * dir, y + 1, err, 1 / 8);
          addError(x, y + 1, err, 1 / 8);
          addError(x + 1 * dir, y + 1, err, 1 / 8);
          addError(x, y + 2, err, 1 / 8);
        }
      }
      break;
    }

    case 'stucki': {
      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && y % 2 === 1;
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const step = isReverse ? -1 : 1;
        const dir = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += step) {
          const idx = y * w + x;
          const oldVal = pixels[idx];
          const newVal = oldVal >= 128 ? 255 : 0;
          output[idx] = newVal === 255 ? 1 : 0;
          const err = oldVal - newVal;

          addError(x + 1 * dir, y, err, 8 / 42);
          addError(x + 2 * dir, y, err, 4 / 42);

          addError(x - 2 * dir, y + 1, err, 2 / 42);
          addError(x - 1 * dir, y + 1, err, 4 / 42);
          addError(x, y + 1, err, 8 / 42);
          addError(x + 1 * dir, y + 1, err, 4 / 42);
          addError(x + 2 * dir, y + 1, err, 2 / 42);

          addError(x - 2 * dir, y + 2, err, 1 / 42);
          addError(x - 1 * dir, y + 2, err, 2 / 42);
          addError(x, y + 2, err, 4 / 42);
          addError(x + 1 * dir, y + 2, err, 2 / 42);
          addError(x + 2 * dir, y + 2, err, 1 / 42);
        }
      }
      break;
    }

    case 'burkes': {
      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && y % 2 === 1;
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const step = isReverse ? -1 : 1;
        const dir = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += step) {
          const idx = y * w + x;
          const oldVal = pixels[idx];
          const newVal = oldVal >= 128 ? 255 : 0;
          output[idx] = newVal === 255 ? 1 : 0;
          const err = oldVal - newVal;

          addError(x + 1 * dir, y, err, 8 / 32);
          addError(x + 2 * dir, y, err, 4 / 32);

          addError(x - 2 * dir, y + 1, err, 2 / 32);
          addError(x - 1 * dir, y + 1, err, 4 / 32);
          addError(x, y + 1, err, 8 / 32);
          addError(x + 1 * dir, y + 1, err, 4 / 32);
          addError(x + 2 * dir, y + 1, err, 2 / 32);
        }
      }
      break;
    }

    case 'sierra': {
      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && y % 2 === 1;
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const step = isReverse ? -1 : 1;
        const dir = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += step) {
          const idx = y * w + x;
          const oldVal = pixels[idx];
          const newVal = oldVal >= 128 ? 255 : 0;
          output[idx] = newVal === 255 ? 1 : 0;
          const err = oldVal - newVal;

          addError(x + 1 * dir, y, err, 5 / 32);
          addError(x + 2 * dir, y, err, 3 / 32);

          addError(x - 2 * dir, y + 1, err, 2 / 32);
          addError(x - 1 * dir, y + 1, err, 4 / 32);
          addError(x, y + 1, err, 5 / 32);
          addError(x + 1 * dir, y + 1, err, 4 / 32);
          addError(x + 2 * dir, y + 1, err, 2 / 32);

          addError(x - 1 * dir, y + 2, err, 2 / 32);
          addError(x, y + 2, err, 3 / 32);
          addError(x + 1 * dir, y + 2, err, 2 / 32);
        }
      }
      break;
    }

    case 'sierra-lite': {
      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && y % 2 === 1;
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const step = isReverse ? -1 : 1;
        const dir = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += step) {
          const idx = y * w + x;
          const oldVal = pixels[idx];
          const newVal = oldVal >= 128 ? 255 : 0;
          output[idx] = newVal === 255 ? 1 : 0;
          const err = oldVal - newVal;

          addError(x + 1 * dir, y, err, 2 / 4);
          addError(x - 1 * dir, y + 1, err, 1 / 4);
          addError(x, y + 1, err, 1 / 4);
        }
      }
      break;
    }

    case 'floyd-steinberg':
    default: {
      for (let y = 0; y < h; y++) {
        const isReverse = serpentine && y % 2 === 1;
        const startX = isReverse ? w - 1 : 0;
        const endX = isReverse ? -1 : w;
        const step = isReverse ? -1 : 1;
        const dir = isReverse ? -1 : 1;

        for (let x = startX; x !== endX; x += step) {
          const idx = y * w + x;
          const oldVal = pixels[idx];
          const newVal = oldVal >= 128 ? 255 : 0;
          output[idx] = newVal === 255 ? 1 : 0;
          const err = oldVal - newVal;

          addError(x + 1 * dir, y, err, 7 / 16);
          addError(x - 1 * dir, y + 1, err, 3 / 16);
          addError(x, y + 1, err, 5 / 16);
          addError(x + 1 * dir, y + 1, err, 1 / 16);
        }
      }
      break;
    }
  }

  return output;
}

/**
 * Main execution function: transforms image to formatted digit lines,
 * full text string, binary bitmap data, and complete diagnostic stats.
 */
export function processImageToDigits(
  source: HTMLImageElement | HTMLCanvasElement,
  settings: DitherSettings,
  sourceFileName?: string
): ProcessResult {
  const startTime = performance.now();

  const sourceW = source.width || (source as HTMLImageElement).naturalWidth || 100;
  const sourceH = source.height || (source as HTMLImageElement).naturalHeight || 100;
  const sourceRatio = sourceH / sourceW;

  const targetWidth = Math.max(10, Math.min(600, Math.round(settings.width)));
  // Character aspect ratio compensation: monospace fonts are approx 2:1 height:width,
  // so we multiply height by charAspectRatio (default 0.5) to keep visual proportions
  const targetHeight = settings.maintainAspectRatio
    ? Math.max(5, Math.round(targetWidth * sourceRatio * settings.charAspectRatio))
    : Math.max(5, Math.round(targetWidth * settings.charAspectRatio));

  // Extract luminance
  const lum = extractLuminance(
    source,
    targetWidth,
    targetHeight,
    settings.contrast,
    settings.brightness,
    settings.gamma
  );

  // Dither
  const strength = settings.ditherStrength / 100;
  const binaryGrid = ditherBuffer(
    lum,
    targetWidth,
    targetHeight,
    settings.algorithm,
    settings.serpentine,
    strength
  );

  // Map to characters
  // If inverted: swap 0 and 1 representation
  // Default: 0 = dark/black (pixels that fell below threshold), 1 = light/white
  const darkChar = settings.invert ? settings.oneChar : settings.zeroChar;
  const lightChar = settings.invert ? settings.zeroChar : settings.oneChar;

  const lines: string[] = [];
  let count0 = 0;
  let count1 = 0;

  for (let y = 0; y < targetHeight; y++) {
    const rowChars: string[] = [];
    const offset = y * targetWidth;

    for (let x = 0; x < targetWidth; x++) {
      const bit = binaryGrid[offset + x]; // 0 is dark, 1 is light
      if (bit === 0) {
        rowChars.push(darkChar);
        count0++;
      } else {
        rowChars.push(lightChar);
        count1++;
      }
    }

    lines.push(
      settings.spaceSeparated ? rowChars.join(' ') : rowChars.join('')
    );
  }

  // Construct text content with optional metadata header
  let fullText = '';
  if (settings.includeHeaderComment) {
    const headerLines = [
      `# BitDigit - 1-Bit Dithered Digit Export`,
      `# Source: ${sourceFileName || 'User image'}`,
      `# Dimensions: ${targetWidth}x${targetHeight} digits (Total: ${targetWidth * targetHeight})`,
      `# Algorithm: ${settings.algorithm} (Serpentine: ${settings.serpentine ? 'ON' : 'OFF'})`,
      `# Char Map: Dark='${darkChar}', Light='${lightChar}'`,
      `# Date: ${new Date().toISOString()}`,
      `# ----------------------------------------------------`,
      '',
    ];
    fullText = headerLines.join('\n') + lines.join('\n');
  } else {
    fullText = lines.join('\n');
  }

  const totalDigits = targetWidth * targetHeight;
  const endTime = performance.now();
  const fileSizeBytes = new Blob([fullText]).size;

  const stats: DitherStats = {
    width: targetWidth,
    height: targetHeight,
    totalDigits,
    zeroCount: count0,
    oneCount: count1,
    zeroPercentage: totalDigits > 0 ? (count0 / totalDigits) * 100 : 0,
    onePercentage: totalDigits > 0 ? (count1 / totalDigits) * 100 : 0,
    fileSizeBytes,
    renderTimeMs: Math.round(endTime - startTime),
  };

  return {
    digitLines: lines,
    fullText,
    binaryGrid,
    targetWidth,
    targetHeight,
    stats,
  };
}
