import React, { useRef } from 'react';
import { SAMPLE_IMAGES, SampleItem } from '../utils/sampleImages';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface SamplePickerProps {
  currentSampleId: string | null;
  onSelectSample: (sample: SampleItem) => void;
  onFileUpload: (file: File) => void;
  imageInfo: { name: string; width: number; height: number } | null;
}

export const SamplePicker: React.FC<SamplePickerProps> = ({
  currentSampleId,
  onSelectSample,
  onFileUpload,
  imageInfo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Upload Zone & Status */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex items-center gap-3.5 flex-1 min-w-0"
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-100 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>Upload Image</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 truncate">
            <ImageIcon className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
            <span className="text-xs font-medium text-neutral-200 truncate">
              {imageInfo ? imageInfo.name : 'No image loaded'}
            </span>
            {imageInfo && (
              <span className="text-[11px] text-neutral-500 font-mono tabular-nums shrink-0">
                ({imageInfo.width}×{imageInfo.height}px)
              </span>
            )}
          </div>
          <span className="text-[11px] text-neutral-500 truncate">
            Drag & drop an image or paste from clipboard (Ctrl+V)
          </span>
        </div>
      </div>

      {/* Preset Demo Images */}
      <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0">
        <span className="text-xs font-medium text-neutral-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-neutral-400" />
          Presets:
        </span>
        <div className="flex items-center gap-1.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currentSampleId === sample.id
                  ? 'bg-neutral-800 text-emerald-400 border border-emerald-500/40 font-medium'
                  : 'bg-neutral-950/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
