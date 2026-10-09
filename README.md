# Drum Keys

Play any of the 470 machines in the archive.org
[drum-machines-collection](https://archive.org/download/drum-machines-collection)
from your computer keyboard.

The collection is ~4 GB of zips, so nothing is downloaded up front. `kits.json`
indexes every sample inside every zip; the page then fetches individual wavs
straight out of the zips on archive.org (it serves single files from inside a
zip, with CORS) — only the ~39 samples on the keys of the current kit.

## Run

```bash
python3 -m http.server 8000
```

Open http://localhost:8000 (it must be served over http; `file://` can't fetch).

## Keys

| Row | Keys | Sounds |
|---|---|---|
| Numbers | `1`–`0` | cymbals, then extras |
| Top | `Q`–`P` | toms, then perc |
| Home | `A S D F` · `G H` · `J K L ;` | closed hats · open hats · perc |
| Bottom | `Z X C V` · `B N M` · `,` `.` | kicks · snares · clap, rim |

- `Shift` + key: accent (louder)
- `←` `→`: previous / next machine · `/`: search
- Click a pad to pick its sample from the whole kit; `[` `]` steps the selected
  (or last played) key through sounds of the same type
- Closed hats choke open hats
- Custom keys, last machine and volume are remembered in this browser

## Sequencer

A 16-step sequencer with 18 classic beats (rock, disco, house, techno, electro,
Miami bass, boom bap, funk, breakbeat, new jack swing, shuffle, trap, drum & bass,
reggae one drop, dembow, bossa nova, son clave, and an empty grid).

- `Space` play / stop; BPM and swing (50% straight → 67% triplet shuffle → 75%)
- Click a step: on → accent → ghost → off; right-click clears it
- Lanes play **keys**, not samples, so any beat plays on whichever machine is
  loaded — switch machines while it runs. Click a lane name, then press a key
  (or click a pad) to point that lane at a different pad.
- `Enter` (or **● Rec**) records what you play. From a stop it counts in one bar
  (the button shows 4-3-2-1), then
  each hit snaps to the nearest step, measured against when you *heard* the beat
  (the audio output latency is subtracted). Shift records an accent. A key with no
  lane takes over the first empty lane. Recording overdubs — it loops until you
  stop. **Click** toggles a metronome.
- **Undo** / `⌘Z` steps back through takes (one per recording pass), step edits,
  clears and beat changes.
- Notes are scheduled on the audio clock a little ahead of time (a worker keeps
  the clock ticking in background tabs), so timing stays tight.
- The current beat and lane keys are remembered in this browser.

## Drum Pads — the mobile app (`app/`)

A touch-first PWA with 16 famous machines and hand-picked pads: TR-808, TR-909,
CR-78, TR-606, TR-707, LM-1, LinnDrum, DMX, Drumulator, SP-12, SP-1200, MPC3000,
Simmons SDS-V, Drumtraks, RX5 and the Ace Tone Rhythm Ace.

Open http://localhost:8000/app/ (or the deployed `/app/`), then "Add to Home
Screen". 4×4 pads; tapping a pad also shows its 16 steps above the pads; hold a pad
to swap its sound for any sample of that machine. Same beats, recording, count-in,
metronome and undo as the desktop page — both import `engine.js`.

- **Offline:** the service worker (`app/sw.js`) keeps every archive.org sample it
  sees, so any machine you've opened works offline; "Save all offline" in the
  machine list fetches all 16 (~224 sounds). Nothing is re-hosted.
- **Curation** lives in `app/machines.js`. After editing it run
  `node scripts/build-machines.mjs` — it checks every pad exists and writes
  `app/machine-files.json` (the swap lists).
- CR-78, Drumulator and SP-12 ship only numbered samples, so their pads were chosen
  from spectrograms and are marked "pads by ear". Fix any by ear with a long-press,
  then move the fix into `machines.js`.
- Icons are drawn by `python3 scripts/make-icons.py`.
- Bump `SHELL` in `sw.js` when the shell file list changes. A service worker needs
  https (or localhost), so test on a phone via the deployed site.

## Rebuild the index

```bash
node scripts/build-index.mjs
```

Node 20+, no dependencies, a minute or two. It also assigns each sample a category
from its filename (kick, snare, hat…); tweak `RULES` there if a kit maps oddly.

AIFF samples (4 kits) only decode in Safari.
