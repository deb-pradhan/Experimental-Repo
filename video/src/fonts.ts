import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Self-hosted variable fonts (latin subset) so renders are deterministic.
// Remotion waits for these promises before capturing any frame.
export const fontsReady = Promise.all([
  loadFont({
    family: 'Manrope',
    url: staticFile('fonts/Manrope-latin.woff2'),
    weight: '200 800',
    format: 'woff2',
  }),
  loadFont({
    family: 'JetBrains Mono',
    url: staticFile('fonts/JetBrainsMono-latin.woff2'),
    weight: '100 800',
    format: 'woff2',
  }),
]);
