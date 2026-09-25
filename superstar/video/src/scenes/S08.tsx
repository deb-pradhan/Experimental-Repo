import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, lerp, noise1, ramp, settle} from '../anim';
import {HeaderMaskOut, Typed, type Cue} from '../components/S06_kit';
import {Star3D} from '../components/Star';
import {CHOICE_Y, ChoiceRow, MonoHead, Reveal, StepHeader} from '../components/ui';
import M from '../data/market.json';
import {BLUE, C, CARD, EASE, FONT, GRAY, WHITE, mixHex} from '../theme';
import {local, wordF} from '../timeline';

// ============================================================
// S08 · 03 Argue both sides → 04 Choose (film 50.0–58.0 s, 480 f)
// BULL (Blue Glow card) and BEAR (white card) face off around the last
// 48 hourly candles. Each case resolves its exact invalidation level
// (the 48h low / high) as a dashed line snaps onto the chart; a tug-of-war
// bar wobbles around 50/50. On "Then it chooses" everything folds into a
// single line that unfolds into the shared ChoiceRow; LONG lands on "Long."
// and the scene ends on <ChoiceRow active={[1,0,0]} /> alone, at rest (S09 match-cuts onto the
// same pixels; S09 has no step header, so 04 · Choose masks out before 440).
// The Superstar core hovers over the options while it deliberates, then dives into LONG.
// Single turquoise element: the MonoHead live dot on the chart card.
// Exhibit is labelled "illustrative review" (an example, not a real trade).
// ============================================================

const w13 = (needle: string, nth = 0) => local('S08', wordF('L13', needle, nth));
const w14 = (needle: string, nth = 0) => local('S08', wordF('L14', needle, nth));

export const T = {
  header3: 2,
  chartIn: 2,
  candles: 14,
  bull: w13('bull'), // 39
  bear: w13('bear'), // 95
  each: w13('each'), // 174 — both levels start resolving
  exact: w13('exact'), // 214 — bull invalidation snaps on
  level: w13('level'), // 234 — bear invalidation snaps on
  proves: w13('proves'), // 271 — invalid zones shade in
  wrong: w13('wrong'), // 298
  then: w14('then'), // 324 — fold away begins
  header3Exit: 314,
  header4: 338,
  seam: 348, // everything has folded into one line
  chooses: w14('chooses'), // 366 — ChoiceRow fully unfolded
  hover: [358, 374, 390, 406] as const, // core hovers SHORT → LONG → NO TRADE → SHORT
  dive: 419, // core dives into LONG, landing on "Long."
  header4Exit: 418,
  long: w14('long'), // 431 — LONG lands
  rest: 440, // exact <ChoiceRow active={[1,0,0]} /> from here to 479
};

// ---- layout (frame px) ----
const X = 72, WID = 936;
const BULL_Y = 440, CASE_H = 196;
const CHART_Y = 656, CHART_H = 644;
const BEAR_Y = CHART_Y + CHART_H + 20; // 1320
// chart (card-local)
const PL = 36, PR = 780, AX_R = 900;
const PT = 128, PB = 516;
const LOW = 82835, HIGH = 85277; // 48h low / high (from M.btc.h1_48)
const P_MIN = 82350, P_MAX = 85750;
const py = (p: number) => PB - ((p - P_MIN) / (P_MAX - P_MIN)) * (PB - PT);
const TICKS = [83500, 84000, 84500];
const TUG_Y = 552, TUG_H = 56;

const H48 = M.btc.h1_48 as number[][];
const lo48 = Math.min(...H48.map((c) => c[3]));
const hi48 = Math.max(...H48.map((c) => c[2]));
// guard: the levels shown are the real 48h extremes
const BULL_LEVEL = lo48 || LOW;
const BEAR_LEVEL = hi48 || HIGH;
const fmt = (v: number) => '$' + v.toLocaleString('en-US');

// ChoiceRow geometry (measured from ui.tsx: 40px Geist Mono, .14em, pad 18.4/38, gap 24)
const PILL = [
  {x0: 150, x1: 345},
  {x0: 369, x1: 593},
  {x0: 617, x1: 930},
];
const ROW_TOP = CHOICE_Y, ROW_BOT = CHOICE_Y + 87, ROW_MID = CHOICE_Y + 43.5;

// ---- SFX cues ----
export const CUES: Cue[] = [
  {at: 18, kind: 'card_in', note: 'chart card rises into place'},
  {at: T.candles, kind: 'tick_train', note: 'dur=48 · 48 hourly candles print left→right'},
  {at: T.bull - 8, kind: 'card_in', note: 'BULL card drops in, word lands on "bull"'},
  {at: T.bull + 4, kind: 'swipe', note: 'tug bar leans bull'},
  {at: T.bear - 8, kind: 'card_in', note: 'BEAR card rises in, word lands on "bear"'},
  {at: T.bear + 4, kind: 'swipe', note: 'tug bar leans bear'},
  {at: T.each, kind: 'tick_train', note: `dur=${T.level - T.each} · both invalidation prices scramble`},
  {at: T.exact, kind: 'lock', note: 'bull level locks $82,835 + dashed line snaps on ("exact")'},
  {at: T.exact - 8, kind: 'draw', note: 'dur=10 · bull invalidation line'},
  {at: T.level, kind: 'lock', note: 'bear level locks $85,277 + dashed line snaps on ("level")'},
  {at: T.level - 8, kind: 'draw', note: 'dur=10 · bear invalidation line'},
  {at: T.proves, kind: 'swipe', note: 'invalid zones shade in beyond both lines ("proves it wrong")'},
  {at: T.wrong, kind: 'tick', note: 'tug bar settles near 50/50'},
  {at: T.header3Exit + 16, kind: 'swipe', note: 'header 03 masks out'},
  {at: T.seam - 2, kind: 'whoosh', note: 'cards + chart fold into one line ("Then")'},
  {at: T.header4 + 18, kind: 'swipe', note: 'header 04 · Choose rises in'},
  {at: T.chooses, kind: 'impact_soft', note: 'LONG / SHORT / NO TRADE unfold ("chooses")'},
  {at: T.hover[0] + 8, kind: 'pop', note: 'Superstar core appears above the options'},
  {at: T.hover[1] + 7, kind: 'tick', note: 'core hovers LONG'},
  {at: T.hover[2] + 7, kind: 'tick', note: 'core hovers NO TRADE'},
  {at: T.hover[3] + 7, kind: 'tick', note: 'core hovers SHORT'},
  {at: T.dive, kind: 'swipe', note: 'dur=12 · core dives toward LONG'},
  {at: T.header4Exit + 16, kind: 'swipe', note: 'header 04 masks out (S09 has no header)'},
  {at: T.long, kind: 'lock', note: 'core lands in LONG ("Long.") — highlight springs on'},
  {at: T.long + 1, kind: 'click'},
];

// ------------------------------------------------------------
/** Deterministic digit scramble that resolves left→right into `target`. */
const scramble = (target: string, f: number, start: number, lockAt: number, seed = 0) => {
  if (f < start) return target.replace(/[0-9]/g, '–');
  if (f >= lockAt) return target;
  const span = lockAt - start;
  let k = 0;
  return target
    .split('')
    .map((ch) => {
      if (!/[0-9]/.test(ch)) return ch;
      const idx = k++;
      const settleAt = start + span * (0.5 + 0.5 * (idx / 5));
      if (f >= settleAt) return ch;
      return String(Math.floor(Math.abs(Math.sin((Math.floor(f / 3) + idx * 7 + seed * 31) * 12.9898) * 43758.5)) % 10);
    })
    .join('');
};

const CaseCard: React.FC<{kind: 'bull' | 'bear'; f: number; fold: number}> = ({kind, f, fold}) => {
  const bull = kind === 'bull';
  const at = bull ? T.bull : T.bear;
  const lockAt = bull ? T.exact : T.level;
  const p = settle(f, at - 18, 22, 0.1);
  const y0 = bull ? BULL_Y : BEAR_Y;
  const fg = bull ? WHITE[100] : C.ink;
  const sub = bull ? WHITE[100] : GRAY[800];
  const lockHit = Math.sin(Math.PI * clamp01((f - lockAt) / 14)) * (f >= lockAt ? 1 : 0);
  const voice = bull ? ramp(f, T.bull, 8) * (1 - ramp(f, T.bear - 6, 12)) : ramp(f, T.bear, 8) * (1 - ramp(f, T.each - 10, 16));
  // fold toward the ChoiceRow seam
  const cy = y0 + CASE_H / 2;
  const dy = (ROW_MID - cy) * fold;
  const sy = Math.max(0.006, 1 - fold);
  const clip = bull ? `inset(0 0 ${(1 - p) * 100}% 0 round ${CARD.radius}px)` : `inset(${(1 - p) * 100}% 0 0 0 round ${CARD.radius}px)`;
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: X,
        top: y0,
        width: WID,
        height: CASE_H,
        transform: `translateY(${dy + (bull ? -1 : 1) * (1 - p) * 50}px) scaleY(${sy}) scale(${1 + 0.012 * voice})`,
        clipPath: fold > 0 ? undefined : clip,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: CARD.radius,
          background: bull ? BLUE[500] : C.card,
          border: bull ? `2px solid ${BLUE[500]}` : CARD.border,
          boxShadow: CARD.shadow,
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', left: 48, top: 38}}>
          <Reveal text={bull ? 'Bull' : 'Bear'} start={at - 12} size={104} family="serif" color={fg} tracking={-0.02} dur={24} />
        </div>
        {/* direction glyph */}
        <svg width={56} height={56} viewBox="0 0 56 56" style={{position: 'absolute', left: 300, top: 72, transform: `scale(${settle(f, at + 4, 16, 0.3)})`}}>
          <path d={bull ? 'M28 8 L48 42 L8 42 Z' : 'M28 48 L48 14 L8 14 Z'} fill={bull ? WHITE[100] : GRAY[800]} />
        </svg>
        <div style={{position: 'absolute', right: 48, top: 44, textAlign: 'right'}}>
          <div style={{fontFamily: FONT.mono, fontSize: 22, letterSpacing: '.16em', color: sub, whiteSpace: 'nowrap'}}>
            <Typed text={bull ? 'INVALID BELOW' : 'INVALID ABOVE'} start={at + 6} cps={1.4} />
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: FONT.mono,
              fontSize: 62,
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: fg,
              whiteSpace: 'nowrap',
              transform: `scale(${1 + 0.06 * lockHit})`,
              transformOrigin: '100% 50%',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {scramble(fmt(bull ? BULL_LEVEL : BEAR_LEVEL), f, T.each, lockAt, bull ? 1 : 2)}
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
export const S08: React.FC = () => {
  const f = useCurrentFrame();

  // hard rest state for the S09 match cut
  if (f >= T.rest) {
    return (
      <AbsoluteFill>
        <ChoiceRow active={[1, 0, 0]} />
      </AbsoluteFill>
    );
  }

  const fold = ramp(f, T.then, T.seam - T.then, EASE.in);
  const drift = Math.min(f, T.then) / 480;

  // chart card
  const cIn = settle(f, T.chartIn, 30, 0.06);
  const chartCy = CHART_Y + CHART_H / 2;
  const chartDy = (1 - cIn) * 300 + (ROW_MID - chartCy) * fold;
  const chartSy = Math.max(0.006, 1 - fold);

  // tug of war (bull share)
  const lean = 0.07 * ramp(f, T.bull, 20, EASE.sys) * (1 - ramp(f, T.bear - 4, 20, EASE.sys)) - 0.07 * ramp(f, T.bear, 20, EASE.sys) * (1 - ramp(f, T.each, 30, EASE.sys));
  const jitter = 0.018 * noise1(f / 16, 5) + 0.008 * noise1(f / 5, 9);
  const lockNudge = 0.02 * Math.sin(Math.PI * clamp01((f - T.exact) / 20)) * (f >= T.exact ? 1 : 0) - 0.02 * Math.sin(Math.PI * clamp01((f - T.level) / 20)) * (f >= T.level ? 1 : 0);
  const share = 0.5 + lean + jitter * ramp(f, 60, 30) + lockNudge;
  const tugIn = ramp(f, 56, 24, EASE.sys);
  const bullPct = Math.round(share * 100);

  // invalidation lines
  const bullLine = ramp(f, T.exact - 8, 10, EASE.out);
  const bearLine = ramp(f, T.level - 8, 10, EASE.out);
  const zones = ramp(f, T.proves, 18, EASE.sys);

  // seam + ChoiceRow unfold
  const seamIn = ramp(f, T.seam - 6, 8, EASE.out);
  const unfold = ramp(f, T.seam + 2, T.chooses - T.seam - 2, EASE.out);
  const seamW = lerp(WID, PILL[2].x1 - PILL[0].x0, ramp(f, T.seam - 4, 14, EASE.inOut));
  const seamH = 6 * seamIn * (1 - unfold);
  const longA = ramp(f, T.long, T.rest - T.long, EASE.out);

  // the core deliberating above the options
  const core = coreState(f);
  const ring = clamp01((f - T.long) / 9);

  return (
    <AbsoluteFill>
      <HeaderMaskOut exit={T.header3Exit}>
        <StepHeader n="03" title="Argue both sides" start={T.header3} />
      </HeaderMaskOut>
      {f >= T.header4 ? (
        <HeaderMaskOut exit={T.header4Exit}>
          <StepHeader n="04" title="Choose" start={T.header4} />
        </HeaderMaskOut>
      ) : null}

      {fold < 1 ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + drift * 0.02})`, transformOrigin: '50% 50%'}}>
          {/* chart card */}
          <div
            style={{
              position: 'absolute',
              left: X,
              top: CHART_Y,
              width: WID,
              height: CHART_H,
              transform: `translateY(${chartDy}px) scaleY(${chartSy})`,
              borderRadius: CARD.radius,
              border: CARD.border,
              background: C.card,
              boxShadow: CARD.shadow,
              overflow: 'hidden',
            }}
          >
            <MonoHead left={<Typed text="superstar · illustrative review" start={12} cps={1.6} />} />
            <svg width={WID} height={CHART_H} style={{position: 'absolute', left: 0, top: 0}}>
              {/* invalid zones */}
              <rect x={PL} y={PT - 8} width={(PR - PL) * zones} height={py(BEAR_LEVEL) - PT + 8} fill={GRAY[400]} />
              <rect x={PL} y={py(BULL_LEVEL)} width={(PR - PL) * zones} height={PB + 8 - py(BULL_LEVEL)} fill={BLUE[100]} />
              {TICKS.map((p, k) => (
                <line key={p} x1={PL} x2={PL + (PR - PL) * ramp(f, 8 + k * 4, 36, EASE.sys)} y1={py(p)} y2={py(p)} stroke={GRAY[400]} strokeWidth={2} strokeDasharray="6 8" />
              ))}
              {H48.map((c, i) => {
                const [, o, h, l, cl] = c;
                const t = ramp(f, T.candles + i, 10, EASE.out);
                if (t <= 0) return null;
                const pitch = (PR - PL) / 48;
                const cx = PL + pitch * (i + 0.5);
                const up = cl >= o;
                const col = up ? BLUE[500] : GRAY[800];
                const yo = py(o);
                const yc = py(o + (cl - o) * t), yh = py(o + (h - o) * t), yl = py(o - (o - l) * t);
                return (
                  <g key={i}>
                    <line x1={cx} x2={cx} y1={yh} y2={yl} stroke={col} strokeWidth={2} />
                    <rect x={cx - 4.5} y={Math.min(yo, yc)} width={9} height={Math.max(2, Math.abs(yc - yo))} rx={1.5} fill={col} />
                  </g>
                );
              })}
              {/* invalidation lines */}
              {bearLine > 0 ? <line x1={PL} x2={PL + (AX_R - PL) * bearLine} y1={py(BEAR_LEVEL)} y2={py(BEAR_LEVEL)} stroke={GRAY[900]} strokeWidth={3} strokeDasharray="12 9" /> : null}
              {bullLine > 0 ? <line x1={PL} x2={PL + (AX_R - PL) * bullLine} y1={py(BULL_LEVEL)} y2={py(BULL_LEVEL)} stroke={BLUE[500]} strokeWidth={3} strokeDasharray="12 9" /> : null}
            </svg>
            {/* axis */}
            {TICKS.map((p, k) => (
              <div key={p} style={{position: 'absolute', left: PR + 8, width: AX_R - PR - 8, top: py(p) - 14, textAlign: 'right', fontFamily: FONT.mono, fontSize: 22, color: C.mute2, lineHeight: '28px'}}>
                <Typed text={p.toLocaleString('en-US')} start={14 + k * 5} cps={0.8} />
              </div>
            ))}
            {[
              {v: BEAR_LEVEL, p: bearLine, at: T.level, bull: false},
              {v: BULL_LEVEL, p: bullLine, at: T.exact, bull: true},
            ].map((tg) => {
              const s = settle(f, tg.at - 2, 14, 0.25);
              if (s <= 0) return null;
              return (
                <div
                  key={tg.v}
                  style={{
                    position: 'absolute',
                    left: PR + 4,
                    width: AX_R - PR + 4,
                    top: py(tg.v) - 20,
                    height: 40,
                    borderRadius: 10,
                    background: tg.bull ? BLUE[500] : GRAY[400],
                    border: `3px solid ${tg.bull ? WHITE[100] : GRAY[800]}`,
                    boxSizing: 'border-box',
                    color: tg.bull ? WHITE[100] : C.ink,
                    fontFamily: FONT.mono,
                    fontSize: 22,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${s})`,
                    transformOrigin: '0% 50%',
                  }}
                >
                  {tg.v.toLocaleString('en-US')}
                </div>
              );
            })}
            {/* tug of war — a wordless balance: no invented conviction numbers */}
            <div style={{position: 'absolute', left: PL, top: TUG_Y, width: AX_R - PL, height: TUG_H, transform: `scaleX(${tugIn})`, transformOrigin: '50% 50%'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `calc(${share * 100}% - 3px)`, background: BLUE[500], borderRadius: '28px 6px 6px 28px'}} />
              <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: `calc(${(1 - share) * 100}% - 3px)`, background: GRAY[700], borderRadius: '6px 28px 28px 6px'}} />
              {/* 50% notch */}
              <div style={{position: 'absolute', left: '50%', top: -12, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: `10px solid ${GRAY[800]}`, transform: 'translateX(-8px)'}} />
            </div>
          </div>

          <CaseCard kind="bull" f={f} fold={fold} />
          <CaseCard kind="bear" f={f} fold={fold} />
        </div>
      ) : null}

      {/* the seam: every thesis folds into one line, which becomes the choice */}
      {seamH > 0.2 ? <div style={{position: 'absolute', left: 540 - seamW / 2, width: seamW, top: ROW_MID - seamH / 2, height: seamH, borderRadius: 3, background: BLUE[500]}} /> : null}

      {unfold > 0 ? (
        <AbsoluteFill style={{clipPath: unfold >= 1 ? undefined : `inset(${ROW_MID - 50 * unfold}px 0 ${1920 - ROW_MID - 50 * unfold}px 0)`}}>
          <ChoiceRow active={[longA, 0, 0]} />
        </AbsoluteFill>
      ) : null}

      {core.s > 0.02 ? (
        <div style={{position: 'absolute', left: core.x - 180, top: core.y - 180, width: 360, height: 360, transform: `scale(${core.s})`}}>
          <Star3D width={360} height={360} size={200} rot={[0.5 + f * 0.01, 0.3 + f * 0.03, 0.2]} lift={-0.1} />
        </div>
      ) : null}
      {/* landing ring on LONG (gone before the rest state) */}
      {f >= T.long && ring < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: PILL[0].x0 - 14 * ring - 4,
            width: PILL[0].x1 - PILL[0].x0 + 28 * ring + 8,
            top: ROW_TOP - 14 * ring - 4,
            height: ROW_BOT - ROW_TOP + 28 * ring + 8,
            borderRadius: 999,
            border: `${4 * (1 - ring) + 1}px solid ${mixHex(BLUE[400], GRAY[300], ring)}`,
            boxSizing: 'border-box',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** The Superstar core hovers over the options, then dives into LONG on "Long.". */
const coreState = (f: number) => {
  const cx = PILL.map((p) => (p.x0 + p.x1) / 2);
  const order = [1, 0, 2, 1]; // SHORT → LONG → NO TRADE → SHORT
  const HOVER_Y = ROW_TOP - 190;
  if (f < T.hover[0]) return {x: cx[1], y: HOVER_Y, s: 0};
  let from = order[0], to = order[0], start: number = T.hover[0];
  for (let i = 1; i < order.length; i++)
    if (f >= T.hover[i]) {
      from = order[i - 1];
      to = order[i];
      start = T.hover[i];
    }
  const k = settle(f, start, 14, 0.18);
  let x = lerp(cx[from], cx[to], k);
  let y = HOVER_Y + 8 * Math.sin((f - T.hover[0]) / 9);
  let s = settle(f, T.hover[0], 16, 0.2);
  if (f >= T.dive) {
    const d = ramp(f, T.dive, T.long - T.dive, EASE.in);
    x = lerp(cx[order[order.length - 1]], cx[0], ramp(f, T.dive, T.long - T.dive, EASE.inOut));
    y = lerp(HOVER_Y, ROW_MID, d);
    s = lerp(1, 0.18, d);
  }
  if (f >= T.long) s = 0;
  return {x, y, s};
};
