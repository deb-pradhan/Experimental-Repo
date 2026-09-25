import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Deploy's own typefaces (served by deploy.finance), self-hosted so renders are deterministic.
export const fontsReady = Promise.all([
  loadFont({family: 'Season Serif', url: staticFile('fonts/SeasonSerif-Regular.woff2'), weight: '400', format: 'woff2'}),
  loadFont({family: 'Season Serif', url: staticFile('fonts/SeasonSerif-Medium.woff2'), weight: '500', format: 'woff2'}),
  loadFont({family: 'Season Sans', url: staticFile('fonts/SeasonSans-Regular.woff2'), weight: '400', format: 'woff2'}),
  loadFont({family: 'Season Sans', url: staticFile('fonts/SeasonSans-Medium.woff2'), weight: '500', format: 'woff2'}),
  loadFont({family: 'Geist Mono', url: staticFile('fonts/GeistMono.woff2'), weight: '100 900', format: 'woff2'}),
  loadFont({family: 'Inter', url: staticFile('fonts/Inter-latin.woff2'), weight: '100 900', format: 'woff2'}),
]);
