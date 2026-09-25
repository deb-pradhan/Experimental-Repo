// Fast frame QA: bundle once, render many stills, tile a contact sheet.
// usage: node tools/stills.mjs <CompositionId> <outDir> <frame,frame,...> [scale=0.5] [cols=4]
// e.g.   node tools/stills.mjs S07 /tmp/qa/s07 0,30,60,120,240,360,450,479
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const video = path.resolve(here, '..');
const [, , id, outDir, framesArg, scaleArg = '0.5', colsArg = '4'] = process.argv;
const frames = framesArg.split(',').map(Number);
const scale = Number(scaleArg);
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(video, 'src/index.ts'), publicDir: path.join(video, 'public'), webpackOverride: (c) => c});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const chromiumOptions = {gl: 'swangle'};
const composition = await selectComposition({serveUrl, id, browserExecutable, chromiumOptions});
const files = [];
for (const f of frames) {
  const out = path.join(outDir, `${id}_${String(f).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame: f, output: out, scale, browserExecutable, chromiumOptions, overwrite: true});
  files.push(out);
  process.stdout.write(`${f} `);
}
// contact sheet with frame labels (PIL)
const sheet = path.join(outDir, `${id}_sheet.png`);
try {
  execFileSync('python3', [path.resolve(video, '../tools/sheet.py'), sheet, colsArg, ...files]);
  console.log(`\nsheet: ${sheet}`);
} catch (e) {
  console.log('\n(sheet failed; individual stills are in', outDir, ')');
}
