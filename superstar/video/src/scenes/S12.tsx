import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, lerp, ramp, settle} from '../anim';
import {Token} from '../components/Token';
import {BLUE, EASE, FONT, WHITE} from '../theme';
import {local, wordF} from '../timeline';

// ------------------------------------------------------------------
// S12 · Where it runs (240 f, Blue Glow ground, white type)
// "Spot." "Perps." "HIP-3." land on the words, each on a rail; the rails
// converge into the official Hyperliquid mark ("on Hyperliquid") and pulses
// run down them into it. Everything lifts away to clean Blue Glow for the cut
// to S13 on the score's final hit (88.0 s).
// ------------------------------------------------------------------

const W20 = (w: string) => local('S12', wordF('L20', w));

export const T = {
  spot: W20('spot'), // ≈12
  perps: W20('perps'), // ≈68
  hip3: W20('hip3'), // ≈121
  hyperliquid: W20('hyperliquid'), // ≈189
  page1Out: 218, // after "Hyperliquid", clear by 238 for the cut at 240
} as const;

// the three pulses leave the rails as the mark lands and arrive before the page lifts
const PULSE = (i: number) => ({t0: T.hyperliquid - 2 + i * 4, dur: 18});

const SIZE = 172;
const ROWS = [
  {w: 'Spot.', at: T.spot - 8, top: 500},
  {w: 'Perps.', at: T.perps - 8, top: 680},
  {w: 'HIP-3.', at: T.hip3 - 8, top: 860},
];
const RAIL_X = 930;
const lineY = (top: number) => top + SIZE + 6;
const HL = {top: 1082, mark: 184, markX: RAIL_X - 10, markY: 1082 + 62};

const CUES_RAW: {at: number; kind: string; note?: string}[] = [
  {at: T.spot + 2, kind: 'swipe', note: '"Spot." rises'},
  {at: T.spot + 8, kind: 'draw', note: 'dur=24 · rail under Spot'},
  {at: T.perps + 2, kind: 'swipe', note: '"Perps." rises'},
  {at: T.perps + 8, kind: 'draw', note: 'dur=24 · rail under Perps'},
  {at: T.hip3 + 2, kind: 'swipe', note: '"HIP-3." rises'},
  {at: T.hip3 + 8, kind: 'draw', note: 'dur=24 · rail under HIP-3'},
  {at: T.hyperliquid - 6, kind: 'draw', note: 'dur=22 · rails converge down to the mark'},
  {at: T.hyperliquid + 2, kind: 'pop', note: 'Hyperliquid mark lands'},
  {at: T.hyperliquid + 4, kind: 'swipe', note: '"on Hyperliquid" rises'},
  ...[0, 1, 2].map((i) => ({at: PULSE(i).t0 + PULSE(i).dur, kind: 'ping', note: `pulse ${i + 1} reaches the mark`})),
  {at: T.page1Out + 8, kind: 'whoosh', note: 'page lifts away → clean Blue Glow for the cut'},
];
export const CUES = [...CUES_RAW].sort((a, b) => a.at - b.at);

const rise = (f: number, at: number, dur = 26) => ramp(f, at, dur, EASE.out);

const Line: React.FC<{text: string; pin: number; pout: number; size: number; serif?: boolean; style?: React.CSSProperties}> = ({text, pin, pout, size, serif, style}) => (
  <div style={{overflow: 'hidden', paddingBottom: '0.16em', marginBottom: '-0.16em', ...style}}>
    <div
      style={{
        fontFamily: serif ? FONT.serif : FONT.sans,
        fontWeight: serif ? 400 : 500,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        color: WHITE[100],
        whiteSpace: 'nowrap',
        transform: `translateY(${(1 - pin) * 115 - pout * 115}%)`,
      }}
    >
      {text}
    </div>
  </div>
);

export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + 0.025 * ramp(f, 0, 240, (t) => t);

  // ---------- page 1 ----------
  const p1out = (i: number) => ramp(f, T.page1Out + i * 2, 12, EASE.cubic);
  const railDown = ramp(f, T.hyperliquid - 8, 22, EASE.sys);
  const markK = settle(f, T.hyperliquid - 4, 20, 0.3);
  const railsOut = ramp(f, T.page1Out, 14, EASE.cubic);

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
        {/* ---------------- page 1 ---------------- */}
        {f < T.page1Out + 22 ? (
          <>
            <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
              {ROWS.map((r, i) => {
                const k = ramp(f, r.at + 10, 26, EASE.sys) * (1 - railsOut);
                const y = lineY(r.top);
                return k > 0 ? <line key={i} x1={72} x2={lerp(72, RAIL_X, k)} y1={y} y2={y} stroke={BLUE[300]} strokeWidth={3} strokeLinecap="round" /> : null;
              })}
              {railDown > 0 ? (
                <line
                  x1={RAIL_X}
                  x2={RAIL_X}
                  y1={lerp(lineY(ROWS[0].top), HL.markY - HL.mark / 2 - 14, railsOut)}
                  y2={lerp(lineY(ROWS[0].top), HL.markY - HL.mark / 2 - 14, railDown)}
                  stroke={BLUE[300]}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              ) : null}
              {/* pulses run along each rail into the mark */}
              {ROWS.map((r, i) => {
                const t = ramp(f, PULSE(i).t0, PULSE(i).dur, EASE.inOut);
                if (t <= 0 || t >= 1 || railsOut > 0) return null;
                const y = lineY(r.top);
                const endY = HL.markY - HL.mark / 2 - 14;
                const horiz = RAIL_X - 520;
                const vert = endY - y;
                const d = t * (horiz + vert);
                const px = d < horiz ? 520 + d : RAIL_X;
                const py = d < horiz ? y : y + (d - horiz);
                return <circle key={i} cx={px} cy={py} r={9} fill={WHITE[100]} />;
              })}
            </svg>

            {ROWS.map((r, i) => (
              <Line key={r.w} text={r.w} pin={rise(f, r.at)} pout={p1out(i)} size={SIZE} style={{position: 'absolute', left: 64, top: r.top}} />
            ))}

            {/* on Hyperliquid */}
            <div style={{position: 'absolute', left: 66, top: HL.top, display: 'flex', alignItems: 'baseline', gap: 26}}>
              <Line text="on" pin={rise(f, T.hyperliquid - 10)} pout={p1out(3)} size={112} serif />
              <Line text="Hyperliquid" pin={rise(f, T.hyperliquid - 6)} pout={p1out(3)} size={112} />
            </div>
            {markK > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: HL.markX - HL.mark / 2,
                  top: HL.markY - HL.mark / 2,
                  transform: `scale(${markK * (1 - p1out(4))}) rotate(${(1 - clamp01(markK)) * -30}deg)`,
                }}
              >
                <Token id="hyperliquid-mono" size={HL.mark} />
              </div>
            ) : null}
          </>
        ) : null}

      </div>
    </AbsoluteFill>
  );
};
