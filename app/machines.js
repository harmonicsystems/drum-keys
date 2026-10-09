// The famous machines, with hand-picked pads. Samples live inside the
// archive.org drum-machines-collection zips: `zip` is the zip name, `root`
// the folder inside it, and each pad is a file under root.
//
// Pad lanes (also the sequencer lanes, in scheduling order — closed hat
// before open hat so it can choke it):
export const LANES = [
  ['kick', 'Kick', 'k'], ['kick2', 'Kick 2', 'k'], ['snare', 'Snare', 's'], ['snare2', 'Snare 2', 's'],
  ['clap', 'Clap', 'c'], ['rim', 'Rim', 'r'], ['chh', 'Closed hat', 'h'], ['ohh', 'Open hat', 'o'],
  ['tom1', 'Low tom', 't'], ['tom2', 'Mid tom', 't'], ['tom3', 'High tom', 't'], ['cym', 'Crash', 'y'],
  ['cym2', 'Ride', 'y'], ['perc1', 'Shaker', 'p'], ['perc2', 'Cowbell', 'p'], ['perc3', 'Perc', 'p'],
];

// 4×4 pad layout, top row first (kick and snare under your thumbs)
export const LAYOUT = [
  ['cym', 'cym2', 'perc2', 'perc3'],
  ['tom1', 'tom2', 'tom3', 'perc1'],
  ['chh', 'ohh', 'clap', 'rim'],
  ['kick', 'snare', 'kick2', 'snare2'],
];

// A pad is 'file' or ['file', 'label'] when the sound isn't what the lane name says.
// `guessed`: the source samples are unlabeled (numbered), so these pads were
// picked from spectrograms, not names — long-press a pad to swap.
export const MACHINES = [
  {
    id: 'tr808', name: 'TR-808', maker: 'Roland', year: 1980, zip: 'Roland TR808.zip', root: 'Roland TR808/',
    note: 'Analog boom and snap. The kick became the low end of hip-hop, electro and trap.',
    pads: {
      kick: 'Kick01.wav', kick2: 'Kick08.wav', snare: 'Snare01.wav', snare2: 'Snare08.wav',
      clap: 'Clap01.wav', rim: 'Rim01.wav', chh: 'Hat_C01.wav', ohh: 'Hat_O01.wav',
      tom1: 'Tom02.wav', tom2: 'Tom04.wav', tom3: 'Tom06.wav', cym: ['Ride01.wav', 'Cymbal'], cym2: ['Ride03.wav', 'Cymbal 2'],
      perc1: ['Shaker01.wav', 'Maracas'], perc2: 'Cow.wav', perc3: ['Clave.wav', 'Clave'],
    },
  },
  {
    id: 'tr909', name: 'TR-909', maker: 'Roland', year: 1983, zip: 'Roland TR-909.zip', root: 'Roland TR-909/',
    note: 'Analog drums with sampled cymbals — the engine room of house and techno.',
    pads: {
      kick: 'Set3/Bd01.wav', kick2: 'Set2/BDRUM1.WAV', snare: 'Set3/Sn01.wav', snare2: 'Set2/SNARE1.WAV',
      clap: 'Set3/Clp01.wav', rim: 'Set3/Rs01.wav', chh: 'Set3/Ch01.wav', ohh: 'Set3/Oh01.wav',
      tom1: 'Set3/Lt01.wav', tom2: 'Set3/Mt01.wav', tom3: 'Set3/Ht01.wav', cym: 'Set2/CRASH1.WAV', cym2: 'Set3/Ride01.wav',
      perc1: ['Set3/Ch16.wav', 'Hat 2'], perc2: ['Set3/Clp12.wav', 'Clap 2'], perc3: ['Set3/Rs03.wav', 'Rim 2'],
    },
  },
  {
    id: 'cr78', name: 'CR-78', maker: 'Roland', year: 1978, zip: 'Roland CR78.zip', root: 'Roland CR78/', guessed: true,
    note: 'One of the first programmable rhythm boxes; gentle, papery and full of Latin percussion.',
    pads: {
      kick: 'SAMPLE5.WAV', snare: 'SAMPLE9.WAV', rim: 'SAMPLE10.WAV', chh: 'SAMPLE21.WAV', ohh: 'SAMPLE22.WAV',
      tom1: ['SAMPLE12.WAV', 'Bongo low'], tom2: ['SAMPLE13.WAV', 'Bongo high'], cym: ['SAMPLE11.WAV', 'Cymbal'],
      perc1: ['SAMPLE7.WAV', 'Maracas'], perc2: ['SAMPLE8.WAV', 'Metal beat'], perc3: ['SAMPLE6.WAV', 'Guiro'],
    },
  },
  {
    id: 'tr606', name: 'TR-606', maker: 'Roland', year: 1981, zip: 'Roland TR606.zip', root: 'Roland TR606/',
    note: 'The Drumatix: a tiny analog box built to sit beside the TB-303.',
    pads: {
      kick: 'Kick01.wav', kick2: ['Kick_OD.wav', 'Kick drive'], snare: 'Snare01.wav', snare2: ['Snare_OD.wav', 'Snare drive'],
      chh: 'Hat_C01.wav', ohh: 'Hat_O01.wav', tom1: 'TomLo01.wav', tom2: 'TomHi01.wav', tom3: ['TomLo_OD.wav', 'Tom drive'],
      cym: ['Cymb01.wav', 'Cymbal'], cym2: ['Cymb_OD.wav', 'Cymbal drive'], perc1: ['Hat_P01.wav', 'Pedal hat'],
      perc3: ['Hat_C_OD.wav', 'Hat drive'],
    },
  },
  {
    id: 'tr707', name: 'TR-707', maker: 'Roland', year: 1985, zip: 'Roland TR707.zip', root: 'Roland TR707/',
    note: 'Crisp sampled drums in a slim box; a staple of mid-80s pop and early house.',
    pads: {
      kick: 'Bd0.wav', kick2: 'Bd1.wav', snare: 'Sd0.wav', snare2: 'Sd1.wav', clap: 'Hcp.wav', rim: 'Rim.wav',
      chh: 'HH_c.wav', ohh: 'HH_o.wav', tom1: 'Lt.wav', tom2: 'Mt.wav', tom3: 'Ht.wav', cym: 'Crs.wav', cym2: 'Rid.wav',
      perc1: ['Tam.wav', 'Tambourine'], perc2: 'Cow.wav',
    },
  },
  {
    id: 'lm1', name: 'LM-1', maker: 'Linn', year: 1980, zip: 'Linn LM-1.zip', root: 'Linn LM-1/',
    note: 'Roger Linn’s Drum Computer — among the first to play back recordings of real drums.',
    pads: {
      kick: 'Kick1.wav', kick2: 'Kick2.wav', snare: 'SnareDrum1.wav', snare2: 'SnareDrum2.wav', clap: 'Clap.wav',
      rim: ['Sst.wav', 'Sidestick'], chh: 'Chh.wav', ohh: 'Ohh.wav', tom1: 'Lotom.wav', tom2: 'Midtom.wav', tom3: 'Hitom.wav',
      cym: 'Crash.wav', cym2: 'Ride.wav', perc1: ['Cabasa.wav', 'Cabasa'], perc2: 'Cowb.wav', perc3: ['Conga.wav', 'Conga'],
    },
  },
  {
    id: 'linndrum', name: 'LinnDrum', maker: 'Linn', year: 1982, zip: 'Linn Linndrum.zip', root: 'Linn Linndrum/',
    note: 'The LM-2. Its gated snares and claps are all over 1980s radio.',
    pads: {
      kick: 'Kick.wav', kick2: 'Kickme.wav', snare: 'SnareDrum.wav', snare2: ['SnareDrumh.wav', 'Snare high'], clap: 'Clap.wav',
      rim: ['Sst.wav', 'Sidestick'], chh: 'Chh.wav', ohh: 'Ohh.wav', tom1: 'Toml.wav', tom2: 'Tom.wav', tom3: 'Tomh.wav',
      cym: 'Crash.wav', cym2: 'Ride.wav', perc1: ['Cabasa.wav', 'Cabasa'], perc2: 'Cowb.wav', perc3: ['Tamb.wav', 'Tambourine'],
    },
  },
  {
    id: 'dmx', name: 'DMX', maker: 'Oberheim', year: 1981, zip: 'Oberheim DMX.zip', root: 'Oberheim DMX/',
    note: 'Hard, punchy samples that shaped early hip-hop.',
    pads: {
      kick: 'Kick01.wav', kick2: 'Kick02.wav', snare: 'Snare01.wav', snare2: 'Snare02.wav', clap: 'Clap.wav', rim: 'Rim.wav',
      chh: 'Hat_C.wav', ohh: 'Hat_O.wav', tom1: 'TomLo.wav', tom2: 'TomMid.wav', tom3: 'TomHi.wav', cym: 'Crash.wav',
      cym2: 'Ride.wav', perc1: ['Tamborine.wav', 'Tambourine'], perc2: ['TimbaleLo.wav', 'Timbale'], perc3: ['Cabasa.wav', 'Cabasa'],
    },
  },
  {
    id: 'drumulator', name: 'Drumulator', maker: 'E-mu', year: 1983, zip: 'EMU Drumulator.zip', root: 'EMU Drumulator/', guessed: true,
    note: 'Made sampled drums affordable, years before samplers were everywhere.',
    pads: {
      kick: '01.wav', kick2: '25.wav', snare: '13.wav', snare2: '39.wav', clap: '17.wav', rim: '11.wav',
      chh: '03.wav', ohh: '09.wav', tom1: '20.wav', tom2: '22.wav', tom3: '23.wav', cym: '02.wav', cym2: '48.wav',
      perc1: ['51.wav', 'Perc'], perc2: ['05.wav', 'Bell'], perc3: ['40.wav', 'Perc 2'],
    },
  },
  {
    id: 'sp12', name: 'SP-12', maker: 'E-mu', year: 1985, zip: 'EMU SP-12.zip', root: 'EMU SP-12/', guessed: true,
    note: 'A 12-bit sampling drum machine — the SP-1200’s older sibling.',
    pads: {
      kick: '31.wav', kick2: '28.wav', snare: '00.wav', snare2: '27.wav', clap: '11.wav', rim: '24.wav',
      chh: '09.wav', ohh: '05.wav', tom1: '20.wav', tom2: '14.wav', tom3: '21.wav', cym: '18.wav', cym2: '19.wav',
      perc1: ['10.wav', 'Hat 2'], perc2: ['23.wav', 'Bell'], perc3: ['25.wav', 'Perc'],
    },
  },
  {
    id: 'sp1200', name: 'SP-1200', maker: 'E-mu', year: 1987, zip: 'EMU SP1200.zip', root: 'EMU SP1200/',
    note: 'Gritty 12-bit, 26 kHz sampling: the sound of golden-age hip-hop production.',
    pads: {
      kick: 'Kick1.wav', kick2: 'Kick2.wav', snare: 'Snare1.wav', snare2: 'Snare2.wav', clap: ['Finger.wav', 'Snap'],
      rim: 'Rim.wav', chh: 'Clhh1.wav', ohh: 'Ophh1.wav', tom1: 'Tom1.wav', tom2: 'Tom2.wav', tom3: ['Conga1.wav', 'Conga'],
      cym: 'Cymb.wav', cym2: 'Ride1.wav', perc1: ['Tamb.wav', 'Tambourine'], perc2: 'Cowbell1.wav', perc3: ['Clave1.wav', 'Clave'],
    },
  },
  {
    id: 'mpc3000', name: 'MPC3000', maker: 'Akai', year: 1994, zip: 'Akai MPC3000.zip', root: 'Akai MPC3000/',
    note: 'Designed with Roger Linn; its swing and pads defined a generation of beatmakers.',
    pads: {
      kick: 'Heavy_Kick.wav', kick2: 'Syn_Kick.wav', snare: 'Snare_3002.wav', snare2: ['Picolo_Sn_3001.wav', 'Piccolo'],
      clap: 'Gtd_Clap.wav', rim: ['Side_Stick.wav', 'Sidestick'], chh: 'Cl_Hat_3001.wav', ohh: 'Op_Hat_3001.wav',
      tom1: 'Rl_N_Toml.wav', tom2: 'Rl_N_Tomm.wav', tom3: 'Rl_N_Tomh.wav', cym: 'Cymbal_3001.wav', cym2: 'Ride_3001.wav',
      perc1: ['Tambourine_3001.wav', 'Tambourine'], perc2: 'Cowbell_3001.wav', perc3: ['Claves.wav', 'Claves'],
    },
  },
  {
    id: 'sdsv', name: 'SDS-V', maker: 'Simmons', year: 1981, zip: 'Simmons SDS5.zip', root: 'Simmons SDS5/',
    note: 'Hexagonal pads and synthesized toms — the electronic kit of the 80s.',
    pads: {
      kick: 'BassDrumrum1.wav', kick2: 'Simmons_sds5_kits/Kick 1.wav', snare: 'Snare1.wav', snare2: 'Simmons_sds5_kits/Snare Hi 1.wav',
      clap: ['Simmons_sds5_kits/Crack.wav', 'Crack'], rim: 'Rimshot1.wav', chh: 'HH_close1.wav', ohh: 'HH_open1.wav',
      tom1: 'Tom1.wav', tom2: 'Tom5.wav', tom3: 'Tom9.wav', perc1: ['HH_pedal1.wav', 'Pedal hat'],
      perc2: ['Tom13.wav', 'Tom 4'], perc3: ['Tom17.wav', 'Tom 5'],
    },
  },
  {
    id: 'drumtraks', name: 'Drumtraks', maker: 'Sequential', year: 1984, zip: 'Sequential Circuits Drumtraks.zip',
    root: 'Sequential Circuits Drumtraks/',
    note: 'One of the first drum machines with MIDI.',
    pads: {
      kick: 'Kick.wav', snare: 'Snare.wav', clap: 'Clap.wav', rim: 'Rimshot.wav', chh: 'Closedhat.wav', ohh: 'Openhat.wav',
      tom1: 'Tom01.wav', tom2: 'Tom02.wav', cym: 'Crash.wav', cym2: 'Ride.wav', perc1: ['Cabasa.wav', 'Cabasa'],
      perc2: 'Cowbell.wav', perc3: ['Tamborine.wav', 'Tambourine'],
    },
  },
  {
    id: 'rx5', name: 'RX5', maker: 'Yamaha', year: 1986, zip: 'Yamaha RX-5.zip', root: 'Yamaha RX-5/',
    note: 'Clean late-80s samples, from rock kits to exotic percussion.',
    pads: {
      kick: 'BassDrum 1.wav', kick2: 'Kick1.wav', snare: 'SnareDrum 1.wav', snare2: 'Snare1.wav', clap: 'Clap.wav',
      rim: 'Rim 1.wav', chh: 'Hh Cl.wav', ohh: 'Hh Op 1.wav', tom1: 'Tom1.wav', tom2: 'Tom2.wav', tom3: 'Tom3.wav',
      cym: 'Crash.wav', cym2: ['China.wav', 'China'], perc1: ['Tamburin.wav', 'Tambourine'], perc2: 'Cowbell.wav',
      perc3: ['Agogo H.wav', 'Agogo'],
    },
  },
  {
    id: 'rhythmace', name: 'Rhythm Ace', maker: 'Ace Tone', year: 1967, zip: 'Acetone Rhythm-Ace.zip', root: 'Acetone Rhythm-Ace/',
    note: 'From Ikutaro Kakehashi, who went on to found Roland.',
    pads: {
      kick: 'Kick1.wav', kick2: 'Kick2.wav', snare: 'Snare1.wav', snare2: 'Snare2.wav', chh: 'HHcl.wav', ohh: 'HHop.wav',
      tom1: ['Perc1.wav', 'Perc 1'], tom2: ['Perc2.wav', 'Perc 2'], tom3: ['Perc3.wav', 'Perc 3'], rim: ['Perc6.wav', 'Perc 6'],
      cym: ['Perc7.wav', 'Perc 7'], perc1: ['Perc4.wav', 'Perc 4'], perc2: ['Perc5.wav', 'Perc 5'], perc3: ['Clave.wav', 'Clave'],
    },
  },
];
