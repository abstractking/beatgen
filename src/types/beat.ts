export type GenerationState = 'idle' | 'generating' | 'complete' | 'error';
export type PlaybackState = 'stopped' | 'playing' | 'paused';

export type Genre = 'Dark Trap' | 'Boom-Bap' | 'Lo-Fi';
export type ScaleType = 'Major' | 'Minor';
export type RootNote = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface SectionConfig {
  name: string;
  enabled: boolean;
  bars: number;
}

export interface BeatParameters {
  genre: Genre;
  bpm: number;
  rootNote: RootNote;
  scaleType: ScaleType;
  drumPattern: string;
  sections: SectionConfig[];
}

export interface Variation {
  id: number;
  audioBuffer: AudioBuffer | null;
  waveformData: number[];
  isPlaying: boolean;
  isComplete: boolean;
  duration: number;
  genre: Genre;
  bpm: number;
  key: string;
  bars: number;
}

export interface PlaybackInfo {
  currentTime: number;
  totalTime: number;
  progress: number;
  currentSection: string;
}
