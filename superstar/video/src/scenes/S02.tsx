import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {SCENES} from '../timeline';

// PLACEHOLDER — replaced by the scene build.
export const T = {} as const;
export const CUES: {at: number; kind: string; note?: string}[] = [];

export const S02: React.FC = () => {
  const f = useCurrentFrame();
  const s = SCENES.S02;
  const dark = s.ground === 'dark' || s.ground === 'blue';
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily: FONT.mono, fontSize: 34, color: dark ? C.white : C.ink}}>
      S02 · {s.name} · {f}
    </AbsoluteFill>
  );
};
