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
- `Enter` (or **● Rec**) records what you play: it starts playback if needed and
  each hit snaps to the nearest step, measured against when you *heard* the beat
  (the audio output latency is subtracted). Shift records an accent. A key with no
  lane takes over the first empty lane. Recording overdubs — it loops until you
  stop. **Click** toggles a metronome.
- **Undo** / `⌘Z` steps back through takes (one per recording pass), step edits,
  clears and beat changes.
- Notes are scheduled on the audio clock a little ahead of time (a worker keeps
  the clock ticking in background tabs), so timing stays tight.
- The current beat and lane keys are remembered in this browser.

## Rebuild the index

```bash
node scripts/build-index.mjs
```

Node 20+, no dependencies, a minute or two. It also assigns each sample a category
from its filename (kick, snare, hat…); tweak `RULES` there if a kit maps oddly.

AIFF samples (4 kits) only decode in Safari.
