// Checks app/machines.js against kits.json and writes app/machine-files.json:
// the full sample list of each famous machine (the long-press swap sheet uses
// it). Run after editing machines.js: `node scripts/build-machines.mjs`
import { readFile, writeFile } from 'node:fs/promises';
import { MACHINES } from '../app/machines.js';

const kits = JSON.parse(await readFile(new URL('../kits.json', import.meta.url), 'utf8'));
const byZip = new Map(kits.map((k) => [k.zip, k]));
const out = {};
let problems = 0;

for (const m of MACHINES) {
  const kit = byZip.get(m.zip);
  if (!kit) { console.error(`${m.name}: no kit ${m.zip}`); problems++; continue; }
  if (kit.root !== m.root) { console.error(`${m.name}: root is ${JSON.stringify(kit.root)}`); problems++; }
  const files = new Set(kit.files);
  for (const [lane, pad] of Object.entries(m.pads)) {
    const file = Array.isArray(pad) ? pad[0] : pad;
    if (!files.has(file)) { console.error(`${m.name}: ${lane} -> ${file} not in kit`); problems++; }
  }
  out[m.id] = kit.files;
}

await writeFile(new URL('../app/machine-files.json', import.meta.url), JSON.stringify(out));
console.log(`${MACHINES.length} machines, ${Object.values(out).flat().length} samples` + (problems ? `, ${problems} problems` : ''));
process.exit(problems ? 1 : 0);
