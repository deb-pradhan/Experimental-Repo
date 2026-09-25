import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {Film} from './Film';
import {ActOne} from './scenes/ActOne';
import {FPS, H, W} from './theme';
import {DURATION} from './timeline';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="HireHouseLaunch" component={Film} durationInFrames={DURATION} fps={FPS} width={W} height={H} defaultProps={{withAudio: true}} />
      <Composition id="ActOne" component={ActOne} durationInFrames={720} fps={FPS} width={W} height={H} defaultProps={{hide: []}} />
    </>
  );
};
