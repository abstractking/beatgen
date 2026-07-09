# BeatGen - AI Beat Generator

A web-based AI beat generation tool for music producers. Set BPM, key, genre, and structure, then generate 4 unique beat variations instantly.

## Features

- **3 Genre Presets**: Dark Trap, Boom-Bap, Lo-Fi
- **BPM Control**: 20-300 BPM with slider + numeric input
- **Key Selector**: All 12 roots × Major/Minor scales
- **Structure Control**: Intro/Verse/Chorus/Bridge/Outro with configurable bar counts
- **4 Variations**: Generate 4 unique beats per session
- **Real-time Playback**: Play/pause/seek with waveform visualization
- **WAV Export**: Download any variation as a WAV file
- **Dark DAW Aesthetic**: Professional music production tool UI

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS 3.4
- shadcn/ui components
- Framer Motion animations
- Web Audio API (browser-based synthesis)
- Lucide React icons

## Architecture

### Audio Engine (`src/lib/audioEngine.ts`)
- Uses `OfflineAudioContext` for rendering beats to `AudioBuffer`
- Synthesizes all sounds programmatically (no samples):
  - **Kick**: Sine sweep + noise burst (808-style)
  - **Snare**: Tone + noise with highpass filter
  - **Hi-hats**: High-frequency noise with bandpass
  - **Bass**: Sine/triangle oscillators
  - **Melody**: Dual-oscillator synth with slight detune
  - **Pad**: Multi-oscillator ambient chords
- Playback via `PlaybackController` class with play/pause/seek

### Pattern Generation (`src/lib/midiPatterns.ts`)
- Seeded random for reproducible but varied patterns
- Genre-specific drum patterns (half-time trap, boom-bap backbeat, lo-fi swung)
- Section-aware arrangement (Intro/Verse/Chorus get different densities)
- Basslines following scale degrees
- Melodic phrases with call-and-response patterns

### State Management (`src/context/BeatContext.tsx`)
- React Context for global state
- Generation pipeline with progress tracking
- Playback state machine
- Toast notifications

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## How to Use

1. **Set Parameters**: Choose genre, BPM, key, drum pattern, and song structure in the left panel
2. **Generate**: Click the "Generate Beats" button
3. **Audition**: Click play on any variation card to preview
4. **Export**: Click "Download WAV" to save your favorite variation

## License

Free for personal/non-monetized use. Full commercial terms TBD.
