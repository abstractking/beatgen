import { motion } from 'framer-motion';
import { useBeat } from '@/context/BeatContext';
import VariationCard from './VariationCard';

const VARIATION_LABELS = ['A', 'B', 'C', 'D'];

export default function VariationsGrid() {
  const { variations, generationState } = useBeat();
  
  const hasVariations = variations.length > 0;
  
  if (!hasVariations && generationState !== 'generating') {
    return null;
  }
  
  // Show placeholder cards during generation before any variations are ready
  const displayVariations = variations.length > 0
    ? variations
    : Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        audioBuffer: null,
        waveformData: [],
        isPlaying: false,
        isComplete: false,
        duration: 0,
        genre: 'Dark Trap' as const,
        bpm: 140,
        key: 'C Minor',
        bars: 24,
      }));
  
  return (
    <motion.div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        padding: '24px 32px 32px 32px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {displayVariations.map((variation, index) => (
        <VariationCard
          key={variation.id}
          variation={variation}
          index={index}
          labels={VARIATION_LABELS}
        />
      ))}
    </motion.div>
  );
}
