import type { RootNote, ScaleType } from '@/types/beat';

// Note frequency map (12-tone equal temperament, A4 = 440Hz)
const BASE_FREQ: Record<RootNote, number> = {
  'C': 261.63,
  'C#': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'B': 493.88,
};

export function getRootFrequency(root: RootNote): number {
  return BASE_FREQ[root];
}

// Major scale intervals (whole-whole-half-whole-whole-whole-half)
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11, 12];
// Minor scale intervals (whole-half-whole-whole-half-whole-whole)
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10, 12];

export function getScaleFrequencies(root: RootNote, scale: ScaleType): number[] {
  const rootFreq = BASE_FREQ[root];
  const intervals = scale === 'Major' ? MAJOR_INTERVALS : MINOR_INTERVALS;
  
  return intervals.map(semitones => {
    // Calculate frequency for note 'semitones' above root
    return rootFreq * Math.pow(2, semitones / 12);
  });
}

// Get all frequencies for a scale across multiple octaves
export function getExtendedScaleFrequencies(
  root: RootNote,
  scale: ScaleType,
  octaves: number = 2
): number[] {
  const baseScale = getScaleFrequencies(root, scale);
  const result: number[] = [];
  
  for (let o = 0; o < octaves; o++) {
    for (const freq of baseScale) {
      result.push(freq * Math.pow(2, o));
    }
  }
  
  return result;
}

// Get a random note from the scale at a given octave
export function getRandomScaleNote(
  root: RootNote,
  scale: ScaleType,
  octave: number = 0
): number {
  const scaleFreqs = getScaleFrequencies(root, scale);
  const note = scaleFreqs[Math.floor(Math.random() * (scaleFreqs.length - 1))];
  return note * Math.pow(2, octave);
}

// Get bassline notes (root, 5th, octave for simple basslines)
export function getBasslineNotes(root: RootNote, scale: ScaleType): number[] {
  const scaleFreqs = getScaleFrequencies(root, scale);
  // Return root, 3rd, 5th, octave
  return [
    scaleFreqs[0] * 0.5, // Low root (1 octave down)
    scaleFreqs[0],        // Root
    scaleFreqs[2],        // 3rd
    scaleFreqs[4],        // 5th
    scaleFreqs[7],        // Octave
  ];
}
