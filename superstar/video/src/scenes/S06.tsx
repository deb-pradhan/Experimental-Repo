import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, mapr, ramp, settle} from '../anim';
import {HeadBar, PathS, Typed, typeDur, usdCompact, type Cue} from '../components/S06_kit';
import {PulseDot, StepHeader} from '../components/ui';
import M from '../data/market.json';
import {BLUE, C, CARD, EASE, FONT, GRAY, WHITE, mixHex} from '../theme';
import {local, wordF} from '../timeline';

// ============================================================
// S06 · 01 Read the last four hours (film 34.0–42.0 s, 480 f)
// A review card lays out the last four hourly prints: a real 1h BTC
// candle per column (−3h −2h −1h now), then its readings type in
// beneath. A Blue Glow scan bar sweeps each column as it fills, then
// each input row is read across time and its trend sparkline draws.
// Single turquoise element: the live dot on the `now` column.
// ============================================================

const w = (needle: string, nth = 0) => local('S06', wordF('L11', needle, nth));

const FILL = [w('last'), w('hours'), w('hour', 1), w('hour', 2)] as const; // candle landings: "last" "hours," "hour" "hour,"
const FORM = 18; // candle forms over the 18 f before it lands

export const T = {
  header: 2,
  cardIn: 2,
  cardLand: 20,
  headType: 14,
  build: 12, // grid, labels and axis build as the card lands
  reads: w('reads'), // 31 — scan bar arms
  four: w('four'), // 98
  fill: FILL,
  rowRead: [226, 246, 266, 286, 306, 326],
  verify: 372, // final verification sweep across all four columns
  verifyEnd: 424,
  done: 428, // "read complete" latch
  headerExit: 452,
  exit: 462,
} as const;

// ---- layout (card-local px) ----
const CARD_X = 72, CARD_Y = 440, CARD_W = 936, CARD_H = 1128;
const PAD = 36;
const COLS_X = PAD, COL_W = 180, GUT_X = 772, GUT_R = CARD_W - PAD; // gutter 772..900
const colL = (i: number) => COLS_X + i * COL_W;
const colC = (i: number) => colL(i) + COL_W / 2;
const HDR_Y = 112;
const CH_T = 214, CH_B = 530;
const P_MIN = 83560, P_MAX = 84200;
const py = (p: number) => CH_B - ((p - P_MIN) / (P_MAX - P_MIN)) * (CH_B - CH_T);
const TICKS = [83600, 83800, 84000, 84200];
const CHG_Y = 546;
const DIV_Y = 588;
const ROW_Y = 606, RH = 70;
const BAND_T = 100, BAND_B = ROW_Y + 6 * RH - 2;
const FOOT_Y = 1036;

// ---- data ----
const CANDLES = M.btc.last4h as number[][]; // [t,o,h,l,c] oldest→newest
const R = M.last4hReadings;
const LABELS = ['−3h', '−2h', '−1h', 'now'];
const TIMES = ['18:00', '19:00', '20:00', '21:00']; // close time of each hourly print (review at 21:00 utc)
const liq = (v: number) => (v < 1000 ? `$${Math.round(v)}` : `$${Math.round(v / 1000)}K`);
const ROWS: {label: string; vals: string[]; series: number[]}[] = [
  {label: 'Close', vals: CANDLES.map((c) => '$' + c[4].toLocaleString('en-US')), series: CANDLES.map((c) => c[4])},
  {label: 'Open interest', vals: R.oi_close_usd.map(usdCompact), series: R.oi_close_usd},
  {label: 'Liqs long / short', vals: R.liq_long_usd.map((v, i) => `${liq(v)}/${liq(R.liq_short_usd[i])}`), series: R.liq_long_usd.map((v, i) => v + R.liq_short_usd[i])},
  {label: 'Funding', vals: R.funding_agg.map((v) => v.toFixed(4)), series: R.funding_agg},
  {label: 'Whale–retail delta', vals: R.whale_retail_delta.map((v) => v.toFixed(2)), series: R.whale_retail_delta},
  {label: 'True retail long', vals: R.true_retail_long_pct.map((v) => v.toFixed(2) + '%'), series: R.true_retail_long_pct},
];
const CHG = CANDLES.map((c) => ((c[4] - c[1]) / c[1]) * 100);
const LAST = CANDLES[3][4];

// value typing schedule: column i, row j
const VAL_CPS = 0.9;
const valStart = (i: number, j: number) => FILL[i] + 4 + j * 5;

// scan-bar x as a function of frame (sweeps each column while its candle forms)
const SWEEP = (i: number) => [FILL[i] - FORM - 2, FILL[i] + 6] as const;
const scanX = (f: number) => {
  if (f >= T.verify) return colL(0) + ramp(f, T.verify, T.verifyEnd - T.verify, EASE.cubic) * 4 * COL_W;
  for (let i = 3; i >= 0; i--) {
    const [a, b] = SWEEP(i);
    if (f >= a) return colL(i) + ramp(f, a, b - a, EASE.cubic) * COL_W;
  }
  return colL(0);
};

// ---- SFX cues (local frames, at the transient) ----
export const CUES: Cue[] = [
  {at: 18, kind: 'card_in', note: 'review card rises into place'},
  {at: T.headType, kind: 'type', note: `dur=${typeDur('superstar · review 21:00 utc', 1.6)} · status header`},
  {at: T.build, kind: 'draw', note: 'dur=40 · price grid, axis and table rules draw on'},
  ...[0, 1, 2, 3].map((i) => ({at: T.build + 12 + i * 4, kind: 'tick', note: `column label ${LABELS[i]} pops`})),
  {at: T.build + 26, kind: 'pop', note: 'turquoise live dot on `now`'},
  {at: T.reads, kind: 'swipe', note: 'scan bar arms ("reads")'},
  ...[0, 1, 2, 3].flatMap((i) => [
    {at: SWEEP(i)[0], kind: 'scan', note: `dur=${SWEEP(i)[1] - SWEEP(i)[0]} · scan bar sweeps ${LABELS[i]}`},
    {at: FILL[i], kind: 'pop', note: `candle ${LABELS[i]} lands (${['"last"', '"hours"', '"hour"', '"hour,"'][i]})`},
    {at: FILL[i] + 1, kind: 'tick', note: `footer segment ${i + 1}/4 fills`},
    {at: valStart(i, 0), kind: 'type', note: `dur=${valStart(i, 5) + 12 - valStart(i, 0)} · ${LABELS[i]} readings type in`},
  ]),
  {at: FILL[3] + 6, kind: 'blip', note: 'last-price tag 83,859 latches on axis'},
  {at: FILL[3] + 12, kind: 'swipe', note: 'scan bar retracts'},
  ...T.rowRead.flatMap((r, j) => [
    {at: r, kind: 'swipe', note: `row read across time: ${ROWS[j].label}`},
    {at: r + 10, kind: 'draw', note: `dur=18 · trend sparkline ${ROWS[j].label}`},
    {at: r + 28, kind: 'blip', note: 'sparkline end point'},
  ]),
  {at: T.verify, kind: 'scan', note: `dur=${T.verifyEnd - T.verify} · verification sweep across all four hours`},
  {at: T.done, kind: 'lock', note: 'footer latches "read complete"'},
  {at: T.headerExit + 14, kind: 'swipe', note: 'step header masks out'},
  {at: 474, kind: 'whoosh', note: 'card slides up and out'},
  {at: 478, kind: 'card_out'},
];

// ------------------------------------------------------------
const Candle: React.FC<{i: number; f: number}> = ({i, f}) => {
  const [, o, h, l, c] = CANDLES[i];
  const p = ramp(f, FILL[i] - FORM, FORM, EASE.sys);
  if (p <= 0) return null;
  const up = c >= o;
  const col = up ? BLUE[500] : GRAY[800];
  const bump = Math.sin(Math.PI * clamp01((f - FILL[i]) / 12)) * (f >= FILL[i] ? 1 : 0);
  const bw = 92 * (1 + 0.1 * bump);
  const cx = colC(i);
  const yo = py(o), yh = py(o + (h - o) * p), yl = py(o - (o - l) * p), yc = py(o + (c - o) * p);
  const top = Math.min(yo, yc), hgt = Math.max(3, Math.abs(yc - yo));
  return (
    <g>
      <line x1={cx} x2={cx} y1={yh} y2={yl} stroke={col} strokeWidth={4} strokeLinecap="round" />
      <rect x={cx - bw / 2} y={top} width={bw} height={hgt} rx={6} fill={col} />
    </g>
  );
};

const Sparkline: React.FC<{j: number; f: number}> = ({j, f}) => {
  const s = ROWS[j].series;
  const lo = Math.min(...s), hi = Math.max(...s);
  const y0 = ROW_Y + j * RH + 24, y1 = y0 + 34;
  const pts = s.map((v, k) => [GUT_X + 10 + (k / 3) * 104, hi === lo ? (y0 + y1) / 2 : mapr(v, lo, hi, y1, y0)] as [number, number]);
  const path = new PathS(pts[0]);
  pts.slice(1).forEach((q) => path.L(q[0], q[1]));
  const r0 = T.rowRead[j];
  const p = ramp(f, r0 + 10, 18, EASE.sys);
  if (p <= 0) return null;
  const endPop = settle(f, r0 + 26, 14, 0.5);
  const [ex, ey] = path.at(p);
  return (
    <g>
      <path d={path.d} fill="none" stroke={BLUE[500]} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={path.len} strokeDashoffset={path.len * (1 - p)} />
      {pts.slice(0, 3).map((q, k) => (k / 3 <= p ? <circle key={k} cx={q[0]} cy={q[1]} r={4} fill={GRAY[700]} /> : null))}
      <circle cx={ex} cy={ey} r={6 + 3 * Math.max(0, endPop - 1) * 4} fill={BLUE[500]} />
    </g>
  );
};

// ------------------------------------------------------------
export const S06: React.FC = () => {
  const f = useCurrentFrame();

  // card motion: rise in with one overshoot, drift, slide up/out
  const inP = settle(f, T.cardIn, 34, 0.06);
  const outP = ramp(f, T.exit, 480 - T.exit, EASE.in);
  const drift = f / 480;
  const cardY = (1 - inP) * 320 - outP * 1560 - drift * 16;
  const cardS = 0.965 + 0.035 * inP + drift * 0.018;

  // scan bar
  const sx = scanX(f);
  const armed = ramp(f, T.reads, 16, EASE.out);
  const retract = ramp(f, FILL[3] + 6, 12, EASE.in) * (f < T.verify ? 1 : 0);
  const verifyIn = ramp(f, T.verify - 8, 8, EASE.out);
  const verifyOut = ramp(f, T.verifyEnd, 10, EASE.in);
  const barVis = f < T.verify ? armed * (1 - retract) : verifyIn * (1 - verifyOut);

  // trailing band behind the bar (Blue 100), wipes off after each sweep
  let bandL = 0, bandR = 0;
  if (f >= T.verify - 8) {
    bandL = colL(0) + ramp(f, T.verify + 14, T.verifyEnd - T.verify, EASE.cubic) * 4 * COL_W;
    bandR = sx;
  } else {
    for (let i = 3; i >= 0; i--) {
      const [a, b] = SWEEP(i);
      if (f >= a) {
        bandL = colL(i) + ramp(f, b + 2, 16, EASE.in) * COL_W;
        bandR = sx;
        break;
      }
    }
  }

  const gridP = ramp(f, T.build, 40, EASE.sys);
  const tagP = settle(f, FILL[3] + 2, 14, 0.25);
  const lastLineP = ramp(f, FILL[3] + 2, 14, EASE.out);

  // footer state
  const filled = FILL.filter((t) => f >= t).length;
  const doneP = ramp(f, T.done - 8, 10, EASE.out);

  return (
    <AbsoluteFill>
      <StepHeader n="01" title="Read the last four hours" start={T.header} exit={T.headerExit} />

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
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: CARD.radius,
            border: CARD.border,
            background: C.card,
            overflow: 'hidden',
            boxShadow: CARD.shadow,
          }}
        >
          <HeadBar
            left={<Typed text="superstar · review 21:00 utc" start={T.headType} cps={1.6} />}
            right={<Typed text="btc-perp · 4 × 1h" start={T.headType + 14} cps={1.4} />}
          />

          <svg width={CARD_W} height={CARD_H} style={{position: 'absolute', left: 0, top: 0}}>
            {/* scan band */}
            {bandR > bandL + 0.5 ? <rect x={bandL} y={BAND_T} width={bandR - bandL} height={BAND_B - BAND_T} fill={BLUE[100]} /> : null}
            {/* row read band (second half): sweeps each row across the four hours */}
            {T.rowRead.map((r, j) => {
              const a = ramp(f, r - 4, 18, EASE.cubic);
              const b = ramp(f, r + 16, 16, EASE.in);
              if (a <= 0 || b >= 1) return null;
              const x0 = COLS_X + b * 4 * COL_W, x1 = COLS_X + a * (GUT_R - COLS_X);
              return x1 > x0 ? <rect key={j} x={x0} y={ROW_Y + j * RH - 6} width={x1 - x0} height={RH - 4} rx={10} fill={BLUE[100]} /> : null;
            })}
            {/* column separators */}
            {[1, 2, 3].map((i) => (
              <line key={i} x1={colL(i)} x2={colL(i)} y1={CH_T - 10} y2={CH_T - 10 + (DIV_Y - CH_T + 10) * gridP} stroke={GRAY[400]} strokeWidth={2} />
            ))}
            {/* price grid */}
            {TICKS.map((p, k) => {
              const g = ramp(f, T.build + k * 5, 36, EASE.sys);
              return <line key={p} x1={COLS_X} x2={COLS_X + (GUT_X - 8 - COLS_X) * g} y1={py(p)} y2={py(p)} stroke={GRAY[400]} strokeWidth={2} strokeDasharray="6 8" />;
            })}
            {/* last price line */}
            {lastLineP > 0 ? (
              <line x1={colC(3) + 50} x2={colC(3) + 50 + (GUT_X - colC(3) - 50) * lastLineP} y1={py(LAST)} y2={py(LAST)} stroke={GRAY[700]} strokeWidth={2} strokeDasharray="4 6" />
            ) : null}
            {[0, 1, 2, 3].map((i) => (
              <Candle key={i} i={i} f={f} />
            ))}
            {/* divider between chart and readings */}
            <line x1={COLS_X} x2={COLS_X + (GUT_R - COLS_X) * gridP} y1={DIV_Y} y2={DIV_Y} stroke={GRAY[600]} strokeWidth={2} />
            {/* row hairlines */}
            {ROWS.slice(1).map((_, j) => (
              <line key={j} x1={COLS_X} x2={COLS_X + (GUT_R - COLS_X) * ramp(f, T.build + 10 + j * 4, 40, EASE.sys)} y1={ROW_Y + (j + 1) * RH - 9} y2={ROW_Y + (j + 1) * RH - 9} stroke={C.hair} strokeWidth={2} />
            ))}
            {ROWS.map((_, j) => (
              <Sparkline key={j} j={j} f={f} />
            ))}
            {/* scan bar */}
            {barVis > 0.01 ? (
              <g>
                <rect x={sx - 2} y={BAND_T + (1 - barVis) * (BAND_B - BAND_T) * 0.5} width={4} height={(BAND_B - BAND_T) * barVis} fill={BLUE[500]} />
                <rect x={sx - 9} y={BAND_T - 4 + (1 - barVis) * 20} width={18} height={18 * barVis} rx={4} fill={BLUE[500]} />
                <rect x={sx - 9} y={BAND_B - 14} width={18} height={18 * barVis} rx={4} fill={BLUE[500]} />
              </g>
            ) : null}
          </svg>

          {/* column headers */}
          {LABELS.map((lab, i) => {
            const pop = settle(f, T.build + 4 + i * 4, 18, 0.15);
            const lit = ramp(f, FILL[i] - FORM, 8, EASE.out);
            const bump = Math.sin(Math.PI * clamp01((f - FILL[i]) / 12)) * (f >= FILL[i] ? 1 : 0);
            return (
              <div key={lab} style={{position: 'absolute', left: colL(i), width: COL_W, top: HDR_Y, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{position: 'relative', transform: `translateY(${(1 - pop) * 24}px) scale(${(0.8 + 0.2 * pop) * (1 + 0.06 * bump)})`, opacity: pop > 0 ? 1 : 0}}>
                  {i === 3 ? (
                    <div style={{position: 'absolute', left: -28, top: 17}}>
                      <PulseDot size={14} />
                    </div>
                  ) : null}
                  <div
                    style={{
                      padding: '9px 22px',
                      borderRadius: 999,
                      background: mixHex(GRAY[400], BLUE[500], lit),
                      color: mixHex(GRAY[900], WHITE[100], lit),
                      fontFamily: FONT.mono,
                      fontSize: 27,
                      fontWeight: 500,
                      letterSpacing: '.04em',
                      lineHeight: 1.2,
                    }}
                  >
                    {lab}
                  </div>
                </div>
                <div style={{marginTop: 8, fontFamily: FONT.mono, fontSize: 22, color: C.mute2, letterSpacing: '.04em'}}>
                  <Typed text={TIMES[i]} start={T.build + 10 + i * 4} cps={1} />
                </div>
              </div>
            );
          })}

          {/* price axis (gutter) */}
          <div style={{position: 'absolute', left: GUT_X, width: GUT_R - GUT_X, top: HDR_Y + 12, textAlign: 'right', fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.16em', color: C.mute3}}>
            <Typed text="USD" start={T.build + 18} cps={0.5} />
          </div>
          {TICKS.map((p, k) => {
            // the last-price tag covers the nearest tick label: it slides away under the tag
            const hide = Math.abs(py(p) - py(LAST)) < 40 ? ramp(f, FILL[3], 10, EASE.in) : 0;
            return (
              <div key={p} style={{position: 'absolute', left: GUT_X, width: GUT_R - GUT_X, top: py(p) - 14, textAlign: 'right', fontFamily: FONT.mono, fontSize: 22, color: C.mute2, lineHeight: '28px', transform: `translateX(${hide * 130}px)`}}>
                <Typed text={p.toLocaleString('en-US')} start={T.build + 6 + k * 5} cps={0.8} />
              </div>
            );
          })}
          {tagP > 0 ? (
            <div
              style={{
                position: 'absolute',
                left: GUT_X - 4,
                width: GUT_R - GUT_X + 12,
                top: py(LAST) - 19,
                height: 38,
                borderRadius: 10,
                background: BLUE[500],
                border: `4px solid ${WHITE[100]}`,
                color: WHITE[100],
                fontFamily: FONT.mono,
                fontSize: 22,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scaleX(${tagP})`,
                transformOrigin: '0% 50%',
              }}
            >
              {LAST.toLocaleString('en-US')}
            </div>
          ) : null}

          {/* per-hour change under each candle */}
          {CHG.map((v, i) => (
            <div key={i} style={{position: 'absolute', left: colL(i), width: COL_W, top: CHG_Y, textAlign: 'center', fontFamily: FONT.mono, fontSize: 23, color: v >= 0 ? BLUE[500] : GRAY[900], fontWeight: 500}}>
              <Typed text={(v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2) + '%'} start={FILL[i] + 2} cps={0.8} />
            </div>
          ))}

          {/* readings table */}
          {ROWS.map((row, j) => {
            const read = ramp(f, T.rowRead[j] - 4, 10, EASE.out);
            return (
              <React.Fragment key={row.label}>
                <div style={{position: 'absolute', left: COLS_X + 4, top: ROW_Y + j * RH - 2, fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.14em', textTransform: 'uppercase', color: mixHex(GRAY[800], C.ink, read), whiteSpace: 'nowrap'}}>
                  <Typed text={row.label} start={T.build + 14 + j * 4} cps={1.4} />
                </div>
                {row.vals.map((v, i) => (
                  <div key={i} style={{position: 'absolute', left: colL(i), width: COL_W, top: ROW_Y + j * RH + 25, textAlign: 'center', fontFamily: FONT.mono, fontSize: 27, color: C.ink, lineHeight: '32px', letterSpacing: '-0.01em'}}>
                    <Typed text={v} start={valStart(i, j)} cps={VAL_CPS} />
                  </div>
                ))}
              </React.Fragment>
            );
          })}
          <div style={{position: 'absolute', left: GUT_X, width: GUT_R - GUT_X, top: ROW_Y - 2, textAlign: 'right', fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.14em', color: C.mute3}}>
            <Typed text="TREND" start={T.rowRead[0] - 10} cps={0.6} />
          </div>

          {/* footer band: Blue Glow status */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: FOOT_Y,
              bottom: 0,
              background: BLUE[500],
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${PAD + 8}px`,
              gap: 22,
              fontFamily: FONT.mono,
              fontSize: 24,
              color: WHITE[100],
              letterSpacing: '.02em',
            }}
          >
            <div style={{position: 'relative', height: 34, flex: 1, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${-doneP * 110}%)`, whiteSpace: 'nowrap', lineHeight: '34px'}}>
                <Typed text="› reading hour by hour" start={T.build + 16} cps={1.2} />
              </div>
              <div style={{position: 'absolute', left: 0, top: 0, transform: `translateY(${(1 - doneP) * 110}%)`, whiteSpace: 'nowrap', lineHeight: '34px', display: 'flex', alignItems: 'center', gap: 14}}>
                <svg width={26} height={26} viewBox="0 0 26 26">
                  <path d="M4 13.5 L10.5 20 L22 6.5" fill="none" stroke={WHITE[100]} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - ramp(f, T.done - 2, 10, EASE.out))} />
                </svg>
                read complete
              </div>
            </div>
            <div style={{display: 'flex', gap: 10}}>
              {[0, 1, 2, 3].map((i) => {
                const k = ramp(f, FILL[i] - 4, 8, EASE.out);
                return <div key={i} style={{width: 46, height: 12, borderRadius: 6, background: mixHex(BLUE[400], WHITE[100], k), transform: `scaleY(${1 + 0.5 * Math.sin(Math.PI * clamp01((f - FILL[i] + 4) / 10)) * (f >= FILL[i] - 4 ? 1 : 0)})`}} />;
              })}
            </div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 104, justifyContent: 'flex-end'}}>
              <div style={{position: 'relative', height: 52, width: 30, overflow: 'hidden'}}>
                {[0, 1, 2, 3, 4].map((n) => {
                  const shownAt = n === 0 ? -999 : FILL[n - 1];
                  const nextAt = n === 4 ? 9999 : FILL[n];
                  const pin = ramp(f, shownAt - 4, 8, EASE.out);
                  const pout = ramp(f, nextAt - 4, 8, EASE.out);
                  if (pout >= 1 || (pin <= 0 && n > 0)) return null;
                  return (
                    <div key={n} style={{position: 'absolute', right: 0, top: 0, fontFamily: FONT.serif, fontSize: 48, lineHeight: '52px', transform: `translateY(${(n > 0 ? (1 - pin) * 100 : 0) - pout * 100}%)`}}>
                      {n}
                    </div>
                  );
                })}
              </div>
              <span style={{fontFamily: FONT.mono, fontSize: 24}}>/ 4 h</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

