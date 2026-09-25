import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {C} from './theme';
import {SCENES, SceneId} from './timeline';
import {S01} from './scenes/S01';
import {S02} from './scenes/S02';
import {S03} from './scenes/S03';
import {S04} from './scenes/S04';
import {S05} from './scenes/S05';
import {S06} from './scenes/S06';
import {S07} from './scenes/S07';
import {S08} from './scenes/S08';
import {S09} from './scenes/S09';
import {S10} from './scenes/S10';
import {S11} from './scenes/S11';
import {S12} from './scenes/S12';
import {S13} from './scenes/S13';

export const SCENE_COMPONENTS: Record<SceneId, React.FC> = {S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13};

export const GROUND = {dark: C.softBlack, gray: C.gray, blue: C.blue, white: C.white} as const;

/** One scene on its own ground (used by the per-scene compositions and the film). */
export const SceneFrame: React.FC<{id: SceneId}> = ({id}) => {
  const Comp = SCENE_COMPONENTS[id];
  return (
    <AbsoluteFill style={{background: GROUND[SCENES[id].ground], overflow: 'hidden'}}>
      <Comp />
    </AbsoluteFill>
  );
};

export const Film: React.FC<{withAudio?: boolean}> = ({withAudio}) => {
  return (
    <AbsoluteFill style={{background: C.softBlack}}>
      {/* the finished mix (score + narration + designed SFX), built by tools/mix_audio.py */}
      {withAudio && <Audio src={staticFile('audio/mix.wav')} />}
      {(Object.keys(SCENES) as SceneId[]).map((id) => (
        <Sequence key={id} from={SCENES[id].from} durationInFrames={SCENES[id].to - SCENES[id].from} name={`${id} · ${SCENES[id].name}`}>
          <SceneFrame id={id} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
