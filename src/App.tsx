import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info } from 'lucide-react';
import { BeatProvider, useBeat } from '@/context/BeatContext';
import ParameterPanel from '@/components/ParameterPanel';
import AppHeader from '@/components/AppHeader';
import WaveformDisplay from '@/components/WaveformDisplay';
import PlaybackControls from '@/components/PlaybackControls';
import VariationsGrid from '@/components/VariationsGrid';
import GenerationOverlay from '@/components/GenerationOverlay';
import EmptyState from '@/components/EmptyState';

function ToastContainer() {
  const { toasts, removeToast } = useBeat();
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="flex items-center gap-3"
            style={{
              background: '#1A1A1A',
              border: '1px solid #333333',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxWidth: '360px',
            }}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '20px' }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
            }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: '24px',
                height: '24px',
                background: toast.type === 'success' ? '#22C55E' : '#06B6D4',
                flexShrink: 0,
              }}
            >
              {toast.type === 'success' ? (
                <Check size={14} color="#FFFFFF" />
              ) : (
                <Info size={14} color="#FFFFFF" />
              )}
            </div>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#F5F5F5',
              }}
            >
              {toast.message}
            </span>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#525252',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: 'auto',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function AppContent() {
  const { generationState, variations } = useBeat();
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  
  const showEmptyState = generationState === 'idle' && variations.length === 0;
  
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '360px 1fr',
        height: '100dvh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0A0A0A',
      }}
    >
      {/* Left Panel - Desktop */}
      <div
        className="hidden lg:block"
        style={{
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <ParameterPanel />
      </div>
      
      {/* Left Panel - Mobile Drawer */}
      <AnimatePresence>
        {mobilePanelOpen && (
          <>
            <motion.div
              className="fixed inset-0 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.7)', zIndex: 40 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobilePanelOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 bottom-0 lg:hidden"
              style={{
                width: '85vw',
                maxWidth: '360px',
                zIndex: 45,
                background: '#111111',
              }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            >
              <div className="h-full" onClick={(e) => e.stopPropagation()}>
                <ParameterPanel />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Right Panel */}
      <div
        className="relative"
        style={{
          height: '100dvh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AppHeader />
        
        {/* Content Area */}
        <div className="flex-1 relative">
          {showEmptyState ? (
            <EmptyState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <WaveformDisplay />
              <PlaybackControls />
              <VariationsGrid />
            </motion.div>
          )}
          
          {/* Generation Overlay */}
          <GenerationOverlay />
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BeatProvider>
      <AppContent />
    </BeatProvider>
  );
}
