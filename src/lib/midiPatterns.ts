import type { Genre, BeatParameters } from '@/types/beat';
import { getBasslineNotes, getRandomScaleNote } from './scaleMaps';

// Seeded random for reproducible variation patterns
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface NoteEvent {
  time: number;
  duration: number;
  frequency: number;
  velocity: number;
  type: 'kick' | 'snare' | 'hihat' | 'bass' | 'melody' | 'pad';
}

export interface BeatPattern {
  notes: NoteEvent[];
  duration: number;
  totalBars: number;
}

// Generate a complete beat pattern for a variation
export function generateBeatPattern(params: BeatParameters, variationIndex: number): BeatPattern {
  const rng = seededRandom(42 + variationIndex * 137);
  const { genre, bpm, rootNote, scaleType, sections } = params;
  
  // Calculate total bars and duration
  const enabledSections = sections.filter(s => s.enabled && s.bars > 0);
  const totalBars = enabledSections.reduce((sum, s) => sum + s.bars, 0);
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;
  const totalDuration = totalBars * barDuration;
  
  const notes: NoteEvent[] = [];
  let currentBar = 0;
  
  // Bass frequencies
  const bassNotes = getBasslineNotes(rootNote, scaleType);
  
  for (const section of enabledSections) {
    const sectionStart = currentBar * barDuration;
    
    // Generate different pattern density per variation
    const variationIntensity = 0.5 + rng() * 0.5;
    
    // 1. Kick drum pattern
    const kickPattern = generateKickPattern(genre, section.bars, beatDuration, rng, variationIntensity);
    for (const note of kickPattern) {
      notes.push({
        ...note,
        time: note.time + sectionStart,
      });
    }
    
    // 2. Snare pattern
    const snarePattern = generateSnarePattern(genre, section.bars, beatDuration, rng, variationIntensity);
    for (const note of snarePattern) {
      notes.push({
        ...note,
        time: note.time + sectionStart,
      });
    }
    
    // 3. Hi-hat pattern
    const hihatPattern = generateHihatPattern(genre, section.bars, beatDuration, rng, variationIntensity);
    for (const note of hihatPattern) {
      notes.push({
        ...note,
        time: note.time + sectionStart,
      });
    }
    
    // 4. Bassline
    const bassPattern = generateBassline(genre, bassNotes, section.bars, beatDuration, rng, variationIntensity, section.name);
    for (const note of bassPattern) {
      notes.push({
        ...note,
        time: note.time + sectionStart,
      });
    }
    
    // 5. Melody (sparse for Dark Trap, more melodic for others)
    const melodyPattern = generateMelody(genre, rootNote, scaleType, section.bars, beatDuration, rng, variationIntensity, section.name);
    for (const note of melodyPattern) {
      notes.push({
        ...note,
        time: note.time + sectionStart,
      });
    }
    
    // 6. Pad/ambient for Lo-Fi and some sections
    if (genre === 'Lo-Fi' || section.name === 'Chorus') {
      const padPattern = generatePad(genre, rootNote, scaleType, section.bars, beatDuration, rng, section.name);
      for (const note of padPattern) {
        notes.push({
          ...note,
          time: note.time + sectionStart,
        });
      }
    }
    
    currentBar += section.bars;
  }
  
  return { notes, duration: totalDuration, totalBars };
}

function generateKickPattern(genre: Genre, bars: number, beatDuration: number, rng: () => number, intensity: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const totalBeats = bars * 4;
  
  for (let beat = 0; beat < totalBeats; beat++) {
    const barBeat = beat % 4;
    let playKick = false;
    
    switch (genre) {
      case 'Dark Trap':
        // Half-time feel: kick on 0 and 2 (with variation)
        playKick = barBeat === 0 || (barBeat === 2 && rng() > 0.3);
        // Occasional double kicks
        if (barBeat === 3 && rng() < intensity * 0.3) {
          playKick = true;
        }
        break;
      case 'Boom-Bap':
        // Classic: kick on 0 and 3
        playKick = barBeat === 0 || barBeat === 3;
        break;
      case 'Lo-Fi':
        // Relaxed: kick on 0, sometimes 2
        playKick = barBeat === 0 || (barBeat === 2 && rng() > 0.4);
        break;
    }
    
    if (playKick) {
      notes.push({
        time: beat * beatDuration,
        duration: beatDuration * 0.5,
        frequency: 60,
        velocity: 0.7 + rng() * 0.3,
        type: 'kick',
      });
    }
  }
  
  return notes;
}

function generateSnarePattern(genre: Genre, bars: number, beatDuration: number, rng: () => number, _intensity: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const totalBeats = bars * 4;
  
  for (let beat = 0; beat < totalBeats; beat++) {
    const barBeat = beat % 4;
    let playSnare = false;
    let velocity = 0.6;
    
    switch (genre) {
      case 'Dark Trap':
        // Half-time snare on beat 2
        playSnare = barBeat === 2;
        // Ghost notes
        if (barBeat === 0 && rng() < 0.15) {
          playSnare = true;
          velocity = 0.3;
        }
        break;
      case 'Boom-Bap':
        // Classic backbeat: snare on 2
        playSnare = barBeat === 2;
        break;
      case 'Lo-Fi':
        // Soft snare on 2 and sometimes 3
        playSnare = barBeat === 2 || (barBeat === 3 && rng() > 0.5);
        velocity = 0.4;
        break;
    }
    
    if (playSnare) {
      notes.push({
        time: beat * beatDuration,
        duration: beatDuration * 0.3,
        frequency: 200,
        velocity,
        type: 'snare',
      });
    }
  }
  
  return notes;
}

function generateHihatPattern(genre: Genre, bars: number, beatDuration: number, rng: () => number, intensity: number): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const totalBeats = bars * 4;
  
  for (let beat = 0; beat < totalBeats; beat++) {
    const barBeat = beat % 4;
    
    switch (genre) {
      case 'Dark Trap': {
        // Rapid 8th note hi-hats
        const subdivision = 2;
        for (let sub = 0; sub < subdivision; sub++) {
          const time = (beat + sub / subdivision) * beatDuration;
          let velocity = 0.5;
          
          // Accent on the beat
          if (sub === 0) velocity = 0.7;
          
          // Occasional rolls
          if (rng() < intensity * 0.08) {
            // 16th note triplet roll
            for (let r = 0; r < 3; r++) {
              notes.push({
                time: time + r * (beatDuration / 6),
                duration: beatDuration * 0.08,
                frequency: 8000,
                velocity: 0.4 + r * 0.1,
                type: 'hihat',
              });
            }
          } else {
            notes.push({
              time,
              duration: beatDuration * 0.1,
              frequency: 8000,
              velocity,
              type: 'hihat',
            });
          }
        }
        break;
      }
      case 'Boom-Bap': {
        // 8th note closed hats
        for (let sub = 0; sub < 2; sub++) {
          notes.push({
            time: (beat + sub / 2) * beatDuration,
            duration: beatDuration * 0.08,
            frequency: 7000,
            velocity: sub === 0 ? 0.5 : 0.35,
            type: 'hihat',
          });
        }
        break;
      }
      case 'Lo-Fi': {
        // Sparse, swung hats
        if (barBeat % 2 === 0 || rng() > 0.3) {
          notes.push({
            time: beat * beatDuration,
            duration: beatDuration * 0.15,
            frequency: 6000,
            velocity: 0.25,
            type: 'hihat',
          });
        }
        break;
      }
    }
  }
  
  return notes;
}

function generateBassline(
  genre: Genre,
  bassNotes: number[],
  bars: number,
  beatDuration: number,
  rng: () => number,
  intensity: number,
  sectionName: string
): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const totalBeats = bars * 4;
  
  // Different bass patterns per section
  const isChorus = sectionName === 'Chorus';
  
  for (let beat = 0; beat < totalBeats; beat++) {
    const barBeat = beat % 4;
    let playBass = false;
    let noteIndex = 0;
    
    switch (genre) {
      case 'Dark Trap': {
        // 808-style: long notes on 0 and 2
        playBass = barBeat === 0 || barBeat === 2;
        noteIndex = barBeat === 0 ? 0 : 2;
        break;
      }
      case 'Boom-Bap': {
        // Bass on beat 1 and some off-beats
        playBass = barBeat === 0 || (barBeat === 2 && rng() > 0.3);
        noteIndex = barBeat === 0 ? 0 : (rng() > 0.5 ? 1 : 2);
        break;
      }
      case 'Lo-Fi': {
        // Walking bass feel
        playBass = barBeat === 0 || barBeat === 2;
        noteIndex = Math.floor(rng() * 3);
        break;
      }
    }
    
    if (playBass) {
      const freq = bassNotes[noteIndex % bassNotes.length];
      const duration = genre === 'Dark Trap' ? beatDuration * 1.5 : beatDuration * 0.8;
      
      notes.push({
        time: beat * beatDuration,
        duration,
        frequency: freq * (isChorus ? 2 : 1),
        velocity: 0.5 + intensity * 0.3,
        type: 'bass',
      });
    }
  }
  
  return notes;
}

function generateMelody(
  genre: Genre,
  rootNote: string,
  scaleType: 'Major' | 'Minor',
  bars: number,
  beatDuration: number,
  rng: () => number,
  _intensity: number,
  sectionName: string
): NoteEvent[] {
  const notes: NoteEvent[] = [];
  const totalBeats = bars * 4;
  
  // Melody density depends on genre and section
  let melodyChance = 0.2;
  if (genre === 'Boom-Bap') melodyChance = 0.35;
  if (genre === 'Lo-Fi') melodyChance = 0.4;
  if (sectionName === 'Chorus') melodyChance *= 1.5;
  if (sectionName === 'Intro') melodyChance *= 0.5;
  
  for (let beat = 0; beat < totalBeats; beat++) {
    if (rng() < melodyChance) {
      const octave = genre === 'Lo-Fi' ? 1 : 2;
      const freq = getRandomScaleNote(rootNote as any, scaleType, octave);
      
      notes.push({
        time: beat * beatDuration,
        duration: beatDuration * (1 + rng() * 2),
        frequency: freq,
        velocity: 0.2 + rng() * 0.3,
        type: 'melody',
      });
    }
  }
  
  return notes;
}

function generatePad(
  _genre: Genre,
  rootNote: string,
  scaleType: 'Major' | 'Minor',
  bars: number,
  beatDuration: number,
  rng: () => number,
  _sectionName: string
): NoteEvent[] {
  const notes: NoteEvent[] = [];
  
  // Long sustained chords
  const barDuration = beatDuration * 4;
  const octave = 1;
  
  for (let bar = 0; bar < bars; bar += 2) {
    const freq = getRandomScaleNote(rootNote as any, scaleType, octave);
    
    notes.push({
      time: bar * barDuration,
      duration: Math.min(barDuration * 2, (bars - bar) * barDuration),
      frequency: freq,
      velocity: 0.08 + rng() * 0.08,
      type: 'pad',
    });
  }
  
  return notes;
}
