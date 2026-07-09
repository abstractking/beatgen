import { motion } from 'framer-motion';

const barHeights = [40, 64, 48, 80, 56];
const barColors = ['#06B6D4', '#06B6D4', '#0891B2', '#8B5CF6', '#8B5CF6'];
const barDelays = [0, 0.15, 0.3, 0.1, 0.25];
const barDurations = [1.2, 1.0, 1.4, 0.9, 1.1];

export default function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: 'calc(100dvh - 64px)',
        padding: '32px',
      }}
    >
      {/* Animated waveform bars */}
      <div className="flex items-center gap-2 mb-8">
        {barHeights.map((h, i) => (
          <motion.div
            key={i}
            style={{
              width: '4px',
              borderRadius: '2px',
              background: barColors[i],
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{
              opacity: 1,
              scaleY: [1, 1.3, 0.7, 1.2, 1],
              height: [h, h * 1.3, h * 0.7, h * 1.2, h],
            }}
            transition={{
              opacity: { delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
              scaleY: { delay: 0.3 + i * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
              height: {
                delay: barDelays[i],
                duration: barDurations[i],
                repeat: Infinity,
                repeatType: 'reverse',
                ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              },
            }}
          />
        ))}
      </div>
      
      {/* Headline */}
      <motion.h2
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '32px',
          fontWeight: 700,
          color: '#F5F5F5',
          textAlign: 'center',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      >
        Create Your Beat
      </motion.h2>
      
      {/* Subtext */}
      <motion.p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 400,
          color: '#A3A3A3',
          textAlign: 'center',
          maxWidth: '420px',
          marginTop: '12px',
          lineHeight: 1.6,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      >
        Set your parameters on the left and hit Generate to create 4 unique beat variations powered by AI.
      </motion.p>
      
      {/* Hint */}
      <motion.p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 400,
          color: '#525252',
          marginTop: '20px',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      >
        Tip: Try different genre presets for instant inspiration
      </motion.p>
    </div>
  );
}
