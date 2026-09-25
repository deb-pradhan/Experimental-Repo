import React, {useMemo} from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {clamp01, lerp, ramp} from '../anim';
import {PulseDot, Reveal} from '../components/ui';
import M from '../data/market.json';
import {BLACK, BLUE, C, EASE, FONT, WHITE} from '../theme';
import {local, voF, wordF} from '../timeline';

// S01 · Cold open (0–8 s). Candle-canyon hero plate (graded to the ramps) under the real
// Hyperliquid BTC-PERP 4h line for the last 30 days. Every direction change pops a tick and
// feeds a counter that grows into the hero "89" as the narrator says it.

// Last 180 CLOSED 4h candles (the 20:00 UTC candle was still open at pull time).
const CLOSES = (M.btc.h4 as number[][]).filter((c) => c[0] < 1790366400).slice(-180).map((c) => c[4]);
// Direction changes, flat candles ignored (matches docs/03-quant-brief.md: 89).
const FLIP_DIR: number[] = []; // +1 = turned up (a low), -1 = turned down (a high); drives the tick pitch
const FLIPS: number[] = (() => {
  const idx: number[] = [];
  let prev = 0;
  for (let i = 1; i < CLOSES.length; i++) {
    const s = Math.sign(CLOSES[i] - CLOSES[i - 1]);
    if (s === 0) continue;
    if (prev !== 0 && s !== prev) {
      idx.push(i - 1);
      FLIP_DIR.push(s);
    }
    prev = s;
  }
  return idx;
})();

export const T = {
  statusIn: 52,
  lineStart: 66,
  lineEnd: 392, // the line finishes drawing just after "month"
  l1: local('S01', wordF('L01', 'this')), // "This market doesn't trend."
  l2: local('S01', wordF('L02', 'it')), // "It whipsaws."
  l3: local('S01', voF('L03')), // "Eighty-nine direction changes in a month."
  hero: local('S01', voF('L03')) - 6,
  exit: 452,
} as const;

// chart box (top half of frame, over the plate's dark sky)
const BOX = {x: 72, y: 520, w: 936, h: 250};

export const S01: React.FC = () => {
  const f = useCurrentFrame();
  const lo = Math.min(...CLOSES), hi = Math.max(...CLOSES);
  const pts = useMemo(
    () => CLOSES.map((c, i) => [BOX.x + (i / (CLOSES.length - 1)) * BOX.w, BOX.y + BOX.h - ((c - lo) / (hi - lo)) * BOX.h] as const),
    [lo, hi],
  );
  const prog = ramp(f, T.lineStart, T.lineEnd - T.lineStart, EASE.cubic) * (pts.length - 1);
  const k = Math.floor(prog);
  const fr = prog - k;
  const head = k >= pts.length - 1 ? pts[pts.length - 1] : [lerp(pts[k][0], pts[k + 1][0], fr), lerp(pts[k][1], pts[k + 1][1], fr)];
  const drawn = pts.slice(0, k + 1).map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` ${head[0].toFixed(1)},${head[1].toFixed(1)}`;
  const flipsSoFar = FLIPS.filter((i) => i <= prog).length;
  const price = k >= CLOSES.length - 1 ? CLOSES[CLOSES.length - 1] : lerp(CLOSES[k], CLOSES[k + 1], fr);

  // plate: full-frame cold open, then a tilt-up reveal (the canyon settles into the lower half so the
  // data sits on clean Soft Black), then a push back into the canyon to hand off to S02's 3D candles.
  const push = lerp(1.06, 1.14, ramp(f, 0, 480, EASE.soft));
  const tilt = ramp(f, 34, 70, EASE.inOut); // 0 → 1
  const exit = ramp(f, T.exit, 28, EASE.in);
  const plateY = lerp(0, 740, tilt) * (1 - exit);
  const maskTop = lerp(-400, 940, tilt) * (1 - exit);
  const heroP = ramp(f, T.hero, 26, EASE.out);
  const statusP = ramp(f, T.statusIn, 24, EASE.out);

  return (
    <AbsoluteFill style={{background: C.softBlack}}>
      <AbsoluteFill
        style={{
          // footage mask (not a colour gradient): the canyon fades into the Soft Black sky
          WebkitMaskImage: `linear-gradient(to bottom, transparent ${maskTop}px, black ${maskTop + 220}px)`,
          maskImage: `linear-gradient(to bottom, transparent ${maskTop}px, black ${maskTop + 220}px)`,
        }}
      >
        <AbsoluteFill style={{transform: `translateY(${plateY}px) scale(${push + exit * 0.18})`, transformOrigin: '50% 50%'}}>
          <OffthreadVideo src={staticFile('plates/p1_canyon_dark.mp4')} muted />
        </AbsoluteFill>
      </AbsoluteFill>

      {/* status line */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 250,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: FONT.mono,
          fontSize: 24,
          letterSpacing: '.04em',
          color: BLACK[300],
          opacity: statusP,
          transform: `translateY(${(1 - statusP) * 14}px)`,
        }}
      >
        <PulseDot dark />
        <span>btc-perp · 4h · hyperliquid · 30d</span>
        <span style={{marginLeft: 'auto', color: WHITE[100], fontVariantNumeric: 'tabular-nums'}}>
          ${Math.round(price).toLocaleString('en-US')}
        </span>
      </div>

      {/* headline */}
      <div style={{position: 'absolute', left: 72, top: 318}}>
        <Reveal text="This market doesn't trend." start={T.l1} exit={T.l2 - 10} size={70} family="sans" weight={500} color={WHITE[100]} tracking={-0.02} />
      </div>
      <div style={{position: 'absolute', left: 68, top: 300}}>
        <Reveal text="It whipsaws." start={T.l2} exit={T.hero - 4} size={150} family="serif" color={WHITE[100]} tracking={-0.03} dur={24} />
      </div>

      {/* the 30-day line */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {/* faint range guides */}
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1={BOX.x} x2={BOX.x + BOX.w} y1={BOX.y + g * BOX.h} y2={BOX.y + g * BOX.h} stroke={BLUE[900]} strokeWidth={2} strokeDasharray="4 10" opacity={statusP} />
        ))}
        {FLIPS.map((i) => {
          if (i > prog) return null;
          const age = (prog - i) / 6;
          const pop = clamp01(age);
          const [x, y] = pts[i];
          const up = CLOSES[i] > CLOSES[i - 1];
          return <line key={i} x1={x} x2={x} y1={y + (up ? -8 : 8)} y2={y + (up ? -8 - 26 * pop : 8 + 26 * pop)} stroke={BLUE[300]} strokeWidth={3} strokeLinecap="round" />;
        })}
        <polyline points={drawn} fill="none" stroke={WHITE[100]} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" />
        {f >= T.lineStart && (
          <g>
            <circle cx={head[0]} cy={head[1]} r={9} fill={WHITE[100]} />
            <circle cx={head[0]} cy={head[1]} r={18} fill="none" stroke={BLUE[400]} strokeWidth={3} />
          </g>
        )}
        {/* range labels */}
        <text x={BOX.x + BOX.w} y={BOX.y - 14} textAnchor="end" fontFamily={FONT.mono} fontSize={22} fill={BLACK[400]} opacity={statusP}>
          ${Math.round(hi).toLocaleString('en-US')}
        </text>
        <text x={BOX.x + BOX.w} y={BOX.y + BOX.h + 34} textAnchor="end" fontFamily={FONT.mono} fontSize={22} fill={BLACK[400]} opacity={statusP}>
          ${Math.round(lo).toLocaleString('en-US')}
        </text>
      </svg>

      {/* direction-change counter: small in the corner, then the hero numeral on "Ninety-one" */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: lerp(826, 808, heroP),
          display: 'flex',
          alignItems: 'flex-end',
          gap: 26,
          transform: `translateY(${-exit * 60}px)`,
          opacity: 1 - exit,
        }}
      >
        <div
          style={{
            fontFamily: FONT.serif,
            fontSize: lerp(60, 230, heroP),
            lineHeight: 0.8,
            color: WHITE[100],
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.03em',
            opacity: ramp(f, T.lineStart + 10, 20),
          }}
        >
          {flipsSoFar}
        </div>
        <div style={{paddingBottom: lerp(4, 22, heroP)}}>
          <div style={{fontFamily: FONT.mono, fontSize: lerp(22, 30, heroP), letterSpacing: '.16em', color: WHITE[100], textTransform: 'uppercase', opacity: ramp(f, T.lineStart + 10, 20)}}>
            direction changes
          </div>
          <div style={{fontFamily: FONT.mono, fontSize: 24, letterSpacing: '.06em', color: BLACK[300], marginTop: 8, opacity: heroP}}>
            in 30 days
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 0, kind: 'riser', note: 'dur=240 low tension bed swell under the canyon'},
  {at: T.statusIn + 6, kind: 'blip', note: 'status line + live dot'},
  {at: T.lineStart, kind: 'draw', note: `dur=${T.lineEnd - T.lineStart} price line`},
  // one tick per direction change, at the frame the drawing head passes it (inverse of the draw easing)
  ...FLIPS.map((i, n) => {
    let at = T.lineStart;
    while (at < T.lineEnd && ramp(at, T.lineStart, T.lineEnd - T.lineStart, EASE.cubic) * (CLOSES.length - 1) < i) at++;
    return {at, kind: 'tick', note: `flip ${n + 1} ${FLIP_DIR[n] > 0 ? 'up' : 'down'}`};
  }),
  {at: T.l2 + 6, kind: 'swipe', note: '"It whipsaws." serif slam'},
  {at: T.hero + 10, kind: 'impact_soft', note: 'hero 89 numeral grows'},
  {at: T.exit + 10, kind: 'whoosh', note: 'push into the canyon → S02'},
];
