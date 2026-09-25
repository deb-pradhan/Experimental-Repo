import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp} from '../anim';
import {LOGO} from '../brand/logo-data';
import {C, EASE, FONT, FW} from '../theme';
import {EV, SCENES} from '../timeline';

// S8: the official tagline lockup ("10 Tagline lockup" in hirehouse-tie-logo.html):
// wordmark, accent rule, positioning line. One logo format only (the house mark has
// already had its moments: landing on the pile and living in the product's title bar).
// Geometry is the outlined SVG, unaltered; ink #1F2430 on white.

const VB = {w: 675.9, h: 220};
const SCALE = 1180 / VB.w; // lockup 1180 px wide
const OX = (1920 - VB.w * SCALE) / 2;
const OY = (1080 - VB.h * SCALE) / 2 - 20;

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SCENES.s8.from - 30) return null;
  const g = LOGO.wordmark.glyphs;
  // glyph order left→right; the tie is simply part of the word (the i), it is not singled out
  const parts = [
    {d: g[0].d, fill: C.ink, k: 0},
    ...LOGO.wordmark.tie.map((t) => ({d: t.d, fill: C.blue, k: 1})),
    ...g.slice(1).map((x, i) => ({d: x.d, fill: C.ink, k: i + 2})),
  ];
  const rule = ramp(f, EV.s8Rule, 34, EASE.inOut);
  const tag = ramp(f, EV.s8Tagline, 30, EASE.out);
  const foot = ramp(f, EV.s8Footer, 28, EASE.out);
  const R = LOGO.tagline.rule;
  return (
    <AbsoluteFill style={{background: C.white}}>
      <svg width={VB.w * SCALE} height={VB.h * SCALE} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{position: 'absolute', left: OX, top: OY, overflow: 'visible'}}>
        <defs>
          <clipPath id="glyphBand">
            <rect x={0} y={20} width={VB.w} height={112} />
          </clipPath>
          <clipPath id="tagBand">
            <rect x={0} y={150} width={VB.w} height={70} />
          </clipPath>
        </defs>
        <g clipPath="url(#glyphBand)">
          {parts.map((p, i) => {
            const q = ramp(f, EV.s8Glyphs + p.k * 3, 30, EASE.out);
            return <path key={i} d={p.d} fill={p.fill} transform={`translate(0 ${(1 - q) * 115})`} />;
          })}
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
