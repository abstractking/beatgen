import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Download, Check, Loader2 } from 'lucide-react';
import type { Variation } from '@/types/beat';
import { useBeat } from '@/context/BeatContext';
import { exportVariationAsWav } from '@/lib/exportAudio';
import { formatTime } from '@/lib/waveform';

interface VariationCardProps {
  variation: Variation;
  index: number;
  labels: string[];
}

const VARIATION_LABELS = ['A', 'B', 'C', 'D'];

export default function VariationCard({ variation, index }: VariationCardProps) {
  const {
    playVariation,
    pausePlayback,
    activeVariation,
    playbackState,
  } = useBeat();
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  
  const isActive = activeVariation === index;
  const isPlaying = isActive && playbackState === 'playing';
  const isOtherPlaying = activeVariation !== null && activeVariation !== index && playbackState === 'playing';
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      playVariation(index);
    }
  };
  
  const handleDownload = () => {
    if (!variation.audioBuffer || isDownloading) return;
    
    setIsDownloading(true);
    
    // Simulate encoding delay
    setTimeout(() => {
      exportVariationAsWav(variation);
      setIsDownloading(false);
      setDownloadComplete(true);
      
      setTimeout(() => {
        setDownloadComplete(false);
      }, 2000);
    }, 800);
  };
  
  // Generate SVG waveform path
  const waveformPath = useMemo(() => {
    if (!variation.waveformData || variation.waveformData.length === 0) return '';
    
    const data = variation.waveformData;
    const width = 300;
    const height = 60;
    const stepX = width / data.length;
    const midY = height / 2;
    
    let path = `M 0 ${midY}`;
    
    // Top half
    for (let i = 0; i < data.length; i++) {
      const x = i * stepX;
      const y = midY - data[i] * midY;
      path += ` L ${x} ${y}`;
    }
    
    // Bottom half (mirrored with less amplitude)
    for (let i = data.length - 1; i >= 0; i--) {
      const x = i * stepX;
      const y = midY + data[i] * midY * 0.5;
      path += ` L ${x} ${y}`;
    }
    
    path += ' Z';
    return path;
  }, [variation.waveformData]);
  
  return (
    <motion.div
      className="flex flex-col"
      style={{
        background: '#141414',
        border: isActive
          ? '1px solid #8B5CF6'
          : '1px solid #222222',
        borderRadius: '16px',
        padding: '20px',
        opacity: isOtherPlaying ? 0.6 : 1,
        boxShadow: isActive
          ? '0 0 20px rgba(139, 92, 246, 0.15)'
          : 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: isOtherPlaying ? 0.6 : 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.12,
        duration: 0.5,
        ease: [0, 0, 0.2, 1] as [number, number, number, number],
      }}
      whileHover={!isOtherPlaying ? {
        y: -2,
        borderColor: '#2A2A2A',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      } : {}}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              fontWeight: 500,
              color: '#8B5CF6',
            }}
          >
            #{index + 1}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#F5F5F5',
            }}
          >
            Variation {VARIATION_LABELS[index]}
          </span>
        </div>
        
        {/* Status indicator */}
        {variation.isComplete ? (
          <Check size={14} style={{ color: '#22C55E' }} />
        ) : (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="rounded-full"
                style={{
                  width: '6px',
                  height: '6px',
                  background: '#06B6D4',
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Mini Waveform */}
      <div
        style={{
          height: '60px',
          width: '100%',
          background: '#0D0D0D',
          borderRadius: '8px',
          marginBottom: '12px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {variation.isComplete && waveformPath ? (
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 60"
            preserveAspectRatio="none"
          >
            <path
              d={waveformPath}
              fill={`rgba(139, 92, 246, ${isPlaying ? 0.5 : 0.3})`}
              stroke={`rgba(139, 92, 246, ${isPlaying ? 0.8 : 0.6})`}
              strokeWidth="1"
            />
          </svg>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* Shimmer animation during generation */}
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.1), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div
        className="grid grid-cols-2 gap-2 mb-4"
        style={{ marginTop: '8px' }}
      >
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#525252' }}>
            Genre:{' '}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#F5F5F5' }}>
            {variation.genre}
          </span>
        </div>
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#525252' }}>
            BPM:{' '}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#F5F5F5' }}>
            {variation.bpm}
          </span>
        </div>
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#525252' }}>
            Key:{' '}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#F5F5F5' }}>
            {variation.key}
          </span>
        </div>
        <div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#525252' }}>
            Duration:{' '}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#F5F5F5' }}>
            {formatTime(variation.duration)}
          </span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-3" style={{ marginTop: 'auto' }}>
        {/* Play/Pause Button */}
        <motion.button
          className="flex items-center justify-center rounded-full"
          style={{
            width: '44px',
            height: '44px',
            background: isPlaying ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.15)',
            border: isPlaying
              ? '1px solid rgba(6, 182, 212, 0.6)'
              : '1px solid rgba(6, 182, 212, 0.3)',
            color: '#06B6D4',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onClick={handlePlayPause}
          whileHover={{ scale: 1.05, background: 'rgba(6, 182, 212, 0.25)' }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </motion.button>
        
        {/* Download Button */}
        <motion.button
          className="flex items-center justify-center gap-2 flex-1"
          style={{
            height: '44px',
            background: downloadComplete ? 'rgba(34, 197, 94, 0.15)' : '#1A1A1A',
            border: downloadComplete
              ? '1px solid rgba(34, 197, 94, 0.3)'
              : '1px solid #222222',
            borderRadius: '10px',
            color: downloadComplete ? '#22C55E' : '#F5F5F5',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            cursor: isDownloading || !variation.audioBuffer ? 'not-allowed' : 'pointer',
            opacity: isDownloading ? 0.7 : 1,
          }}
          onClick={handleDownload}
          disabled={isDownloading || !variation.audioBuffer}
          whileHover={{ background: '#222222', borderColor: '#333333' }}
          whileTap={{ scale: 0.97 }}
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Encoding...
            </>
          ) : downloadComplete ? (
            <>
              <Check size={16} />
              Downloaded!
            </>
          ) : (
            <>
              <Download size={16} />
              Download WAV
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
