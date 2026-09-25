import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, lerp, ramp, rng} from '../anim';
import {Micro, Reveal} from '../components/ui';
import M from '../data/market.json';
import {BLACK, BLUE, C, EASE, FONT, GRAY, H, W, WHITE} from '../theme';
import {local, wordF} from '../timeline';
import {BoxInst, Boxes, Cam, Palette, Stage} from '../three/Candles3D';
import {V3, fitCamera} from '../three/fit';

// S02 · Both sides liquidated (8.0–15.5 s). The last 30 days of Hyperliquid BTC-PERP 4h candles as a
// 3D row receding into depth; Hyblock's daily Binance BTC-perp liquidations grow as a butterfly
// around it: longs downward on "$542M of longs", shorts upward on "$616M of shorts".

const CANDLES = (M.btc.h4 as number[][]).filter((c) => c[0] < 1790366400).slice(-180);
const LIQ = M.liquidations.daily as number[][]; // [t, long, short] ascending, 30 days
const LONGS = M.liquidations.longs30dUSD as number;
const SHORTS = M.liquidations.shorts30dUSD as number;

const DZ = 0.3; // depth per candle
const PY = (p: number) => ((p - 81200) / 1000) * 0.9;
const LQ = 0.06 / 1e6; // units per $
const BASE = 6.4;

const PAL: Palette = [
  {top: BLUE[400], lit: BLUE[500], dark: BLUE[700]}, // 0 up candle
  {top: GRAY[800], lit: GRAY[900], dark: GRAY[1000]}, // 1 down candle
  {top: BLUE[200], lit: BLUE[300], dark: BLUE[400]}, // 2 short-liq bar
  {top: BLACK[200], lit: BLACK[300], dark: BLACK[400]}, // 3 long-liq bar (grey)
  {top: BLUE[300], lit: BLUE[300], dark: BLUE[300]}, // 4 up wick
  {top: GRAY[700], lit: GRAY[700], dark: GRAY[700]}, // 5 down wick
  {top: BLUE[200], lit: BLUE[200], dark: BLUE[300]}, // 6 short particle
  {top: BLACK[200], lit: BLACK[200], dark: BLACK[300]}, // 7 long particle
  {top: BLUE[900], lit: BLUE[900], dark: BLUE[900]}, // 8 guide
];

export const T = {
  longStart: local('S02', wordF('L04', '542')),
  longsWord: local('S02', wordF('L04', 'longs')),
  shortStart: local('S02', wordF('L05', '616')),
  shortsWord: local('S02', wordF('L05', 'shorts')),
  reveal: 376,
  exit: 432,
} as const;

const dayStartLong = (d: number) => T.longStart + 4 + d * 4.2;
const dayStartShort = (d: number) => T.shortStart + 2 + d * 3.4;
const GROW = 26;

type Particle = {d: number; side: 0 | 1; vx: number; vy: number; vz: number; life: number; size: number};
const PARTICLES: Particle[] = (() => {
  const r = rng(7);
  const out: Particle[] = [];
  LIQ.forEach((row, d) => {
    const nl = Math.round(row[1] / 2.5e6) + 1;
    const ns = Math.round(row[2] / 2.5e6) + 1;
    for (let i = 0; i < nl; i++) out.push({d, side: 0, vx: (r() - 0.5) * 0.09, vy: -(0.04 + r() * 0.1), vz: (r() - 0.5) * 0.09, life: 50 + r() * 50, size: 0.05 + r() * 0.08});
    for (let i = 0; i < ns; i++) out.push({d, side: 1, vx: (r() - 0.5) * 0.09, vy: 0.05 + r() * 0.13, vz: (r() - 0.5) * 0.09, life: 50 + r() * 50, size: 0.05 + r() * 0.08});
  });
  return out;
})();

// extents of the fully grown butterfly, for the auto-framing camera
const FIT_PTS: V3[] = (() => {
  const pts: V3[] = [];
  LIQ.forEach((row, d) => {
    const z = -(6 * d + 2.5) * DZ;
    pts.push([0.65, BASE + row[2] * LQ, z - 0.7], [0.65, -BASE - row[1] * LQ, z + 0.7], [-0.65, BASE + row[2] * LQ, z + 0.7], [-0.65, -BASE - row[1] * LQ, z - 0.7]);
  });
  pts.push([0, PY(88000), 0.3], [0, PY(74000), -180 * DZ]);
  return pts;
})();
const TARGET: V3 = [0, 1.2, -21];

const fmtM = (v: number) => `$${Math.round(v / 1e6).toLocaleString('en-US')}M`;

export const S02: React.FC = () => {
  const f = useCurrentFrame();

  const items = useMemo(() => {
    const out: BoxInst[] = [];
    // candles rise in, staggered along the row
    CANDLES.forEach((c, i) => {
      const [, o, h, l, cl] = c;
      const up = cl >= o;
      const g = ramp(f, -60 + i * 0.3, 22, EASE.out);
      const z = -i * DZ;
      const y0 = PY(Math.min(o, cl)), y1 = PY(Math.max(o, cl));
      const bh = Math.max(0.03, y1 - y0) * g;
      out.push({x: 0, y: y0 + bh / 2, z, sx: 0.55, sy: bh, sz: 0.24, kind: up ? 0 : 1});
      const wy0 = PY(l), wy1 = PY(h);
      out.push({x: 0, y: (wy0 + wy1) / 2, z, sx: 0.07, sy: (wy1 - wy0) * g, sz: 0.07, kind: up ? 4 : 5});
    });
    // liquidation butterfly
    LIQ.forEach((row, d) => {
      const z = -(6 * d + 2.5) * DZ;
      const gl = ramp(f, dayStartLong(d), GROW, EASE.out);
      const gs = ramp(f, dayStartShort(d), GROW, EASE.out);
      const hl = row[1] * LQ * gl;
      const hs = row[2] * LQ * gs;
      if (hl > 0.001) out.push({x: 0, y: -BASE - hl / 2, z, sx: 1.3, sy: hl, sz: 6 * DZ * 0.8, kind: 3});
      if (hs > 0.001) out.push({x: 0, y: BASE + hs / 2, z, sx: 1.3, sy: hs, sz: 6 * DZ * 0.8, kind: 2});
    });
    // particles shed from each bar as it lands
    PARTICLES.forEach((p) => {
      const row = LIQ[p.d];
      const t0 = (p.side === 0 ? dayStartLong(p.d) : dayStartShort(p.d)) + GROW * 0.55;
      const t = f - t0;
      if (t < 0 || t > p.life) return;
      const k = t / p.life;
      const z = -(6 * p.d + 2.5) * DZ;
      const end = p.side === 0 ? -BASE - row[1] * LQ : BASE + row[2] * LQ;
      const drag = (1 - Math.exp(-t / 22)) * 22;
      const s = p.size * (1 - k);
      out.push({x: p.vx * drag * 1.2, y: end + p.vy * drag, z: z + p.vz * drag, sx: s, sy: s, sz: s, kind: p.side === 0 ? 7 : 6});
    });
    return out;
  }, [f]);

  // camera: a low dolly beside the row, then a rising pull-back that reveals the whole butterfly
  const a = ramp(f, 0, T.reveal, EASE.soft);
  const b = ramp(f, T.reveal - 40, 110, EASE.inOut);
  // three-quarter view: the row crosses the middle band (near = left, far = right),
  // shorts rise into the upper band, longs hang into the lower band; slow truck along the row.
  // auto-framed orbit: the grown butterfly always fits the middle band (y 560–1270)
  const az = lerp(lerp(16, 26, a), 40, b);
  const el = lerp(lerp(2, 5, a), 12, b);
  const fov = 60;
  const cam = fitCamera(FIT_PTS, TARGET, az, el, fov, W, H, {x0: 20, x1: 1060, y0: 540, y1: 1290});
  // push a little beyond the fit early (the near end crops out of frame — reads as depth), then settle
  const push = lerp(0.42, 0.66, ramp(f, 0, T.reveal + 70, EASE.inOut));
  const pos: [number, number, number] = [
    TARGET[0] + (cam.pos[0] - TARGET[0]) * push,
    TARGET[1] + (cam.pos[1] - TARGET[1]) * push,
    TARGET[2] + (cam.pos[2] - TARGET[2]) * push,
  ];
  const look: [number, number, number] = TARGET;
  const exit = ramp(f, T.exit, 18, EASE.in);

  const longCount = LONGS * ramp(f, T.longStart, 150, EASE.soft);
  const shortCount = SHORTS * ramp(f, T.shortStart, 118, EASE.soft);
  const pL = ramp(f, T.longStart - 4, 24, EASE.out);
  const pS = ramp(f, T.shortStart - 4, 24, EASE.out);

  return (
    <AbsoluteFill style={{background: C.softBlack}}>
      <AbsoluteFill style={{transform: `scale(${1 + exit * 0.06})`, opacity: 1 - exit}}>
        <Stage width={W} height={H}>
          <Cam pos={pos} look={look} fov={fov} roll={0} />
          <Boxes items={items} palette={PAL} max={1600} />
        </Stage>
      </AbsoluteFill>

      {/* SHORTS — top (frosted-glass card: the one approved opacity on dark) */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 236,
          padding: '30px 36px 34px',
          borderRadius: 40,
          background: C.frost,
          border: `2px solid ${C.frost}`,
          backdropFilter: 'blur(26px)',
          WebkitBackdropFilter: 'blur(26px)',
          opacity: pS * (1 - exit),
          transform: `translateY(${(1 - pS) * -30 - exit * 40}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 18, height: 18, background: BLUE[300], display: 'inline-block'}} />
          <Micro color={WHITE[100]} size={26}>shorts liquidated</Micro>
        </div>
        <div style={{overflow: 'hidden', marginTop: 8}}>
          <div style={{transform: `translateY(${(1 - pS) * 110}%)`, fontFamily: FONT.serif, fontSize: 168, lineHeight: 1, color: WHITE[100], letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
            {fmtM(shortCount)}
          </div>
        </div>
      </div>

      {/* LONGS — bottom */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 1296,
          padding: '30px 36px 34px',
          borderRadius: 40,
          background: C.frost,
          border: `2px solid ${C.frost}`,
          backdropFilter: 'blur(26px)',
          WebkitBackdropFilter: 'blur(26px)',
          opacity: pL * (1 - exit),
          transform: `translateY(${(1 - pL) * 30 + exit * 40}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{width: 18, height: 18, background: BLACK[300], display: 'inline-block'}} />
          <Micro color={WHITE[100]} size={26}>longs liquidated</Micro>
        </div>
        <div style={{overflow: 'hidden', marginTop: 8}}>
          <div style={{transform: `translateY(${(1 - pL) * 110}%)`, fontFamily: FONT.serif, fontSize: 168, lineHeight: 1, color: WHITE[100], letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums'}}>
            {fmtM(longCount)}
          </div>
        </div>
      </div>

      {/* source */}
      <div style={{position: 'absolute', left: 72, right: 72, top: 1590, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.04em', color: BLACK[400], opacity: ramp(f, 30, 30) * (1 - exit)}}>
        <span>binance btc perps · aug 26 – sep 24 · hyblock</span>
        <span>30d</span>
      </div>
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 2, kind: 'whoosh', note: 'dive into the 3D candle row (from S01 push-in)'},
  {at: 20, kind: 'shimmer', note: 'candles rise in along the row'},
  {at: T.longStart + 2, kind: 'impact_soft', note: '$542M appears'},
  {at: T.longStart, kind: 'tick_train', note: 'dur=150 longs counter'},
  ...LIQ.map((row, d) => ({at: Math.round(dayStartLong(d) + GROW * 0.55), kind: row[1] > 3e7 ? 'crackle_big' : 'crackle', note: `long liq day ${d} $${Math.round(row[1] / 1e6)}M`})),
  {at: T.shortStart + 2, kind: 'impact_soft', note: '$616M appears'},
  {at: T.shortStart, kind: 'tick_train', note: 'dur=118 shorts counter'},
  ...LIQ.map((row, d) => ({at: Math.round(dayStartShort(d) + GROW * 0.55), kind: row[2] > 3e7 ? 'crackle_big' : 'crackle', note: `short liq day ${d} $${Math.round(row[2] / 1e6)}M`})),
  {at: T.reveal - 30, kind: 'whoosh', note: 'camera rises and pulls back'},
];
