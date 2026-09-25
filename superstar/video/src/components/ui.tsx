import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ramp} from '../anim';
import {A, C, CARD, EASE, FONT} from '../theme';

// ------------------------------------------------------------------
// Deploy viewport card: white surface, 2px #E8E8F1 border, big radius,
// soft shadow (never a glow), mono status header + mono footer.
// ------------------------------------------------------------------

export const PulseDot: React.FC<{size?: number; color?: string; period?: number; dark?: boolean}> = ({
  size = 16,
  color = C.accent,
  period = 144,
}) => {
  const f = useCurrentFrame();
  const t = (f % period) / period; // 2.4s pulse at 60fps
  const ring = t < 0.7 ? (t / 0.7) * size : size;
  const a = t < 0.7 ? 0.5 * (1 - t / 0.7) : 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 0 ${ring}px ${A(a)}`,
        flex: 'none',
      }}
    />
  );
};

export const MonoHead: React.FC<{left: React.ReactNode; right?: React.ReactNode; dark?: boolean; size?: number}> = ({
  left,
  right,
  dark,
  size = 23,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '30px 40px',
      borderBottom: `2px solid ${dark ? C.lineDark : C.border2}`,
      fontFamily: FONT.mono,
      fontSize: size,
      color: dark ? C.t3 : C.t3,
      letterSpacing: '.02em',
      whiteSpace: 'nowrap',
    }}
  >
    <PulseDot />
    <span>{left}</span>
    {right ? <span style={{marginLeft: 'auto', color: dark ? C.t2 : C.faint}}>{right}</span> : null}
  </div>
);

export const MonoFoot: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '14px 36px',
      justifyContent: 'center',
      padding: '28px 36px 34px',
      borderTop: `2px solid ${dark ? C.lineDark : C.border2}`,
      fontFamily: FONT.mono,
      fontSize: 22,
      color: C.t3,
      letterSpacing: '.02em',
    }}
  >
    {children}
  </div>
);

export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
  dark?: boolean;
}> = ({children, style, dark}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: CARD.radius,
      border: dark ? `2px solid ${C.lineDark}` : CARD.border,
      background: dark ? C.panel : C.white,
      overflow: 'hidden',
      boxShadow: dark ? 'none' : CARD.shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small-caps mono micro-label. */
export const Micro: React.FC<{children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties}> = ({
  children,
  color = C.t3,
  size = 22,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT.mono,
      fontSize: size,
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pill / chip (active = accent, inactive = grey). */
export const Pill: React.FC<{active?: number; label: string; size?: number; dark?: boolean; style?: React.CSSProperties}> = ({
  active = 0,
  label,
  size = 30,
  dark,
  style,
}) => {
  const bgIdle = dark ? C.panel3 : C.surf2;
  const mix = (a: string, b: string, t: number) => {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t);
    const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t);
    const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t);
    return `rgb(${r},${g},${bl})`;
  };
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${size * 0.42}px ${size * 0.9}px`,
        borderRadius: 999,
        background: mix(bgIdle, C.accent, active),
        color: mix(dark ? C.t2 : C.t3, C.white, active),
        fontFamily: FONT.mono,
        fontSize: size,
        letterSpacing: '.14em',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {label}
    </div>
  );
};

// ------------------------------------------------------------------
// Kinetic type: words rise from behind their own line mask (no fades).
// ------------------------------------------------------------------
type RevealProps = {
  text: string;
  start: number;
  exit?: number;
  size: number;
  family?: 'serif' | 'sans' | 'mono';
  weight?: number;
  color: string;
  tracking?: number;
  lineHeight?: number;
  stagger?: number;
  dur?: number;
  exitDur?: number;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
  italicWords?: number[]; // indexes rendered in italic
  colorWords?: Record<number, string>;
};

export const Reveal: React.FC<RevealProps> = ({
  text,
  start,
  exit,
  size,
  family = 'serif',
  weight = 400,
  color,
  tracking = -0.03,
  lineHeight = 1.02,
  stagger = 4,
  dur = 30,
  exitDur = 18,
  align = 'left',
  style,
  italicWords = [],
  colorWords = {},
}) => {
  const f = useCurrentFrame();
  const lines = text.split('\n');
  let wi = 0;
  return (
    <div
      style={{
        fontFamily: FONT[family],
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: `${tracking}em`,
        color,
        textAlign: align,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{display: 'block', whiteSpace: 'nowrap'}}>
          {line.split(' ').map((word, k) => {
            const i = wi++;
            const pIn = ramp(f, start + i * stagger, dur, EASE.out);
            const pOut = exit !== undefined ? ramp(f, exit + i * Math.max(1, stagger / 2), exitDur, EASE.in) : 0;
            const y = (1 - pIn) * 110 - pOut * 110;
            return (
              <span
                key={k}
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  paddingBottom: '0.12em',
                  marginBottom: '-0.12em',
                  marginRight: k < line.split(' ').length - 1 ? '0.25em' : 0,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${y}%)`,
                    fontStyle: italicWords.includes(i) ? 'italic' : 'normal',
                    color: colorWords[i] ?? color,
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Count-up number (easeOutCubic by default). */
export const useCount = (f: number, start: number, dur: number, from: number, to: number) => {
  const t = ramp(f, start, dur, EASE.soft);
  return from + (to - from) * t;
};
