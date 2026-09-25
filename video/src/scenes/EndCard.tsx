import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ramp, settle} from '../anim';
import {BANNER, LOGO} from '../brand/logo-data';
import {C, EASE, FONT, FW} from '../theme';
import {EV, SCENES} from '../timeline';

// S8: the official centred lockup ("13 Social banner" in hirehouse-tie-logo.html):
// house mark above the wordmark, tagline beneath. Geometry is the outlined SVG, unaltered.
// The house mark is the hero: it rises into place from its own baseline as the VO says
// "HireHouse." The wordmark builds glyph by glyph (the tie rises as part of the word).

// Content bounds inside the 1200×400 banner viewBox.
const CB = {x0: 282.7, y0: 41, x1: 921.7, y1: 359};
const SCALE = 1.85;
const W = (CB.x1 - CB.x0) * SCALE;
const H = (CB.y1 - CB.y0) * SCALE;
const OX = (1920 - W) / 2 - CB.x0 * SCALE;
const OY = (1080 - H) / 2 - CB.y0 * SCALE - 24;
const M = BANNER.mark;

export const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  if (f < SCENES.s8.from - 30) return null;
  const glyphs = BANNER.glyphs;
  // glyph order left→right with the tie in the slot after "H"
  const parts = [
    {d: glyphs[0], fill: C.ink, k: 0},
    ...BANNER.tie.map((d) => ({d, fill: C.blue, k: 1})),
    ...glyphs.slice(1).map((d, i) => ({d, fill: C.ink, k: i + 2})),
  ];
  const mark = settle(f, EV.s8TieDrop, EV.s8TieLand - EV.s8TieDrop + 14, 0.06);
  const tag = ramp(f, EV.s8Tagline, 30, EASE.out);
  const foot = ramp(f, EV.s8Footer, 28, EASE.out);
  return (
    <AbsoluteFill style={{background: C.white}}>
      <svg width={1200 * SCALE} height={400 * SCALE} viewBox="0 0 1200 400" style={{position: 'absolute', left: OX, top: OY, overflow: 'visible'}}>
        <defs>
          <clipPath id="markBand">
            <rect x={M.x} y={0} width={100 * M.scale} height={M.y + 94 * M.scale} />
          </clipPath>
          <clipPath id="wordBand">
            <rect x={0} y={180} width={1200} height={118} />
          </clipPath>
          <clipPath id="tagBand">
            <rect x={0} y={306} width={1200} height={60} />
          </clipPath>
        </defs>
        {/* house mark rises from its baseline */}
        <g clipPath="url(#markBand)">
          <g transform={`translate(${M.x} ${M.y + (1 - mark) * 140}) scale(${M.scale})`}>
            <path fillRule="evenodd" d={LOGO.mark.d} fill={C.blue} />
          </g>
        </g>
        {/* wordmark, glyph by glyph */}
        <g clipPath="url(#wordBand)">
          {parts.map((p, i) => {
            const q = ramp(f, EV.s8Glyphs + p.k * 3, 30, EASE.out);
            return <path key={i} d={p.d} fill={p.fill} transform={`translate(0 ${(1 - q) * 120})`} />;
          })}
        </g>
        {/* tagline, in the lockup's own ink at 55% */}
        <g clipPath="url(#tagBand)">
          <path d={BANNER.tagline} fill={C.ink} opacity={BANNER.taglineOpacity} transform={`translate(0 ${(1 - tag) * 56})`} />
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
