import * as THREE from 'three';
import {C} from '../theme';

// Procedural, flat, on-palette textures drawn with Canvas2D.
// Treated as raw colour (NoColorSpace) and written straight to the
// framebuffer by the card shader, so every pixel is an exact palette value.

const make = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d')!;
  draw(g);
  // Explicit mip chain (2× box downsamples). SwiftShader's generateMipmap left the
  // levels uninitialised, which read as grain on every minified or tilted card.
  const levels: HTMLCanvasElement[] = [cv];
  let lw = w;
  let lh = h;
  while (lw > 1 || lh > 1) {
    lw = Math.max(1, lw >> 1);
    lh = Math.max(1, lh >> 1);
    const c = document.createElement('canvas');
    c.width = lw;
    c.height = lh;
    const cg = c.getContext('2d')!;
    cg.imageSmoothingEnabled = true;
    cg.imageSmoothingQuality = 'high';
    cg.drawImage(levels[levels.length - 1], 0, 0, lw, lh);
    levels.push(c);
  }
  const tex = new THREE.Texture(cv);
  tex.mipmaps = levels;
  tex.colorSpace = THREE.NoColorSpace;
  tex.anisotropy = 1;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
};

// Seeded PRNG so every render is identical.
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const drawCV = (g: CanvasRenderingContext2D, ox: number, oy: number, variant: number) => {
  const r = rng(1000 + variant * 17);
  const W = 300;
  const H = 424;
  g.save();
  g.translate(ox, oy);
  g.fillStyle = C.white;
  g.beginPath();
  g.roundRect(0, 0, W, H, 16);
  g.fill();
  g.strokeStyle = C.greyBlock;
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(1.5, 1.5, W - 3, H - 3, 15);
  g.stroke();
  // monogram block + name + role
  g.fillStyle = [C.lime, C.lilac, C.yellow, C.greyBg][variant % 4];
  g.fillRect(24, 26, 44, 44);
  g.fillStyle = C.black;
  g.fillRect(80, 30, 100 + r() * 80, 13);
  g.fillStyle = C.greyBlock;
  g.fillRect(80, 54, 60 + r() * 60, 9);
  g.fillStyle = C.greyBlock;
  g.fillRect(24, 88, 252, 2);
  let y = 108;
  for (let s = 0; s < 4 && y < 390; s++) {
    g.fillStyle = C.mutedDark;
    g.fillRect(24, y, 56 + r() * 44, 8);
    y += 20;
    const lines = 2 + Math.floor(r() * 3);
    for (let l = 0; l < lines && y < 396; l++) {
      g.fillStyle = C.greyBg;
      g.fillRect(24, y, 252 * (l === lines - 1 ? 0.3 + r() * 0.4 : 0.78 + r() * 0.22), 7);
      y += 15;
    }
    y += 12;
  }
  g.restore();
};

/** 8 CV page variants in a power-of-two 4×2 atlas (512² cells, card drawn 362×512 at the cell's left).
 *  POT keeps SwiftShader's mip chain valid; NPOT mips came out as grain. */
export const ATLAS = {w: 2048, h: 1024, cell: 512, cardW: 362} as const;
export const cvAtlas = () =>
  make(ATLAS.w, ATLAS.h, (g) => {
    for (let v = 0; v < 8; v++) {
      g.save();
      g.translate((v % 4) * ATLAS.cell, Math.floor(v / 4) * ATLAS.cell);
      g.scale(ATLAS.cardW / 300, ATLAS.cell / 424);
      drawCV(g, 0, 0, v);
      g.restore();
    }
  });

// Row geometry shared by the 3D rows and the DOM rows in S4 (screen px).
export const ROW = {x: 988, w: 736, h: 84, top: 316, pitch: 94, r: 16} as const;

// Skeleton row (the kit's Skeleton: circle + lines). Drawn at 2×.
// Layout mirrors components/Applicants.tsx so the 3D→DOM handoff is invisible.
export const SKELETON = {
  avatar: {cx: 46, cy: 42, r: 24},
  name: {x: 88, y: 28, w: 190, h: 13},
  sub: {x: 88, y: 50, w: 110, h: 9},
  badge: {x: 392, y: 27, w: 104, h: 30},
  fit: {x: 548, y: 34, w: 58, h: 15},
  score: {x: 646, y: 29, w: 66, h: 26},
} as const;

export const rowTexture = () =>
  make(2048, 256, (g) => {
    g.scale(2048 / ROW.w, 256 / ROW.h);
    g.fillStyle = C.white;
    g.beginPath();
    g.roundRect(0, 0, ROW.w, ROW.h, ROW.r);
    g.fill();
    g.fillStyle = C.greyBg;
    const S = SKELETON;
    g.beginPath();
    g.arc(S.avatar.cx, S.avatar.cy, S.avatar.r, 0, Math.PI * 2);
    g.fill();
    for (const k of ['name', 'sub', 'fit', 'score'] as const) {
      const b = S[k];
      g.beginPath();
      g.roundRect(b.x, b.y, b.w, b.h, b.h / 2);
      g.fill();
    }
    g.beginPath();
    g.roundRect(S.badge.x, S.badge.y, S.badge.w, S.badge.h, 15);
    g.fill();
  });
