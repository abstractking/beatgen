import type { Genre } from '@/types/beat';

export interface GenreConfig {
  name: Genre;
  bpmRange: [number, number];
  defaultBpm: number;
  preferredScale: 'Minor' | 'Major';
  description: string;
}

export const GENRE_CONFIGS: Record<Genre, GenreConfig> = {
  'Dark Trap': {
    name: 'Dark Trap',
    bpmRange: [130, 160],
    defaultBpm: 140,
    preferredScale: 'Minor',
    description: 'Deep 808s, rapid hi-hats, eerie melodies, distorted bass',
  },
  'Boom-Bap': {
    name: 'Boom-Bap',
    bpmRange: [80, 110],
    defaultBpm: 90,
    preferredScale: 'Minor',
    description: 'Classic breakbeats, sampled feel, gritty drums, jazz influences',
  },
  'Lo-Fi': {
    name: 'Lo-Fi',
    bpmRange: [70, 90],
    defaultBpm: 80,
    preferredScale: 'Minor',
    description: 'Dusty textures, swung drums, warm chords, relaxed tempo',
  },
};

export const DRUM_PATTERNS = [
  'Standard',
  'Double Time',
  'Half Time',
  'Trap Roll',
  'Breakbeat',
  'Boom-Bap',
  'Minimal',
  'Afro',
] as const;

// Genre-specific drum pattern probabilities
export function getPatternsForGenre(genre: Genre): string[] {
  switch (genre) {
    case 'Dark Trap':
      return ['Trap Roll', 'Standard', 'Double Time', 'Half Time'];
    case 'Boom-Bap':
      return ['Boom-Bap', 'Breakbeat', 'Standard', 'Afro'];
    case 'Lo-Fi':
      return ['Standard', 'Minimal', 'Boom-Bap', 'Half Time'];
    default:
      return ['Standard'];
  }
}

export function getDefaultPatternForGenre(genre: Genre): string {
  const patterns = getPatternsForGenre(genre);
  return patterns[0];
}
