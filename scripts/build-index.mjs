// Builds kits.json: an index of every kit (zip) in the archive.org
// drum-machines-collection, with the sample files inside each zip and a
// category code for each file. Run once: `node scripts/build-index.mjs`
import { writeFile } from 'node:fs/promises';

const ITEM = 'drum-machines-collection';
const BASE = `https://archive.org/download/${ITEM}/`;
const CONCURRENCY = 6;
const AUDIO = /\.(wav|aif|aiff)$/i;

// Category codes, checked in order (first match wins):
// o open hat, h closed/pedal hat, c clap, r rim, k kick, s snare,
// t tom, y cymbal, p perc/other
const RULES = [
  ['o', /ohh|open|ohat|(^|[^a-z])oh([^a-z]|$)|hat[ _-]?o([^a-z]|$)|(^|[^a-z])hh[ _-]?op?([^a-z]|$)|hhop/],
  ['h', /chh|phh|closed|pedal|hi-?hat|hihat|hat|(^|[^a-z])(hh|ch|hats)([^a-z]|$)|(^|[^a-z])hh/],
  ['c', /clap|(^|[^a-z])(cp|clp|hc)([^a-z]|$)/],
  ['r', /rim|stick|(^|[^a-z])(rs|ss|sst)[hl]?([^a-z]|$)/],
  ['k', /kick|kik|bass ?drum|bassdrum|b ?drum|(^|[^a-z])(bd|bass|kck|kk)([^a-z]|$)/],
  ['s', /snare|snr|(^|[^a-z])(sd|sn|sna|snar)([^a-z]|$)/],
  ['t', /tom|conga|bongo|timbal|tabla|(^|[^a-z])(tm|lt|mt|ht|lo ?t|hi ?t)([^a-z]|$)/],
  ['y', /crash|ride|cym|splash|china|(^|[^a-z])(cy|cr|rd)([^a-z]|$)/],
];

export function classify(path) {
  const parts = path.toLowerCase().replace(AUDIO, '').split('/');
  const base = parts.pop();
  for (const [code, re] of RULES) if (re.test(base)) return code;
  for (const dir of parts.reverse())
    for (const [code, re] of RULES) if (re.test(dir)) return code;
  return 'p';
}

async function get(url, as = 'text', tries = 4) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === 'json' ? res.json() : res.text();
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 1000 * i * i));
    }
  }
}

async function listZip(zip) {
  const html = await get(BASE + encodeURIComponent(zip) + '/');
  const prefix = `/${ITEM}/${zip}/`;
  const files = new Set();
  for (const [, raw] of html.matchAll(/href="([^"]+)"/g)) {
    let href;
    try { href = decodeURIComponent(raw.replaceAll('&amp;', '&')); } catch { continue; }
    const at = href.indexOf(prefix);
    if (at < 0) continue;
    const path = href.slice(at + prefix.length);
    if (AUDIO.test(path) && !path.includes('__MACOSX')) files.add(path);
  }
  return [...files].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

// One kit entry. Most zips wrap everything in a single top folder; store it
// once as `root` instead of repeating it on every file path.
function entry(zip, paths) {
  const top = paths[0].split('/')[0] + '/';
  const root = paths.every((p) => p.startsWith(top)) ? top : '';
  const files = paths.map((p) => p.slice(root.length));
  return { name: zip.replace(/\.zip$/, ''), zip, root, files, cats: files.map(classify).join('') };
}

const meta = await get(`https://archive.org/metadata/${ITEM}`, 'json');
const zips = meta.files.map((f) => f.name).filter((n) => n.endsWith('.zip')).sort();
console.log(`${zips.length} zips`);

const kits = [];
const failed = [];
let next = 0, done = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  while (next < zips.length) {
    const zip = zips[next++];
    try {
      const files = await listZip(zip);
      if (files.length) kits.push(entry(zip, files));
    } catch (err) {
      failed.push(zip);
      console.error(`\n${err.message}`);
    }
    if (++done % 50 === 0 || done === zips.length) console.log(`${done}/${zips.length}`);
  }
}));

kits.sort((a, b) => a.name.localeCompare(b.name));
await writeFile(new URL('../kits.json', import.meta.url), JSON.stringify(kits));
const total = kits.reduce((n, k) => n + k.files.length, 0);
console.log(`\nwrote kits.json: ${kits.length} kits, ${total} samples`);
if (failed.length) console.log(`failed (${failed.length}): ${failed.join(', ')}`);
