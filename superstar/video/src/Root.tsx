import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Film, SceneFrame} from './Film';
import {FPS, H, W} from './theme';
import {DURATION, SCENES, SceneId} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="SuperstarLaunch" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{withAudio: true}} />
      {(Object.keys(SCENES) as SceneId[]).map((id) => (
        <Composition
          key={id}
          id={id}
          component={() => <SceneFrame id={id} />}
          durationInFrames={SCENES[id].to - SCENES[id].from}
          fps={FPS}
          width={W}
          height={H}
        />
      ))}
    </>
  );
};
