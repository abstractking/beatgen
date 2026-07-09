import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useBeat } from '@/context/BeatContext';

export default function GenerationOverlay() {
  const {
    generationState,
    generationProgress,
    currentStage,
    currentVariationIndex,
    cancelGeneration,
  } = useBeat();
  
  const isVisible = generationState === 'generating';
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 20,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="flex flex-col items-center"
            style={{
              width: '400px',
              background: '#111111',
              border: '1px solid #222222',
              borderRadius: '20px',
              padding: '40px 32px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{
              delay: 0.1,
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
          >
            {/* Animated Spinner */}
            <div
              className="relative flex items-center justify-center mb-6"
              style={{ width: '64px', height: '64px' }}
            >
              {/* Rotating ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '3px solid #222222',
                  borderTopColor: '#06B6D4',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              {/* Sparkles icon */}
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={20} style={{ color: '#06B6D4' }} />
              </motion.div>
            </div>
            
            {/* Title */}
            <h3
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#F5F5F5',
                textAlign: 'center',
              }}
            >
              Generating Beats
            </h3>
            
            {/* Progress Bar */}
            <div
              className="w-full mt-5 mb-3"
              style={{
                height: '4px',
                background: '#222222',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  background: '#06B6D4',
                  borderRadius: '2px',
                }}
                animate={{ width: `${generationProgress}%` }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
              />
            </div>
            
            {/* Progress Text */}
            <p
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#A3A3A3',
                textAlign: 'center',
              }}
            >
              Variation {currentVariationIndex + 1} of 4
            </p>
            
            {/* Stage Label */}
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#525252',
                textAlign: 'center',
                marginTop: '8px',
              }}
            >
              {currentStage}
            </p>
            
            {/* Cancel Button */}
            <motion.button
              className="flex items-center justify-center gap-2 mt-6"
              style={{
                width: '120px',
                height: '40px',
                background: '#1A1A1A',
                border: '1px solid #222222',
                borderRadius: '10px',
                color: '#F5F5F5',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                cursor: 'pointer',
              }}
              onClick={cancelGeneration}
              whileHover={{ background: '#222222', borderColor: '#333333' }}
              whileTap={{ scale: 0.97 }}
            >
              <X size={16} />
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
