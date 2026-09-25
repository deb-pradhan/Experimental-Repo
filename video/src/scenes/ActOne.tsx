import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {lerp, ramp} from '../anim';
import {Chips, Reveal} from '../components/Type';
import {PileCanvas} from '../three/Pile';
import {landedCount, markCenterScreen, project, SCAN_Z, scanY} from '../three/pileModel';
import {C, EASE, FONT, FW} from '../theme';
import {EV} from '../timeline';

// S1–S3: the 3D pile with its DOM overlays. At the end the black void
// contracts into the product window of S4 while the ground turns white.

export const WINDOW = {x: 960, y: 150, r: 30} as const; // right edge = 1752, bleeds off the bottom

const Counter: React.FC = () => {
  const f = useCurrentFrame();
  const n = landedCount(f);
  const pIn = ramp(f, 128, 28);
  const pOut = ramp(f, 244, 18, EASE.in);
  const y = (1 - pIn) * 135 - pOut * 135;
  return (
    <div
      style={{
        position: 'absolute',
        left: 168,
        top: 318,
        fontFamily: FONT.sans,
        fontWeight: FW.light,
        fontSize: 150,
        lineHeight: 1,
        letterSpacing: '-0.045em',
        color: C.white,
        overflow: 'hidden',
        paddingBottom: '0.12em',
      }}
    >
      <div style={{transform: `translateY(${y}%)`, whiteSpace: 'nowrap'}}>
        {/* revealed only once the count has three digits; tabular so the line never jitters */}
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{n}</span>{' '}
        applications.
      </div>
    </div>
  );
};

const Meta: React.FC = () => {
  const f = useCurrentFrame();
  const n = landedCount(f);
  const pIn = ramp(f, 14, 30);
  const pOut = ramp(f, 460, 16, EASE.in);
  return (
    <div
      style={{
        position: 'absolute',
        left: 168,
        top: 944,
        fontFamily: FONT.mono,
        fontSize: 24,
        lineHeight: 1.5,
        letterSpacing: '0.04em',
        color: C.mutedDark,
        opacity: 1,
        clipPath: `inset(0 0 ${(1 - pIn + pOut) * 100}% 0)`,
      }}
    >
      <div>QA ENGINEER</div>
      <div>
        APPLICANTS <span style={{color: C.lime}}>{String(n).padStart(4, '0')}</span>
      </div>
    </div>
  );
};

// Keyword filter label + tags ride the 3D scan line (projected every frame).
const ScanTags: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 272 || f > 378) return null;
  const y = scanY(f);
  const items = ['KEYWORD FILTER', '"Selenium"', '"5+ years"', '"ISTQB"'];
  const anchor = project(f, -40, y, SCAN_Z);
  let x = Math.max(anchor.x, 980);
  return (
    <>
      {items.map((t, i) => {
        const label = i === 0;
        const w = label ? 250 : t.length * 13 + 36;
        const left = x;
        x += w + 12;
        const pt = project(f, left - 960, y, SCAN_Z);
        return (
          <div
            key={t}
            style={{
              position: 'absolute',
              left,
              top: pt.y - 54,
              height: 42,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 999,
              background: label ? C.white : C.black,
              boxShadow: label ? undefined : `inset 0 0 0 2px ${C.white}`,
              color: label ? C.black : C.white,
              fontFamily: FONT.mono,
              fontSize: label ? 18 : 20,
              letterSpacing: label ? '0.08em' : 0,
              whiteSpace: 'nowrap',
              clipPath: `inset(0 ${(1 - ramp(f, 274 + i * 4, 14)) * 100}% 0 0 round 999px)`,
            }}
          >
            {t}
          </div>
        );
      })}
    </>
  );
};

const Pulse: React.FC = () => {
  const f = useCurrentFrame();
  if (f < EV.s3TieLand || f > EV.s3TieLand + 60) return null;
  const tip = markCenterScreen();
  const rings = [0, 8, 16];
  return (
    <svg style={{position: 'absolute', inset: 0}} width={1920} height={1080}>
      {rings.map((d) => {
        const p = ramp(f, EV.s3TieLand + d, 46, EASE.out);
        if (p <= 0 || p >= 1) return null;
        return <circle key={d} cx={tip.x} cy={tip.y} r={lerp(10, 1500, p)} fill="none" stroke={C.white} strokeWidth={2} />;
      })}
    </svg>
  );
};

export const ActOne: React.FC<{hide?: string[]}> = ({hide = []}) => {
  const f = useCurrentFrame();
  // Void → product window (clip-path contraction). Ground behind is white.
  const v = ramp(f, EV.s3VoidClose, 52, EASE.inOut);
  const top = lerp(0, WINDOW.y, v);
  const right = lerp(0, 1920 - 1752, v);
  const left = lerp(0, WINDOW.x, v);
  const bottom = lerp(0, -60, v);
  const radius = lerp(0, WINDOW.r, v);
  return (
    <AbsoluteFill style={{background: C.white}}>
      <AbsoluteFill style={{clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius}px)`, background: C.black}}>
        {!hide.includes('canvas') && <PileCanvas />}
      </AbsoluteFill>

      {!hide.includes('s1') && (<>
      <Reveal text="One role." start={EV.s1Line1} exit={244} size={150} color={C.white} style={{position: 'absolute', left: 168, top: 170}} />
      <Counter />
      <Meta />
      </>)}

      {!hide.includes('s2') && (<>
      <Chips labels={['Keyword filter']} start={EV.s2ChipIn} exit={468} dark />
      <Reveal text={'Most are\nnever read.'} start={EV.s2Super} exit={470} size={150} color={C.white} stagger={5} style={{position: 'absolute', left: 168, top: 218}} />
      <ScanTags />
      </>)}

      {!hide.includes('s3') && (<>
      <Pulse />
      <Chips labels={['HireHouse', 'Every application']} start={EV.s3ReadWave} exit={650} dark />
      <Reveal
        text={'Every application,\nread.'}
        start={EV.s3ReadWave + 6}
        exit={652}
        size={124}
        color={C.white}
        stagger={5}
        style={{position: 'absolute', left: 168, top: 218}}
      />
      </>)}
    </AbsoluteFill>
  );
};
