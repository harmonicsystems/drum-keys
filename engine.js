// Shared audio + sequencer engine for the desktop page (index.html) and the
// mobile PWA (app/). No DOM here: each app tells the engine how to find a
// lane's sample (`resolve`) and redraws when told (`onChange`, `onDraw`).

export const ITEM = 'https://archive.org/download/drum-machines-collection/';
// archive.org serves single files out of a zip, with CORS
export const sampleUrl = (zip, path) => ITEM + encodeURIComponent(zip) + '/' + encodeURIComponent(path);

export const STEPS = 16;
export const LEVEL = { g: 0.3, x: 0.7, X: 1 };   // ghost, hit, accent
export const NEXT = { '.': 'x', x: 'X', X: 'g', g: '.' };

// Classic patterns, one bar of 16ths. x hit, X accent, g ghost, . rest
// Lane ids: kick snare clap rim chh ohh tom1-3 cym perc1 (shaker/tambourine)
// perc2 (cowbell); the PWA adds kick2 snare2 cym2 perc3.
export const PRESETS = [
  { name: 'Rock', bpm: 110, swing: 50, lanes: {
    kick: 'X.......x.x.....', snare: '....X.......X...', chh: 'x.x.x.x.x.x.x.x.', cym: 'x...............' } },
  { name: 'Disco', bpm: 118, swing: 50, lanes: {
    kick: 'X...X...X...X...', snare: '....x.......x...', chh: 'xx.xxx.xxx.xxx.x', ohh: '..x...x...x...x.' } },
  { name: 'House', bpm: 124, swing: 52, lanes: {
    kick: 'X...X...X...X...', clap: '....x.......x...', ohh: '..x...x...x...x.', perc1: 'g.g.g.g.g.g.g.g.' } },
  { name: 'Techno', bpm: 132, swing: 50, lanes: {
    kick: 'X...X...X...X...', clap: '....x.......x...', chh: 'gg.ggg.ggg.ggg.g', ohh: '..x...x...x...x.', rim: '...x.....x..x...' } },
  { name: 'Electro', bpm: 126, swing: 50, lanes: {
    kick: 'X.....x.....x...', clap: '....X.......X...', chh: 'x.x.x.x.x.x.x.x.', perc2: 'x..x..x...x..x..' } },
  { name: 'Miami bass', bpm: 132, swing: 50, lanes: {
    kick: 'X......x..X.....', clap: '....X.......X...', chh: 'xgxgxgxgxgxgxgxg', tom1: '..............x.' } },
  { name: 'Boom bap', bpm: 90, swing: 58, lanes: {
    kick: 'X......x..x.....', snare: '....X.......X...', chh: 'x.x.x.x.x.x.x.x.', ohh: '..............x.' } },
  { name: 'Funk', bpm: 100, swing: 54, lanes: {
    kick: 'X.x.......x..x..', snare: '....X..g.g..X..g', chh: 'xxxxxxx.xxxxx.xx', ohh: '.......x.....x..' } },
  { name: 'Breakbeat', bpm: 136, swing: 50, lanes: {
    kick: 'X.x.......xx....', snare: '....X..g.g..X..g', cym: 'x.x.x.x.x.x.x.x.' } },
  { name: 'New jack swing', bpm: 104, swing: 62, lanes: {
    kick: 'X..x..x...x..x..', snare: '....X.......X...', chh: 'x.xxx.xxx.xxx.xx' } },
  { name: 'Shuffle', bpm: 92, swing: 67, lanes: {
    kick: 'X.....x.X.....x.', snare: '....X.......X...', chh: 'X.xxX.xxX.xxX.xx' } },
  { name: 'Trap', bpm: 140, swing: 50, lanes: {
    kick: 'X.....x...x....x', clap: '........X.......', chh: 'xgxgxgxgxxxxxgxg', ohh: '.......x........' } },
  { name: 'Drum & bass', bpm: 172, swing: 50, lanes: {
    kick: 'X.........X.....', snare: '....X..g.g..X...', chh: 'x.x.x.x.x.x.x.x.' } },
  { name: 'Reggae one drop', bpm: 76, swing: 62, lanes: {
    kick: '........X.......', rim: '........x.......', chh: 'x.x.x.x.x.x.x.x.' } },
  { name: 'Dembow', bpm: 96, swing: 50, lanes: {
    kick: 'X...X...X...X...', snare: '...x..x....x..x.', chh: 'x.x.x.x.x.x.x.x.' } },
  { name: 'Bossa nova', bpm: 128, swing: 50, lanes: {
    kick: 'X..xX..xX..xX..x', rim: 'x..x..x...x..x..', chh: 'gggggggggggggggg' } },
  { name: 'Son clave 3-2', bpm: 104, swing: 50, lanes: {
    kick: 'X...X...X...X...', rim: 'x..x..x...x.x...', perc2: 'x.x.x.x.x.x.x.x.', tom1: '......x.......x.' } },
  { name: 'Empty', bpm: 120, swing: 50, lanes: {} },
];

// Tiny localStorage wrapper; every access can throw (private mode, blocked storage)
export function makeStore(prefix) {
  return {
    get(k) { try { return JSON.parse(localStorage.getItem(prefix + k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(prefix + k, JSON.stringify(v)); } catch {} },
  };
}

/**
 * lanes:    lane ids in scheduling order (closed hat must come before open hat)
 * resolve:  laneId -> { url, cat } | null — what that lane plays right now
 * onChange: something in the transport or pattern changed; redraw
 * onDraw:   ({ i, hits }) as each step is heard, or ({ count }) during a count-in
 */
export function createEngine({ lanes, store, resolve, onChange = () => {}, onDraw = () => {} }) {
  let ctx, master, volume = store.get('vol') ?? 0.8;
  const buffers = new Map();   // url -> Promise<AudioBuffer>
  const ready = new Map();     // url -> AudioBuffer once decoded (the sequencer only plays these)
  const openHats = new Set();  // live open-hat voices a closed hat should choke

  const fromPreset = (p) => ({
    name: p.name, edited: false, bpm: p.bpm, swing: p.swing,
    lanes: Object.fromEntries(lanes.map((id) => [id, (p.lanes[id] || '').padEnd(STEPS, '.').slice(0, STEPS)])),
  });
  let seq = store.get('seq') || fromPreset(PRESETS[0]);
  for (const id of lanes) seq.lanes[id] = (seq.lanes[id] || '').padEnd(STEPS, '.').slice(0, STEPS);

  let playing = false, recording = false, metronome = store.get('metro') ?? false;
  let step = 0, nextTime = 0;
  const drawQueue = [];        // {i, t, hits} / {count, t} in audio time
  const scheduled = [];        // recent {i, t} already handed to the audio clock
  const skipOnce = new Set();  // 'lane:step' hits played live just before the sequencer got there
  const undoStack = [];
  let countClicks = [];

  // ---------- audio ----------
  function audio() {
    if (!ctx) {
      ctx = new AudioContext({ latencyHint: 'interactive' });
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    }
    if (ctx.state !== 'running') ctx.resume();
    return ctx;
  }

  function load(url) {
    if (!buffers.has(url)) {
      const p = fetch(url)
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
        .then((data) => audio().decodeAudioData(data))
        .then((buf) => { ready.set(url, buf); return buf; });
      p.catch(() => buffers.delete(url)); // allow a retry later
      buffers.set(url, p);
    }
    return buffers.get(url);
  }

  // Start one sample at audio time `when` (now if omitted). A closed hat chokes
  // any open hat that has already started by then.
  function voice(buf, cat, level, when = 0) {
    const ac = audio();
    const t = Math.max(when, ac.currentTime);
    if (cat === 'h') for (const v of openHats) v.choke(t);
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    src.buffer = buf;
    gain.gain.value = level;
    src.connect(gain).connect(master);
    src.start(t);
    if (cat === 'o') {
      const v = { start: t, choke(at) {
        if (at < v.start) return;
        gain.gain.setValueAtTime(level, at);
        gain.gain.linearRampToValueAtTime(0, at + 0.01);
        src.stop(at + 0.02);
        openHats.delete(v);
      } };
      openHats.add(v);
      src.onended = () => openHats.delete(v);
    }
  }

  async function play(url, cat, level) {
    let buf;
    try { buf = await load(url); } catch { return false; }
    voice(buf, cat, level);
    return true;
  }

  function chokeAll() { if (ctx) for (const v of openHats) v.choke(ctx.currentTime); }

  function setVolume(v) {
    volume = v;
    if (master) master.gain.value = v;
    store.set('vol', v);
  }

  // Metronome: a short sine blip, higher on the downbeat
  function click(t, down) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.frequency.value = down ? 1760 : 1320;
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.05);
    return osc;
  }

  // ---------- pattern ----------
  const save = () => store.set('seq', seq);

  function snapshot() {
    undoStack.push(JSON.stringify(seq.lanes));
    if (undoStack.length > 100) undoStack.shift();
  }

  function writeStep(id, i, v) {
    const row = seq.lanes[id];
    seq.lanes[id] = row.slice(0, i) + v + row.slice(i + 1);
    seq.edited = true;
    save();
  }

  function setStep(id, i, v) {
    snapshot();
    writeStep(id, i, v);
    onChange();
    // Audition when stopped, so you hear what you're placing
    if (!playing && v !== '.') { const s = resolve(id); if (s) play(s.url, s.cat, LEVEL[v]); }
  }

  function loadPreset(name) {
    const p = PRESETS.find((x) => x.name === name);
    if (!p) return;
    snapshot();
    seq = fromPreset(p);
    save();
    onChange();
  }

  function clear() {
    snapshot();
    for (const id of lanes) seq.lanes[id] = '.'.repeat(STEPS);
    seq.edited = true;
    save();
    onChange();
  }

  function undo() {
    const prev = undoStack.pop();
    if (!prev) return;
    seq.lanes = JSON.parse(prev);
    seq.edited = true;
    save();
    onChange();
  }

  function setBpm(bpm) {
    seq.bpm = Math.min(260, Math.max(40, Math.round(bpm) || seq.bpm));
    seq.edited = true;
    save();
    onChange();
  }

  function setSwing(swing) {
    seq.swing = Math.min(75, Math.max(50, Math.round(swing)));
    seq.edited = true;
    save();
  }

  function setMetronome(on) { metronome = on; store.set('metro', on); onChange(); }

  // Replace the whole pattern (used when loading a favorite)
  function loadSeq({ name, bpm, swing, lanes: rows }) {
    snapshot();
    seq = { name, edited: false, bpm, swing,
      lanes: Object.fromEntries(lanes.map((id) => [id, (rows[id] || '').padEnd(STEPS, '.').slice(0, STEPS)])) };
    save();
    onChange();
  }

  // ---------- clock ----------
  // A worker ticks every 25 ms (keeps running in background tabs); each tick
  // schedules any steps falling in the next 120 ms on the audio clock.
  const clock = new Worker(URL.createObjectURL(new Blob(
    ['let t; onmessage = (e) => { clearInterval(t); if (e.data) t = setInterval(() => postMessage(0), 25); };'],
    { type: 'text/javascript' })));
  clock.onmessage = tick;

  const swingOffset = (i) => i % 2 ? (seq.swing - 50) / 50 * (60 / seq.bpm / 4) : 0;

  function tick() {
    const stepDur = 60 / seq.bpm / 4;
    if (nextTime < ctx.currentTime - 0.05) nextTime = ctx.currentTime + 0.01; // fell behind: don't burst-play
    while (nextTime < ctx.currentTime + 0.12) {
      scheduleStep(step, nextTime + swingOffset(step));
      nextTime += stepDur;
      step = (step + 1) % STEPS;
    }
  }

  function scheduleStep(i, t) {
    const hits = [];
    scheduled.push({ i, t });
    if (scheduled.length > STEPS) scheduled.shift();
    if (metronome && i % 4 === 0) click(t, i === 0);
    for (const id of lanes) {
      if (skipOnce.delete(id + ':' + i)) continue;
      const level = LEVEL[seq.lanes[id][i]];
      const s = level && resolve(id);
      if (!s) continue;
      const buf = ready.get(s.url);
      if (!buf) { load(s.url).catch(() => {}); continue; } // still downloading: skip this hit
      voice(buf, s.cat, level, t);
      hits.push(id);
    }
    drawQueue.push({ i, t, hits });
  }

  function draw() {
    if (!playing) return;
    while (drawQueue.length && drawQueue[0].t <= ctx.currentTime) onDraw(drawQueue.shift());
    requestAnimationFrame(draw);
  }

  // countIn: one bar of clicks before step 1 (used when recording from a stop)
  function togglePlay(countIn = false) {
    audio();
    playing = !playing;
    if (playing) {
      step = 0;
      nextTime = ctx.currentTime + 0.06;
      drawQueue.length = 0;
      scheduled.length = 0;
      skipOnce.clear();
      if (countIn) {
        const beat = 60 / seq.bpm;
        for (let b = 0; b < 4; b++) {
          const t = nextTime + b * beat;
          countClicks.push(click(t, b === 0));
          drawQueue.push({ count: 4 - b, t });
        }
        nextTime += 4 * beat;
      }
      clock.postMessage(true);
      requestAnimationFrame(draw);
    } else {
      clock.postMessage(false);
      for (const osc of countClicks) try { osc.stop(); } catch {}
      countClicks = [];
      recording = false;
    }
    onChange();
  }

  function toggleRecord() {
    recording = !recording;
    if (recording) {
      snapshot();                  // one undo per take
      if (!playing) return togglePlay(true);
    }
    onChange();
  }

  // Put a live hit on the step nearest to when you heard it. Sound reaches your
  // ears outputLatency after the audio clock schedules it, so compare against that.
  // Returns true if the pattern changed.
  function recordHit(id, accent) {
    if (!playing || !recording) return false;
    const heard = ctx.currentTime - (ctx.outputLatency || 0) - (ctx.baseLatency || 0);
    const stepDur = 60 / seq.bpm / 4;
    let best = { i: step, t: nextTime + swingOffset(step), pending: true };
    for (const s of scheduled) if (Math.abs(s.t - heard) < Math.abs(best.t - heard)) best = s;
    if (!scheduled.length && best.t - heard > stepDur / 2) return false; // still counting in
    const cur = seq.lanes[id][best.i], v = accent ? 'X' : 'x';
    if (cur === 'X' || cur === v) return false;
    // You already heard it live; don't let the sequencer play it again this time round
    if (best.pending) skipOnce.add(id + ':' + best.i);
    writeStep(id, best.i, v);
    onChange();
    return true;
  }

  return {
    audio, load, ready, play, chokeAll, setVolume, fromPreset,
    setStep, loadPreset, loadSeq, clear, undo, setBpm, setSwing, setMetronome,
    togglePlay, toggleRecord, recordHit,
    get ctx() { return ctx; },
    get volume() { return volume; },
    get seq() { return seq; },
    get playing() { return playing; },
    get recording() { return recording; },
    get metronome() { return metronome; },
    isEmpty: (id) => !/[^.]/.test(seq.lanes[id]),
  };
}

// ---------- favorites ----------
// A favorite is the beat (pattern, tempo, swing) plus whatever the app says
// makes up its sound — capture() returns e.g. { machine, pads }, apply() restores it.
export function createFavorites({ store, engine, capture, apply }) {
  let list = store.get('favs') || [];
  const state = () => {
    const { bpm, swing, lanes } = engine.seq;
    return { beat: { bpm, swing, lanes }, ...capture() };
  };
  // Key order can differ between saves, so compare a sorted serialisation
  const canon = (v) => v && typeof v === 'object'
    ? (Array.isArray(v) ? v.map(canon) : Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])))
    : v;
  const key = (s) => JSON.stringify(canon(s));
  const persist = () => store.set('favs', list);

  return {
    get list() { return list; },
    // The favorite that matches exactly what's loaded now, if any
    current() { const k = key(state()); return list.find((f) => key(f.state) === k); },
    // Saving under an existing name replaces that favorite
    save(name) {
      const fav = { id: Date.now().toString(36), name, state: JSON.parse(JSON.stringify(state())) };
      list = [fav, ...list.filter((f) => f.name !== name)];
      persist();
      return fav;
    },
    remove(id) { list = list.filter((f) => f.id !== id); persist(); },
    load(id) {
      const fav = list.find((f) => f.id === id);
      if (!fav) return;
      apply(fav.state);
      engine.loadSeq({ name: fav.name, ...fav.state.beat });
    },
  };
}

export const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// <option>s for the Beat menu: favorites first, then the classic beats.
// Anything that isn't exactly a favorite or an untouched preset shows as "(edited)".
export function beatOptions(seq, favs, current) {
  const preset = !seq.edited && PRESETS.some((p) => p.name === seq.name);
  let html = !current && !preset ? `<option value="" selected>${escapeHtml(seq.name)} (edited)</option>` : '';
  if (favs.length) html += '<optgroup label="Favorites">' + favs.map((f) =>
    `<option value="fav:${f.id}"${f === current ? ' selected' : ''}>★ ${escapeHtml(f.name)}</option>`).join('') + '</optgroup>';
  html += '<optgroup label="Classic beats">' + PRESETS.map((p) =>
    `<option value="${escapeHtml(p.name)}"${!current && preset && p.name === seq.name ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('') + '</optgroup>';
  return html;
}
