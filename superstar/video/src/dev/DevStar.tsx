import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {Star3D, StarGlyph} from '../components/Star';
import {Token} from '../components/Token';
import {C} from '../theme';

export const DevStar: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.gray}}>
      <AbsoluteFill style={{opacity: 1}}>
        <OffthreadVideo src={staticFile('plates/p3_core_light.mp4')} startFrom={300} muted />
      </AbsoluteFill>
      <AbsoluteFill style={{clipPath: 'inset(0 0 0 50%)'}}>
        <AbsoluteFill style={{background: C.gray}} />
        <Star3D width={1080} height={1920} x={0} y={-10} size={800} rot={[0.5 + f * 0.004, 0.3 + f * 0.01, 0.2]} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 60, bottom: 120, display: 'flex', gap: 30, alignItems: 'center'}}>
        <StarGlyph size={120} />
        <Token id="btc" size={100} />
        <Token id="usdc" size={100} />
        <Token id="hyperliquid" size={100} />
      </div>
    </AbsoluteFill>
  );
};
