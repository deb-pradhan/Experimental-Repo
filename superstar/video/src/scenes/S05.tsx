import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, lerp, ramp, settle} from '../anim';
import {Micro, PulseDot, Reveal} from '../components/ui';
import {Star3D} from '../components/Star';
import {BLUE, C, EASE, FONT, H, W, WHITE} from '../theme';
import {local, voF, wordF} from '../timeline';
import {STAR_END, STAR_LIFT, starRot} from './S04';

// S05 · Every four hours (26.0–34.0 s). On the groove's first downbeat Blue Glow floods out of the
// star; the star re-shades to its light ramp and settles into the centre of a 24-hour review clock.
// A sweep hand lights the six daily reviews (every 4 h), each one pinging data into the core.
// Exit: the blue panel contracts into a card and flies up, handing the stage to 01 (S06).

const CX = 540, CY = 1010, R = 360;
const REVIEWS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

export const T = {
  flood: 0,
  settle: 8,
  ring: 34,
  every: local('S05', voF('L10')),
  fresh: local('S05', wordF('L10', 'fresh')),
  decision: local('S05', wordF('L10', 'decision')),
  one: local('S05', wordF('L10', 'one')),
  sweep0: 96,
  sweep1: 396,
  exit: 452,
} as const;

// the hand reaches review k (k = 0..5) at this frame
const reviewAt = (k: number) => T.sweep0 + ((T.sweep1 - T.sweep0) * k) / 6 + 8;

export const S05: React.FC = () => {
  const f = useCurrentFrame();
  const flood = ramp(f, T.flood, 30, EASE.out);
  const mv = ramp(f, T.settle, 56, EASE.inOut);
  const exit = ramp(f, T.exit, 28, EASE.inOut);

  // star: continues S04's rotation, moves from the reveal position into the clock centre
  const sx = lerp(STAR_END.x, CX, mv), sy = lerp(STAR_END.y, CY, mv);
  const size = lerp(STAR_END.size, 250, mv) * (1 + 0.06 * Math.max(0, Math.sin(Math.PI * ramp(f, T.decision - 4, 24))));
  const ringP = ramp(f, T.ring, 70, EASE.sys);
  const sweep = ramp(f, T.sweep0, T.sweep1 - T.sweep0, (t) => t);
  const ang = -Math.PI / 2 + sweep * Math.PI * 2;
  const panelR = lerp(40, 1500, flood);

  // exit: the whole blue panel contracts to a card and flies up
  const cardW = lerp(1080, 820, exit), cardH = lerp(1920, 1100, exit);
  const cardY = lerp(0, -1500, ramp(f, T.exit + 10, 20, EASE.in));
  const radius = lerp(0, 44, exit);

  return (
    <AbsoluteFill style={{background: C.gray}}>
      <div
        style={{
          position: 'absolute',
          left: (1080 - cardW) / 2,
          top: (1920 - cardH) / 2 + cardY,
          width: cardW,
          height: cardH,
          borderRadius: radius,
          overflow: 'hidden',
          clipPath: `circle(${panelR}px at ${STAR_END.x - (1080 - cardW) / 2}px ${STAR_END.y - (1920 - cardH) / 2}px)`,
          background: C.blue,
        }}
      >
        <div style={{position: 'absolute', left: -(1080 - cardW) / 2, top: -(1920 - cardH) / 2, width: 1080, height: 1920, transform: `scale(${lerp(1, 0.78, exit)})`, transformOrigin: '540px 960px'}}>
          {/* status */}
          <div style={{position: 'absolute', left: 72, right: 72, top: 250, display: 'flex', alignItems: 'center', gap: 18, fontFamily: FONT.mono, fontSize: 24, color: BLUE[200], letterSpacing: '.04em', opacity: ramp(f, 20, 20)}}>
            <PulseDot />
            <span>superstar · live · reviews every 4h · utc</span>
          </div>
          {/* headline */}
          <div style={{position: 'absolute', left: 72, top: 318}}>
            <Reveal text="Every four hours." start={T.every - 2} size={96} family="sans" weight={500} color={WHITE[100]} tracking={-0.02} />
          </div>
          <div style={{position: 'absolute', left: 68, top: 430}}>
            <Reveal text="One decision." start={T.one - 6} size={132} family="serif" color={WHITE[100]} tracking={-0.03} dur={26} />
          </div>

          {/* the clock */}
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke={BLUE[300]} strokeWidth={3} strokeDasharray={`${2 * Math.PI * R * ringP} ${2 * Math.PI * R}`} transform={`rotate(-90 ${CX} ${CY})`} />
            <circle cx={CX} cy={CY} r={R - 46} fill="none" stroke={BLUE[400]} strokeWidth={2} strokeDasharray="2 14" opacity={ringP} />
            {/* sweep hand (only while sweeping) */}
            {f >= T.sweep0 && (
              <g>
                <path
                  d={`M ${CX} ${CY} L ${CX + Math.cos(-Math.PI / 2) * (R - 8)} ${CY + Math.sin(-Math.PI / 2) * (R - 8)} A ${R - 8} ${R - 8} 0 ${sweep > 0.5 ? 1 : 0} 1 ${CX + Math.cos(ang) * (R - 8)} ${CY + Math.sin(ang) * (R - 8)} Z`}
                  fill={BLUE[600]}
                  opacity={1 - ramp(f, T.sweep1, 30)}
                />
                <line x1={CX} y1={CY} x2={CX + Math.cos(ang) * (R + 26)} y2={CY + Math.sin(ang) * (R + 26)} stroke={WHITE[100]} strokeWidth={3} strokeLinecap="round" opacity={1 - ramp(f, T.sweep1, 30)} />
              </g>
            )}
            {REVIEWS.map((lab, k) => {
              const a = -Math.PI / 2 + (k / 6) * Math.PI * 2;
              const x = CX + Math.cos(a) * R, y = CY + Math.sin(a) * R;
              const tIn = ramp(f, T.ring + 10 + k * 8, 20, EASE.out);
              const lit = settle(f, reviewAt(k) - 8, 22, 0.35);
              // data pulse from the node into the core
              const pk = clamp01((f - reviewAt(k)) / 26);
              const px = lerp(x, CX, EASE.in(pk)), py = lerp(y, CY, EASE.in(pk));
              const lx = CX + Math.cos(a) * (R + 62), ly = CY + Math.sin(a) * (R + 62);
              return (
                <g key={lab}>
                  <circle cx={x} cy={y} r={lerp(8, 18, lit) * tIn} fill={lit > 0.01 ? WHITE[100] : BLUE[300]} />
                  {lit > 0.01 && <circle cx={x} cy={y} r={18 + lit * 16} fill="none" stroke={BLUE[200]} strokeWidth={2} opacity={1 - clamp01((f - reviewAt(k)) / 30)} />}
                  {pk > 0 && pk < 1 && <circle cx={px} cy={py} r={7} fill={WHITE[100]} />}
                  <text x={lx} y={ly + 9} textAnchor="middle" fontFamily={FONT.mono} fontSize={26} fill={lit > 0.5 ? WHITE[100] : BLUE[200]} opacity={tIn} letterSpacing="1">
                    {lab}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* the core (inside the panel once the flood has covered it) */}
          {f >= 30 && <Star3D width={W} height={H} x={sx - 540} y={sy - 960} size={size} rot={starRot(240 + f)} mix={ramp(f, 2, 26)} lift={lerp(STAR_LIFT, -0.1, ramp(f, 2, 26))} />}

          {/* footer: reviews counter */}
          <div style={{position: 'absolute', left: 72, right: 72, top: 1470, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', opacity: ramp(f, T.sweep0, 20)}}>
            <Micro color={BLUE[200]} size={24}>reviews today</Micro>
            <div style={{fontFamily: FONT.serif, fontSize: 88, color: WHITE[100], fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em'}}>
              {Math.min(6, REVIEWS.filter((_, k) => f >= reviewAt(k)).length)}
              <span style={{color: BLUE[300]}}> / 6</span>
            </div>
          </div>
          <div style={{position: 'absolute', left: 72, right: 72, top: 1580, height: 2, background: BLUE[400], transformOrigin: 'left', transform: `scaleX(${sweep})`}} />
        </div>
      </div>
      {/* continuity: while the flood is still small, the star stays above it (same place as S04's last frame) */}
      {f < 30 && <Star3D width={W} height={H} x={sx - 540} y={sy - 960} size={size} rot={starRot(240 + f)} mix={ramp(f, 2, 26)} lift={lerp(STAR_LIFT, -0.1, ramp(f, 2, 26))} />}
    </AbsoluteFill>
  );
};

export const CUES: {at: number; kind: string; note?: string}[] = [
  {at: 0, kind: 'whoosh', note: 'Blue Glow floods out of the star on the groove downbeat'},
  {at: 20, kind: 'blip', note: 'status line'},
  {at: T.ring, kind: 'draw', note: 'dur=70 clock ring draws'},
  ...REVIEWS.map((_, k) => ({at: T.ring + 10 + k * 8 + 10, kind: 'tick', note: `node ${k} appears`})),
  {at: T.sweep0, kind: 'clock_sweep', note: `dur=${T.sweep1 - T.sweep0} sweep hand`},
  ...REVIEWS.map((_, k) => ({at: Math.round(reviewAt(k)), kind: 'ping', note: `review ${REVIEWS[k]} lights`})),
  ...REVIEWS.map((_, k) => ({at: Math.round(reviewAt(k)) + 22, kind: 'blip', note: `data reaches core ${k}`})),
  {at: T.one - 2, kind: 'impact_soft', note: '"One decision."'},
  {at: T.exit + 4, kind: 'swipe', note: 'panel contracts to a card'},
  {at: T.exit + 22, kind: 'whoosh', note: 'card flies up → S06'},
];
