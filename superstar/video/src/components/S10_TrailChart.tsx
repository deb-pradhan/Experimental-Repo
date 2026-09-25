import React from 'react';
import {clamp01, lerp, noise1, ramp, settle} from '../anim';
import {BLUE, C, CARD, EASE, FONT, GRAY, TURQ, WHITE, mixHex} from '../theme';

// ------------------------------------------------------------------
// S10 · Risk engine. One chart carries all three rules:
//   01 the loss limit locks in BEFORE the price reaches entry, a widen
//      attempt bends it and it snaps back (latch);
//   02 the stop distance (entry → limit) feeds the sizing formula;
//   03 price climbs, the stop ratchets up behind it, never down; the band
//      between entry and the stop is the gain it has locked in.
// Everything is a pure function of the S10-local frame `f`, so S11 can keep
// rendering it past S10's end (match cut into the backtest card).
// ------------------------------------------------------------------

export const S10_CARD = {x: 72, y: 620, w: 936, h: 970, head: 84} as const;
export const BODY_W = S10_CARD.w;
export const BODY_H = S10_CARD.h - S10_CARD.head;

// plot (card-body coords)
const X0 = 44;
const X1 = 892;
const Y0 = 60;
const Y1 = 760;
export const U_ENTRY = 0.28;
const ENTRY = 100;
const LIMIT = 94;
const TRAIL = 6.5;
const U_HANDLE = 0.6;

/** Key frames, S10-local. */
export const TC = {
  cardIn: 0,
  gridIn: 14,
  pre0: 30, // pre-entry price starts crawling
  limitDraw: 206, // "the loss limit"
  limitLock: 228,
  entry: 289, // "entry"
  band: 296,
  handleIn: 316,
  pull0: 322,
  snap: 360, // "never"
  lockBadge: 370, // "widened"
  badgeOut: 426,
  f12: 432, // framing 1 → 2 (make room for the formula)
  formulaIn: 434,
  term1: 440,
  term2: 456,
  term3: 472,
  solve0: 478, // "limit"
  solved: 512,
  formulaOut: 520,
  f23: 516, // framing 2 → 3 (zoom out for the climb)
  post0: 526, // price leaves entry
  reviews: [540, 556, 572, 588, 604, 620, 640],
  hold: 612,
  protect: 640, // "protect" (lands in S11 local 10)
} as const;

// ---------- price model ----------
const KP: [number, number][] = [
  [0, 101.2], [0.04, 100.7], [0.08, 101.8], [0.125, 101.0], [0.17, 102.0], [0.21, 101.1], [0.245, 101.5], [U_ENTRY, 100],
  [0.354, 104.5], [0.4, 102.4], [0.502, 110.0], [0.557, 107.2], [0.649, 116.0], [0.705, 112.3], [0.806, 123.0], [0.862, 118.6], [0.963, 129.0], [1.0, 127.8],
];
const pw = (pts: readonly (readonly [number, number])[], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i][0]) {
      const [a, va] = pts[i - 1];
      const [b, vb] = pts[i];
      return va + ((vb - va) * (x - a)) / (b - a);
    }
  }
  return pts[pts.length - 1][1];
};
export const priceAt = (u: number) => pw(KP, u) + noise1(u * 52, 5) * 0.17 * clamp01(Math.abs(u - U_ENTRY) * 25);

const POST_K: [number, number][] = [
  [526, U_ENTRY], [538, 0.354], [545, 0.4], [560, 0.502], [567, 0.557], [581, 0.649], [588, 0.705], [602, 0.806], [609, 0.862], [622, 0.963], [630, 1.0],
];
export const headU = (f: number) => {
  if (f < TC.post0) return U_ENTRY * clamp01((f - TC.pre0) / (TC.entry - TC.pre0));
  return pw(POST_K, f);
};

const runHigh = (u: number) => {
  let m = -1e9;
  for (let s = U_ENTRY; s <= u + 1e-9; s += 0.0025) m = Math.max(m, priceAt(s));
  return m;
};

type Step = {f: number; u: number; level: number};
/** Trailing-stop steps: stop = max(stop, running high − trail), only ever up. */
export const STEPS: Step[] = (() => {
  let lvl = LIMIT;
  const out: Step[] = [];
  for (const fr of TC.reviews) {
    const u = headU(fr);
    const L = Math.max(lvl, Math.round((runHigh(u) - TRAIL) * 10) / 10);
    if (L > lvl + 0.8) out.push({f: fr, u, level: L});
    lvl = L;
  }
  return out;
})();

/** Framing (price range shown) — a slow camera on the chart. */
const rangeAt = (f: number): [number, number] => {
  const z = ramp(f, TC.limitDraw - 10, 40, EASE.inOut);
  const a = ramp(f, TC.f12, 38, EASE.inOut);
  const b = ramp(f, TC.f23, 40, EASE.inOut);
  const lo = lerp(lerp(lerp(96.2, 88, z), 88, a), 90, b);
  const hi = lerp(lerp(lerp(104.6, 105, z), 116, a), 134, b);
  return [lo, hi];
};

const P = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

const mono = (size = 22, track = 0.14): React.CSSProperties => ({
  fontFamily: FONT.mono,
  fontSize: size,
  letterSpacing: `${(size * track).toFixed(1)}px`,
});

// ---------- small icons (UI glyphs, not logos) ----------
export const Glyph: React.FC<{kind: 'lock' | 'check' | 'up' | 'down'; color: string; size: number; shackle?: number}> = ({
  kind,
  color,
  size,
  shackle = 0,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', overflow: 'visible'}}>
    {kind === 'lock' ? (
      <>
        <path d={`M7.5 11V${8 - shackle * 3}a4.5 4.5 0 0 1 9 0V11`} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
        <rect x={4.5} y={10.5} width={15} height={10.5} rx={2.4} fill={color} />
      </>
    ) : kind === 'check' ? (
      <path d="M5 12.8l4.4 4.4L19.2 7.4" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    ) : kind === 'up' ? (
      <path d="M12 19.5V5.5M6 11.2l6-6 6 6" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M12 4.5v14M6 12.8l6 6 6-6" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

// ---------- card header (MonoHead styling, static dot colour chosen per scene) ----------
export const Head: React.FC<{left: React.ReactNode; right?: React.ReactNode; dot?: string; style?: React.CSSProperties}> = ({
  left,
  right,
  dot = BLUE[500],
  style,
}) => (
  <div
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      height: 84,
      padding: '0 40px',
      boxSizing: 'border-box',
      borderBottom: `2px solid ${C.hair}`,
      fontFamily: FONT.mono,
      fontSize: 23,
      color: GRAY[900],
      letterSpacing: '.02em',
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    <span style={{width: 14, height: 14, borderRadius: '50%', background: dot, flex: 'none'}} />
    <span>{left}</span>
    {right ? <span style={{marginLeft: 'auto', color: GRAY[800]}}>{right}</span> : null}
  </div>
);

/** Typed string: first n characters. */
export const typed = (s: string, f: number, start: number, cps = 1.4) => s.slice(0, Math.max(0, Math.floor((f - start) * cps)));

/** White viewport card shell at an absolute rect. */
export const CardShell: React.FC<{x: number; y: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  x,
  y,
  w,
  h,
  children,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: CARD.radius,
      border: CARD.border,
      boxSizing: 'border-box',
      background: C.card,
      boxShadow: CARD.shadow,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

// ------------------------------------------------------------------
// The rule list (01 / 02 / 03). Active rule = Blue Glow panel (white type),
// swept in left→right; done rules keep a Blue Glow numeral and a status glyph.
// ------------------------------------------------------------------
export const RULES = [
  {n: '01', title: 'Loss limit first', on: 218, off: 438, icon: 'lock' as const, iconAt: 370},
  {n: '02', title: 'Size follows limit', on: 436, off: 541, icon: 'check' as const, iconAt: 512},
  {n: '03', title: 'Stops only protect', on: 541, off: 1e9, icon: 'up' as const, iconAt: 560},
];
export const ROW = {x: 72, w: 936, h: 100, top: 262, step: 114, in: 212} as const;

const RowContent: React.FC<{n: string; title: string; numC: string; titleC: string; icon: 'lock' | 'check' | 'up'; iconC: string; iconK: number; shackle: number}> = ({
  n,
  title,
  numC,
  titleC,
  icon,
  iconC,
  iconK,
  shackle,
}) => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 34px'}}>
    <div style={{width: 118, fontFamily: FONT.serif, fontSize: 70, lineHeight: 1, color: numC, letterSpacing: '-0.02em', marginTop: 4}}>{n}</div>
    <div style={{fontFamily: FONT.sans, fontWeight: 500, fontSize: 50, letterSpacing: '-0.02em', color: titleC, whiteSpace: 'nowrap'}}>{title}</div>
    <div style={{marginLeft: 'auto', transform: `scale(${iconK})`, opacity: iconK > 0.01 ? 1 : 0}}>
      <Glyph kind={icon} color={iconC} size={44} shackle={shackle} />
    </div>
  </div>
);

export const RuleRows: React.FC<{f: number; exitAt?: number}> = ({f, exitAt}) => (
  <>
    {RULES.map((r, i) => {
      const pin = ramp(f, ROW.in + i * 5, 28, EASE.out);
      const pout = exitAt !== undefined ? ramp(f, exitAt + i * 4, 20, EASE.in) : 0;
      if (pin <= 0 || pout >= 1) return null;
      const top = ROW.top + i * ROW.step;
      const act = ramp(f, r.on, 16, EASE.sys);
      const deact = ramp(f, r.off, 18, EASE.sys);
      const lit = f >= r.on + 16;
      const iconK = settle(f, r.iconAt - 4, 16, 0.3);
      const shackle = r.icon === 'lock' ? 1 - ramp(f, r.iconAt + 2, 8, EASE.out) : 0;
      const clip = `inset(${(1 - pin) * 100}% 0 ${pout * 100}% 0 round 30px)`;
      return (
        <div
          key={r.n}
          style={{
            position: 'absolute',
            left: ROW.x,
            top,
            width: ROW.w,
            height: ROW.h,
            transform: `translateY(${(1 - pin) * 34 - pout * 40}px)`,
            clipPath: clip,
          }}
        >
          <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: C.card, border: `2px solid ${GRAY[600]}`, boxSizing: 'border-box'}} />
          <RowContent
            n={r.n}
            title={r.title}
            numC={lit ? BLUE[500] : GRAY[700]}
            titleC={lit ? C.ink : GRAY[800]}
            icon={r.icon}
            iconC={BLUE[500]}
            iconK={iconK}
            shackle={shackle}
          />
          {act > 0 && deact < 1 ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 30,
                background: BLUE[500],
                clipPath: `inset(0 ${(1 - act) * 100}% 0 ${deact * 100}% round 30px)`,
              }}
            >
              <RowContent n={r.n} title={r.title} numC={WHITE[100]} titleC={WHITE[100]} icon={r.icon} iconC={WHITE[100]} iconK={iconK} shackle={shackle} />
            </div>
          ) : null}
        </div>
      );
    })}
  </>
);

// ------------------------------------------------------------------
// The chart (card body). 936 × 886.
// ------------------------------------------------------------------
export const TrailChart: React.FC<{f: number; id?: string}> = ({f, id = 's10'}) => {
  const [lo, hi] = rangeAt(f);
  const Y = (v: number) => Y0 + ((hi - v) / (hi - lo)) * (Y1 - Y0);
  // time axis: opens zoomed on the waiting market, pulls back as the loss limit arrives
  const ux1 = lerp(0.31, 1, ramp(f, TC.limitDraw - 12, 50, EASE.inOut));
  const X = (u: number) => X0 + (u / ux1) * (X1 - X0);
  const head = headU(f);
  const post = f >= TC.post0;
  const xE = X(U_ENTRY);

  // ---- rule 01: loss limit line (locks in), widen attempt, snap back ----
  const limP = ramp(f, TC.limitDraw, 18, EASE.out);
  const limDrop = f < TC.limitDraw ? 0 : -14 * (1 - settle(f, TC.limitDraw + 8, 20, 0.45));
  const pullIn = ramp(f, TC.pull0, TC.snap - TC.pull0, EASE.inOut);
  const strain = f < TC.snap ? Math.sin(f * 1.9) * 2.2 * pullIn : 0;
  const sag = f < TC.snap ? 96 * pullIn + strain : 96 * (1 - settle(f, TC.snap, 22, 0.5));
  const bump = (u: number) => Math.exp(-(((u - U_HANDLE) / 0.16) ** 2));
  const yLim = (u: number) => Y(LIMIT) + limDrop + sag * bump(u);
  const limPts: [number, number][] = [];
  for (let u = 0; u <= limP + 1e-6; u += 0.01) limPts.push([X(Math.min(u, limP)), yLim(Math.min(u, limP))]);

  // entry line + max-loss band grow outward from the entry point
  const entP = ramp(f, TC.entry, 22, EASE.out);
  const bandP = ramp(f, TC.band, 26, EASE.out);
  const outward = (p: number): [number, number] => [lerp(xE, X0, p), lerp(xE, X1, p)];
  const [eL, eR] = outward(entP);
  const bL = xE;
  const bR = lerp(xE, X1, bandP);
  const bandPts: [number, number][] = [];
  if (bandP > 0) {
    const uL = (bL - X0) / (X1 - X0);
    const uR = (bR - X0) / (X1 - X0);
    bandPts.push([bL, Y(ENTRY)], [bR, Y(ENTRY)]);
    for (let u = uR; u >= uL - 1e-6; u -= 0.01) bandPts.push([X(u), yLim(u)]);
    bandPts.push([bL, yLim(uL)]);
  }

  // bracket (max loss → stop distance)
  const brIn = ramp(f, TC.band + 12, 18, EASE.out) * (1 - ramp(f, TC.formulaOut, 16, EASE.in));
  const brHi = ramp(f, TC.term2, 12, EASE.sys) * (1 - ramp(f, TC.solved + 4, 12, EASE.sys));
  const brX = X1 - 16;

  // ---- rule 03: price climbs, stop ratchets ----
  const pricePre: [number, number][] = [];
  const preEnd = Math.min(head, U_ENTRY);
  if (f >= TC.pre0) {
    for (let u = 0; u < preEnd; u += 0.004) pricePre.push([X(u), Y(priceAt(u))]);
    pricePre.push([X(preEnd), Y(priceAt(preEnd))]);
  }
  const pricePost: [number, number][] = [];
  if (post) {
    for (let u = U_ENTRY; u < head; u += 0.004) pricePost.push([X(u), Y(priceAt(u))]);
    pricePost.push([X(head), Y(priceAt(head))]);
  }
  // area under the post-entry price (Blue Glow)
  const areaD = post && pricePost.length > 1 ? `${P([[xE, Y1], ...pricePost, [X(head), Y1]])} Z` : `M${xE} ${Y1} Z`;
  const outD = `M0 0 H${X1 + 8} V${BODY_H} H0 Z ${areaD}`;

  // stop path
  type Seg = {u0: number; u1: number; lvl: number};
  const segs: Seg[] = [];
  const risers: {u: number; from: number; to: number; f: number}[] = [];
  let cur = LIMIT;
  let u0 = U_ENTRY;
  let latestStepF = -1;
  if (post) {
    for (const s of STEPS) {
      if (f < s.f - 4) break;
      const k = settle(f, s.f - 4, 14, 0.18);
      const lvl = lerp(cur, s.level, k);
      const ur = Math.min(s.u, head);
      segs.push({u0, u1: ur, lvl: cur});
      risers.push({u: ur, from: cur, to: lvl, f: s.f});
      cur = lvl;
      u0 = ur;
      latestStepF = s.f;
    }
    segs.push({u0, u1: head, lvl: cur});
  }
  const stopPts: [number, number][] = [];
  segs.forEach((s, i) => {
    if (i === 0) stopPts.push([X(s.u0), Y(s.lvl)]);
    else stopPts.push([X(s.u0), Y(s.lvl)]);
    stopPts.push([X(s.u1), Y(s.lvl)]);
  });
  const lockedRects = segs.filter((s) => s.lvl > ENTRY + 0.05 && s.u1 > s.u0);
  const protectK = settle(f, TC.protect - 4, 18, 0.3);
  const bandCol = mixHex(BLUE[700], BLUE[800], ramp(f, TC.protect - 4, 8, EASE.out) * (1 - ramp(f, TC.protect + 6, 20, EASE.sys)));

  // ---- labels + layer helpers ----
  const overlay = (mode: 'dark' | 'light') => {
    const dark = mode === 'dark';
    const ink = dark ? C.ink : WHITE[100];
    const mute = dark ? GRAY[900] : WHITE[100];
    const brC = dark ? mixHex(GRAY[900], BLUE[500], brHi) : WHITE[100];
    return (
      <g>
        {bandPts.length > 2 && dark ? <path d={`${P(bandPts)} Z`} fill={GRAY[400]} /> : null}
        {entP > 0 ? (
          <line x1={eL} x2={eR} y1={Y(ENTRY)} y2={Y(ENTRY)} stroke={dark ? GRAY[800] : WHITE[100]} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
        ) : null}
        {limPts.length > 1 ? <path d={P(limPts)} fill="none" stroke={ink} strokeWidth={4} strokeDasharray="16 10" /> : null}
        {brIn > 0 ? (
          <g>
            <path
              d={`M${brX - 14} ${Y(ENTRY)} H${brX} V${lerp(Y(ENTRY), yLim(1), brIn)} ${brIn > 0.98 ? `H${brX - 14}` : ''}`}
              fill="none"
              stroke={brC}
              strokeWidth={3 + 2 * brHi}
              strokeLinejoin="round"
            />

          </g>
        ) : null}
        {limP > 0.2 ? (
          <text x={X0 + 4} y={Y(LIMIT) + limDrop + 38} fill={mute} style={mono(22)}>
            {typed('LOSS LIMIT', f, TC.limitDraw + 8, 0.8)}
          </text>
        ) : null}
        {f >= TC.entry + 4 ? (
          <text x={xE - 24} y={Y(ENTRY) + 36} textAnchor="end" fill={mute} style={mono(22)}>
            {typed('ENTRY', f, TC.entry + 4, 0.6)}
          </text>
        ) : null}
      </g>
    );
  };

  // grid
  const gridP = ramp(f, TC.gridIn, 50, EASE.sys);
  const gridLevels = [85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135];

  // pre-entry head
  const preHead = f >= TC.pre0 && f < TC.entry + 2;
  const hx = X(preEnd);
  const hy = Y(priceAt(preEnd));

  // entry dot
  const eK = settle(f, TC.entry - 3, 16, 0.35);
  const ring = clamp01((f - TC.entry) / 34);

  // post head
  const px = X(head);
  const py = Y(priceAt(head));
  const markK = settle(f, 536, 14, 0.3);
  const markPulse = latestStepF > 0 ? settle(f, latestStepF - 4, 14, 0.6) : 1;
  const holdK = f >= TC.hold - 4 && f < TC.hold + 20 ? 1 : 0;

  // widen handle / latch badge
  const handleK = settle(f, TC.handleIn, 14, 0.3) * (1 - ramp(f, TC.badgeOut, 14, EASE.in));
  const latched = f >= TC.snap;
  const hX = X(U_HANDLE);
  const hY = yLim(U_HANDLE);
  const badgeFlash = latched ? 1 - ramp(f, TC.snap, 22, EASE.sys) : 0;

  // formula panel (rule 02)
  const fIn = ramp(f, TC.formulaIn, 18, EASE.out);
  const fOut = ramp(f, TC.formulaOut, 18, EASE.in);
  const t = (f - TC.solve0) / 60;
  const solve = f < TC.solve0 ? 0 : 1 - Math.exp(-6 * t) * Math.cos(16 * t);
  const solvedK = settle(f, TC.solved - 2, 14, 0.4);

  const lockedMid = lockedRects.length ? [...lockedRects].sort((a, b) => (b.u1 - b.u0) * (b.lvl - ENTRY) - (a.u1 - a.u0) * (a.lvl - ENTRY))[0] : null;

  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: BODY_W, height: BODY_H}}>
      <svg width={BODY_W} height={BODY_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <clipPath id={`${id}plot`}>
            <rect x={0} y={Y0 - 30} width={BODY_W} height={Y1 - Y0 + 30} />
          </clipPath>
          <clipPath id={`${id}in`}>
            <path d={areaD} />
          </clipPath>
          <clipPath id={`${id}out`}>
            <path d={outD} clipRule="evenodd" />
          </clipPath>
        </defs>

        {/* axes + grid */}
        <g clipPath={`url(#${id}plot)`}>
          {gridLevels.map((v, i) => (
            <line key={v} x1={X0} x2={lerp(X0, X1, clamp01(gridP * 1.25 - i * 0.025))} y1={Y(v)} y2={Y(v)} stroke={C.hair} strokeWidth={2} />
          ))}
        </g>
        <line x1={X0} x2={lerp(X0, X1, gridP)} y1={Y1} y2={Y1} stroke={GRAY[600]} strokeWidth={2} />
        {Array.from({length: 57}).map((_, i) => {
          const u = i / 56;
          const k = clamp01(gridP * 1.3 - (X(u) - X0) / (X1 - X0));
          return k > 0 && X(u) <= X1 + 1 ? <line key={i} x1={X(u)} x2={X(u)} y1={Y1} y2={Y1 + 12 * k} stroke={GRAY[600]} strokeWidth={2} /> : null;
        })}


        {/* Blue Glow area under the live trade */}
        {post ? <path d={areaD} fill={BLUE[500]} /> : null}
        {/* gain the stop has locked in (entry → stop) */}
        {lockedRects.map((s, i) => (
          <rect key={i} x={X(s.u0)} y={Y(s.lvl)} width={Math.max(0, X(s.u1) - X(s.u0))} height={Math.max(0, Y(ENTRY) - Y(s.lvl))} fill={bandCol} />
        ))}

        {/* two-tone overlay: ink on the card, white inside the Blue Glow area */}
        <g clipPath={`url(#${id}out)`}>{overlay('dark')}</g>
        {post ? <g clipPath={`url(#${id}in)`}>{overlay('light')}</g> : null}

        {/* trailing stop */}
        {post && stopPts.length > 1 ? <path d={P(stopPts)} fill="none" stroke={WHITE[100]} strokeWidth={5} strokeLinejoin="miter" /> : null}
        {risers.map((r, i) => {
          const h = Y(r.from) - Y(r.to);
          if (h < 26) return null;
          const cy = (Y(r.from) + Y(r.to)) / 2;
          return <path key={i} d={`M${X(r.u) - 9} ${cy + 5} L${X(r.u)} ${cy - 5} L${X(r.u) + 9} ${cy + 5}`} fill="none" stroke={WHITE[100]} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />;
        })}

        {/* price: market before entry (gray), the trade after (Blue Glow) */}
        {pricePre.length > 1 ? <path d={P(pricePre)} fill="none" stroke={GRAY[800]} strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round" /> : null}
        {pricePost.length > 1 ? <path d={P(pricePost)} fill="none" stroke={BLUE[500]} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" /> : null}

        {preHead ? (
          <g>
            <circle cx={hx} cy={hy} r={8 + 22 * ((f % 48) / 48)} fill="none" stroke={mixHex(GRAY[600], WHITE[100], (f % 48) / 48)} strokeWidth={3} />
            <circle cx={hx} cy={hy} r={8} fill={GRAY[900]} />
          </g>
        ) : null}


        {/* entry marker */}
        {f >= TC.entry - 3 ? (
          <g>
            {ring < 1 ? <circle cx={xE} cy={Y(ENTRY)} r={12 + 38 * EASE.out(ring)} fill="none" stroke={mixHex(BLUE[300], WHITE[100], ring)} strokeWidth={4} /> : null}
            <circle cx={xE} cy={Y(ENTRY)} r={13 * eK} fill={BLUE[500]} stroke={WHITE[100]} strokeWidth={4} />
          </g>
        ) : null}

        {/* post head + labels */}
        {post ? <circle cx={px} cy={py} r={10} fill={BLUE[500]} stroke={WHITE[100]} strokeWidth={4} /> : null}

        {/* the scene's one turquoise element: the stop's latest step */}
        {post && f >= 532 ? (
          <circle cx={X(head)} cy={Y(cur)} r={11 * markK * (0.85 + 0.15 * markPulse)} fill={TURQ[500]} stroke={WHITE[100]} strokeWidth={3} />
        ) : null}
        {/* pullback: price dips, the stop holds (ring on the marker) */}
        {holdK > 0 ? (
          <circle cx={X(head)} cy={Y(cur)} r={12 + 30 * ramp(f, TC.hold - 4, 24, EASE.out)} fill="none" stroke={mixHex(TURQ[300], BLUE[500], ramp(f, TC.hold - 4, 24, EASE.sys))} strokeWidth={4} />
        ) : null}

        {/* protect: the locked-in band gets its label + latch */}
        {lockedMid && protectK > 0 ? (
          <g transform={`translate(${(X(lockedMid.u0) + X(lockedMid.u1)) / 2} ${(Y(lockedMid.lvl) + Y(ENTRY)) / 2})`}>
            <g transform={`scale(${protectK})`}>
              <g transform="translate(-22 -48)">
                <Glyph kind="lock" color={WHITE[100]} size={44} shackle={1 - ramp(f, TC.protect + 2, 8, EASE.out)} />
              </g>
              <text x={0} y={30} textAnchor="middle" fill={WHITE[100]} style={{...mono(22), fontWeight: 600}}>
                LOCKED IN
              </text>
            </g>
          </g>
        ) : null}
      </svg>

      {/* widen attempt → latch */}
      {handleK > 0.01 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: hX - 26,
              top: hY - 26,
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: C.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${handleK * (1 + 0.18 * badgeFlash)})`,
              boxShadow: badgeFlash > 0 ? `0 0 0 ${10 * (1 - badgeFlash) + 2}px ${mixHex(GRAY[600], WHITE[100], 1 - badgeFlash)}` : 'none',
            }}
          >
            {latched ? (
              <Glyph kind="lock" color={WHITE[100]} size={28} shackle={1 - ramp(f, TC.lockBadge - 4, 8, EASE.out)} />
            ) : (
              <Glyph kind="down" color={WHITE[100]} size={28} />
            )}
          </div>

        </>
      ) : null}

      {/* rule 02 · LIMIT ÷ STOP = SIZE, built term by term; the size bar solves itself */}
      {fIn > 0 && fOut < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: X0,
            top: 70,
            width: X1 - X0,
            height: 250,
            borderRadius: 34,
            background: BLUE[500],
            clipPath: `inset(${fOut * 100}% 0 ${(1 - fIn) * 100}% 0 round 34px)`,
            transform: `translateY(${(1 - fIn) * 24 - fOut * 20}px)`,
          }}
        >
          {(() => {
            const k1 = ramp(f, TC.term1, 18, EASE.out);
            const k2 = ramp(f, TC.term2, 18, EASE.out);
            const k3 = ramp(f, TC.term3, 18, EASE.out);
            const op1 = ramp(f, TC.term2 - 4, 14, EASE.out);
            const op2 = ramp(f, TC.term3 - 4, 14, EASE.out);
            const lab = (txt: string, k: number, left: number) => (
              <div style={{position: 'absolute', left, top: 52, height: 44, overflow: 'hidden'}}>
                <div style={{...mono(34, 0.1), fontWeight: 600, color: WHITE[100], lineHeight: '44px', transform: `translateY(${(1 - k) * 48}px)`}}>{txt}</div>
              </div>
            );
            const op = (ch: string, k: number, left: number) => (
              <div style={{position: 'absolute', left, top: 70, fontFamily: FONT.serif, fontSize: 96, lineHeight: '96px', color: BLUE[200], transform: `scale(${k})`, opacity: k > 0.01 ? 1 : 0}}>{ch}</div>
            );
            const barTop = 150;
            const sizeW = 300 * solve;
            return (
              <>
                {lab('LIMIT', k1, 44)}
                <div style={{position: 'absolute', left: 44, top: barTop, height: 34, width: 124 * k1, borderRadius: 17, background: WHITE[100]}} />
                {op('÷', op1, 212)}
                {lab('STOP', k2, 300)}
                <svg style={{position: 'absolute', left: 300, top: barTop - 34, overflow: 'visible'}} width={80} height={104}>
                  <path d={`M8 6 H44 V${6 + 90 * k2} H8`} fill="none" stroke={WHITE[100]} strokeWidth={6} strokeLinejoin="round" opacity={k2 > 0 ? 1 : 0} />
                </svg>
                {op('=', op2, 404)}
                {lab('SIZE', k3, 486)}
                <div style={{position: 'absolute', left: 486, top: barTop, height: 34, width: 300, borderRadius: 17, background: BLUE[600], opacity: k3}} />
                <div style={{position: 'absolute', left: 486, top: barTop, height: 34, width: Math.max(0, sizeW), borderRadius: 17, background: WHITE[100]}} />
                {solvedK > 0.01 ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: 486 + 300 - 40,
                      top: barTop - 23,
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: WHITE[100],
                      border: `6px solid ${BLUE[500]}`,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${solvedK})`,
                    }}
                  >
                    <Glyph kind="check" color={BLUE[500]} size={40} />
                  </div>
                ) : null}
              </>
            );
          })()}
        </div>
      ) : null}
    </div>
  );
};
