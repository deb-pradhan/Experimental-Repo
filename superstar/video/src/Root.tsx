import React from 'react';
import {Composition} from 'remotion';
import './fonts';
import {FPS, H, W} from './theme';
import {Test} from './Test';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Test" component={Test} durationInFrames={120} fps={FPS} width={W} height={H} />
    </>
  );
};
