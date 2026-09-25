import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, ramp, settle} from '../anim';
import {HeadBar, PathS, Typed, type Cue} from '../components/S06_kit';
import {Star3D} from '../components/Star';
import {Reveal, StepHeader} from '../components/ui';
import M from '../data/market.json';
import {BLUE, C, CARD, EASE, FONT, GRAY, TURQ, WHITE, mixHex} from '../theme';
import {local, wordF} from '../timeline';

// ============================================================
// S07 · 02 Build a picture — the signal bus (film 42.0–50.0 s, 480 f)
// 18 input chips in the docs' 5 lenses pop in (counter 0→18 on "eighteen"),
// their lanes draw on and bundle into a ribbon that runs down into the
// Superstar core. Each lens lights exactly when the narrator names it and
// fires a burst of pulses that make the core breathe. Final beat: the view
// scrolls down, the core emits one output line into the "picture" panel:
// a price × OI quadrant with the last three hourly moves; `now` sits in
// price ↓ · OI ↓ → "Long unwind". Minimal text: 1–2 word tags, one mono line.
// Single turquoise element: the `now` dot.
// ============================================================

const w = (needle: string, nth = 0) => local('S07', wordF('L12', needle, nth));

const NAMED = {
  leverage: w('leverage'), // 144
  liquidations: w('liquidations'), // 194
  order: w('order'), // 258
  whales: w('wails'), // 322 (Whisper spells it "wails")
  retail: w('retail'), // 354
};
const TRAVEL = 28; // burst pulses reach the core TRAVEL frames after the word

export const T = {
  header: 2,
  cardIn: 2,
  headType: 14,
  pop0: 12, // chips pop 12 + 1.4k → last chip + counter land on "eighteen"
  eighteen: w('18'), // 35
  drawOn: 44,
  ...NAMED,
  scroll: [330, 362] as const,
  output: 382, // core emits the output line (retail burst arrives)
  panel: 400, // output reaches the picture panel
  dots: [410, 417, 424] as const, // −2h, −1h, now
  headerExit: 452,
  exit: 462,
};

// ---- layout (card-local px; content scrolls under the head) ----
const CARD_X = 72, CARD_Y = 440, CARD_W = 936, CARD_H = 1120, HEAD_H = 92;
const CX = CARD_W / 2; // 468
const LCOL = [128, 392] as const, RCOL = [544, 808] as const;
const CHIP_H = 44, PITCH = 52;
const Y_BUNDLE = 800, CORE_Y = 948, CORE_SIZE = 250;
const SCROLL = 316;
const PANEL = {x: 36, y: 1140, w: 864, h: 260};

type Lens = {name: string; side: 'L' | 'R'; y: number; chips: string[]};
const LENSES: Lens[] = [
  // the docs' five lenses, labelled with the narrator's words; 18 inputs as 1–2 word tags
  {name: 'Price', side: 'L', y: 122, chips: ['Close', 'High']},
  {name: 'Leverage', side: 'L', y: 280, chips: ['OI', 'OI delta', 'Funding', 'Next funding']},
  {name: 'Liquidations', side: 'L', y: 542, chips: ['Long pool', 'Short pool', 'Long liqs', 'Short liqs']},
  {name: 'Order flow', side: 'R', y: 122, chips: ['Buy vol', 'Sell vol', 'Bid / ask', 'CVD']},
  {name: 'Whales / retail', side: 'R', y: 384, chips: ['Whales', 'Retail', 'True retail', 'Top traders']},
];

type Chip = {k: number; label: string; lens: number; side: 'L' | 'R'; y: number; lit: number; path: PathS; lane: number};
const CHIPS: Chip[] = (() => {
  const out: Chip[] = [];
  let k = 0;
  LENSES.forEach((ln, li) =>
    ln.chips.forEach((label, ci) => {
      out.push({k, label, lens: li, side: ln.side, y: ln.y + 36 + ci * PITCH, lit: 0, path: new PathS([0, 0]), lane: 0});
      k++;
    }),
  );
  // when each chip lights (frame of the word)
  const litAt: Record<string, number> = {};
  [2, 3, 4, 5].forEach((i) => (litAt[i] = NAMED.leverage));
  [6, 7, 8, 9].forEach((i) => (litAt[i] = NAMED.liquidations));
  [10, 11, 12, 13].forEach((i) => (litAt[i] = NAMED.order));
  [14, 17].forEach((i) => (litAt[i] = NAMED.whales)); // whale–retail delta, top trader
  [15, 16, 0, 1].forEach((i) => (litAt[i] = NAMED.retail)); // retail L/S + price context complete the picture
  // lanes: 18 lanes 6px apart; left chips top→bottom take inner→outer lanes, right chips likewise (no crossings)
  const laneX = (j: number) => CX - 51 + 6 * j;
  const left = out.filter((c) => c.side === 'L');
  const right = out.filter((c) => c.side === 'R');
  left.forEach((c, i) => (c.lane = laneX(left.length - 1 - i)));
  right.forEach((c, i) => (c.lane = laneX(10 + i)));
  for (const c of out) {
    c.lit = litAt[c.k];
    const cy = c.y + CHIP_H / 2;
    const x0 = c.side === 'L' ? LCOL[1] : RCOL[0];
    const dir = c.side === 'L' ? 1 : -1;
    const p = new PathS([x0, cy]);
    p.L(c.lane - dir * 14, cy);
    p.Q([c.lane, cy], [c.lane, cy + 14]);
    p.L(c.lane, Y_BUNDLE);
    p.C([c.lane, Y_BUNDLE + 70], [CX + (c.lane - CX) * 0.12, CORE_Y - 90], [CX, CORE_Y]);
    c.path = p;
  }
  return out;
})();

const popAt = (k: number) => T.pop0 + k * 1.4;
const drawStart = (k: number) => T.drawOn + k * 2;
const DRAW_DUR = 60;
const BURSTS = [NAMED.leverage, NAMED.liquidations, NAMED.order, NAMED.whales, NAMED.retail];
const ARRIVALS = BURSTS.map((b) => b + TRAVEL);

// ---- picture data: hourly price change vs hourly OI change (last 3 hours) ----
const CAN = M.btc.last4h as number[][];
const OI = M.last4hReadings.oi_close_usd;
const PTS = [1, 2, 3].map((i) => ({
  dp: ((CAN[i][4] - CAN[i][1]) / CAN[i][1]) * 100,
  doi: ((OI[i] - OI[i - 1]) / OI[i - 1]) * 100,
  label: ['−2h', '−1h', 'now'][i - 1],
}));
const Q = {x: 64, y: 1164, w: 436, h: 212};
const QC = {x: Q.x + Q.w / 2, y: Q.y + Q.h / 2};
const qx = (dp: number) => QC.x + dp * 560;
const qy = (doi: number) => QC.y - doi * 160;

// ---- SFX cues ----
export const CUES: Cue[] = [
  {at: 18, kind: 'card_in', note: 'signal-bus card rises into place'},
  {at: T.headType, kind: 'type', note: 'dur=18 · status header'},
  {at: T.pop0, kind: 'tick_train', note: 'dur=24 · 18 chips pop in, counter 0→18'},
  {at: T.eighteen + 1, kind: 'impact_soft', note: 'counter lands on 18 ("eighteen")'},
  {at: T.drawOn, kind: 'draw', note: `dur=${34 + DRAW_DUR} · 18 lanes draw on and bundle into the core`},
  {at: T.drawOn + 64, kind: 'shimmer', note: 'idle pulses start flowing down the ribbon'},
  ...BURSTS.flatMap((b, i) => [
    {at: b, kind: 'blip', note: `lens lights: ${['positioning & leverage ("leverage")', 'forced buying & selling ("liquidations")', 'order flow ("order")', 'whales ("whales")', 'retail + price context ("retail")'][i]}`},
    {at: b + 2, kind: 'swipe', note: 'burst of pulses leaves the lit chips'},
    {at: ARRIVALS[i], kind: 'ping', note: 'burst arrives, core breathes'},
  ]),
  {at: T.scroll[1] - 6, kind: 'slide', note: 'view scrolls down to the core'},
  {at: T.output, kind: 'draw', note: 'dur=18 · core emits the output line'},
  {at: T.panel, kind: 'impact_soft', note: 'output reaches the "picture" panel (border flashes)'},
  {at: T.panel + 2, kind: 'draw', note: 'dur=16 · quadrant axes draw'},
  {at: T.panel - 4, kind: 'swipe', note: 'waiting dots collapse'},
  {at: T.dots[0], kind: 'pop', note: '−2h point'},
  {at: T.dots[1], kind: 'pop', note: '−1h point'},
  {at: T.dots[2], kind: 'blip', note: 'turquoise `now` point lands in price ↓ · OI ↓'},
  {at: T.dots[2] + 2, kind: 'lock', note: 'active quadrant latches'},
  {at: T.dots[2] + 12, kind: 'shimmer', note: '"Long unwind" rises in'},
  {at: T.headerExit + 14, kind: 'swipe', note: 'step header masks out'},
  {at: 474, kind: 'whoosh', note: 'card slides up and out'},
  {at: 478, kind: 'card_out'},
];

// ------------------------------------------------------------
const bump = (f: number, at: number, dur = 26) => {
  const t = (f - at) / dur;
  return t < 0 || t > 1 ? 0 : Math.sin(Math.PI * t) * (1 - t * 0.4);
};

export const S07: React.FC = () => {
  const f = useCurrentFrame();

  const inP = settle(f, T.cardIn, 34, 0.06);
  const outP = ramp(f, T.exit, 480 - T.exit, EASE.in);
  const drift = f / 480;
  const cardY = (1 - inP) * 320 - outP * 1560 - drift * 14;
  const cardS = 0.965 + 0.035 * inP + drift * 0.016;
  const scroll = ramp(f, T.scroll[0], T.scroll[1] - T.scroll[0], EASE.inOut) * SCROLL;

  const popped = CHIPS.filter((c) => f >= popAt(c.k)).length;
  const breath = Math.max(...ARRIVALS.map((a, i) => bump(f, a, i === 4 ? 34 : 26) * (i === 4 ? 1.3 : 1)));
  const coreScale = (1 + 0.018 * Math.sin((f / 96) * Math.PI * 2)) * (1 + 0.075 * breath) * (0.6 + 0.4 * settle(f, 26, 30, 0.12));
  const coreIn = ramp(f, 20, 24, EASE.out);

  const outLine = ramp(f, T.output, 18, EASE.sys);
  const panelHit = bump(f, T.panel, 22);
  const axesP = ramp(f, T.panel + 2, 16, EASE.sys);

  return (
    <AbsoluteFill>
      <StepHeader n="02" title="Build a picture" start={T.header} exit={T.headerExit} />

      <div
        style={{
          position: 'absolute',
          left: CARD_X,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          transform: `translateY(${cardY}px) scale(${cardS})`,
          transformOrigin: '50% 40%',
        }}
      >
        <div style={{position: 'absolute', inset: 0, borderRadius: CARD.radius, border: CARD.border, background: C.card, overflow: 'hidden', boxShadow: CARD.shadow}}>
          {/* scrolling content, clipped under the head */}
          <div style={{position: 'absolute', left: 0, top: HEAD_H, width: CARD_W, height: CARD_H - HEAD_H, overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: -HEAD_H, width: CARD_W, height: 1500, transform: `translateY(${-scroll}px)`}}>
              {/* lenses + chips */}
              {LENSES.map((ln, li) => {
                const first = CHIPS.find((c) => c.lens === li)!;
                const lightAt = Math.min(...CHIPS.filter((c) => c.lens === li).map((c) => c.lit));
                const named = ramp(f, lightAt - 4, 8, EASE.out);
                const x = ln.side === 'L' ? LCOL[0] : RCOL[0];
                return (
                  <div
                    key={ln.name}
                    style={{
                      position: 'absolute',
                      left: x + 4,
                      top: ln.y,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontFamily: FONT.mono,
                      fontSize: 22,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: mixHex(GRAY[800], C.ink, named),
                      whiteSpace: 'nowrap',
                      height: 28,
                    }}
                  >
                    <span style={{width: 10, height: 10, borderRadius: 2, background: BLUE[500], transform: `scale(${named})`, marginLeft: -2 + (1 - named) * -10, flex: 'none'}} />
                    <Typed text={ln.name} start={popAt(first.k) - 6} cps={1.6} />
                  </div>
                );
              })}
              {CHIPS.map((c) => {
                const p = settle(f, popAt(c.k), 16, 0.18);
                const a = ramp(f, c.lit - 5, 8, EASE.out);
                const hit = bump(f, c.lit, 16);
                const x = c.side === 'L' ? LCOL[0] : RCOL[0];
                return (
                  <div
                    key={c.k}
                    style={{
                      position: 'absolute',
                      left: x,
                      top: c.y,
                      width: LCOL[1] - LCOL[0],
                      height: CHIP_H,
                      borderRadius: 999,
                      background: mixHex(GRAY[400], BLUE[500], a),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '0 24px',
                      boxSizing: 'border-box',
                      fontFamily: FONT.mono,
                      fontSize: 24,
                      whiteSpace: 'nowrap',
                      transform: `scale(${p * (1 + 0.025 * hit)})`,
                      transformOrigin: c.side === 'L' ? '100% 50%' : '0% 50%',
                    }}
                  >
                    <span style={{color: mixHex(C.ink, WHITE[100], a)}}>{c.label}</span>
                  </div>
                );
              })}

              {/* counter */}
              <div style={{position: 'absolute', left: RCOL[0] + 4, top: 646, display: 'flex', alignItems: 'baseline', gap: 18}}>
                <div style={{overflow: 'hidden', paddingBottom: 6}}>
                  <div style={{fontFamily: FONT.serif, fontSize: 124, lineHeight: 1, color: BLUE[500], letterSpacing: '-0.02em', minWidth: 140, fontVariantNumeric: 'tabular-nums', transform: `translateY(${(1 - ramp(f, T.pop0 - 4, 16, EASE.out)) * 110}%) scale(${1 + 0.06 * bump(f, T.eighteen + 1, 16)})`, transformOrigin: '0% 80%'}}>
                    {popped}
                  </div>
                </div>
                <div style={{fontFamily: FONT.mono, fontSize: 24, color: C.mute, lineHeight: 1.3}}>
                  <Typed text="signals" start={T.pop0 + 8} cps={1} />
                </div>
              </div>

              {/* lanes, pulses, core rings, output line */}
              <svg width={CARD_W} height={1500} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <defs>
                  <filter id="s07blur" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation={1.6} />
                  </filter>
                </defs>
                {/* core orbit ring + pings (Blue ramp stepping toward white) */}
                <circle cx={CX} cy={CORE_Y} r={168 * coreIn} fill="none" stroke={GRAY[600]} strokeWidth={2.5} strokeDasharray="2 12" strokeDashoffset={-f * 0.6} strokeLinecap="round" />
                {ARRIVALS.map((a, i) => {
                  const t = clamp01((f - a) / 30);
                  if (f < a || t >= 1) return null;
                  return <circle key={i} cx={CX} cy={CORE_Y} r={140 + t * (i === 4 ? 120 : 70)} fill="none" stroke={mixHex(BLUE[400], WHITE[100], t)} strokeWidth={3 * (1 - t) + 1} />;
                })}
                {CHIPS.map((c) => {
                  const p = ramp(f, drawStart(c.k), DRAW_DUR, EASE.sys);
                  if (p <= 0) return null;
                  const a = ramp(f, c.lit - 2, 10, EASE.out);
                  return (
                    <path
                      key={c.k}
                      d={c.path.d}
                      fill="none"
                      stroke={mixHex(GRAY[600], BLUE[500], a)}
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeDasharray={c.path.len}
                      strokeDashoffset={c.path.len * (1 - p)}
                    />
                  );
                })}
                {/* ports */}
                {CHIPS.map((c) => {
                  const p = ramp(f, drawStart(c.k), 8, EASE.out);
                  if (p <= 0) return null;
                  const a = ramp(f, c.lit - 2, 10, EASE.out);
                  const x0 = c.side === 'L' ? LCOL[1] : RCOL[0];
                  return <circle key={c.k} cx={x0} cy={c.y + CHIP_H / 2} r={6 * p} fill={WHITE[100]} stroke={mixHex(GRAY[700], BLUE[500], a)} strokeWidth={2.5} />;
                })}
                {/* idle pulses (2 per lane) */}
                <g filter="url(#s07blur)">
                  {CHIPS.flatMap((c) => {
                    const start = drawStart(c.k) + DRAW_DUR;
                    const lit = f >= c.lit ? 1 : 0;
                    return [0, 1].map((n) => {
                      const P = 150;
                      const t = f - start - ((c.k * 23 + n * 75) % P);
                      if (t < 0) return null;
                      const [x, y] = c.path.at((t % P) / P);
                      return <circle key={`${c.k}-${n}`} cx={x} cy={y} r={lit ? 5.5 : 4.5} fill={lit ? BLUE[500] : BLUE[400]} />;
                    });
                  })}
                  {/* bursts on naming */}
                  {CHIPS.flatMap((c) =>
                    [0, 1, 2].map((n) => {
                      const u = ramp(f, c.lit + n * 6, TRAVEL - n * 4, EASE.cubic);
                      if (u <= 0 || u >= 1) return null;
                      const [x, y] = c.path.at(u);
                      return <circle key={`b${c.k}-${n}`} cx={x} cy={y} r={7} fill={BLUE[500]} />;
                    }),
                  )}
                  {/* output pulse */}
                  {(() => {
                    const u = ramp(f, T.output + 8, 16, EASE.cubic);
                    if (u <= 0 || u >= 1) return null;
                    return <circle cx={CX} cy={CORE_Y + 110 + u * (PANEL.y - CORE_Y - 110)} r={7} fill={BLUE[500]} />;
                  })()}
                </g>
                {/* output line */}
                {outLine > 0 ? <line x1={CX} x2={CX} y1={CORE_Y + 100} y2={CORE_Y + 100 + (PANEL.y - CORE_Y - 100) * outLine} stroke={BLUE[500]} strokeWidth={3} strokeLinecap="round" /> : null}
              </svg>

              {/* core */}
              <div
                style={{
                  position: 'absolute',
                  left: CX - 240,
                  top: CORE_Y - 240,
                  width: 480,
                  height: 480,
                  transform: `scale(${coreScale * coreIn})`,
                }}
              >
                <Star3D width={480} height={480} size={CORE_SIZE} rot={[0.45 + f * 0.0035, 0.25 + f * 0.009, 0.15]} lift={-0.14 + 0.2 * breath} />
              </div>

              {/* picture panel */}
              <div
                style={{
                  position: 'absolute',
                  left: PANEL.x,
                  top: PANEL.y,
                  width: PANEL.w,
                  height: PANEL.h,
                  borderRadius: 28,
                  border: `${2 + 2 * panelHit}px solid ${mixHex(GRAY[600], BLUE[500], Math.min(1, panelHit * 1.4))}`,
                  background: C.card,
                  transform: `scale(${1 + 0.012 * panelHit})`,
                  boxSizing: 'border-box',
                }}
              />
              <Picture f={f} axesP={axesP} />
            </div>
          </div>

          <div style={{position: 'absolute', left: 0, top: 0, width: CARD_W}}>
            <HeadBar left={<Typed text="superstar · signal bus" start={T.headType} cps={1.6} />} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------
const Picture: React.FC<{f: number; axesP: number}> = ({f, axesP}) => {
  const cell = ramp(f, T.dots[2] - 2, 10, EASE.out);
  const trail = PTS.map((p) => [qx(p.dp), qy(p.doi)] as [number, number]);
  const seg1 = ramp(f, T.dots[0] + 2, 8, EASE.sys);
  const seg2 = ramp(f, T.dots[1] + 2, 9, EASE.sys);
  const lab = (t: string, x: number, y: number, start: number, align: 'left' | 'right' = 'left', color: string = C.mute2) => (
    <div style={{position: 'absolute', left: align === 'left' ? x : undefined, right: align === 'right' ? CARD_W - x : undefined, top: y, fontFamily: FONT.mono, fontSize: 22, color, whiteSpace: 'nowrap', lineHeight: '26px'}}>
      <Typed text={t} start={start} cps={1.2} />
    </div>
  );
  return (
    <>
      <svg width={CARD_W} height={1500} style={{position: 'absolute', left: 0, top: 0}}>
        {/* active quadrant: price ↓ · OI ↓ */}
        <rect x={Q.x} y={QC.y} width={(Q.w / 2) * cell} height={Q.h / 2} rx={14} fill={BLUE[100]} />
        <rect x={Q.x} y={Q.y} width={Q.w} height={Q.h} rx={16} fill="none" stroke={GRAY[400]} strokeWidth={2} />
        {/* idle cross (placeholder) then the live axes draw over it */}
        <line x1={Q.x} x2={Q.x + Q.w} y1={QC.y} y2={QC.y} stroke={GRAY[400]} strokeWidth={2} strokeDasharray="4 8" />
        <line x1={QC.x} x2={QC.x} y1={Q.y} y2={Q.y + Q.h} stroke={GRAY[400]} strokeWidth={2} strokeDasharray="4 8" />
        <line x1={QC.x - (Q.w / 2) * axesP} x2={QC.x + (Q.w / 2) * axesP} y1={QC.y} y2={QC.y} stroke={GRAY[800]} strokeWidth={2.5} />
        <line x1={QC.x} x2={QC.x} y1={QC.y - (Q.h / 2) * axesP} y2={QC.y + (Q.h / 2) * axesP} stroke={GRAY[800]} strokeWidth={2.5} />
        {/* trail −2h → −1h → now */}
        {f >= T.dots[0] ? (
          <line x1={trail[0][0]} y1={trail[0][1]} x2={trail[0][0] + (trail[1][0] - trail[0][0]) * seg1} y2={trail[0][1] + (trail[1][1] - trail[0][1]) * seg1} stroke={BLUE[400]} strokeWidth={2.5} strokeDasharray="5 6" />
        ) : null}
        {f >= T.dots[1] ? (
          <line x1={trail[1][0]} y1={trail[1][1]} x2={trail[1][0] + (trail[2][0] - trail[1][0]) * seg2} y2={trail[1][1] + (trail[2][1] - trail[1][1]) * seg2} stroke={BLUE[400]} strokeWidth={2.5} strokeDasharray="5 6" />
        ) : null}
        {PTS.map((p, i) => {
          const s = settle(f, T.dots[i], 14, 0.4);
          if (s <= 0) return null;
          const isNow = i === 2;
          return <circle key={i} cx={trail[i][0]} cy={trail[i][1]} r={(isNow ? 12 : 7) * s} fill={isNow ? TURQ[500] : BLUE[400]} stroke={isNow ? C.ink : 'none'} strokeWidth={isNow ? 2 : 0} />;
        })}
        {/* output port on the panel */}
        <circle cx={CX} cy={PANEL.y} r={7} fill={BLUE[500]} />
      </svg>
      {/* two axis words only */}
      {lab('price →', Q.x + Q.w - 12, QC.y + 8, 250, 'right')}
      {lab('oi ↑', QC.x + 12, Q.y + 8, 256)}
      {/* readout: a waiting pulse, then the two-word state */}
      {[0, 1, 2].map((k) => {
        const gone = ramp(f, T.panel - 8, 8, EASE.in);
        if (gone >= 1) return null;
        const b = Math.max(0, Math.sin(((f - k * 8) / 48) * Math.PI * 2));
        return <div key={k} style={{position: 'absolute', left: 584 + k * 34, top: 1262 - b * 10, width: 16, height: 16, borderRadius: 8, background: mixHex(GRAY[600], BLUE[400], b), transform: `scale(${1 - gone})`}} />;
      })}
      <div style={{position: 'absolute', left: 578, top: 1190}}>
        <Reveal text={'Long\nunwind'} start={T.dots[2] + 2} size={76} family="serif" color={BLUE[500]} lineHeight={1.0} stagger={5} dur={20} />
      </div>
    </>
  );
};
