import { useRef, useEffect, useCallback } from 'react';
import { useBeat } from '@/context/BeatContext';
import { createAnalyser } from '@/lib/audioEngine';

export default function WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  
  const {
    playbackState,
    currentTime,
    totalTime,
    variations,
    generationState,
  } = useBeat();
  
  // Setup analyser from audio context
  useEffect(() => {
    try {
      const analyser = createAnalyser();
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    } catch {
      // Audio context not available yet
    }
  }, []);
  
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75].forEach(y => {
      ctx.beginPath();
      ctx.moveTo(0, height * y);
      ctx.lineTo(width, height * y);
      ctx.stroke();
    });
    
    const isPlaying = playbackState === 'playing';
    
    if (isPlaying && analyserRef.current && dataArrayRef.current) {
      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      const barCount = 64;
      const barWidth = (width / barCount) - 2;
      const midY = height / 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * dataArrayRef.current.length);
        const value = dataArrayRef.current[dataIndex] / 255;
        const barHeight = value * height * 0.7;
        
        const x = i * (barWidth + 2);
        const y = midY - barHeight / 2;
        
        // Gradient from cyan (low freq) to purple (high freq)
        const ratio = i / barCount;
        const r = Math.round(6 + (139 - 6) * ratio);
        const g = Math.round(182 + (92 - 182) * ratio);
        const b = Math.round(212 + (246 - 212) * ratio);
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [1, 1, 0, 0]);
        ctx.fill();
      }
      
      // Draw playback progress overlay
      if (totalTime > 0) {
        const progressX = (currentTime / totalTime) * width;
        
        // Semi-transparent fill
        ctx.fillStyle = 'rgba(6, 182, 212, 0.03)';
        ctx.fillRect(0, 0, progressX, height);
        
        // Progress line
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, height);
        ctx.stroke();
      }
    } else {
      // Idle state - flat line
      ctx.strokeStyle = '#222222';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      
      // Center text
      if (generationState === 'idle' || generationState === 'complete') {
        ctx.fillStyle = '#525252';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Select a variation to preview', width / 2, height / 2 + 20);
      }
    }
    
    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, [playbackState, currentTime, totalTime, generationState]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    animFrameRef.current = requestAnimationFrame(drawWaveform);
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [drawWaveform]);
  
  // No need to show if no variations
  if (generationState === 'idle' || (generationState === 'generating' && variations.length === 0)) {
    return null;
  }
  
  return (
    <div
      style={{
        margin: '24px 32px 0 32px',
        background: '#0D0D0D',
        border: '1px solid #1A1A1A',
        borderRadius: '12px',
        overflow: 'hidden',
        height: '200px',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
}
