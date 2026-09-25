import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, lerp, ramp, rng} from '../anim';
import {Micro, Reveal} from '../components/ui';
import M from '../data/market.json';
import {BLACK, BLUE, C, EASE, FONT, GRAY, WHITE, mixHex} from '../theme';
import {local, voF, wordF} from '../timeline';

// S03 · Both sides pay (15.5–22.0 s). The last 48 hourly candles play out; a LONG that bought a
// swing high is flushed on the next drop, a SHORT that sold a swing low is squeezed on the next rip,
// alternating. On "both" the two chips fuse; the frame freezes, drains to grey and collapses to one
// point in the breath before the 22.0 s impact (S04 opens from that point).

const BARS = (M.btc.h1_48 as number[][]).map((c) => ({o: c[1], h: c[2], l: c[3], c: c[4]}));
const N = BARS.length;
const BOX = {x: 96, y: 720, w: 888, h: 640};
const LO = Math.min(...BARS.map((b) => b.l));
const HI = Math.max(...BARS.map((b) => b.h));
const X = (i: number) => BOX.x + (i / (N - 1)) * BOX.w;
const Y = (p: number) => BOX.y + BOX.h - ((p - LO) / (HI - LO)) * BOX.h;

// swing pivots on closes (local extrema over ±3 bars)
const PIVOTS: {i: number; kind: 'hi' | 'lo'}[] = (() => {
  const out: {i: number; kind: 'hi' | 'lo'}[] = [];
  for (let i = 3; i < N - 3; i++) {
    const w = BARS.slice(i - 3, i + 4).map((b) => b.c);
    if (BARS[i].c === Math.max(...w)) out.push({i, kind: 'hi'});
    else if (BARS[i].c === Math.min(...w)) out.push({i, kind: 'lo'});
  }
  // keep alternating hi/lo
  const alt: typeof out = [];
  for (const p of out) if (!alt.length || alt[alt.length - 1].kind !== p.kind) alt.push(p);
  return alt;
})();

export const T = {
  play0: 6,
  play1: 262, // playhead reaches the right edge on "both"
  pick: local('S03', voF('L06')),
  pay: local('S03', wordF('L06', 'makes')),
  unless: local('S03', voF('L07')),
  both: local('S03', wordF('L07', 'both')),
  freeze: local('S03', wordF('L07', 'both')) + 22,
  collapse: local('S03', wordF('L07', 'both')) + 44,
  seed: 356,
} as const;

// trades: each pivot opens the losing side; the next pivot liquidates it
type Trade = {side: 'LONG' | 'SHORT'; open: number; close: number; entry: number; exit: number};
const ALL_TRADES: Trade[] = PIVOTS.slice(0, -1).map((p, k) => ({
  side: p.kind === 'hi' ? 'LONG' : 'SHORT', // buy the top / sell the bottom — then get run over
  open: p.i,
  close: PIVOTS[k + 1].i,
  entry: BARS[p.i].c,
  exit: BARS[PIVOTS[k + 1].i].c,
}));
// the four biggest swings, non-overlapping, in time order
const TRADES: Trade[] = (() => {
  const picked: Trade[] = [];
  for (const t of [...ALL_TRADES].sort((a, b) => Math.abs(b.exit - b.entry) - Math.abs(a.exit - a.entry))) {
    if (picked.every((q) => t.close <= q.open || t.open >= q.close)) picked.push(t);
    if (picked.length === 4) break;
  }
  return picked.sort((a, b) => a.open - b.open);
})();

const barAt = (f: number) => lerp(0, N - 1, ramp(f, T.play0, T.play1 - T.play0, (t) => t));
const frameOfBar = (i: number) => {
  for (let f = T.play0; f <= T.play1; f++) if (barAt(f) >= i) return f;
  return T.play1;
};

const SPARKS = (() => {
  const r = rng(11);
  return TRADES.map(() => Array.from({length: 18}, () => ({a: r() * Math.PI * 2, v: 2 + r() * 6, s: 2 + r() * 4})));
})();

export const S03: React.FC = () => {
  const f = useCurrentFrame();
  const frozen = Math.min(f, T.freeze);
  const head = barAt(frozen);
  const drain = ramp(f, T.freeze, 24, EASE.soft); // Blue Glow → grey
  const col = (hex: string) => mixHex(hex, GRAY[800], drain);
  const k = ramp(f, T.collapse, 60, EASE.in); // collapse to the centre point
  const exitText = ramp(f, T.freeze + 4, 20, EASE.in);

  const candles = useMemo(() => BARS, []);
  const cx = 540, cy = 1040;

  return (
    <AbsoluteFill style={{background: C.softBlack}}>
      {/* headline */}
      <div style={{position: 'absolute', left: 72, top: 300, opacity: 1 - exitText}}>
        <Reveal text={'Pick one side,'} start={T.pick} exit={T.unless - 8} size={96} family="sans" weight={500} color={WHITE[100]} tracking={-0.02} />
        <Reveal text={'and this market\nmakes you pay.'} start={T.pay - 6} exit={T.unless - 8} size={96} family="sans" weight={500} color={WHITE[100]} tracking={-0.02} stagger={3} />
      </div>
      <div style={{position: 'absolute', left: 72, top: 300, opacity: 1 - exitText}}>
        <Reveal text={'Unless you can'} start={T.unless} size={96} family="sans" weight={500} color={WHITE[100]} tracking={-0.02} />
        <Reveal text={'trade both.'} start={T.both - 14} size={150} family="serif" color={WHITE[100]} tracking={-0.03} dur={26} />
      </div>

      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${cx} ${cy}) scale(${1 - k}) translate(${-cx} ${-cy})`} opacity={1 - ramp(f, T.collapse + 44, 16)}>
          {/* hourly candles, revealed by the playhead */}
          {candles.map((b, i) => {
            if (i > head + 0.001) return null;
            const up = b.c >= b.o;
            const x = X(i);
            const bw = (BOX.w / N) * 0.56;
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={Y(b.h)} y2={Y(b.l)} stroke={up ? col(BLUE[300]) : GRAY[800]} strokeWidth={3} />
                <rect x={x - bw / 2} y={Y(Math.max(b.o, b.c))} width={bw} height={Math.max(2, Math.abs(Y(b.o) - Y(b.c)))} fill={up ? col(BLUE[500]) : GRAY[900]} />
              </g>
            );
          })}
          {/* trades */}
          {TRADES.map((t, n) => {
            const fo = frameOfBar(t.open), fc = frameOfBar(t.close);
            if (frozen < fo) return null;
            const pIn = ramp(f, fo, 16, EASE.out);
            const liq = frozen >= fc;
            const pL = ramp(f, fc, 18, EASE.out);
            const x0 = X(t.open), y0 = Y(t.entry), x1 = X(t.close), y1 = Y(t.exit);
            const long = t.side === 'LONG';
            const tone = long ? col(BLUE[500]) : GRAY[700];
            const lab = long ? WHITE[100] : BLACK[500];
            const segX = liq ? x1 : Math.min(X(head), x1);
            return (
              <g key={n}>
                <line x1={x0} x2={segX} y1={y0} y2={y0} stroke={tone} strokeWidth={4} strokeDasharray="12 10" opacity={liq ? 1 - pL * 0.6 : 1} />
                <g transform={`translate(${x0} ${y0 + (long ? -62 : 62)}) scale(${pIn})`} opacity={liq ? 1 - pL * 0.45 : 1}>
                  <rect x={-84} y={-28} width={168} height={56} rx={28} fill={liq ? GRAY[900] : tone} />
                  <text x={0} y={10} textAnchor="middle" fontFamily={FONT.mono} fontSize={28} letterSpacing="3.5" fill={liq ? GRAY[400] : lab}>
                    {t.side}
                  </text>
                </g>
                {liq && (
                  <g>
                    {/* the liquidation: an ✕ at the stop and a burst of sparks */}
                    <g transform={`translate(${x1} ${y1}) scale(${pL})`} stroke={WHITE[100]} strokeWidth={6} strokeLinecap="round">
                      <line x1={-20} y1={-20} x2={20} y2={20} />
                      <line x1={-20} y1={20} x2={20} y2={-20} />
                    </g>
                    {SPARKS[n].map((s, j) => {
                      const tt = clamp01((frozen - fc) / 28);
                      if (tt >= 1) return null;
                      const d = s.v * 10 * Math.sqrt(tt);
                      return <rect key={j} x={x1 + Math.cos(s.a) * d * 1.6} y={y1 + Math.sin(s.a) * d * 1.6 + tt * tt * 40} width={s.s * 1.6 * (1 - tt)} height={s.s * 1.6 * (1 - tt)} fill={long ? BLUE[300] : BLACK[200]} />;
                    })}
                    <text x={x1 + 34} y={y1 + 9} textAnchor="start" fontFamily={FONT.mono} fontSize={24} letterSpacing="3" fill={WHITE[100]} opacity={pL * (1 - ramp(frozen, fc + 70, 20))}>
                      LIQUIDATED
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          {/* playhead */}
          {f < T.freeze + 30 && <line x1={X(head)} x2={X(head)} y1={BOX.y - 30} y2={BOX.y + BOX.h + 30} stroke={col(BLUE[400])} strokeWidth={2} opacity={0.9 * (1 - drain)} />}
        </g>

        {/* the seed: everything collapses into one point, which holds, breathing, until the impact */}
        {f >= T.collapse + 30 && (
          <g>
            <circle cx={cx} cy={cy} r={lerp(40, 16, ramp(f, T.collapse + 30, 30, EASE.out)) * (1 + 0.16 * Math.sin(Math.max(0, f - T.seed) / 5))} fill={BLUE[500]} />
          </g>
        )}
      </svg>

      {/* mono meta */}
      <div style={{position: 'absolute', left: 90, right: 90, top: 1420, display: 'flex', justifyContent: 'space-between', opacity: ramp(f, 10, 20) * (1 - exitText)}}>
        <Micro color={BLACK[300]} size={22}>btc-perp · 1h · last 48 hours</Micro>
        <Micro color={BLACK[300]} size={22}>illustrative positions</Micro>
      </div>
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: T.play0, kind: 'draw', note: `dur=${T.play1 - T.play0} hourly tape plays`},
  ...TRADES.flatMap((t, n) => [
    {at: frameOfBar(t.open) + 6, kind: 'click', note: `${t.side} opens (${n})`},
    {at: frameOfBar(t.close) + 4, kind: 'crackle_big', note: `${t.side} liquidated (${n})`},
  ]),
  {at: T.both, kind: 'swipe', note: '"both" lands'},
  {at: T.freeze, kind: 'tape_stop', note: 'freeze-frame + drain to grey'},
  {at: T.collapse + 40, kind: 'reverse_swell', note: 'collapse into one point (suck-in)'},
  {at: T.seed + 6, kind: 'heartbeat', note: 'the seed breathes in the silence'},
];
