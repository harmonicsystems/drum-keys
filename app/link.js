// The link is the whole setup, so a home-screen shortcut (which iOS saves as
// the page URL, into its own empty storage) reopens exactly that beat.
//
//   ?m=sp1200&t=97&s=54&b=funk                    a classic beat as-is
//   ?m=tr808&t=90&g=0AAAQAA2EREREQ&k=2Snare3.wav  an edited beat + a swapped pad
//   &n=Dusty%20Linn                               a favorite's name
//
// m machine id · t tempo · s swing (omitted at 50) · b classic beat (slug) or
// g grid: per non-empty lane, its hex index in LANES + 6 chars holding 16 steps
// at 2 bits each · k swapped pads: hex lane + file, comma-separated · n name.
// No DOM here (node can import it).
import { PRESETS, STEPS } from '../engine.js';
import { LANES, MACHINES } from './machines.js';

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const LV = '.xXg';
export const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const ids = LANES.map(([id]) => id);
const blank = '.'.repeat(STEPS);

function packRow(row) {
  let v = 0;
  for (let i = STEPS - 1; i >= 0; i--) v = v * 4 + Math.max(0, LV.indexOf(row[i]));
  let out = '';
  for (let k = 0; k < 6; k++) { out += B64[v % 64]; v = Math.floor(v / 64); }
  return out;
}

function unpackRow(s) {
  let v = 0;
  for (let k = 5; k >= 0; k--) v = v * 64 + B64.indexOf(s[k]);
  let row = '';
  for (let i = 0; i < STEPS; i++) { row += LV[v % 4]; v = Math.floor(v / 4); }
  return row;
}

const presetLanes = (p) => Object.fromEntries(ids.map((id) => [id, (p.lanes[id] || '').padEnd(STEPS, '.').slice(0, STEPS)]));
const sameLanes = (a, b) => ids.every((id) => (a[id] || blank) === (b[id] || blank));

// state: { machine, bpm, swing, lanes, pads: {lane: file}, name? } -> query string (no '?')
export function encode({ machine, bpm, swing, lanes, pads = {}, name }) {
  const q = [`m=${machine}`, `t=${bpm}`];
  if (swing !== 50) q.push(`s=${swing}`);
  const preset = PRESETS.find((p) => sameLanes(lanes, presetLanes(p)));
  if (preset) q.push(`b=${slug(preset.name)}`);
  else q.push('g=' + ids.map((id, i) => (lanes[id] && lanes[id] !== blank ? i.toString(16) + packRow(lanes[id]) : '')).join(''));
  const swaps = Object.entries(pads).filter(([id, f]) => f && ids.includes(id));
  if (swaps.length) q.push('k=' + swaps.map(([id, f]) => ids.indexOf(id).toString(16) + encodeURIComponent(f)).join(','));
  if (name) q.push('n=' + encodeURIComponent(name));
  return q.join('&');
}

// query string -> state, or null when it isn't a usable link
export function decode(search) {
  const raw = {};
  for (const part of search.replace(/^\?/, '').split('&')) {
    const at = part.indexOf('=');
    if (at > 0) raw[part.slice(0, at)] = part.slice(at + 1);   // still encoded: k needs its commas
  }
  const dec = (s) => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch { return null; } };
  const machine = MACHINES.find((m) => m.id === raw.m);
  if (!machine) return null;
  const bpm = Math.min(260, Math.max(40, parseInt(raw.t, 10) || 120));
  const swing = Math.min(75, Math.max(50, parseInt(raw.s, 10) || 50));

  let lanes, beatName;
  const preset = raw.b && PRESETS.find((p) => slug(p.name) === raw.b);
  if (preset) { lanes = presetLanes(preset); beatName = preset.name; }
  else if (raw.g != null) {
    lanes = Object.fromEntries(ids.map((id) => [id, blank]));
    for (const [, hex, packed] of raw.g.matchAll(/([0-9a-f])([A-Za-z0-9_-]{6})/g)) {
      const id = ids[parseInt(hex, 16)];
      if (id) lanes[id] = unpackRow(packed);
    }
  } else return null;

  const pads = {};
  for (const item of (raw.k || '').split(',')) {
    const id = ids[parseInt(item[0], 16)], file = item.length > 1 && dec(item.slice(1));
    if (id && file) pads[id] = file;
  }
  const name = raw.n ? dec(raw.n) : null;
  return { machine, bpm, swing, lanes, pads, name, beatName };
}
