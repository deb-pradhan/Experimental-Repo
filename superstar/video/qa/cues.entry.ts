import {SCENES} from '../src/timeline';
import * as S01 from '../src/scenes/S01';
import * as S02 from '../src/scenes/S02';
import * as S03 from '../src/scenes/S03';
import * as S04 from '../src/scenes/S04';
import * as S05 from '../src/scenes/S05';
import * as S06 from '../src/scenes/S06';
import * as S07 from '../src/scenes/S07';
import * as S08 from '../src/scenes/S08';
import * as S09 from '../src/scenes/S09';
import * as S10 from '../src/scenes/S10';
import * as S11 from '../src/scenes/S11';
import * as S12 from '../src/scenes/S12';
import * as S13 from '../src/scenes/S13';

const MODS: Record<string, {CUES?: {at: number; kind: string; note?: string}[]}> = {S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13};
const out: any[] = [];
for (const [id, m] of Object.entries(MODS)) {
  const sc = (SCENES as any)[id] ?? (SCENES as any[]).find?.((s: any) => s.id === id);
  for (const c of m.CUES ?? []) {
    const dur = /dur=(\d+)/.exec(c.note ?? '');
    out.push({scene: id, film: sc.from + Math.round(c.at), t: +((sc.from + c.at) / 60).toFixed(3), kind: c.kind, dur: dur ? +dur[1] : undefined, note: c.note});
  }
}
out.sort((a, b) => a.film - b.film);
process.stdout.write(JSON.stringify(out, null, 1));
