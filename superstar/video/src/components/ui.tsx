import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ramp} from '../anim';
import {BLUE, C, CARD, EASE, FONT, GRAY, TURQ, WHITE, mixHex} from '../theme';

// ------------------------------------------------------------------
// Deploy viewport card: white surface, 2px #E8E8F1 border, big radius,
// soft shadow (never a glow), mono status header + mono footer.
// ------------------------------------------------------------------

export const PulseDot: React.FC<{size?: number; period?: number; dark?: boolean; color?: string}> = ({
  size = 16,
  period = 144,
  dark,
  color = TURQ[500],
}) => {
  // Live dot: turquoise (the brand's kicker-pill dot). The ring steps through the
  // turquoise ramp toward the ground colour instead of using an opacity tint.
  const f = useCurrentFrame();
  const t = (f % period) / period;
  const k = Math.min(1, t / 0.7);
  const ring = k * size * 0.9;
  const ground = dark ? '#131313' : GRAY[300];
  const ringCol = mixHex(TURQ[300], ground, k);
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: t < 0.7 ? `0 0 0 ${ring}px ${ringCol}` : 'none',
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
      borderBottom: `2px solid ${dark ? C.frost : C.hair}`,
      fontFamily: FONT.mono,
      fontSize: size,
      color: dark ? C.onDarkMute : C.mute2,
      letterSpacing: '.02em',
      whiteSpace: 'nowrap',
    }}
  >
    <PulseDot dark={dark} />
    <span>{left}</span>
    {right ? <span style={{marginLeft: 'auto', color: dark ? C.onDarkMute : C.mute3}}>{right}</span> : null}
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
      borderTop: `2px solid ${dark ? C.frost : C.hair}`,
      fontFamily: FONT.mono,
      fontSize: 22,
      color: dark ? C.onDarkMute : C.mute2,
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
      border: dark ? `2px solid ${C.frost}` : CARD.border,
      background: dark ? C.frost : C.card,
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
  color = C.mute2,
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

/** Pill / chip: active = Blue Glow + white (approved pairing), inactive = Gray 400 + Gray 900. */
export const Pill: React.FC<{active?: number; label: string; size?: number; dark?: boolean; style?: React.CSSProperties}> = ({
  active = 0,
  label,
  size = 30,
  dark,
  style,
}) => {
  const bgIdle = dark ? '#1D2166' : GRAY[400];
  const fgIdle = dark ? '#B8BEFF' : GRAY[900];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${size * 0.42}px ${size * 0.9}px`,
        borderRadius: 999,
        background: mixHex(bgIdle, BLUE[500], active),
        color: mixHex(fgIdle, WHITE[100], active),
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

// ------------------------------------------------------------------
// Step header used by the loop scenes (01–04): Season Serif numeral in
// Blue Glow + Season Sans title, masked rise-in. Place at top: 250.
// ------------------------------------------------------------------
export const StepHeader: React.FC<{n: string; title: string; start: number; exit?: number; onBlue?: boolean; style?: React.CSSProperties}> = ({
  n,
  title,
  start,
  exit,
  onBlue,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, start, 34, EASE.out);
  const q = exit !== undefined ? ramp(f, exit, 20, EASE.in) : 0;
  const line = ramp(f, start + 6, 40, EASE.sys);
  return (
    <div style={{position: 'absolute', left: 72, right: 72, top: 250, ...style}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 28, overflow: 'hidden', paddingBottom: 8}}>
        <span
          style={{
            fontFamily: FONT.serif,
            fontSize: 120,
            lineHeight: 1,
            color: onBlue ? WHITE[100] : BLUE[500],
            transform: `translateY(${(1 - p) * 110 - q * 110}%)`,
            display: 'inline-block',
            letterSpacing: '-0.02em',
          }}
        >
          {n}
        </span>
        <span
          style={{
            fontFamily: FONT.sans,
            fontWeight: 500,
            fontSize: 58,
            lineHeight: 1.05,
            color: onBlue ? WHITE[100] : C.ink,
            transform: `translateY(${(1 - ramp(f, start + 5, 34, EASE.out)) * 130 - q * 130}%)`,
            display: 'inline-block',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </span>
      </div>
      <div style={{height: 2, marginTop: 18, background: onBlue ? BLUE[300] : GRAY[600], transformOrigin: 'left', transform: `scaleX(${line * (1 - q)})`}} />
    </div>
  );
};

// ------------------------------------------------------------------
// ChoiceRow — the decision selector shared by S08 (end) and S09 (start).
// Fixed geometry so the S08→S09 cut is a match cut: centred row, top = CHOICE_Y.
//  on Gray:  inactive Gray 400 / Gray 900 text · active Blue Glow / white
//  on Blue:  inactive Blue 600 / Blue 300 text · active White / Soft Black
//  lock (0..1) on NO TRADE: Turquoise / black text (the scene's single accent)
// ------------------------------------------------------------------
export const CHOICE_Y = 900;
export const CHOICES = ['LONG', 'SHORT', 'NO TRADE'] as const;

export const ChoiceRow: React.FC<{
  active: [number, number, number];
  onBlue?: boolean;
  lock?: number;
  y?: number;
  scale?: number;
  style?: React.CSSProperties;
}> = ({active, onBlue, lock = 0, y = CHOICE_Y, scale = 1, style}) => {
  const size = 40;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: y,
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        ...style,
      }}
    >
      {CHOICES.map((label, i) => {
        const a = active[i];
        const idleBg = onBlue ? BLUE[600] : GRAY[400];
        const idleFg = onBlue ? BLUE[300] : GRAY[900];
        const onBg = onBlue ? WHITE[100] : BLUE[500];
        const onFg = onBlue ? '#131313' : WHITE[100];
        let bg = mixHex(idleBg, onBg, a);
        let fg = mixHex(idleFg, onFg, a);
        if (i === 2 && lock > 0) {
          bg = mixHex(onBlue ? WHITE[100] : BLUE[500], TURQ[500], lock);
          fg = mixHex(onBlue ? '#131313' : WHITE[100], '#000000', lock);
        }
        return (
          <div
            key={label}
            style={{
              padding: `${size * 0.46}px ${size * 0.95}px`,
              borderRadius: 999,
              background: bg,
              color: fg,
              fontFamily: FONT.mono,
              fontSize: size,
              fontWeight: 500,
              letterSpacing: '.14em',
              whiteSpace: 'nowrap',
              transform: `scale(${1 + 0.06 * Math.sin(Math.PI * Math.min(1, a))})`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};
