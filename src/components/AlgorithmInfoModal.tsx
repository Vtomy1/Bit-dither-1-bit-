import React from 'react';
import { X, BookOpen, CheckCircle2 } from 'lucide-react';

interface AlgorithmInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlgorithmInfoModal: React.FC<AlgorithmInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 text-neutral-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Guide to 1-Bit Dithering & Digits Conversion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-5 text-xs leading-relaxed text-neutral-300">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">
              What is 1-Bit Dithering?
            </h3>
            <p>
              1-Bit dithering is the process of converting continuous-tone grayscale images into strictly two states (0 or 1, black or white) while creating the illusion of intermediate shades through spatial frequency distribution.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Dithering Algorithms Compared
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-lg">
                <strong className="text-emerald-400 block mb-1">
                  Floyd-Steinberg (1976)
                </strong>
                <p className="text-neutral-400">
                  Diffuses 100% of quantization error to 4 neighboring pixels (7/16 right, 3/16 down-left, 5/16 down, 1/16 down-right). Yields smooth tonal gradations.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-lg">
                <strong className="text-emerald-400 block mb-1">
                  Atkinson Dithering (1984)
                </strong>
                <p className="text-neutral-400">
                  Developed by Bill Atkinson for the original Apple Macintosh & MacPaint. It diffuses only 3/4 (75%) of the error, intentionally discarding 25%. This prevents muddy dark areas and gives iconic high-contrast, razor-sharp 1-bit art.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-lg">
                <strong className="text-emerald-400 block mb-1">
                  Bayer Ordered Matrices (2×2, 4×4, 8×8)
                </strong>
                <p className="text-neutral-400">
                  Deterministic spatial cross-hatch pattern thresholding without error diffusion. Extremely fast, stable, and reminiscent of Game Boy and early LCD screens.
                </p>
              </div>

              <div className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-lg">
                <strong className="text-emerald-400 block mb-1">
                  Stucki & Burkes
                </strong>
                <p className="text-neutral-400">
                  Multi-row error diffusion algorithms that distribute error across 12 or 7 neighbors, minimizing directional streak artifacts.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">
              Why Character Aspect Ratio (0.50×) Matters
            </h3>
            <p>
              In standard monospace fonts, characters are approximately twice as tall as they are wide (a 1:2 width-to-height ratio). If an image is converted with square pixel dimensions (e.g. 100×100), it will appear 2× vertically stretched when opened in a text editor like VS Code or Notepad.
            </p>
            <p className="text-neutral-400">
              By setting the aspect ratio compensation to <strong className="text-neutral-200">0.50</strong>, BitDigit scales down the vertical row count so the generated <code className="text-emerald-400">.txt</code> file appears visually proportioned in any text editor.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-white">
              Using Your Downloaded .TXT File
            </h3>
            <ul className="space-y-1.5 text-neutral-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Terminal display:</strong> Run <code className="text-neutral-200">cat filename.txt</code> in any terminal for instant ASCII/binary art.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Data matrix / Game dev:</strong> Parse rows of 0 and 1 into 2D game levels, tilemaps, or bitboards.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Microcontrollers & Hardware:</strong> Directly stream raw binary bytes into Arduino, ESP32, e-paper screens, or OLED displays.
                </span>
              </li>
            </ul>
          </section>
        </div>

        <div className="pt-6 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
