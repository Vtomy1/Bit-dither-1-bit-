export interface SampleItem {
  id: string;
  name: string;
  category: string;
  generate: () => string; // returns data URL
}

/**
 * Creates high-contrast graphical canvas data URLs for instant demonstration
 */
export const SAMPLE_IMAGES: SampleItem[] = [
  {
    id: 'classical_bust',
    name: 'Apollo Bust',
    category: 'Sculpture',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      // Background gradient
      const bgGrad = ctx.createRadialGradient(200, 200, 50, 200, 200, 250);
      bgGrad.addColorStop(0, '#333333');
      bgGrad.addColorStop(1, '#050505');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 400, 400);

      // Classical bust silhouette & shading
      // Pedestal
      ctx.fillStyle = '#666';
      ctx.fillRect(150, 340, 100, 20);
      ctx.fillStyle = '#888';
      ctx.fillRect(160, 320, 80, 20);

      // Shoulders / Torso
      ctx.beginPath();
      ctx.moveTo(110, 320);
      ctx.bezierCurveTo(120, 260, 170, 250, 200, 250);
      ctx.bezierCurveTo(230, 250, 280, 260, 290, 320);
      ctx.closePath();
      const torsoGrad = ctx.createLinearGradient(110, 250, 290, 320);
      torsoGrad.addColorStop(0, '#f5f5f5');
      torsoGrad.addColorStop(0.5, '#cccccc');
      torsoGrad.addColorStop(1, '#444444');
      ctx.fillStyle = torsoGrad;
      ctx.fill();

      // Neck
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(185, 200, 30, 60);

      // Head
      ctx.beginPath();
      ctx.ellipse(200, 150, 45, 60, 0, 0, Math.PI * 2);
      const headGrad = ctx.createRadialGradient(180, 130, 10, 200, 150, 60);
      headGrad.addColorStop(0, '#ffffff');
      headGrad.addColorStop(0.6, '#b0b0b0');
      headGrad.addColorStop(1, '#202020');
      ctx.fillStyle = headGrad;
      ctx.fill();

      // Hair curls
      ctx.fillStyle = '#999999';
      for (let i = 0; i < 9; i++) {
        const angle = Math.PI + (i * Math.PI) / 8;
        const x = 200 + Math.cos(angle) * 48;
        const y = 140 + Math.sin(angle) * 55;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Facial features (nose bridge, eye sockets)
      ctx.fillStyle = '#555';
      ctx.beginPath();
      ctx.arc(190, 145, 5, 0, Math.PI * 2);
      ctx.arc(215, 145, 5, 0, Math.PI * 2);
      ctx.fill();

      // Nose shadow
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.moveTo(200, 145);
      ctx.lineTo(206, 170);
      ctx.lineTo(198, 172);
      ctx.closePath();
      ctx.fill();

      // Lips
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(193, 185);
      ctx.quadraticCurveTo(200, 188, 208, 185);
      ctx.stroke();

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'cyber_skull',
    name: 'Cybernetic Skull',
    category: 'High Contrast',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      // Deep dark background
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, 400, 400);

      // Grid background lines
      ctx.strokeStyle = '#181818';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 400; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 400);
        ctx.stroke();
      }
      for (let y = 0; y <= 400; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(400, y);
        ctx.stroke();
      }

      // Skull Cranium
      const skullGrad = ctx.createRadialGradient(200, 170, 20, 200, 180, 130);
      skullGrad.addColorStop(0, '#ffffff');
      skullGrad.addColorStop(0.7, '#888888');
      skullGrad.addColorStop(1, '#111111');

      ctx.fillStyle = skullGrad;
      ctx.beginPath();
      ctx.ellipse(200, 170, 85, 95, 0, 0, Math.PI * 2);
      ctx.fill();

      // Jaw
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.moveTo(150, 220);
      ctx.lineTo(160, 290);
      ctx.lineTo(240, 290);
      ctx.lineTo(250, 220);
      ctx.closePath();
      ctx.fill();

      // Eye Sockets (deep black)
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.ellipse(165, 175, 22, 28, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(235, 175, 22, 28, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Cyber eye lens in right socket
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(235, 175, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(235, 175, 4, 0, Math.PI * 2);
      ctx.fill();

      // Nasal cavity (triangle)
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.moveTo(200, 205);
      ctx.lineTo(190, 235);
      ctx.lineTo(210, 235);
      ctx.closePath();
      ctx.fill();

      // Teeth
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 6; i++) {
        const tx = 165 + i * 12;
        ctx.fillRect(tx, 255, 9, 14);
        ctx.fillRect(tx, 273, 9, 13);
      }

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'retro_macintosh',
    name: 'Retro 1984 Computer',
    category: 'Hardware',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#121212';
      ctx.fillRect(0, 0, 400, 400);

      // Computer casing
      const caseGrad = ctx.createLinearGradient(100, 80, 300, 340);
      caseGrad.addColorStop(0, '#e5e5e0');
      caseGrad.addColorStop(0.8, '#a8a8a0');
      caseGrad.addColorStop(1, '#505048');

      ctx.fillStyle = caseGrad;
      ctx.beginPath();
      ctx.roundRect(110, 80, 180, 220, 16);
      ctx.fill();

      // Front Bezel bevel
      ctx.fillStyle = '#60605a';
      ctx.beginPath();
      ctx.roundRect(125, 100, 150, 120, 8);
      ctx.fill();

      // CRT Screen (bright glowing 1-bit screen)
      const crtGrad = ctx.createRadialGradient(200, 160, 20, 200, 160, 80);
      crtGrad.addColorStop(0, '#ffffff');
      crtGrad.addColorStop(0.7, '#c8d8c8');
      crtGrad.addColorStop(1, '#405040');
      ctx.fillStyle = crtGrad;
      ctx.beginPath();
      ctx.roundRect(130, 105, 140, 110, 6);
      ctx.fill();

      // Happy Mac icon inside screen
      ctx.fillStyle = '#111111';
      ctx.fillRect(180, 135, 40, 50);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(183, 138, 34, 44);
      ctx.fillStyle = '#111111';
      // eyes
      ctx.fillRect(190, 148, 4, 6);
      ctx.fillRect(206, 148, 4, 6);
      // smile
      ctx.fillRect(192, 166, 16, 4);

      // Floppy drive slot
      ctx.fillStyle = '#222220';
      ctx.fillRect(150, 245, 100, 8);

      // Apple logo rainbow badge notch
      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(135, 275, 7, 0, Math.PI * 2);
      ctx.fill();

      // Keyboard in front
      ctx.fillStyle = '#808078';
      ctx.beginPath();
      ctx.moveTo(90, 315);
      ctx.lineTo(310, 315);
      ctx.lineTo(330, 360);
      ctx.lineTo(70, 360);
      ctx.closePath();
      ctx.fill();

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'geometric_mandala',
    name: 'Geometric Vortex',
    category: 'Abstract',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 400, 400);

      const cx = 200;
      const cy = 200;

      // Concentric hypnotic interference rings
      for (let r = 180; r > 10; r -= 14) {
        const isWhite = Math.floor(r / 14) % 2 === 0;
        ctx.fillStyle = isWhite ? '#ffffff' : '#000000';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Spiral overlay
      ctx.strokeStyle = '#888888';
      ctx.lineWidth = 4;
      for (let a = 0; a < 16; a++) {
        const baseAngle = (a * Math.PI) / 8;
        ctx.beginPath();
        for (let rad = 10; rad < 180; rad += 5) {
          const theta = baseAngle + rad * 0.05;
          const x = cx + Math.cos(theta) * rad;
          const y = cy + Math.sin(theta) * rad;
          if (rad === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      return canvas.toDataURL('image/png');
    },
  },
  {
    id: 'mountain_moon',
    name: 'Full Moon & Peaks',
    category: 'Landscape',
    generate: () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d')!;

      // Night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
      skyGrad.addColorStop(0, '#0a0a14');
      skyGrad.addColorStop(0.6, '#202035');
      skyGrad.addColorStop(1, '#050508');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, 400, 400);

      // Glowing Giant Moon
      const moonGrad = ctx.createRadialGradient(260, 130, 20, 260, 130, 70);
      moonGrad.addColorStop(0, '#ffffff');
      moonGrad.addColorStop(0.7, '#e0e0e0');
      moonGrad.addColorStop(1, '#777777');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(260, 130, 65, 0, Math.PI * 2);
      ctx.fill();

      // Distant mountain ridge
      ctx.fillStyle = '#404050';
      ctx.beginPath();
      ctx.moveTo(0, 260);
      ctx.lineTo(80, 200);
      ctx.lineTo(160, 270);
      ctx.lineTo(240, 180);
      ctx.lineTo(340, 250);
      ctx.lineTo(400, 220);
      ctx.lineTo(400, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      // Foreground jagged mountain ridge (dark silhouette)
      ctx.fillStyle = '#101018';
      ctx.beginPath();
      ctx.moveTo(0, 310);
      ctx.lineTo(70, 230);
      ctx.lineTo(140, 320);
      ctx.lineTo(220, 240);
      ctx.lineTo(310, 340);
      ctx.lineTo(400, 270);
      ctx.lineTo(400, 400);
      ctx.lineTo(0, 400);
      ctx.closePath();
      ctx.fill();

      // Pine trees along ridge
      ctx.fillStyle = '#050508';
      for (let x = 10; x < 390; x += 18) {
        const ty = 340 + Math.sin(x * 0.1) * 20;
        ctx.beginPath();
        ctx.moveTo(x, ty - 30);
        ctx.lineTo(x - 7, ty);
        ctx.lineTo(x + 7, ty);
        ctx.closePath();
        ctx.fill();
      }

      return canvas.toDataURL('image/png');
    },
  },
];

export const DIGIT_PRESETS = [
  {
    id: 'binary-01',
    name: 'Binary (0 / 1)',
    zeroChar: '0',
    oneChar: '1',
    description: '0 = Dark, 1 = Light',
  },
  {
    id: 'binary-10',
    name: 'Inverted (1 / 0)',
    zeroChar: '1',
    oneChar: '0',
    description: '1 = Dark (ink), 0 = Light (empty)',
  },
  {
    id: 'binary-dot-hash',
    name: 'Dot & Hash (. / #)',
    zeroChar: '.',
    oneChar: '#',
    description: 'Classic ASCII grid',
  },
  {
    id: 'blocks',
    name: 'Space & Block (  / █)',
    zeroChar: ' ',
    oneChar: '█',
    description: 'High density block matrix',
  },
  {
    id: 'shaded',
    name: 'Shaded (░ / ▓)',
    zeroChar: '░',
    oneChar: '▓',
    description: 'Textured unicode blocks',
  },
  {
    id: 'dots',
    name: 'Braille / Micro (· / •)',
    zeroChar: '·',
    oneChar: '•',
    description: 'Minimalist point matrix',
  },
  {
    id: 'hex',
    name: 'Hex (0 / F)',
    zeroChar: '0',
    oneChar: 'F',
    description: 'Hexadecimal boundary',
  },
];
