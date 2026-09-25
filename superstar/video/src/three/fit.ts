// Auto-framing camera: given world points, a view direction (azimuth/elevation) and fov,
// solve the camera distance so every point projects inside a target screen rectangle.
export type V3 = [number, number, number];

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Project world point to screen px for a camera at pos looking at look (up = +y). */
export const project = (p: V3, pos: V3, look: V3, fovDeg: number, W: number, H: number) => {
  const f = norm(sub(look, pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const d = sub(p, pos);
  const z = dot(d, f);
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const x = dot(d, r) / (z * t * (W / H));
  const y = dot(d, u) / (z * t);
  return {x: W / 2 + (x * W) / 2, y: H / 2 - (y * H) / 2, z};
};

export const fitCamera = (
  pts: V3[],
  target: V3,
  azDeg: number,
  elDeg: number,
  fovDeg: number,
  W: number,
  H: number,
  rect: {x0: number; x1: number; y0: number; y1: number},
  shift: [number, number] = [0, 0], // screen-space nudge of the look point (world units along r/u)
) => {
  const az = (azDeg * Math.PI) / 180, el = (elDeg * Math.PI) / 180;
  const dir: V3 = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
  const fits = (d: number) => {
    const pos: V3 = [target[0] + dir[0] * d, target[1] + dir[1] * d, target[2] + dir[2] * d];
    for (const p of pts) {
      const s = project(p, pos, target, fovDeg, W, H);
      if (s.z <= 0.1 || s.x < rect.x0 || s.x > rect.x1 || s.y < rect.y0 || s.y > rect.y1) return false;
    }
    return true;
  };
  // the band may be off-centre: move the look target so the band centre maps to the content centre
  let lo = 2, hi = 400;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) hi = mid;
    else lo = mid;
  }
  const d = hi;
  const pos: V3 = [target[0] + dir[0] * d, target[1] + dir[1] * d, target[2] + dir[2] * d];
  return {pos, look: target, d, dir, shift};
};
