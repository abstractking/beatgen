import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useBeat } from '@/context/BeatContext';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/waveform';

export default function PlaybackControls() {
  const {
    playbackState,
    currentTime,
    totalTime,
    playbackProgress,
    currentSection,
    playVariation,
    pausePlayback,
    activeVariation,
    variations,
    seekTo,
  } = useBeat();
  
  const hasVariations = variations.length > 0 && variations.some(v => v.isComplete);
  
  if (!hasVariations) return null;
  
  const isPlaying = playbackState === 'playing';
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
    } else if (activeVariation !== null) {
      playVariation(activeVariation);
    } else {
      playVariation(0);
    }
  };
  
  const handleSeek = (value: number[]) => {
    if (totalTime > 0) {
      const time = (value[0] / 100) * totalTime;
      seekTo(time);
    }
  };
  
  const sectionColors: Record<string, string> = {
    Intro: '#8B5CF6',
    Verse: '#06B6D4',
    Chorus: '#8B5CF6',
    Bridge: '#EAB308',
    Outro: '#8B5CF6',
  };
  
  return (
    <motion.div
      className="flex items-center gap-4"
      style={{
        margin: '12px 32px 0 32px',
        height: '48px',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
    >
      {/* Play/Pause Button */}
      <motion.button
        className="flex items-center justify-center rounded-full"
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#06B6D4',
          cursor: 'pointer',
        }}
        onClick={handlePlayPause}
        whileHover={{ background: 'rgba(6, 182, 212, 0.25)' }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Pause size={16} />
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Play size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Time Display */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px',
          color: '#A3A3A3',
          width: '100px',
          flexShrink: 0,
        }}
      >
        {formatTime(currentTime)} / {formatTime(totalTime)}
      </div>
      
      {/* Timeline Scrubber */}
      <div className="flex-1">
        <Slider
          value={[playbackProgress]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
        />
      </div>
      
      {/* Current Section Badge */}
      <AnimatePresence>
        {currentSection && (
          <motion.div
            className="flex items-center justify-center px-3"
            style={{
              height: '36px',
              borderRadius: '8px',
              background: `${sectionColors[currentSection] || '#8B5CF6'}15`,
              border: `1px solid ${sectionColors[currentSection] || '#8B5CF6'}`,
              color: sectionColors[currentSection] || '#8B5CF6',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              flexShrink: 0,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {currentSection}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
