import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp} from '../anim';
import {BLUE, C, FONT, WHITE, mixHex} from '../theme';

// ------------------------------------------------------------------
// Small helpers shared by S06 / S07 / S08 (the "how it works" scenes).
// ------------------------------------------------------------------

export type Cue = {at: number; kind: string; note?: string};

/** Live dot in Blue Glow (for scenes whose single turquoise element lives elsewhere).
 *  The ring steps along the Blue ramp toward white instead of using an opacity tint. */
export const BlueDot: React.FC<{size?: number; period?: number; phase?: number}> = ({size = 16, period = 144, phase = 0}) => {
  const f = useCurrentFrame();
  const t = (((f + phase) % period) + period) % period / period;
  const k = Math.min(1, t / 0.7);
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: BLUE[500],
        boxShadow: t < 0.7 ? `0 0 0 ${k * size * 0.9}px ${mixHex(BLUE[200], WHITE[100], k)}` : 'none',
        flex: 'none',
      }}
    />
  );
};

/** MonoHead clone whose live dot is Blue Glow (same geometry as ui.tsx MonoHead). */
export const HeadBar: React.FC<{left: React.ReactNode; right?: React.ReactNode; size?: number}> = ({left, right, size = 23}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '30px 40px',
      borderBottom: `2px solid ${C.hair}`,
      fontFamily: FONT.mono,
      fontSize: size,
      color: C.mute2,
      letterSpacing: '.02em',
      whiteSpace: 'nowrap',
      background: C.card,
    }}
  >
    <BlueDot />
    <span>{left}</span>
    {right ? <span style={{marginLeft: 'auto', color: C.mute3}}>{right}</span> : null}
  </div>
);

/** Number of characters typed at frame f (cps = chars per frame). */
export const typedN = (f: number, start: number, len: number, cps = 1.4) => clamp(Math.floor((f - start) * cps), 0, len);

/** Mono typing: typed part visible, the rest reserved (transparent) so layout never shifts. */
export const Typed: React.FC<{text: string; start: number; cps?: number; style?: React.CSSProperties; caret?: string}> = ({
  text,
  start,
  cps = 1.4,
  style,
  caret,
}) => {
  const f = useCurrentFrame();
  const n = typedN(f, start, text.length, cps);
  const typing = n > 0 && n < text.length;
  return (
    <span style={{whiteSpace: 'pre', ...style}}>
      {text.slice(0, n)}
      {typing && caret ? (
        <span style={{position: 'relative'}}>
          <span style={{position: 'absolute', left: 0, top: '8%', bottom: '8%', width: '0.55em', background: caret}} />
          <span style={{color: 'transparent'}}>{text.slice(n)}</span>
        </span>
      ) : (
        <span style={{color: 'transparent'}}>{text.slice(n)}</span>
      )}
    </span>
  );
};

/** Duration in frames to type `text` at cps. */
export const typeDur = (text: string, cps = 1.4) => Math.ceil(text.length / cps);

// ------------------------------------------------------------------
// Path sampler: build a path from segments, get its SVG `d`, its length
// and the point at any fraction (for draw-ons and pulses).
// ------------------------------------------------------------------
type Pt = [number, number];
export class PathS {
  pts: Pt[] = [];
  d = '';
  cum: number[] = [0];
  constructor(start: Pt) {
    this.pts.push(start);
    this.d = `M${start[0].toFixed(2)} ${start[1].toFixed(2)}`;
  }
  private push(p: Pt) {
    const q = this.pts[this.pts.length - 1];
    this.cum.push(this.cum[this.cum.length - 1] + Math.hypot(p[0] - q[0], p[1] - q[1]));
    this.pts.push(p);
  }
  L(x: number, y: number) {
    this.push([x, y]);
    this.d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
    return this;
  }
  C(c1: Pt, c2: Pt, e: Pt, n = 28) {
    const s = this.pts[this.pts.length - 1];
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      this.push([
        u * u * u * s[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * e[0],
        u * u * u * s[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * e[1],
      ]);
    }
    this.d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${e[0].toFixed(2)} ${e[1].toFixed(2)}`;
    return this;
  }
  /** Quarter-ish corner via quadratic (sampled as cubic). */
  Q(c: Pt, e: Pt, n = 12) {
    const s = this.pts[this.pts.length - 1];
    const c1: Pt = [s[0] + (2 / 3) * (c[0] - s[0]), s[1] + (2 / 3) * (c[1] - s[1])];
    const c2: Pt = [e[0] + (2 / 3) * (c[0] - e[0]), e[1] + (2 / 3) * (c[1] - e[1])];
    return this.C(c1, c2, e, n);
  }
  get len() {
    return this.cum[this.cum.length - 1];
  }
  at(u: number): Pt {
    const L = clamp(u, 0, 1) * this.len;
    let lo = 0, hi = this.cum.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (this.cum[m] < L) lo = m;
      else hi = m;
    }
    const seg = this.cum[hi] - this.cum[lo] || 1;
    const k = (L - this.cum[lo]) / seg;
    const a = this.pts[lo], b = this.pts[hi];
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
}

/** Compact USD: $84 · $4.4K · $249K · $25.56B */
export const usdCompact = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `$${(v / 1e6).toFixed(a >= 1e8 ? 0 : 1)}M`;
  if (a >= 1e4) return `$${Math.round(v / 1e3)}K`;
  if (a >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${Math.round(v)}`;
};

export const px = (n: number) => `${n}px`;
