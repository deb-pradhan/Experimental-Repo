import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {C, FONT, H, W} from './theme';
import {Card, MonoHead, Reveal, Pill} from './components/ui';

export const Test: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.surf}}>
      <AbsoluteFill>
        <ThreeCanvas width={W} height={H} camera={{position: [0, 0, 6], fov: 40}}>
          <mesh rotation={[f / 40, f / 30, 0]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={C.accent} flatShading />
          </mesh>
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 4, 5]} intensity={1.4} />
        </ThreeCanvas>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 72, top: 300}}>
        <Reveal text={'Pick a side.\nOnly when the data does.'} start={0} size={110} color={C.text} />
      </div>
      <Card style={{position: 'absolute', left: 72, right: 72, top: 1300, height: 300}}>
        <MonoHead left="superstar · decision" right="4h review · 06/06" />
        <div style={{display: 'flex', gap: 20, padding: 40}}>
          <Pill label="LONG" active={1} />
          <Pill label="SHORT" />
          <Pill label="FLAT" />
          <span style={{fontFamily: FONT.serif, fontSize: 80, color: C.deep}}>+171%</span>
        </div>
      </Card>
    </AbsoluteFill>
  );
};
