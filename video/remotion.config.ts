import {Config} from '@remotion/cli/config';

// Headless Chromium shipped with the container (no download needed).
Config.setBrowserExecutable(
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
);
// CPU WebGL (SwiftShader via ANGLE) for the three.js scenes.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('png');
Config.setConcurrency(4);
Config.setCodec('h264');
Config.setCrf(14);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
