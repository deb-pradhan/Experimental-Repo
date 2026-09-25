import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, lerp, ramp, settle} from '../anim';
import {Token} from '../components/Token';
import {BLUE, C, CARD, EASE, FONT, GRAY, TURQ, WHITE, mixHex} from '../theme';
import {local, wordF} from '../timeline';

// ------------------------------------------------------------------
// S12 · Where it runs (360 f, Blue Glow ground, white type)
// Page 1: "Spot." "Perps." "HIP-3." land on the words, each on a rail; the
// rails converge into the official Hyperliquid mark ("on Hyperliquid") and
// pulses run down them. Page 2: "USDC in." — the official USDC coin drops
// into a white wallet card; "USDC out." — it lifts out and away. Clear to
// Blue Glow by the end (S13 white end card follows).
// ------------------------------------------------------------------

const W20 = (w: string) => local('S12', wordF('L20', w));
const W21 = (w: string, n = 0) => local('S12', wordF('L21', w, n));

export const T = {
  spot: W20('spot'), // ≈12
  perps: W20('perps'), // ≈68
  hip3: W20('hip3'), // ≈121
  hyperliquid: W20('hyperliquid'), // ≈189
  page1Out: 214,
  usdcIn: W21('usdc', 0), // ≈242
  inWord: W21('in'), // ≈268
  usdcOut: W21('usdc', 1), // ≈332
  land: 272,
  clear: 340,
} as const;

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
  {at: 214, kind: 'ping', note: 'pulse 1 reaches the mark'},
  {at: 220, kind: 'ping', note: 'pulse 2 reaches the mark'},
  {at: 226, kind: 'ping', note: 'pulse 3 reaches the mark'},
  {at: T.page1Out + 10, kind: 'whoosh', note: 'page 1 lifts away'},
  {at: T.usdcIn + 2, kind: 'swipe', note: '"USDC in." rises'},
  {at: T.usdcIn + 4, kind: 'pop', note: 'USDC coin appears'},
  {at: 262, kind: 'card_in', note: 'wallet card rises'},
  {at: T.land - 10, kind: 'whoosh', note: 'coin arcs down (short)'},
  {at: T.land, kind: 'lock', note: 'coin lands in the wallet slot · "in"'},
  {at: T.land + 2, kind: 'shimmer', note: 'coin flip settles'},
  {at: T.usdcOut, kind: 'swipe', note: '"USDC out." rises'},
  {at: T.usdcOut + 12, kind: 'whoosh', note: 'coin lifts out and away'},
  {at: 352, kind: 'card_out', note: 'wallet card whooshes off left'},
  {at: 358, kind: 'swipe', note: 'last type clears → blue for the cut'},
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

/** Quadratic bezier point. */
const qb = (a: [number, number], c: [number, number], b: [number, number], t: number): [number, number] => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const push = 1 + 0.025 * ramp(f, 0, 360, (t) => t);

  // ---------- page 1 ----------
  const p1out = (i: number) => ramp(f, T.page1Out + i * 3, 16, EASE.cubic);
  const railDown = ramp(f, T.hyperliquid - 8, 22, EASE.sys);
  const markK = settle(f, T.hyperliquid - 4, 20, 0.3);
  const railsOut = ramp(f, T.page1Out, 14, EASE.cubic);

  // ---------- page 2 ----------
  const inPin = rise(f, T.usdcIn - 8);
  const outPin = rise(f, T.usdcOut - 8);
  const clr = (i: number) => (i === 2 ? ramp(f, 347, 12, EASE.cubic) : ramp(f, T.clear - 4 + i * 3, 14, EASE.cubic));
  const cardIn = settle(f, T.usdcIn + 4, 26, 0.12);
  const cardOut = ramp(f, 340, 16, EASE.in);
  const CARD_Y = 790;
  const cardTop = CARD_Y + (1 - cardIn) * 260;
  const slot: [number, number] = [72 + 60 + 100, cardTop + 200];

  // coin path: appear at the end of "USDC in." → arc into the slot → rest → arc out past "USDC out."
  const coinStart: [number, number] = [900, 520];
  const coinPop = settle(f, T.usdcIn, 16, 0.4);
  const tIn = ramp(f, T.land - 18, 18, EASE.inOut);
  const tOut = ramp(f, T.usdcOut + 1, 19, EASE.cubic);
  let coin: [number, number] = coinStart;
  let coinScale = 1;
  if (f >= T.land - 18) {
    coin = qb(coinStart, [780, 690], slot, tIn);
    coinScale = lerp(1, 1.25, tIn);
  }
  if (f >= T.usdcOut + 2) {
    coin = qb(slot, [300, cardTop - 230], [1270, cardTop - 90], tOut);
    coinScale = lerp(1.25, 1.05, tOut);
  }
  const flip = Math.cos(Math.PI * 2 * ramp(f, T.land - 2, 26, EASE.out)); // one coin flip on landing
  const landBump = f >= T.land ? Math.sin(Math.PI * clamp01((f - T.land) / 14)) * 14 * (1 - clamp01((f - T.land) / 14)) : 0;
  const ring = clamp01((f - T.land) / 26);
  const showCoin = f >= T.usdcIn - 2 && tOut < 1;

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: '50% 45%'}}>
        {/* ---------------- page 1 ---------------- */}
        {f < T.page1Out + 30 ? (
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
                const t0 = T.hyperliquid + 4 + i * 6;
                const t = ramp(f, t0, 22, EASE.inOut);
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

        {/* ---------------- page 2 ---------------- */}
        {f >= T.usdcIn - 10 ? (
          <>
            <Line text="USDC in." pin={inPin} pout={clr(1)} size={SIZE} style={{position: 'absolute', left: 64, top: 430}} />

            {/* wallet card (white surface + Soft Black text) */}
            {cardIn > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: 72,
                  top: cardTop + landBump,
                  width: 936,
                  height: 400,
                  borderRadius: CARD.radius,
                  background: WHITE[100],
                  boxShadow: CARD.shadow,
                  overflow: 'hidden',
                  transform: `translateX(${-1120 * cardOut}px) rotate(${-4 * cardOut}deg)`,
                }}
              >
                {/* slot */}
                <div
                  style={{
                    position: 'absolute',
                    left: 60,
                    top: 100,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: `4px dashed ${GRAY[600]}`,
                    boxSizing: 'border-box',
                    transform: `rotate(${f * 0.5}deg)`,
                  }}
                />
                {/* landing ring: the scene's one turquoise element (non-text, on white) */}
                {f >= T.land && ring < 1 ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: 160 - (100 + 60 * EASE.out(ring)),
                      top: 200 - (100 + 60 * EASE.out(ring)),
                      width: 2 * (100 + 60 * EASE.out(ring)),
                      height: 2 * (100 + 60 * EASE.out(ring)),
                      borderRadius: '50%',
                      border: `6px solid ${mixHex(TURQ[500], WHITE[100], ring)}`,
                      boxSizing: 'border-box',
                    }}
                  />
                ) : null}
                <div style={{position: 'absolute', left: 316, top: 104}}>
                  <div style={{fontFamily: FONT.serif, fontSize: 118, lineHeight: 1, letterSpacing: '-0.03em', color: C.ink, fontVariantNumeric: 'tabular-nums'}}>$10,000</div>
                  <div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: '.16em', color: GRAY[900], marginTop: 22, textTransform: 'uppercase'}}>USDC minimum</div>
                </div>
              </div>
            ) : null}

            <Line text="USDC out." pin={outPin} pout={clr(2)} size={SIZE} style={{position: 'absolute', left: 64, top: 1262}} />

            {/* the official USDC coin */}
            {showCoin ? (
              <div
                style={{
                  position: 'absolute',
                  left: coin[0] - 80,
                  top: coin[1] - 80 + (f >= T.land && f < T.usdcOut + 2 ? landBump + Math.sin((f - T.land) / 11) * 5 * ramp(f, T.land + 14, 20, EASE.sys) : 0),
                  width: 160,
                  height: 160,
                  transform: `scale(${coinPop * coinScale}) scaleX(${f >= T.land - 2 && f < T.land + 26 ? Math.abs(flip) * 0.9 + 0.1 : 1})`,
                }}
              >
                <Token id="usdc" size={160} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
