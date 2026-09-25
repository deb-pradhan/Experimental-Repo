import * as THREE from 'three';
import {EASE} from '../theme';
import {EV} from '../timeline';
import {clamp01, lerp, ramp} from '../anim';
import {ROW, rng} from './textures';

// ============================================================
// Pure, deterministic model of the 3D act (S1–S3).
// World units are pixel-matched: with the camera at (0,0,DIST)
// looking down -Z, 1 unit at z=0 == 1 screen px. Z is "height
// above the desk": cards fall towards -Z, the pile grows towards +Z.
// ============================================================

export const N = 312;
export const FOV = 30;
export const DIST = 540 / Math.tan((FOV / 2) * (Math.PI / 180)); // 2015.3
export const CARD = {w: 150, h: 212};

const toWorld = (sx: number, sy: number) => [sx - 960, 540 - sy] as const;

export type CardSeed = {
  tLand: number;
  x0: number; y0: number; z0: number;
  xr: number; yr: number; zr: number;
  r0: [number, number, number];
  yaw: number;
  tilt: [number, number];
  variant: number;
  survivor: boolean;
  fallDelay: number;
  spin: [number, number, number];
  row: number; // list slot (0..7 visible rows, ≥8 off-frame)
  tList: number;
};

const FALL = 44;

export const CARDS: CardSeed[] = (() => {
  const r = rng(42);
  const gauss = () => {
    const u = Math.max(1e-6, r());
    const v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const out: CardSeed[] = [];
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const sx = Math.min(2100, Math.max(880, 1340 + gauss() * 380));
    const sy = Math.min(1230, Math.max(690, 925 + gauss() * 115));
    const [xr, yr] = toWorld(sx, sy);
    const yaw = (r() - 0.5) * 1.2;
    out.push({
      tLand: EV.landFirst + (EV.landLast - EV.landFirst) * Math.pow(u, 0.55),
      x0: xr + r() * 520,
      y0: yr + 140 + r() * 460,
      z0: 320 + r() * 620,
      xr,
      yr,
      zr: 2 + i * 1.1,
      r0: [(r() - 0.5) * 5, (r() - 0.5) * 5, yaw + (r() - 0.5) * 4],
      yaw,
      tilt: [0, 0], // resting cards lie flat: parallel planes never interpenetrate
      variant: Math.floor(r() * 8),
      survivor: r() < 0.085,
      fallDelay: r() * 20,
      spin: [(r() - 0.5) * 7, (r() - 0.5) * 7, (r() - 0.5) * 4],
      row: -1,
      tList: 0,
    });
  }
  // The eight visible list rows come from the top of the pile (last to land).
  const visible = [N - 3, N - 11, N - 6, N - 1, N - 14, N - 8, N - 2, N - 5];
  visible.forEach((ci, k) => {
    out[ci].row = k;
    out[ci].tList = EV.s3ListStart + 22 + k * 6;
  });
  // Everything else streams out below the frame first, top of screen last.
  let j = 8;
  out
    .map((c, i) => ({c, i}))
    .filter(({c}) => c.row < 0)
    .sort((a, b) => a.c.yr - b.c.yr)
    .forEach(({c}, n) => {
      c.row = j++;
      c.tList = EV.s3ListStart + (n / (N - 8)) * 34;
    });
  return out;
})();

/** Number of cards that have landed by frame f (drives the "312" counter). */
export const landedCount = (f: number) => CARDS.reduce((n, c) => n + (c.tLand <= f ? 1 : 0), 0);

// ---------- camera ----------
type CamKey = {f: number; pos: [number, number, number]; look: [number, number, number]; roll: number};
const CAM: CamKey[] = [
  {f: 0, pos: [-120, -430, 1560], look: [120, -150, 0], roll: -0.07},
  {f: 240, pos: [-60, -230, 1760], look: [60, -70, 0], roll: -0.035},
  {f: 480, pos: [-20, -90, 1900], look: [20, -25, 0], roll: -0.01},
  {f: 690, pos: [0, 0, DIST], look: [0, 0, 0], roll: 0},
];

export const camState = (f: number) => {
  let a = CAM[0];
  let b = CAM[CAM.length - 1];
  for (let i = 0; i < CAM.length - 1; i++) {
    if (f >= CAM[i].f && f <= CAM[i + 1].f) {
      a = CAM[i];
      b = CAM[i + 1];
    }
  }
  if (f >= CAM[CAM.length - 1].f) a = b;
  const span = Math.max(1, b.f - a.f);
  const t = a === b ? 1 : EASE.inOut(clamp01((f - a.f) / span));
  const m = (u: number[], v: number[]) => u.map((x, i) => lerp(x, v[i], t)) as [number, number, number];
  return {pos: m(a.pos, b.pos), look: m(a.look, b.look), roll: lerp(a.roll, b.roll, t)};
};

export const applyCam = (cam: THREE.PerspectiveCamera, f: number) => {
  const s = camState(f);
  cam.fov = FOV;
  cam.near = 150;
  cam.far = 40000;
  cam.aspect = 16 / 9;
  cam.position.set(...s.pos);
  cam.up.set(Math.sin(s.roll), Math.cos(s.roll), 0);
  cam.lookAt(...s.look);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const scratchCam = new THREE.PerspectiveCamera(FOV, 16 / 9, 150, 40000);
/** World → screen px for DOM overlays that must stick to 3D objects. */
export const project = (f: number, x: number, y: number, z: number) => {
  applyCam(scratchCam, f);
  const v = new THREE.Vector3(x, y, z).project(scratchCam);
  return {x: (v.x + 1) * 960, y: (1 - v.y) * 540, visible: v.z < 1};
};

// ---------- keyword filter scan ----------
export const SCAN_Z = 240;
export const scanY = (f: number) => lerp(760, -980, ramp(f, EV.scanStart, EV.scanEnd - EV.scanStart, EASE.inOut));
const tFlag = (c: CardSeed) => {
  // frame at which the scan line passes this card's top edge
  const top = c.yr + CARD.h / 2;
  let lo: number = EV.scanStart;
  let hi: number = EV.scanEnd;
  for (let k = 0; k < 18; k++) {
    const mid = (lo + hi) / 2;
    if (scanY(mid) > top) lo = mid;
    else hi = mid;
  }
  return hi;
};
export const FLAG = CARDS.map(tFlag);

// ---------- the house mark (official primary symbol) ----------
// It drops onto the pile, lies flat on it (resting on the cards beneath, which
// yield on impact), then lifts off and flies into the product window's title bar.
export const MARK = {
  start: EV.s3TieStart,
  land: EV.s3TieLand,
  lift: EV.s3ListStart - 4,
  dock: 700,
  scale: 2.6, // 100-unit viewBox → 260 world units (house ≈ 224)
  x: 330,
  y: -235,
  // docked as the app icon in the window chrome: 40 px at the pixel-matched plane
  dockAt: [52, 344, 0] as [number, number, number],
  dockScale: 0.4,
};
// Rest on top of whatever the pile holds under the mark's footprint.
export const MARK_Z = (() => {
  const r = 0.43 * 100 * MARK.scale; // house half-width in world units
  let top = 0;
  CARDS.forEach((c) => {
    if (Math.abs(c.xr - MARK.x) < r + CARD.w / 2 && Math.abs(c.yr - MARK.y) < r + CARD.h / 2) top = Math.max(top, c.zr);
  });
  return top + 14;
})();

export const markState = (f: number) => {
  const p = ramp(f, MARK.start, MARK.land - MARK.start, EASE.in);
  const bounce = f >= MARK.land ? Math.sin(ramp(f, MARK.land, 16, EASE.out) * Math.PI) * -10 : 0;
  let x = lerp(MARK.x - 260, MARK.x, EASE.out(p));
  let y = lerp(MARK.y + 420, MARK.y, EASE.out(p));
  let z = lerp(1750, MARK_Z, p) + bounce;
  let rx = lerp(0.95, 0, EASE.out(p));
  let ry = 0;
  let rz = lerp(-0.55, -0.07, EASE.out(p));
  let s = MARK.scale;
  // lift off, then fly (with one full turn) into the title bar
  const up = ramp(f, MARK.lift, 26, EASE.out);
  z += up * 260;
  const fly = ramp(f, MARK.lift + 22, MARK.dock - MARK.lift - 22, EASE.inOut);
  if (fly > 0) {
    x = lerp(x, MARK.dockAt[0], fly);
    y = lerp(y, MARK.dockAt[1], fly);
    z = lerp(z, MARK.dockAt[2], fly);
    rz = lerp(rz, 0, fly);
    ry = fly * Math.PI * 2;
    s = lerp(MARK.scale, MARK.dockScale, EASE.inOut(fly));
  }
  return {x, y, z, rx, ry, rz, s, visible: f >= MARK.start - 1};
};

/** Screen position of the mark's centre at landing (origin of the read pulse). */
export const markCenterScreen = () => project(MARK.land + 2, MARK.x, MARK.y, MARK_Z);

// ---------- per-card state ----------
export const GREY = 207 / 255;
export type CardFrame = {
  x: number; y: number; z: number;
  rx: number; ry: number; rz: number;
  sx: number; sy: number;
  shade: number; // 1 = white, GREY = flagged
  morph: number; // 0 = CV page, 1 = list row
  visible: boolean;
};

const ROW_W = ROW.w;
const ROW_H = ROW.h;
const rowWorld = (k: number) => {
  const sy = k < 8 ? ROW.top + k * ROW.pitch + ROW_H / 2 : 1240 + (k % 12) * 40;
  return toWorld(ROW.x + ROW_W / 2, sy);
};

export const cardAt = (c: CardSeed, i: number, f: number): CardFrame => {
  // ---- S1: fall onto the pile
  const pf = ramp(f, c.tLand - FALL, FALL, (t) => t);
  if (pf <= 0) return {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, sx: 0, sy: 0, shade: 1, morph: 0, visible: false};
  const eo = EASE.out(pf);
  const zf = Math.pow(pf, 1.7);
  let x = lerp(c.x0, c.xr, eo);
  let y = lerp(c.y0, c.yr, eo);
  let z = lerp(c.z0, c.zr, zf);
  let rx = lerp(c.r0[0], c.tilt[0], eo);
  let ry = lerp(c.r0[1], c.tilt[1], eo);
  let rz = lerp(c.r0[2], c.yaw, eo);
  let shade = 1;

  // ---- S2: keyword filter
  const flag = FLAG[i];
  if (f >= flag) {
    if (c.survivor) {
      z += 70 * ramp(f, flag, 24, EASE.out);
    } else {
      shade = GREY;
      const tf = flag + 8 + c.fallDelay;
      const q = ramp(f, tf, 64, (t) => t * t * t);
      // ---- S3: every application comes back, read
      const dx = c.xr - MARK.x;
      const dy = c.yr - MARK.y;
      const tRet = EV.s3ReadWave + Math.sqrt(dx * dx + dy * dy) / 42;
      const back = ramp(f, tRet, 40, EASE.out);
      const down = q * (1 - back);
      z = lerp(z, -5200, down);
      y = lerp(y, y - 1700, down);
      x = lerp(x, x + (c.xr - 200) * 0.6, down);
      rx += c.spin[0] * down;
      ry += c.spin[1] * down;
      rz += c.spin[2] * down;
      if (back > 0.02) shade = 1;
    }
  }

  // ---- S3: the mark lands on the pile — cards under and around it yield
  if (f >= MARK.land && f < MARK.land + 30) {
    const dx = c.xr - MARK.x;
    const dy = c.yr - MARK.y;
    const d = Math.hypot(dx, dy);
    const fall = Math.max(0, 1 - d / 420);
    const k = Math.sin(ramp(f, MARK.land, 26, EASE.out) * Math.PI) * fall;
    x += (dx / (d || 1)) * 26 * k;
    y += (dy / (d || 1)) * 26 * k;
    z -= 18 * k;
  }

  // ---- S3: pile becomes a list (flip-board morph at the edge-on moment)
  const l = ramp(f, c.tList, c.row < 8 ? 52 : 40, EASE.inOut);
  let morph = 0;
  let sx: number = CARD.w;
  let sy: number = CARD.h;
  if (l > 0) {
    const [tx, ty] = rowWorld(c.row);
    x = lerp(x, tx, l);
    y = lerp(y, ty, l);
    z = lerp(z, c.row < 8 ? 0 : 20, l) + Math.sin(l * Math.PI) * 140;
    rx = lerp(rx, 0, l);
    ry = lerp(ry, 0, l);
    rz = lerp(rz, 0, l);
    morph = l;
    rx += morph < 0.5 ? morph * Math.PI : (morph - 1) * Math.PI;
    if (morph >= 0.5) {
      sx = ROW_W;
      sy = ROW_H;
    }
  }
  return {x, y, z, rx, ry, rz, sx, sy, shade, morph: morph >= 0.5 ? 1 : 0, visible: z > -4600};
};

// ---------- house mark geometry (official path: outer house + knot/blade holes) ----------
/** Parses the mark's SVG path (M/L/Q/Z) into a Shape with the tie as holes, centred on (50,50), y up. */
export const houseShape = (d: string) => {
  const subs = d.trim().split(/(?=M)/);
  const toPath = (sub: string, path: THREE.Path) => {
    const tok = sub.match(/[MLQZ]|-?\d+(?:\.\d+)?/g)!;
    const P = (i: number) => [Number(tok[i]) - 50, 50 - Number(tok[i + 1])] as const;
    for (let i = 0; i < tok.length; ) {
      const c = tok[i];
      if (c === 'M') { path.moveTo(...P(i + 1)); i += 3; }
      else if (c === 'L') { path.lineTo(...P(i + 1)); i += 3; }
      else if (c === 'Q') { const [cx, cy] = P(i + 1); const [x, y] = P(i + 3); path.quadraticCurveTo(cx, cy, x, y); i += 5; }
      else if (c === 'Z') { path.closePath(); i += 1; }
      else i += 1;
    }
    return path;
  };
  const shape = toPath(subs[0], new THREE.Shape()) as THREE.Shape;
  subs.slice(1).forEach((sub) => shape.holes.push(toPath(sub, new THREE.Path())));
  return shape;
};
