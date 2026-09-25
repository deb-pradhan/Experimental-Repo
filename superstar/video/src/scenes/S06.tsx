import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, mapr, ramp, settle} from '../anim';
import {HeadBar, HeaderMaskOut, Typed, usdCompact, type Cue} from '../components/S06_kit';
import {PulseDot, StepHeader} from '../components/ui';
import M from '../data/market.json';
import {BLUE, C, CARD, EASE, FONT, GRAY, WHITE, mixHex} from '../theme';
import {local, wordF} from '../timeline';

// ============================================================
// S06 · 01 Read the last four hours (film 34.0–42.0 s, 480 f)
// Four hourly columns (−3h −2h −1h now) fill one by one on the words:
// a real 1h BTC candle forms under a sweeping Blue Glow scan bar, the OI
// line steps to the next hour and the liquidation twin-bars grow (long =
// Blue Glow, short = Gray 800). The Blue Glow band rolls its three big
// readings (price · OI · liqs) to each new hour. Then each strip is read
// across time, a verification sweep passes and the read latches.
// Minimal text: one mono status line, 1-word labels, key numbers only.
// Single turquoise element: the live dot on the `now` column.
// ============================================================

const w = (needle: string, nth = 0) => local('S06', wordF('L11', needle, nth));

const FILL = [w('last'), w('hours'), w('hour', 1), w('hour', 2)] as const; // candles land on "last" "hours," "hour" "hour,"
const FORM = 18; // a candle forms over the 18 f before it lands

export const T = {
  header: 2,
  cardIn: 2,
  build: 12, // grid, pills and strips build as the card lands
  reads: w('reads'), // 31 — scan bar arms
  fill: FILL,
  stripRead: [228, 262, 296] as const, // price · OI · liqs read across time
  verify: 372,
  verifyEnd: 424,
  done: 428,
  headerExit: 452,
  exit: 462,
};

// ---- layout (card-local px) ----
const CARD_X = 72, CARD_Y = 440, CARD_W = 936, CARD_H = 1128;
const PAD = 36;
const COLS_X = PAD, COL_W = 180, GUT_X = 772, GUT_R = CARD_W - PAD;
const colL = (i: number) => COLS_X + i * COL_W;
const colC = (i: number) => colL(i) + COL_W / 2;
const HDR_Y = 116;
const CH_T = 206, CH_B = 548;
const P_MIN = 83560, P_MAX = 84200;
const py = (p: number) => CH_B - ((p - P_MIN) / (P_MAX - P_MIN)) * (CH_B - CH_T);
const TICKS = [83600, 83800, 84000, 84200];
const DIV_Y = 574;
const OI_T = 590, OI_Y0 = 626, OI_Y1 = 690;
const HAIR_Y = 716;
const LQ_T = 732, LQ_BASE = 900, LQ_MAX = 140;
const BAND_Y = 936;
const SCAN_T = 104, SCAN_B = LQ_BASE + 8;

// ---- data ----
const CANDLES = M.btc.last4h as number[][]; // [t,o,h,l,c] oldest→newest
const R = M.last4hReadings;
const LABELS = ['−3h', '−2h', '−1h', 'now'];
const LAST = CANDLES[3][4];
const OI = R.oi_close_usd;
const OI_LO = Math.min(...OI), OI_HI = Math.max(...OI);
const oiY = (v: number) => mapr(v, OI_LO, OI_HI, OI_Y1, OI_Y0);
const LQL = R.liq_long_usd, LQS = R.liq_short_usd;
const LQ_TOP = Math.max(...LQL, ...LQS);
const lqH = (v: number) => Math.max(4, (v / LQ_TOP) * LQ_MAX);
const READ = [
  {label: 'PRICE', vals: CANDLES.map((c) => '$' + c[4].toLocaleString('en-US'))},
  {label: 'OI', vals: OI.map(usdCompact)},
  {label: 'LIQS', vals: LQL.map((v, i) => usdCompact(v + LQS[i]))},
];

// scan bar sweeps each column while its candle forms
const SWEEP = (i: number) => [FILL[i] - FORM - 2, FILL[i] + 6] as const;
const scanX = (f: number) => {
  if (f >= T.verify - 8) return colL(0) + ramp(f, T.verify, T.verifyEnd - T.verify, EASE.cubic) * 4 * COL_W;
  for (let i = 3; i >= 0; i--) {
    const [a, b] = SWEEP(i);
    if (f >= a) return colL(i) + ramp(f, a, b - a, EASE.cubic) * COL_W;
  }
  return colL(0);
};

// ---- SFX cues (local frames, at the transient) ----
export const CUES: Cue[] = [
  {at: 18, kind: 'card_in', note: 'review card rises into place'},
  {at: 14, kind: 'type', note: 'dur=18 · status line "superstar · review 21:00 utc"'},
  {at: T.build, kind: 'draw', note: 'dur=40 · price grid, strip rules and column dividers draw on'},
  ...[0, 1, 2, 3].map((i) => ({at: T.build + 8 + i * 4, kind: 'tick', note: `column pill ${LABELS[i]} pops`})),
  {at: T.build + 22, kind: 'pop', note: 'turquoise live dot on `now`'},
  {at: T.reads, kind: 'swipe', note: 'scan bar arms ("reads")'},
  ...[0, 1, 2, 3].flatMap((i) => [
    {at: SWEEP(i)[0], kind: 'scan', note: `dur=${SWEEP(i)[1] - SWEEP(i)[0]} · scan sweeps ${LABELS[i]}`},
    {at: FILL[i], kind: 'pop', note: `candle ${LABELS[i]} lands (${['"last"', '"hours"', '"hour"', '"hour,"'][i]})`},
    {at: FILL[i] + 2, kind: 'blip', note: `OI point ${LABELS[i]}`},
    {at: FILL[i] + 4, kind: 'tick_train', note: `dur=10 · band readings roll to ${LABELS[i]}`},
    {at: FILL[i] + 8, kind: 'tick', note: `liq bars ${LABELS[i]} grow${i === 3 ? ' (spike)' : ''}`},
  ]),
  {at: FILL[3] + 6, kind: 'blip', note: 'last-price tag 83,859 latches on the axis'},
  {at: FILL[3] + 14, kind: 'swipe', note: 'scan bar retracts'},
  ...T.stripRead.flatMap((r, j) => [
    {at: r, kind: 'swipe', note: `strip read across time · ${READ[j].label}`},
    {at: r + 16, kind: 'blip', note: `${READ[j].label} reading pulses`},
  ]),
  {at: T.verify, kind: 'scan', note: `dur=${T.verifyEnd - T.verify} · verification sweep across all four hours`},
  {at: T.done, kind: 'lock', note: 'read latches (check draws, pills + readings bump)'},
  {at: T.headerExit + 16, kind: 'swipe', note: 'step header masks out'},
  {at: 474, kind: 'whoosh', note: 'card slides up and out'},
  {at: 478, kind: 'card_out'},
];

// ------------------------------------------------------------
const bumpAt = (f: number, at: number, dur = 12) => (f >= at ? Math.sin(Math.PI * clamp01((f - at) / dur)) : 0);

const Candle: React.FC<{i: number; f: number}> = ({i, f}) => {
  const [, o, h, l, c] = CANDLES[i];
  const p = ramp(f, FILL[i] - FORM, FORM, EASE.sys);
  if (p <= 0) return null;
  const col = c >= o ? BLUE[500] : GRAY[800];
  const bw = 96 * (1 + 0.1 * bumpAt(f, FILL[i]));
  const cx = colC(i);
  const yo = py(o), yh = py(o + (h - o) * p), yl = py(o - (o - l) * p), yc = py(o + (c - o) * p);
  return (
    <g>
      <line x1={cx} x2={cx} y1={yh} y2={yl} stroke={col} strokeWidth={4} strokeLinecap="round" />
      <rect x={cx - bw / 2} y={Math.min(yo, yc)} width={bw} height={Math.max(4, Math.abs(yc - yo))} rx={6} fill={col} />
    </g>
  );
};

/** A band that sweeps left→right across a strip, then wipes off. */
const Sweep: React.FC<{f: number; at: number; y0: number; y1: number}> = ({f, at, y0, y1}) => {
  const a = ramp(f, at - 4, 18, EASE.cubic);
  const b = ramp(f, at + 16, 16, EASE.in);
  if (a <= 0 || b >= 1) return null;
  const x0 = COLS_X + b * (GUT_R - COLS_X), x1 = COLS_X + a * (GUT_R - COLS_X);
  return x1 > x0 ? <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={12} fill={BLUE[100]} /> : null;
};

/** Rolling number: shows the reading of the latest filled hour, rolling up on each fill. */
const Roll: React.FC<{vals: string[]; f: number; size: number}> = ({vals, f, size}) => {
  const idx = FILL.filter((t) => f >= t - 2).length - 1; // current hour index (−1 = none)
  return (
    <div style={{position: 'relative', height: size * 1.12, overflow: 'hidden'}}>
      {[-1, 0, 1, 2, 3].map((k) => {
        const inAt = k < 0 ? -999 : FILL[k] - 2;
        const outAt = k === 3 ? 9999 : FILL[k + 1] - 2;
        if (k < idx - 1 || k > idx) return null;
        const pin = k < 0 ? 1 : ramp(f, inAt, 10, EASE.out);
        const pout = ramp(f, outAt, 10, EASE.out);
        return (
          <div key={k} style={{position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', transform: `translateY(${(1 - pin) * 105 - pout * 105}%)`}}>
            {k < 0 ? '—' : vals[k]}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------
export const S06: React.FC = () => {
  const f = useCurrentFrame();

  const inP = settle(f, T.cardIn, 34, 0.06);
  const outP = ramp(f, T.exit, 480 - T.exit, EASE.in);
  const drift = f / 480;
  const cardY = (1 - inP) * 320 - outP * 1560 - drift * 16;
  const cardS = 0.965 + 0.035 * inP + drift * 0.018;

  // scan bar + trailing band
  const sx = scanX(f);
  const armed = ramp(f, T.reads, 14, EASE.out);
  const retract = ramp(f, FILL[3] + 8, 12, EASE.in) * (f < T.verify - 8 ? 1 : 0);
  const verifyIn = ramp(f, T.verify - 8, 8, EASE.out);
  const verifyOut = ramp(f, T.verifyEnd, 10, EASE.in);
  const barVis = f < T.verify - 8 ? armed * (1 - retract) : verifyIn * (1 - verifyOut);
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
  const doneHit = bumpAt(f, T.done, 16);
  const oiPts = OI.map((v, i) => [colC(i), oiY(v)] as [number, number]);

  return (
    <AbsoluteFill>
      <HeaderMaskOut exit={T.headerExit}>
        <StepHeader n="01" title="Read the last four hours" start={T.header} />
      </HeaderMaskOut>

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
          <HeadBar left={<Typed text="superstar · review 21:00 utc" start={14} cps={1.6} />} />

          <svg width={CARD_W} height={CARD_H} style={{position: 'absolute', left: 0, top: 0}}>
            {bandR > bandL + 0.5 ? <rect x={bandL} y={SCAN_T} width={bandR - bandL} height={SCAN_B - SCAN_T} fill={BLUE[100]} /> : null}
            <Sweep f={f} at={T.stripRead[0]} y0={CH_T - 12} y1={CH_B + 12} />
            <Sweep f={f} at={T.stripRead[1]} y0={OI_T - 8} y1={HAIR_Y - 6} />
            <Sweep f={f} at={T.stripRead[2]} y0={LQ_T - 8} y1={LQ_BASE + 12} />
            {/* column dividers */}
            {[1, 2, 3].map((i) => (
              <line key={i} x1={colL(i)} x2={colL(i)} y1={CH_T - 12} y2={CH_T - 12 + (LQ_BASE + 12 - CH_T) * gridP} stroke={GRAY[400]} strokeWidth={2} />
            ))}
            {/* price grid */}
            {TICKS.map((p, k) => {
              const g = ramp(f, T.build + k * 5, 36, EASE.sys);
              return <line key={p} x1={COLS_X} x2={COLS_X + (GUT_X - 8 - COLS_X) * g} y1={py(p)} y2={py(p)} stroke={GRAY[400]} strokeWidth={2} strokeDasharray="6 8" />;
            })}
            {lastLineP > 0 ? <line x1={colC(3) + 52} x2={colC(3) + 52 + (GUT_X - colC(3) - 52) * lastLineP} y1={py(LAST)} y2={py(LAST)} stroke={GRAY[700]} strokeWidth={2} strokeDasharray="4 6" /> : null}
            {[0, 1, 2, 3].map((i) => (
              <Candle key={i} i={i} f={f} />
            ))}
            {/* strip rules */}
            <line x1={COLS_X} x2={COLS_X + (GUT_R - COLS_X) * gridP} y1={DIV_Y} y2={DIV_Y} stroke={GRAY[600]} strokeWidth={2} />
            <line x1={COLS_X} x2={COLS_X + (GUT_R - COLS_X) * ramp(f, T.build + 6, 40, EASE.sys)} y1={HAIR_Y} y2={HAIR_Y} stroke={C.hair} strokeWidth={2} />
            <line x1={COLS_X} x2={COLS_X + (GUT_R - COLS_X) * ramp(f, T.build + 10, 40, EASE.sys)} y1={LQ_BASE} y2={LQ_BASE} stroke={GRAY[600]} strokeWidth={2} />
            {/* OI line: steps to each new hour */}
            {oiPts.slice(1).map((q, k) => {
              const p0 = oiPts[k];
              const s = ramp(f, FILL[k + 1] - 4, 12, EASE.sys);
              if (s <= 0) return null;
              return <line key={k} x1={p0[0]} y1={p0[1]} x2={p0[0] + (q[0] - p0[0]) * s} y2={p0[1] + (q[1] - p0[1]) * s} stroke={BLUE[500]} strokeWidth={4} strokeLinecap="round" />;
            })}
            {oiPts.map((q, i) => {
              const s = settle(f, FILL[i] + 2, 14, 0.5);
              if (s <= 0) return null;
              const read = bumpAt(f, T.stripRead[1] + 16, 16) + doneHit;
              return <circle key={i} cx={q[0]} cy={q[1]} r={(i === 3 ? 12 : 8) * s * (1 + 0.25 * read)} fill={i === 3 ? BLUE[500] : WHITE[100]} stroke={BLUE[500]} strokeWidth={4} />;
            })}
            {/* liquidation twin bars: long (Blue Glow) · short (Gray 800) */}
            {[0, 1, 2, 3].map((i) => {
              const g = ramp(f, FILL[i] + 2, 16, EASE.out);
              if (g <= 0) return null;
              const read = bumpAt(f, T.stripRead[2] + 16, 16) + doneHit;
              const hl = lqH(LQL[i]) * g * (1 + 0.06 * read), hs = lqH(LQS[i]) * g * (1 + 0.06 * read);
              return (
                <g key={i}>
                  <rect x={colC(i) - 44} y={LQ_BASE - hl} width={40} height={hl} rx={5} fill={BLUE[500]} />
                  <rect x={colC(i) + 4} y={LQ_BASE - hs} width={40} height={hs} rx={5} fill={GRAY[800]} />
                </g>
              );
            })}
            {/* scan bar */}
            {barVis > 0.01 ? (
              <g>
                <rect x={sx - 2} y={SCAN_T + (1 - barVis) * (SCAN_B - SCAN_T) * 0.5} width={4} height={(SCAN_B - SCAN_T) * barVis} fill={BLUE[500]} />
                <rect x={sx - 9} y={SCAN_T - 4} width={18} height={18 * barVis} rx={4} fill={BLUE[500]} />
                <rect x={sx - 9} y={SCAN_B - 14} width={18} height={18 * barVis} rx={4} fill={BLUE[500]} />
              </g>
            ) : null}
          </svg>

          {/* column pills */}
          {LABELS.map((lab, i) => {
            const pop = settle(f, T.build + 4 + i * 4, 18, 0.15);
            const lit = ramp(f, FILL[i] - FORM, 8, EASE.out);
            const b = bumpAt(f, FILL[i]) + doneHit;
            return (
              <div key={lab} style={{position: 'absolute', left: colL(i), width: COL_W, top: HDR_Y, display: 'flex', justifyContent: 'center'}}>
                <div style={{position: 'relative', transform: `translateY(${(1 - pop) * 24}px) scale(${(0.8 + 0.2 * pop) * (1 + 0.06 * b)})`, opacity: pop > 0 ? 1 : 0}}>
                  {i === 3 ? (
                    <div style={{position: 'absolute', left: -30, top: 19}}>
                      <PulseDot size={14} />
                    </div>
                  ) : null}
                  <div
                    style={{
                      padding: '10px 24px',
                      borderRadius: 999,
                      background: mixHex(GRAY[400], BLUE[500], lit),
                      color: mixHex(GRAY[900], WHITE[100], lit),
                      fontFamily: FONT.mono,
                      fontSize: 28,
                      fontWeight: 500,
                      letterSpacing: '.04em',
                      lineHeight: 1.2,
                    }}
                  >
                    {lab}
                  </div>
                </div>
              </div>
            );
          })}

          {/* price axis */}
          {TICKS.map((p, k) => {
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
                top: py(LAST) - 20,
                height: 40,
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

          {/* strip labels (one word each) */}
          {[
            {t: 'OI', y: OI_T},
            {t: 'LIQS', y: LQ_T},
          ].map((s, j) => (
            <div key={s.t} style={{position: 'absolute', left: COLS_X + 4, top: s.y, fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.16em', color: C.mute2}}>
              <Typed text={s.t} start={T.build + 14 + j * 6} cps={0.6} />
            </div>
          ))}

          {/* Blue Glow readout band: three big readings roll hour by hour */}
          <div style={{position: 'absolute', left: 0, right: 0, top: BAND_Y, bottom: 0, background: BLUE[500], display: 'flex', padding: `0 ${PAD}px`}}>
            {READ.map((r, j) => {
              const hit = bumpAt(f, T.stripRead[j] + 16, 16) + doneHit;
              return (
                <div key={r.label} style={{flex: 1, padding: '36px 0 0 24px', borderLeft: j > 0 ? `2px solid ${BLUE[400]}` : 'none', position: 'relative'}}>
                  <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.16em', color: WHITE[100]}}>
                    <Typed text={r.label} start={T.build + 18 + j * 5} cps={0.6} />
                  </div>
                  <div style={{marginTop: 14, fontFamily: FONT.serif, fontSize: 58, lineHeight: 1, color: WHITE[100], letterSpacing: '-0.02em', transform: `scale(${1 + 0.05 * hit})`, transformOrigin: '0% 60%', fontVariantNumeric: 'tabular-nums'}}>
                    <Roll vals={r.vals} f={f} size={58} />
                  </div>
                </div>
              );
            })}
            {/* latch check */}
            <svg width={40} height={40} viewBox="0 0 40 40" style={{position: 'absolute', right: PAD + 6, top: 30}}>
              <circle cx={20} cy={20} r={Math.max(0, 18 * settle(f, T.done - 6, 14, 0.3))} fill={WHITE[100]} />
              <path d="M11 20.5 L17.5 27 L29 13.5" fill="none" stroke={BLUE[500]} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - ramp(f, T.done - 2, 10, EASE.out))} />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
