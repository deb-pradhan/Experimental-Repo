import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {ActOne} from './scenes/ActOne';
import {ActThree} from './scenes/ActThree';
import {ActTwo} from './scenes/ActTwo';
import {EndCard} from './scenes/EndCard';
import {C} from './theme';
import {SCENES} from './timeline';

// The master timeline. Scenes are written against GLOBAL frames (timeline.ts),
// so layering is explicit and every sync point is readable in one place.

export const Film: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: C.black}}>
      {/* Act I — 3D: the pile, the filter, the read (mounted only while on screen) */}
      <Sequence from={0} durationInFrames={SCENES.s3.to} layout="none">
        <ActOne />
      </Sequence>
      {/* Act II — the product: ranked, interviewed */}
      {f >= SCENES.s4.from && f < SCENES.s5.to + 40 && <ActTwo />}
      {/* End card sits under the blue curtain so the lift reveals it */}
      {f >= SCENES.s8.from - 30 && <EndCard />}
      {/* Act III — shortlist, climax */}
      {f >= SCENES.s6.from - 20 && <ActThree />}
      {withAudio && <Audio src={staticFile('audio/hirehouse_mix.wav')} />}
    </AbsoluteFill>
  );
};
