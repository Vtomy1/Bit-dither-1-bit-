import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DitherSettings } from './types/dither';
import { SAMPLE_IMAGES, SampleItem } from './utils/sampleImages';
import { processImageToDigits, ProcessResult } from './utils/dithering';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { SamplePicker } from './components/SamplePicker';
import { Controls } from './components/Controls';
import { PreviewArea } from './components/PreviewArea';
import { AlgorithmInfoModal } from './components/AlgorithmInfoModal';

const DEFAULT_SETTINGS: DitherSettings = {
  algorithm: 'atkinson',
  width: 90,
  maintainAspectRatio: true,
  charAspectRatio: 0.5,
  contrast: 15,
  brightness: 0,
  gamma: 1.0,
  invert: false,
  zeroChar: '0',
  oneChar: '1',
  spaceSeparated: false,
  serpentine: true,
  ditherStrength: 100,
  includeHeaderComment: true,
};

export default function App() {
  const [settings, setSettings] = useState<DitherSettings>(DEFAULT_SETTINGS);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentImageName, setCurrentImageName] = useState<string>('apollo_bust.png');
  const [currentSampleId, setCurrentSampleId] = useState<string | null>('classical_bust');
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);

  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);

  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Initialize with the first sample image on mount
  useEffect(() => {
    const initialSample = SAMPLE_IMAGES[0];
    loadSample(initialSample);
  }, []);

  // Listen for global paste events (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileUpload(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Load a sample image
  const loadSample = (sample: SampleItem) => {
    const dataUrl = sample.generate();
    setCurrentSampleId(sample.id);
    setCurrentImageName(`${sample.id}.png`);
    setCurrentImageSrc(dataUrl);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageElementRef.current = img;
      setImageMeta({ width: img.naturalWidth, height: img.naturalHeight });
      recomputeDithering(img, settings, `${sample.id}.png`);
    };
    img.src = dataUrl;
  };

  // Handle uploaded file
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;

      setCurrentSampleId(null);
      setCurrentImageName(file.name);
      setCurrentImageSrc(dataUrl);

      const img = new Image();
      img.onload = () => {
        imageElementRef.current = img;
        setImageMeta({ width: img.naturalWidth, height: img.naturalHeight });
        recomputeDithering(img, settings, file.name);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Recompute dithering output
  const recomputeDithering = useCallback(
    (img: HTMLImageElement, currentSettings: DitherSettings, fileName: string) => {
      try {
        const res = processImageToDigits(img, currentSettings, fileName);
        setResult(res);
      } catch (err) {
        console.error('Error in dithering:', err);
      }
    },
    []
  );

  // Trigger recalculation when settings change
  useEffect(() => {
    if (imageElementRef.current) {
      recomputeDithering(imageElementRef.current, settings, currentImageName);
    }
  }, [settings, currentImageName, recomputeDithering]);

  // Reset adjustments
  const handleResetAdjustments = () => {
    setSettings((prev) => ({
      ...prev,
      contrast: 0,
      brightness: 0,
      gamma: 1.0,
      ditherStrength: 100,
    }));
  };

  // Download .TXT file
  const handleDownloadTxt = () => {
    if (!result) return;
    const blob = new Blob([result.fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate descriptive filename: original_name_wXh_algo.txt
    const baseName = currentImageName.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}_${result.targetWidth}x${result.targetHeight}_${settings.algorithm}.txt`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy full text to clipboard
  const handleCopyText = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.fullText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* 1. Header (Top Bar Contract: wordmark, single-line links, primary action) */}
      <Header
        onDownloadTxt={handleDownloadTxt}
        onCopyText={handleCopyText}
        isCopied={isCopied}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        statsText={
          result
            ? `${result.targetWidth}×${result.targetHeight} Digits · ${settings.algorithm}`
            : '1-Bit Dither'
        }
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4">
        {/* Sample Picker & Drag-and-Drop Bar */}
        <SamplePicker
          currentSampleId={currentSampleId}
          onSelectSample={loadSample}
          onFileUpload={handleFileUpload}
          imageInfo={
            imageMeta
              ? {
                  name: currentImageName,
                  width: imageMeta.width,
                  height: imageMeta.height,
                }
              : null
          }
        />

        {/* Tabular Numerals Stats Strip */}
        {result && (
          <StatsBar
            stats={result.stats}
            zeroChar={settings.zeroChar}
            oneChar={settings.oneChar}
          />
        )}

        {/* Main Content Layout: Sidebar Controls + Interactive Live Preview */}
        <div className="flex flex-col lg:flex-row items-start gap-5 flex-1">
          {/* Left / Top Controls Sidebar */}
          <Controls
            settings={settings}
            onChange={setSettings}
            onReset={handleResetAdjustments}
          />

          {/* Right Live Preview Area */}
          <PreviewArea
            result={result}
            originalImageSrc={currentImageSrc}
            onDownloadTxt={handleDownloadTxt}
            onCopyText={handleCopyText}
            isCopied={isCopied}
          />
        </div>
      </main>

      {/* Educational / Mathematical Dither Explainer Modal */}
      <AlgorithmInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
