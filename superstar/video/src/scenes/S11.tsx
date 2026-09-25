import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, fmtUSD, lerp, ramp, settle} from '../anim';
import {BODY_H, BODY_W, CardShell, Glyph, Head, RuleRows, S10_CARD, TrailChart, typed} from '../components/S10_TrailChart';
import {Token} from '../components/Token';
import {BACKTEST} from '../data/backtest';
import {BLUE, C, CARD, EASE, FONT, GRAY, TURQ, WHITE} from '../theme';
import {local, wordF} from '../timeline';

// ------------------------------------------------------------------
// S11 · Proof · simulated backtest (480 f, Gray ground, music peak)
// Match cut: S10's risk-engine card carries over ("…to protect" + latch),
// lifts into the backtest card. BTC (gray) and Superstar equity (Blue Glow)
// draw month by month; BTC callouts land on the narrator's numbers; the
// hero $271,465 counts up onto "finished positive"; both halves confirm.
// Exit: a Blue Glow sheet rises into S12's ground.
// ------------------------------------------------------------------

const W18 = (w: string, n = 0) => local('S11', wordF('L18', w, n));
const W19 = (w: string, n = 0) => local('S11', wordF('L19', w, n));

export const T = {
  protect: 10, // "…protect" (S10 chart latch)
  rowsOut: 2,
  wipe0: 20, // S10 chart wipes out of the card
  morph0: 22,
  morph1: 62,
  backtested: W18('backtested'), // ≈52
  bitcoin: W18('bitcoin'), // ≈93
  n124: W18('124'), // ≈143
  fell: W18('fell'), // ≈261
  n63: W18('63'), // ≈280
  finished: W19('finished'), // ≈353
  positive: W19('positive'), // ≈367
  both: W19('both'), // ≈412
  halves: W19('halves'), // ≈426
  draw0: 60,
  peak: 146,
  draw1: 284,
  heroIn: 294,
  heroLand: 356,
  chip: 362,
  tiles: 374,
  dd: 392,
  sheet0: 446,
  sheet1: 476,
} as const;

// card geometry (final)
const K = {x: 72, y: 356, w: 936, h: 920} as const;
const X0 = 44;
const X1 = 892;
const Y0 = 150;
const Y1 = 700;
const LO = 30;
const HI = 300;
const N = BACKTEST.equityK.length; // 15 month-end points
const xi = (i: number) => X0 + (i / (N - 1)) * (X1 - X0);
const yv = (v: number) => Y0 + ((HI - v) / (HI - LO)) * (Y1 - Y0);
const BAR_BASE = 782;
const BAR_K = 1.3; // px per $k

const pw = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++)
    if (x <= pts[i][0]) return pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (x - pts[i - 1][0])) / (pts[i][0] - pts[i - 1][0]);
  return pts[pts.length - 1][1];
};
/** Drawn month index (fractional) — synced so BTC hits $124k on "124" and $63k on "63". */
const headIdx = (f: number) => pw([[T.draw0, 0], [T.peak, 6], [T.draw1 - 24, 12.9], [T.draw1, 14]], f);
const valAt = (arr: readonly number[], h: number) => {
  const i = Math.min(N - 2, Math.floor(h));
  return lerp(arr[i], arr[i + 1], h - i);
};
const lineTo = (arr: readonly number[], h: number): [number, number][] => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= Math.floor(h) && i < N; i++) pts.push([xi(i), yv(arr[i])]);
  if (h < N - 1 && h > Math.floor(h)) pts.push([xi(h), yv(valAt(arr, h))]);
  return pts;
};
const P = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

const monoS = (size = 22, track = 0.14): React.CSSProperties => ({fontFamily: FONT.mono, fontSize: size, letterSpacing: `${(size * track).toFixed(1)}px`});

const CUES_RAW: {at: number; kind: string; note?: string}[] = [
  {at: T.protect, kind: 'ratchet', note: 'last stop step (S10 chart, carried over) · "protect"'},
  {at: T.protect + 6, kind: 'lock', note: 'LOCKED IN latch closes'},
  {at: 18, kind: 'card_out', note: 'rule rows lift away'},
  {at: 40, kind: 'whoosh', note: 'card lifts + resizes into the backtest card'},
  {at: 34, kind: 'type', note: 'dur=16 · header → superstar · backtest'},
  {at: 64, kind: 'shimmer', note: 'grid draws'},
  {at: T.draw0, kind: 'draw', note: `dur=${T.draw1 - T.draw0} · BTC + equity lines draw month by month`},
  ...BACKTEST.monthlyPnlK.map((v, i) => {
    let at = T.draw0;
    for (let f = T.draw0; f <= T.draw1; f++) if (headIdx(f) >= i + 1) {
      at = f;
      break;
    }
    return {at: at + 4, kind: 'blip', note: `monthly bar ${i + 1} ${v > 0 ? '+' : ''}${v}k`};
  }),
  {at: T.bitcoin + 4, kind: 'pop', note: 'BTC $104k callout'},
  {at: T.peak + 4, kind: 'pop', note: '$124k callout (peak)'},
  {at: 172, kind: 'tick', note: 'halfway marker drops'},
  {at: T.draw1 + 4, kind: 'pop', note: '$63k callout'},
  {at: T.heroIn, kind: 'tick_train', note: `dur=${T.heroLand - T.heroIn} · $100,000 → $271,465 count-up`},
  {at: T.heroLand, kind: 'impact_soft', note: '$271,465 lands ("finished")'},
  {at: T.chip + 6, kind: 'pop', note: '+171.46% chip (turquoise) · "positive"'},
  {at: T.tiles + 12, kind: 'card_in', note: 'stat tiles rise (3, staggered 6f)'},
  {at: T.tiles + 6, kind: 'tick_train', note: 'dur=40 · stat count-ups'},
  {at: T.dd, kind: 'draw', note: 'dur=16 · drawdown bracket'},
  {at: T.both, kind: 'lock', note: 'first half ✓ · "both"'},
  {at: T.halves, kind: 'lock', note: 'second half ✓ · "halves"'},
  {at: T.sheet1 - 4, kind: 'whoosh', note: 'Blue Glow sheet rises → S12'},
];
export const CUES = [...CUES_RAW].sort((a, b) => a.at - b.at);

export const S11: React.FC = () => {
  const f = useCurrentFrame();

  // ---- card morph (S10 rect → backtest rect) ----
  const m = ramp(f, T.morph0, T.morph1 - T.morph0, EASE.inOut);
  const s10y = S10_CARD.y - 14; // S10 ends drifted −14
  const lift = ramp(f, T.sheet0, T.sheet1 - T.sheet0, EASE.in);
  const drift = -10 * ramp(f, T.morph1, 479 - T.morph1, (t) => t);
  const cx = K.x;
  // card sits a little lower while the chart draws, lifts to make room for the stat tiles
  const room = ramp(f, T.tiles - 10, 30, EASE.inOut);
  const baseY = lerp(K.y + 44, K.y, room);
  const cy = lerp(s10y, baseY, m) + drift - lift * 90;
  const cw = K.w;
  const ch = lerp(S10_CARD.h, K.h, m);

  // S10 chart carried over, then wiped (top → bottom)
  const wipe = ramp(f, T.wipe0, 22, EASE.in);
  const btIn = ramp(f, 40, 30, EASE.out);

  // ---- chart state ----
  const h = headIdx(f);
  const drawing = f >= T.draw0;
  const gridP = ramp(f, 44, 40, EASE.sys);
  const eq = BACKTEST.equityK;
  const btc = BACKTEST.btcIndexed;
  const eqPts = drawing ? lineTo(eq, h) : [];
  const btPts = drawing ? lineTo(btc, h) : [];
  const areaD = eqPts.length > 1 ? `${P([[X0, Y1], ...eqPts, [eqPts[eqPts.length - 1][0], Y1]])} Z` : '';
  const headEq = eqPts.length ? eqPts[eqPts.length - 1] : null;
  const headBt = btPts.length ? btPts[btPts.length - 1] : null;

  const halfK = ramp(f, 166, 26, EASE.out);
  const h1 = settle(f, T.both - 6, 16, 0.4);
  const h2 = settle(f, T.halves - 6, 16, 0.4);
  const h1Idle = ramp(f, 172, 12, EASE.out);
  const h2Idle = ramp(f, T.draw1 + 2, 12, EASE.out);

  // callouts
  const call = (at: number) => settle(f, at - 4, 16, 0.35);
  const c104 = call(T.bitcoin);
  const c124 = call(T.peak);
  const c63 = call(T.draw1);

  // hero
  const heroP = ramp(f, T.heroIn - 6, 24, EASE.out);
  const heroV = 100000 + (BACKTEST.end - 100000) * ramp(f, T.heroIn, T.heroLand - T.heroIn, EASE.soft);
  const heroScale = 1 + 0.04 * Math.sin(Math.PI * clamp01((f - T.heroLand + 2) / 16)) * (f >= T.heroLand - 2 ? 1 : 0);
  const chipK = settle(f, T.chip, 16, 0.35);

  // drawdown bracket (Dec '25 peak → Feb '26 trough = 13.6%)
  const ddK = ramp(f, T.dd, 16, EASE.out);

  // tiles
  const tile = (i: number) => settle(f, T.tiles + i * 6, 22, 0.12);
  const cnt = (i: number) => ramp(f, T.tiles + 6 + i * 6, 40, EASE.soft);

  // blue sheet exit
  const sheetTop = lerp(1940, -40, ramp(f, T.sheet0, T.sheet1 - T.sheet0, EASE.inOut));

  const labIn = ramp(f, 0, 14, EASE.out);

  return (
    <AbsoluteFill>
      {/* the required label, visible for the whole scene */}
      <div style={{position: 'absolute', left: 72, top: (f < T.morph0 ? 268 : lerp(268, cy - 72, m)), overflow: 'hidden', borderRadius: 999}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 20px',
            borderRadius: 999,
            background: GRAY[400],
            color: GRAY[900],
            ...monoS(22),
            fontWeight: 500,
            textTransform: 'uppercase',
            transform: `translateY(${(1 - labIn) * 100}%)`,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{width: 10, height: 10, borderRadius: '50%', background: GRAY[800]}} />
          Simulated backtest
        </div>
      </div>

      {/* S10 rule rows lift away */}
      {f < 40 ? (
        <div style={{position: 'absolute', inset: 0, transform: 'translateY(-14px)'}}>
          <RuleRows f={630 + f} exitAt={630 + T.rowsOut} />
        </div>
      ) : null}

      <CardShell x={cx} y={cy} w={cw} h={ch}>
        {/* header: risk engine → backtest */}
        <Head
          left={
            <span style={{display: 'inline-block', height: 30, overflow: 'hidden', verticalAlign: 'middle'}}>
              <span style={{display: 'block', transform: `translateY(${-ramp(f, 26, 14, EASE.inOut) * 30}px)`, lineHeight: '30px'}}>
                <span style={{display: 'block'}}>superstar · risk engine</span>
                <span style={{display: 'block'}}>{f >= 26 ? typed('superstar · backtest', f, 30, 1.6) : 'superstar · backtest'}</span>
              </span>
            </span>
          }
        />

        {/* carried-over S10 chart (continues its own clock: latch on "protect") */}
        {wipe < 1 ? (
          <div style={{position: 'absolute', left: 0, top: S10_CARD.head, width: BODY_W, height: BODY_H, clipPath: `inset(${wipe * 100}% 0 0 0)`}}>
            <TrailChart f={630 + f} id="s11carry" />
          </div>
        ) : null}

        {/* backtest chart */}
        {btIn > 0 ? (
          <svg width={K.w} height={K.h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <defs>
              <linearGradient id="s11area" x1="0" y1={Y0} x2="0" y2={Y1} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={BLUE[200]} />
                <stop offset="0.55" stopColor={BLUE[100]} />
                <stop offset="1" stopColor={WHITE[100]} />
              </linearGradient>
            </defs>
            {/* grid */}
            {[50, 100, 150, 200].map((v, i) => (
              <line key={v} x1={X0} x2={lerp(X0, X1, clamp01(gridP * 1.2 - i * 0.04))} y1={yv(v)} y2={yv(v)} stroke={C.hair} strokeWidth={2} />
            ))}
            {/* halfway marker */}
            {halfK > 0 ? (
              <line x1={xi(7)} x2={xi(7)} y1={446} y2={lerp(446, 880, halfK)} stroke={GRAY[700]} strokeWidth={3} strokeDasharray="10 10" />
            ) : null}
            {/* equity area + lines */}
            {areaD ? <path d={areaD} fill="url(#s11area)" /> : null}
            {btPts.length > 1 ? <path d={P(btPts)} fill="none" stroke={GRAY[700]} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" /> : null}
            {eqPts.length > 1 ? <path d={P(eqPts)} fill="none" stroke={BLUE[500]} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" /> : null}

            {/* drawdown bracket */}
            {ddK > 0 ? (
              <g>
                <line x1={xi(6)} x2={lerp(xi(6), xi(8) + 18, ddK)} y1={yv(190)} y2={yv(190)} stroke={GRAY[800]} strokeWidth={3} strokeDasharray="6 7" />
                <path d={`M${xi(8) + 6} ${yv(190)} H${xi(8) + 18} V${lerp(yv(190), yv(164.2), ddK)} H${xi(8) + 6}`} fill="none" stroke={GRAY[900]} strokeWidth={3.5} strokeLinejoin="round" />
              </g>
            ) : null}

            {/* BTC callout markers */}
            {[
              {i: 0, k: c104},
              {i: 6, k: c124},
              {i: 14, k: c63},
            ].map(({i, k}) => (k > 0 ? <circle key={i} cx={xi(i)} cy={yv(btc[i])} r={9 * k} fill={GRAY[900]} stroke={WHITE[100]} strokeWidth={3} /> : null))}

            {/* heads */}
            {headBt && f < T.draw1 + 2 ? <circle cx={headBt[0]} cy={headBt[1]} r={7} fill={GRAY[800]} stroke={WHITE[100]} strokeWidth={3} /> : null}
            {headEq ? <circle cx={headEq[0]} cy={headEq[1]} r={11} fill={BLUE[500]} stroke={WHITE[100]} strokeWidth={4} /> : null}

            {/* monthly P&L bars: up = Blue Glow, down = Gray 700 */}
            <line x1={X0} x2={lerp(X0, X1, gridP)} y1={BAR_BASE} y2={BAR_BASE} stroke={GRAY[600]} strokeWidth={2} />
            {BACKTEST.monthlyPnlK.map((v, i) => {
              const k = h >= i + 1 ? settle(f, (() => {
                for (let fr = T.draw0; fr <= T.draw1; fr++) if (headIdx(fr) >= i + 1) return fr;
                return T.draw1;
              })(), 14, 0.3) : 0;
              if (k <= 0) return null;
              const bx = (xi(i) + xi(i + 1)) / 2;
              const hh = Math.abs(v) * BAR_K * k;
              return <rect key={i} x={bx - 15} y={v > 0 ? BAR_BASE - hh : BAR_BASE} width={30} height={hh} rx={4} fill={v > 0 ? BLUE[500] : GRAY[700]} />;
            })}

            {/* halves: two spans + check badges */}
            {[
              {a: X0, b: xi(7) - 14, k: h1, idle: h1Idle},
              {a: xi(7) + 14, b: X1, k: h2, idle: h2Idle},
            ].map((s, i) => {
              if (s.idle <= 0) return null;
              const mid = (s.a + s.b) / 2;
              const on = clamp01(s.k);
              return (
                <g key={i}>
                  <line x1={s.a} x2={lerp(s.a, s.b, s.idle)} y1={860} y2={860} stroke={on > 0.5 ? BLUE[500] : GRAY[600]} strokeWidth={on > 0.5 ? 5 : 3} strokeLinecap="round" />
                  <g transform={`translate(${mid} 860) scale(${s.idle * (1 + 0.25 * Math.sin(Math.PI * clamp01(s.k)))})`}>
                    <circle r={26} fill={on > 0.5 ? BLUE[500] : WHITE[100]} stroke={on > 0.5 ? BLUE[500] : GRAY[600]} strokeWidth={3} />
                    <g transform="translate(-15 -15)">
                      <Glyph kind="check" color={on > 0.5 ? WHITE[100] : GRAY[700]} size={30} />
                    </g>
                  </g>
                </g>
              );
            })}
            <text x={X0} y={832} fill={GRAY[800]} style={monoS(22)} opacity={gridP}>
              JUN &apos;25
            </text>
            <text x={X1} y={832} textAnchor="end" fill={GRAY[800]} style={monoS(22)} opacity={gridP}>
              JUL &apos;26
            </text>
          </svg>
        ) : null}

        {/* BTC callout chips (HTML for the token mark) */}
        {[
          {i: 0, k: c104, label: '$104k', token: true, dx: 0, dy: 26, anchor: 'left' as const},
          {i: 6, k: c124, label: '$124k', token: false, dx: 0, dy: -70, anchor: 'center' as const},
          {i: 14, k: c63, label: '$63k', token: false, dx: 0, dy: 22, anchor: 'right' as const},
        ].map((c) => {
          if (c.k <= 0) return null;
          const px = xi(c.i);
          const py = yv(btc[c.i]);
          const tx = c.anchor === 'left' ? '0%' : c.anchor === 'center' ? '-50%' : '-100%';
          return (
            <div
              key={c.i}
              style={{
                position: 'absolute',
                left: px + c.dx,
                top: py + c.dy,
                transform: `translateX(${tx}) scale(${c.k})`,
                transformOrigin: c.anchor === 'left' ? '0% 0%' : c.anchor === 'center' ? '50% 100%' : '100% 0%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                height: 48,
                padding: c.token ? '0 18px 0 8px' : '0 18px',
                borderRadius: 24,
                background: GRAY[400],
                color: C.ink,
                ...monoS(26, 0.02),
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {c.token ? <Token id="btc" size={34} /> : null}
              {c.label}
            </div>
          );
        })}

        {/* hero: $271,465 (count-up) + the scene's one turquoise element */}
        {heroP > 0 ? (
          <div style={{position: 'absolute', left: X0 - 4, top: 118, overflow: 'hidden', paddingBottom: 14}}>
            <div
              style={{
                fontFamily: FONT.serif,
                fontSize: 144,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: BLUE[500],
                fontVariantNumeric: 'tabular-nums',
                transform: `translateY(${(1 - heroP) * 110}%) scale(${heroScale})`,
                transformOrigin: '0% 100%',
                whiteSpace: 'nowrap',
              }}
            >
              {fmtUSD(heroV)}
            </div>
          </div>
        ) : null}
        {chipK > 0 ? (
          <div
            style={{
              position: 'absolute',
              left: X0,
              top: 284,
              height: 64,
              padding: '0 26px',
              borderRadius: 32,
              background: TURQ[500],
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              ...monoS(38, 0.02),
              fontWeight: 600,
              transform: `scale(${chipK})`,
              transformOrigin: '0% 50%',
            }}
          >
            +{BACKTEST.returnPct.toFixed(2)}%
          </div>
        ) : null}
      </CardShell>

      {/* stat tiles (3): max drawdown · shorts · longs (both directions profitable) */}
      {[
        {w: 236, label: 'MAX DRAWDOWN', v: (k: number) => `${(BACKTEST.maxDrawdownPct * k).toFixed(1)}%`, blue: false},
        {w: 332, label: 'SHORTS', v: (k: number) => `+${fmtUSD(BACKTEST.bySide.short.pnl * k)}`, blue: true},
        {w: 332, label: 'LONGS', v: (k: number) => `+${fmtUSD(BACKTEST.bySide.long.pnl * k)}`, blue: true},
      ].map((t, i, arr) => {
        const k = tile(i);
        if (k <= 0) return null;
        const left = 72 + arr.slice(0, i).reduce((a, b) => a + b.w + 18, 0);
        const top = cy + K.h + 26;
        return (
          <div
            key={t.label}
            style={{
              position: 'absolute',
              left,
              top,
              width: t.w,
              height: 164,
              borderRadius: 36,
              background: t.blue ? BLUE[500] : C.card,
              border: t.blue ? 'none' : `2px solid ${GRAY[600]}`,
              boxSizing: 'border-box',
              boxShadow: t.blue ? 'none' : CARD.shadow,
              transform: `translateY(${(1 - k) * 70}px)`,
              clipPath: `inset(${(1 - clamp01(k)) * 100}% 0 0 0 round 36px)`,
              padding: '26px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{fontFamily: FONT.serif, fontSize: 54, lineHeight: 1, letterSpacing: '-0.02em', color: t.blue ? WHITE[100] : C.ink, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>
              {t.v(cnt(i))}
            </div>
            <div style={{...monoS(22), color: t.blue ? WHITE[100] : GRAY[900], whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10}}>
              {t.label}
            </div>
          </div>
        );
      })}

      {/* exit: a Blue Glow sheet rises into S12's ground */}
      {f >= T.sheet0 ? <div style={{position: 'absolute', left: 0, right: 0, top: sheetTop, bottom: 0, background: BLUE[500]}} /> : null}
    </AbsoluteFill>
  );
};
