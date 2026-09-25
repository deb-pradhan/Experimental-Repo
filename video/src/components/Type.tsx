import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ramp} from '../anim';
import {EASE, FONT, FW} from '../theme';

// Masks, not fades: every word rises from behind its own line mask
// and leaves the same way. Lines are split on "\n".

type RevealProps = {
  text: string;
  start: number; // global frame of first word
  exit?: number; // global frame exit begins (optional)
  size: number;
  weight?: number;
  color: string;
  tracking?: number; // em
  lineHeight?: number;
  stagger?: number;
  dur?: number;
  exitDur?: number;
  style?: React.CSSProperties;
  numeric?: boolean;
};

export const Reveal: React.FC<RevealProps> = ({
  text,
  start,
  exit,
  size,
  weight = FW.light,
  color,
  tracking = -0.045,
  lineHeight = 1.0,
  stagger = 4,
  dur = 28,
  exitDur = 18,
  style,
  numeric,
}) => {
  const f = useCurrentFrame();
  const lines = text.split('\n');
  let wi = 0;
  return (
    <div
      style={{
        fontFamily: FONT.sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        letterSpacing: `${tracking}em`,
        color,
        fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
        ...style,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{display: 'block', whiteSpace: 'nowrap'}}>
          {line.split(' ').map((word, k) => {
            const i = wi++;
            const pIn = ramp(f, start + i * stagger, dur, EASE.out);
            const pOut = exit === undefined ? 0 : ramp(f, exit + i * Math.round(stagger / 2), exitDur, EASE.in);
            const y = (1 - pIn) * 135 - pOut * 135;
            return (
              <span
                key={k}
                style={{
                  display: 'inline-block',
                  overflow: 'hidden',
                  verticalAlign: 'top',
                  paddingBottom: '0.12em',
                  marginBottom: '-0.12em',
                  marginRight: k < line.split(' ').length - 1 ? '0.24em' : 0,
                }}
              >
                <span style={{display: 'inline-block', transform: `translateY(${y}%)`}}>{word}</span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Chip pair from the kit: black (or white on dark) left pill + lime right pill, 1px gap. */
export const Chips: React.FC<{
  labels: [string] | [string, string];
  start: number;
  exit?: number;
  dark?: boolean;
  x?: number;
  y?: number;
}> = ({labels, start, exit, dark, x = 152, y = 120}) => {
  const f = useCurrentFrame();
  const h = 64;
  return (
    <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 2}}>
      {labels.map((label, i) => {
        const p = ramp(f, start + i * 5, 26, EASE.out);
        const q = exit === undefined ? 0 : ramp(f, exit + i * 3, 16, EASE.in);
        const first = i === 0;
        const single = labels.length === 1;
        const bg = first ? (dark ? '#FFFFFF' : '#000000') : '#E9FEA3';
        const fg = first ? (dark ? '#000000' : '#FFFFFF') : '#000000';
        const radius = single ? '999px' : first ? '999px 0 0 999px' : '0 999px 999px 0';
        return (
          <div
            key={label}
            style={{
              height: h,
              overflow: 'hidden',
              borderRadius: radius,
              clipPath: `inset(0 ${(1 - p + q) * 100}% 0 0 round ${first ? '999px 0 0 999px' : '0 999px 999px 0'})`,
            }}
          >
            <div
              style={{
                height: h,
                background: bg,
                color: fg,
                display: 'flex',
                alignItems: 'center',
                padding: '0 26px',
                fontFamily: FONT.sans,
                fontWeight: FW.mid,
                fontSize: 32,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{transform: `translateY(${(1 - p) * 40}%)`}}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** 0.75pt hairline (2px at 1080p) that draws on left→right. */
export const Hairline: React.FC<{
  x: number;
  y: number;
  w: number;
  start: number;
  color: string;
  dur?: number;
}> = ({x, y, w, start, color, dur = 30}) => {
  const f = useCurrentFrame();
  const p = ramp(f, start, dur, EASE.inOut);
  return <div style={{position: 'absolute', left: x, top: y, width: w * p, height: 2, background: color}} />;
};
