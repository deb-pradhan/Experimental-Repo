import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp, swing} from '../anim';
import {LOGO} from '../brand/logo-data';
import {C, EASE, FONT, FW} from '../theme';
import {EV, SCENES} from '../timeline';

// S8: the official tagline lockup (outlined SVG from hirehouse-tie-logo.html),
// animated part by part. Ink #1F2430 on white; the tie is the only colour event.

const VB = {w: 675.9, h: 220};
const SCALE = 1180 / VB.w; // lockup rendered 1180 px wide
const OX = (1920 - VB.w * SCALE) / 2;
const OY = (1080 - VB.h * SCALE) / 2 - 20;
// Tie knot top-centre in viewBox units (pivot for the swing).
const PIVOT = {x: 132.25, y: 51.0};

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SCENES.s8.from - 30) return null;
  const glyphs = LOGO.wordmark.glyphs;
  const tieDrop = ramp(f, EV.s8TieDrop, EV.s8TieLand - EV.s8TieDrop, EASE.in);
  const tieY = (1 - tieDrop) * -700;
  const tieRot = f < EV.s8TieLand ? -14 * (1 - tieDrop) : swing(f, EV.s8TieLand, 9, 34, 20);
  const rule = ramp(f, EV.s8Rule, 34, EASE.inOut);
  const tag = ramp(f, EV.s8Tagline, 30, EASE.out);
  const foot = ramp(f, EV.s8Footer, 28, EASE.out);
  const R = LOGO.tagline.rule;
  return (
    <AbsoluteFill style={{background: C.white}}>
      <svg
        width={VB.w * SCALE}
        height={VB.h * SCALE}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        style={{position: 'absolute', left: OX, top: OY, overflow: 'visible'}}
      >
        <defs>
          <clipPath id="glyphBand">
            <rect x={0} y={20} width={VB.w} height={112} />
          </clipPath>
          <clipPath id="tagBand">
            <rect x={0} y={150} width={VB.w} height={70} />
          </clipPath>
        </defs>
        <g clipPath="url(#glyphBand)">
          {glyphs.map((g, i) => {
            const p = ramp(f, EV.s8Glyphs + i * 3, 30, EASE.out);
            return <path key={g.id} d={g.d} fill={C.ink} transform={`translate(0 ${(1 - p) * 115})`} />;
          })}
        </g>
        <g transform={`translate(0 ${tieY}) rotate(${tieRot} ${PIVOT.x} ${PIVOT.y})`}>
          {LOGO.wordmark.tie.map((t) => (
            <path key={t.id} d={t.d} fill={C.blue} />
          ))}
        </g>
        <rect x={R.x} y={R.y} width={R.width * rule} height={R.height} rx={R.rx} fill={C.blue} />
        <g clipPath="url(#tagBand)">
          <path d={LOGO.tagline.text} fill={C.ink} transform={`translate(0 ${(1 - tag) * 60})`} />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 168,
          right: 168,
          bottom: 72,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONT.sans,
          fontWeight: FW.mid,
          fontSize: 28,
          letterSpacing: '-0.01em',
          color: C.label,
          clipPath: `inset(${(1 - foot) * 100}% 0 0 0)`,
          transform: `translateY(${(1 - foot) * 30}px)`,
        }}
      >
        <span>hirehouse.xyz</span>
        <span>UAE · India</span>
      </div>
    </AbsoluteFill>
  );
};
