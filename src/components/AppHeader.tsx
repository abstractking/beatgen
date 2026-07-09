import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useBeat } from '@/context/BeatContext';

export default function AppHeader() {
  const { generationState } = useBeat();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const getStatusColor = () => {
    switch (generationState) {
      case 'idle':
        return '#525252';
      case 'generating':
        return '#06B6D4';
      case 'complete':
        return '#22C55E';
      case 'error':
        return '#EF4444';
      default:
        return '#525252';
    }
  };
  
  const getStatusText = () => {
    switch (generationState) {
      case 'idle':
        return 'Ready';
      case 'generating':
        return 'Generating...';
      case 'complete':
        return '4 Variations Ready';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };
  
  return (
    <motion.header
      className="flex items-center justify-between"
      style={{
        height: '64px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #222222',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        flexShrink: 0,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number], delay: 0.05 }}
    >
      {/* Left side - Branding */}
      <div className="flex items-baseline gap-3">
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            color: '#F5F5F5',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Beat<span style={{ color: '#8B5CF6' }}>Gen</span>
        </h1>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            color: '#525252',
          }}
        >
          AI Beat Generator
        </span>
      </div>
      
      {/* Right side - Status */}
      <div className="flex items-center gap-2">
        {/* Status Dot */}
        <motion.div
          className="rounded-full"
          style={{
            width: '8px',
            height: '8px',
            background: getStatusColor(),
          }}
          animate={
            generationState === 'generating'
              ? { opacity: [0.4, 1, 0.4] }
              : { opacity: 1 }
          }
          transition={
            generationState === 'generating'
              ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
        />
        
        {/* Status Text */}
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            fontWeight: 400,
            color: generationState === 'generating' ? '#06B6D4' : '#525252',
            letterSpacing: '0.02em',
          }}
        >
          {getStatusText()}
        </span>
        
        {/* Mobile menu button */}
        <button
          className="lg:hidden ml-3"
          style={{ color: '#A3A3A3', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Settings size={24} />
        </button>
      </div>
    </motion.header>
  );
}
