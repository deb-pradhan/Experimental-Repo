import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ramp, settle} from '../anim';
import {LOGO} from '../brand/logo-data';
import {C, EASE, FONT, FW} from '../theme';

// Kit components (assets/brand/shadcn-editorial.html) at film scale (~2.1× web).

export const Badge: React.FC<{kind: 'secondary' | 'primary' | 'accent' | 'default'; children: React.ReactNode; style?: React.CSSProperties}> = ({
  kind,
  children,
  style,
}) => {
  const bg = {secondary: C.greyBlock, primary: C.blue, accent: C.lime, default: C.black}[kind];
  const fg = kind === 'primary' || kind === 'default' ? C.white : C.black;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 38,
        padding: '0 17px',
        borderRadius: 999,
        background: bg,
        color: fg,
        fontFamily: FONT.sans,
        fontWeight: FW.mid,
        fontSize: 21,
        letterSpacing: '-0.005em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export const Avatar: React.FC<{initials: string; bg: string; size?: number}> = ({initials, bg, size = 48}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: 999,
      background: bg,
      color: bg === C.blue || bg === C.black ? C.white : C.black,
      display: 'grid',
      placeItems: 'center',
      fontFamily: FONT.sans,
      fontWeight: FW.bold,
      fontSize: size * 0.36,
      letterSpacing: '-0.02em',
      flex: 'none',
    }}
  >
    {initials}
  </span>
);

/** Window chrome: title + right-hand slot. The app icon (house mark) is drawn by the
 *  window itself so it holds still while the chrome content changes around it. */
export const Chrome: React.FC<{title: string; right?: React.ReactNode}> = ({title, right}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, height: 40}}>
    <span style={{fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 28, letterSpacing: '-0.02em', color: C.white}}>{title}</span>
    <span style={{marginLeft: 'auto'}}>{right}</span>
  </div>
);

/** The official house mark (primary symbol), single path with the tie knocked out. */
export const HouseMark: React.FC<{size: number; color?: string; style?: React.CSSProperties}> = ({size, color = C.blue, style}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path fillRule="evenodd" d={LOGO.mark.d} fill={color} />
  </svg>
);

/** Kit switch: grey-block track → blue when on, white knob. */
export const Switch: React.FC<{onAt: number}> = ({onAt}) => {
  const f = useCurrentFrame();
  const p = ramp(f, onAt, 14, EASE.kit);
  return (
    <span
      style={{
        position: 'relative',
        width: 80,
        height: 44,
        borderRadius: 999,
        background: p > 0.5 ? C.blue : C.greyBlock,
        display: 'inline-block',
        flex: 'none',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          width: 36,
          height: 36,
          borderRadius: 999,
          background: C.white,
          transform: `translateX(${p * 36}px)`,
        }}
      />
    </span>
  );
};

/** Kit progress/meter on a dark surface: true 0–100 scale, lime fill. */
export const Meter: React.FC<{label: string; value: number; start: number; width?: number}> = ({label, value, start, width = 736}) => {
  const f = useCurrentFrame();
  const p = ramp(f, start, 50, EASE.kit);
  const shown = Math.round(value * p);
  return (
    <div style={{width, display: 'flex', alignItems: 'center', gap: 22}}>
      <span style={{width: 250, fontFamily: FONT.sans, fontWeight: FW.mid, fontSize: 24, color: C.white, letterSpacing: '-0.01em'}}>{label}</span>
      <span style={{flex: 1, height: 8, borderRadius: 999, background: C.borderOnDark, position: 'relative', overflow: 'hidden'}}>
        <span style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${value * p}%`, background: C.lime, borderRadius: 999}} />
      </span>
      <span style={{width: 60, textAlign: 'right', fontFamily: FONT.mono, fontSize: 24, color: C.white, fontVariantNumeric: 'tabular-nums'}}>
        {shown}
      </span>
    </div>
  );
};

/** Kit toast (sonner): black pill, lime check. On black grounds it takes the kit's
 *  overlay hairline ring. Springs in from the right, masks out to the right. */
export const Toast: React.FC<{text: string; at: number; outAt?: number; ring?: boolean; style?: React.CSSProperties}> = ({
  text,
  at,
  outAt,
  ring,
  style,
}) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = settle(f, at, 28, 0.1);
  const o = outAt === undefined ? 0 : ramp(f, outAt, 16, EASE.in);
  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 24,
        height: 84,
        padding: '0 16px 0 36px',
        borderRadius: 999,
        background: C.black,
        boxShadow: ring ? `inset 0 0 0 2px ${C.borderOnDark}` : undefined,
        color: C.white,
        fontFamily: FONT.sans,
        fontWeight: FW.mid,
        fontSize: 30,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
        transform: `translateX(${(1 - s) * 560 + o * 560}px)`,
        clipPath: `inset(0 ${o * 100}% 0 0 round 999px)`,
        zIndex: 20,
        ...style,
      }}
    >
      <span>{text}</span>
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: 999,
          background: C.lime,
          color: C.black,
          display: 'grid',
          placeItems: 'center',
          fontWeight: FW.bold,
          fontSize: 28,
          transform: `scale(${ramp(f, at + 8, 16, EASE.out)})`,
        }}
      >
        ✓
      </span>
    </div>
  );
};

/** The signature bleeding-bar wipe: bars slide in from the left edge with a ragged
 *  leading edge, then hold as the next ground. */
export const BarWipe: React.FC<{start: number; color: string; bars?: number; dur?: number; stagger?: number}> = ({
  start,
  color,
  bars = 6,
  dur = 30,
  stagger = 3,
}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  const h = 1080 / bars;
  const order = [2, 0, 4, 1, 5, 3];
  return (
    <>
      {Array.from({length: bars}, (_, i) => {
        const p = ramp(f, start + order[i % order.length] * stagger, dur, EASE.inOut);
        return (
          <div
            key={i}
            style={{position: 'absolute', left: 0, top: i * h - 1, height: h + 2, width: 1920 * p + 2, background: color}}
          />
        );
      })}
    </>
  );
};
