import { motion } from 'framer-motion';
import { Sliders, Zap, Loader2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useBeat } from '@/context/BeatContext';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { Genre, RootNote, ScaleType } from '@/types/beat';

const GENRES: Genre[] = ['Dark Trap', 'Boom-Bap', 'Lo-Fi'];
const ROOT_NOTES: RootNote[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_TYPES: ScaleType[] = ['Major', 'Minor'];
const DRUM_PATTERNS = [
  'Standard',
  'Double Time',
  'Half Time',
  'Trap Roll',
  'Breakbeat',
  'Boom-Bap',
  'Minimal',
  'Afro',
];

export default function ParameterPanel() {
  const {
    params,
    setGenre,
    setBpm,
    setRootNote,
    setScaleType,
    setDrumPattern,
    setSection,
    generateBeats,
    generationState,
  } = useBeat();
  
  const isGenerating = generationState === 'generating';
  const totalBars = params.sections
    .filter(s => s.enabled && s.bars > 0)
    .reduce((sum, s) => sum + s.bars, 0);
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 + i * 0.07,
        duration: 0.35,
        ease: [0, 0, 0.2, 1] as [number, number, number, number],
      },
    }),
  };
  
  return (
    <div
      className="h-full flex flex-col overflow-y-auto"
      style={{
        background: '#111111',
        borderRight: '1px solid #222222',
        padding: '24px',
        scrollbarWidth: 'thin',
        scrollbarColor: '#333333 transparent',
      }}
    >
      {/* Panel Header */}
      <motion.div
        className="flex items-center gap-2 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number], delay: 0.1 }}
      >
        <Sliders size={16} style={{ color: '#525252' }} />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#A3A3A3',
          }}
        >
          Parameters
        </span>
      </motion.div>
      
      {/* Genre */}
      <motion.div
        className="mb-6"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '8px',
          }}
        >
          Genre
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#525252',
            marginBottom: '12px',
          }}
        >
          Select the overall style and mood
        </p>
        <Select value={params.genre} onValueChange={(v: string) => setGenre(v as Genre)}>
          <SelectTrigger
            style={{
              background: '#1A1A1A',
              border: '1px solid #222222',
              borderRadius: '10px',
              color: '#F5F5F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              height: '44px',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              background: '#1A1A1A',
              border: '1px solid #222222',
              borderRadius: '10px',
            }}
          >
            {GENRES.map(g => (
              <SelectItem
                key={g}
                value={g}
                style={{ color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}
              >
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      
      {/* BPM */}
      <motion.div
        className="mb-6"
        custom={1}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '8px',
          }}
        >
          BPM
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#525252',
            marginBottom: '12px',
          }}
        >
          Beats per minute — controls the tempo
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Slider
              value={[params.bpm]}
              onValueChange={(v: number[]) => setBpm(v[0])}
              min={20}
              max={300}
              step={1}
              className="w-full"
            />
          </div>
          <Input
            type="number"
            value={params.bpm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setBpm(Number(e.target.value))}
            min={20}
            max={300}
            style={{
              width: '80px',
              background: '#1A1A1A',
              border: params.bpm < 20 || params.bpm > 300 ? '1px solid #EF4444' : '1px solid #222222',
              borderRadius: '10px',
              color: '#F5F5F5',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#525252' }}>
            Slow 20
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#525252' }}>
            300 Fast
          </span>
        </div>
        {(params.bpm < 20 || params.bpm > 300) && (
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>
            BPM must be between 20-300
          </p>
        )}
      </motion.div>
      
      {/* Key */}
      <motion.div
        className="mb-6"
        custom={2}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '8px',
          }}
        >
          Key
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#525252',
            marginBottom: '12px',
          }}
        >
          Musical key and scale for harmonic content
        </p>
        <div className="flex gap-3">
          <div style={{ width: '55%' }}>
            <Select value={params.rootNote} onValueChange={(v: string) => setRootNote(v as RootNote)}>
              <SelectTrigger
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                  color: '#F5F5F5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  height: '44px',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                }}
              >
                {ROOT_NOTES.map(n => (
                  <SelectItem
                    key={n}
                    value={n}
                    style={{ color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}
                  >
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div style={{ width: '40%' }}>
            <Select value={params.scaleType} onValueChange={(v: string) => setScaleType(v as ScaleType)}>
              <SelectTrigger
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                  color: '#F5F5F5',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  height: '44px',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                }}
              >
                {SCALE_TYPES.map(s => (
                  <SelectItem
                    key={s}
                    value={s}
                    style={{ color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>
      
      {/* Drum Pattern */}
      <motion.div
        className="mb-6"
        custom={3}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '8px',
          }}
        >
          Drum Pattern
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#525252',
            marginBottom: '12px',
          }}
        >
          Choose the rhythmic foundation
        </p>
        <Select value={params.drumPattern} onValueChange={(v: string) => setDrumPattern(v)}>
          <SelectTrigger
            style={{
              background: '#1A1A1A',
              border: '1px solid #222222',
              borderRadius: '10px',
              color: '#F5F5F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              height: '44px',
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            style={{
              background: '#1A1A1A',
              border: '1px solid #222222',
              borderRadius: '10px',
            }}
          >
            {DRUM_PATTERNS.map(p => (
              <SelectItem
                key={p}
                value={p}
                style={{ color: '#F5F5F5', fontFamily: 'Inter, sans-serif' }}
              >
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>
      
      {/* Structure */}
      <motion.div
        className="mb-6"
        custom={4}
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <h3
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            color: '#F5F5F5',
            marginBottom: '8px',
          }}
        >
          Structure
        </h3>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            color: '#525252',
            marginBottom: '12px',
          }}
        >
          Arrange your beat with sections and bar counts
        </p>
        
        <div className="flex flex-col gap-1">
          {params.sections.map((section, index) => (
            <motion.div
              key={section.name}
              className="flex items-center gap-3 rounded-lg px-3"
              style={{
                height: '44px',
                background: section.enabled ? 'rgba(139, 92, 246, 0.04)' : 'transparent',
                borderBottom: '1px solid #1A1A1A',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.43 + index * 0.05, duration: 0.3 }}
            >
              <Checkbox
                checked={section.enabled}
                onCheckedChange={(checked) =>
                  setSection(index, { enabled: checked === true })
                }
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: '1px solid #333333',
                }}
              />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  color: '#F5F5F5',
                  width: '80px',
                }}
              >
                {section.name}
              </span>
              <Input
                type="number"
                value={section.bars}
                onChange={(e) =>
                  setSection(index, { bars: Math.max(0, Math.min(64, Number(e.target.value))) })
                }
                min={0}
                max={64}
                disabled={!section.enabled}
                style={{
                  width: '60px',
                  background: '#1A1A1A',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  color: section.enabled ? '#F5F5F5' : '#525252',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px',
                  textAlign: 'center',
                }}
              />
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  color: '#525252',
                }}
              >
                bars
              </span>
            </motion.div>
          ))}
        </div>
        
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: '#525252',
            marginTop: '8px',
          }}
        >
          Total: {totalBars} bars
        </p>
      </motion.div>
      
      <Separator style={{ background: '#1A1A1A', margin: '0 0 24px 0' }} />
      
      {/* Generate Button - Sticky at bottom */}
      <motion.div
        className="mt-auto"
        style={{
          position: 'sticky',
          bottom: '0',
          paddingBottom: '24px',
          background: 'linear-gradient(transparent, #111111 30%)',
          marginTop: 'auto',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          duration: 0.4,
          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
        }}
      >
        <motion.button
          className="w-full flex items-center justify-center gap-2"
          style={{
            height: '52px',
            background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
            borderRadius: '12px',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: isGenerating ? 'wait' : 'pointer',
            opacity: isGenerating ? 0.6 : 1,
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }}
          onClick={generateBeats}
          disabled={isGenerating}
          whileHover={!isGenerating ? {
            y: -1,
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
          } : {}}
          whileTap={!isGenerating ? { scale: 0.98, y: 0 } : {}}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap size={18} />
              Generate Beats
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
