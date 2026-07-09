import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  GenerationState,
  PlaybackState,
  Genre,
  RootNote,
  ScaleType,
  SectionConfig,
  BeatParameters,
  Variation,
} from '@/types/beat';
import { generateVariation, PlaybackController } from '@/lib/audioEngine';
import { generateWaveformData } from '@/lib/waveform';
import { getDefaultPatternForGenre } from '@/lib/genreRules';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info';
}

interface BeatContextType {
  // Generation state
  generationState: GenerationState;
  setGenerationState: (state: GenerationState) => void;
  
  // Parameters
  params: BeatParameters;
  setGenre: (genre: Genre) => void;
  setBpm: (bpm: number) => void;
  setRootNote: (note: RootNote) => void;
  setScaleType: (scale: ScaleType) => void;
  setDrumPattern: (pattern: string) => void;
  setSection: (index: number, config: Partial<SectionConfig>) => void;
  
  // Variations
  variations: Variation[];
  activeVariation: number | null;
  
  // Playback
  playbackState: PlaybackState;
  currentTime: number;
  totalTime: number;
  playbackProgress: number;
  currentSection: string;
  
  // Actions
  generateBeats: () => Promise<void>;
  playVariation: (index: number) => void;
  pausePlayback: () => void;
  stopPlayback: () => void;
  seekTo: (time: number) => void;
  cancelGeneration: () => void;
  
  // Toasts
  toasts: Toast[];
  removeToast: (id: string) => void;
  
  // Generation progress
  generationProgress: number;
  currentStage: string;
  currentVariationIndex: number;
}

const BeatContext = createContext<BeatContextType | null>(null);

const STAGES = [
  'Initializing...',
  'Composing drums...',
  'Adding bassline...',
  'Writing melodies...',
  'Mixing and mastering...',
  'Finalizing...',
];

const DEFAULT_SECTIONS: SectionConfig[] = [
  { name: 'Intro', enabled: true, bars: 4 },
  { name: 'Verse', enabled: true, bars: 8 },
  { name: 'Chorus', enabled: true, bars: 8 },
  { name: 'Bridge', enabled: false, bars: 4 },
  { name: 'Outro', enabled: true, bars: 4 },
];

export function BeatProvider({ children }: { children: ReactNode }) {
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [params, setParams] = useState<BeatParameters>({
    genre: 'Dark Trap',
    bpm: 140,
    rootNote: 'C',
    scaleType: 'Minor',
    drumPattern: 'Trap Roll',
    sections: [...DEFAULT_SECTIONS],
  });
  const [variations, setVariations] = useState<Variation[]>([]);
  const [activeVariation, setActiveVariation] = useState<number | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(STAGES[0]);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(0);
  
  const playbackRef = useRef<PlaybackController | null>(null);
  const animFrameRef = useRef<number>(0);
  const cancelledRef = useRef(false);
  
  // Playback animation loop
  useEffect(() => {
    const updatePlayback = () => {
      if (playbackRef.current?.getIsPlaying()) {
        const ct = playbackRef.current.getCurrentTime();
        setCurrentTime(ct);
        if (totalTime > 0) {
          const prog = (ct / totalTime) * 100;
          setPlaybackProgress(Math.min(prog, 100));
          
          // Calculate current section
          let barTime = 0;
          const beatDuration = 60 / params.bpm;
          const barDuration = beatDuration * 4;
          for (const section of params.sections) {
            if (!section.enabled || section.bars === 0) continue;
            const sectionDuration = section.bars * barDuration;
            if (ct >= barTime && ct < barTime + sectionDuration) {
              setCurrentSection(section.name);
              break;
            }
            barTime += sectionDuration;
          }
        }
        animFrameRef.current = requestAnimationFrame(updatePlayback);
      }
    };
    
    if (playbackState === 'playing') {
      animFrameRef.current = requestAnimationFrame(updatePlayback);
    }
    
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [playbackState, totalTime, params]);
  
  const addToast = useCallback((message: string, type: 'success' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);
  
  const generateBeats = useCallback(async () => {
    if (generationState === 'generating') return;
    
    setGenerationState('generating');
    setVariations([]);
    cancelledRef.current = false;
    
    const newVariations: Variation[] = [];
    const totalBars = params.sections
      .filter(s => s.enabled && s.bars > 0)
      .reduce((sum, s) => sum + s.bars, 0);
    const duration = totalBars * (60 / params.bpm) * 4;
    
    for (let i = 0; i < 4; i++) {
      if (cancelledRef.current) {
        setGenerationState('idle');
        return;
      }
      
      setCurrentVariationIndex(i);
      setGenerationProgress((i / 4) * 100);
      setCurrentStage(STAGES[Math.min(Math.floor((i / 4) * STAGES.length), STAGES.length - 1)]);
      
      try {
        const buffer = await generateVariation(params, i);
        const waveformData = generateWaveformData(buffer);
        
        const variation: Variation = {
          id: i + 1,
          audioBuffer: buffer,
          waveformData,
          isPlaying: false,
          isComplete: true,
          duration,
          genre: params.genre,
          bpm: params.bpm,
          key: `${params.rootNote} ${params.scaleType}`,
          bars: totalBars,
        };
        
        newVariations.push(variation);
        setVariations([...newVariations]);
      } catch (error) {
        console.error('Generation error:', error);
        setGenerationState('error');
        addToast('Generation failed. Please try again.', 'info');
        return;
      }
    }
    
    setGenerationProgress(100);
    setCurrentStage(STAGES[STAGES.length - 1]);
    
    setTimeout(() => {
      setGenerationState('complete');
      addToast('4 beat variations generated!', 'success');
    }, 300);
  }, [generationState, params, addToast]);
  
  const playVariation = useCallback((index: number) => {
    if (!variations[index]?.audioBuffer) return;
    
    if (activeVariation !== null && activeVariation !== index) {
      // Stop current variation
      playbackRef.current?.stop();
      setVariations(prev => prev.map((v, i) => ({
        ...v,
        isPlaying: i === index,
      })));
    } else {
      setVariations(prev => prev.map((v, i) => ({
        ...v,
        isPlaying: i === index,
      })));
    }
    
    setActiveVariation(index);
    setPlaybackState('playing');
    setTotalTime(variations[index].duration);
    
    if (!playbackRef.current) {
      playbackRef.current = new PlaybackController();
    }
    
    playbackRef.current.play(variations[index].audioBuffer!, () => {
      setPlaybackState('stopped');
      setCurrentTime(0);
      setPlaybackProgress(0);
      setVariations(prev => prev.map((v) => ({
        ...v,
        isPlaying: false,
      })));
    });
  }, [variations, activeVariation]);
  
  const pausePlayback = useCallback(() => {
    playbackRef.current?.pause();
    setPlaybackState('paused');
    setVariations(prev => prev.map((v) => ({
      ...v,
      isPlaying: false,
    })));
  }, []);
  
  const stopPlayback = useCallback(() => {
    playbackRef.current?.stop();
    setPlaybackState('stopped');
    setCurrentTime(0);
    setPlaybackProgress(0);
    setCurrentSection('');
    setVariations(prev => prev.map(v => ({ ...v, isPlaying: false })));
  }, []);
  
  const seekTo = useCallback((time: number) => {
    playbackRef.current?.seek(time);
    setCurrentTime(time);
    if (totalTime > 0) {
      setPlaybackProgress((time / totalTime) * 100);
    }
  }, [totalTime]);
  
  const cancelGeneration = useCallback(() => {
    cancelledRef.current = true;
    setGenerationState('idle');
    setGenerationProgress(0);
  }, []);
  
  // Parameter setters
  const setGenre = useCallback((genre: Genre) => {
    setParams(prev => {
      const newParams = { ...prev, genre };
      // Auto-update drum pattern based on genre
      newParams.drumPattern = getDefaultPatternForGenre(genre);
      return newParams;
    });
  }, []);
  
  const setBpm = useCallback((bpm: number) => {
    setParams(prev => ({ ...prev, bpm: Math.max(20, Math.min(300, bpm)) }));
  }, []);
  
  const setRootNote = useCallback((rootNote: RootNote) => {
    setParams(prev => ({ ...prev, rootNote }));
  }, []);
  
  const setScaleType = useCallback((scaleType: ScaleType) => {
    setParams(prev => ({ ...prev, scaleType }));
  }, []);
  
  const setDrumPattern = useCallback((drumPattern: string) => {
    setParams(prev => ({ ...prev, drumPattern }));
  }, []);
  
  const setSection = useCallback((index: number, config: Partial<SectionConfig>) => {
    setParams(prev => {
      const sections = [...prev.sections];
      sections[index] = { ...sections[index], ...config };
      return { ...prev, sections };
    });
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      playbackRef.current?.dispose();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);
  
  return (
    <BeatContext.Provider
      value={{
        generationState,
        setGenerationState,
        params,
        setGenre,
        setBpm,
        setRootNote,
        setScaleType,
        setDrumPattern,
        setSection,
        variations,
        activeVariation,
        playbackState,
        currentTime,
        totalTime,
        playbackProgress,
        currentSection,
        generateBeats,
        playVariation,
        pausePlayback,
        stopPlayback,
        seekTo,
        cancelGeneration,
        toasts,
        removeToast,
        generationProgress,
        currentStage,
        currentVariationIndex,
      }}
    >
      {children}
    </BeatContext.Provider>
  );
}

export function useBeat() {
  const context = useContext(BeatContext);
  if (!context) {
    throw new Error('useBeat must be used within a BeatProvider');
  }
  return context;
}
