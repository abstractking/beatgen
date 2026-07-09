import type { BeatParameters } from '@/types/beat';
import type { NoteEvent } from './midiPatterns';
import { generateBeatPattern } from './midiPatterns';

// Main audio context
let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

// Analyser node for waveform visualization
export function createAnalyser(): AnalyserNode {
  const ctx = getAudioContext();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.8;
  return analyser;
}

// Generate a beat variation as an AudioBuffer
export async function generateVariation(
  params: BeatParameters,
  variationIndex: number,
  sampleRate: number = 44100
): Promise<AudioBuffer> {
  // Generate the pattern
  const pattern = generateBeatPattern(params, variationIndex);
  
  // Create offline context for rendering
  const offlineCtx = new OfflineAudioContext(2, Math.ceil(pattern.duration * sampleRate), sampleRate);
  
  // Create master gain
  const masterGain = offlineCtx.createGain();
  masterGain.gain.value = 0.7;
  masterGain.connect(offlineCtx.destination);
  
  // Channel gains
  const drumGain = offlineCtx.createGain();
  drumGain.gain.value = 0.8;
  drumGain.connect(masterGain);
  
  const bassGain = offlineCtx.createGain();
  bassGain.gain.value = 0.6;
  bassGain.connect(masterGain);
  
  const melodyGain = offlineCtx.createGain();
  melodyGain.gain.value = 0.35;
  melodyGain.connect(masterGain);
  
  const padGain = offlineCtx.createGain();
  padGain.gain.value = 0.15;
  padGain.connect(masterGain);
  
  // Render each note
  for (const note of pattern.notes) {
    switch (note.type) {
      case 'kick':
        renderKick(offlineCtx, note, drumGain);
        break;
      case 'snare':
        renderSnare(offlineCtx, note, drumGain);
        break;
      case 'hihat':
        renderHihat(offlineCtx, note, drumGain);
        break;
      case 'bass':
        renderBass(offlineCtx, note, bassGain, params.genre);
        break;
      case 'melody':
        renderMelody(offlineCtx, note, melodyGain, params.genre);
        break;
      case 'pad':
        renderPad(offlineCtx, note, padGain);
        break;
    }
  }
  
  // Render
  const buffer = await offlineCtx.startRendering();
  return buffer;
}

// Render kick drum (sine sweep + noise burst)
function renderKick(
  ctx: OfflineAudioContext | AudioContext,
  note: NoteEvent,
  destination: GainNode
): void {
  const t = note.time;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const noise = ctx.createOscillator();
  const noiseGain = ctx.createGain();
  
  // Main sine sweep (808-style)
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
  
  gain.gain.setValueAtTime(note.velocity * 0.9, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + note.duration);
  
  // Subtle click
  noise.type = 'square';
  noise.frequency.setValueAtTime(1000, t);
  noiseGain.gain.setValueAtTime(note.velocity * 0.2, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
  
  osc.connect(gain);
  gain.connect(destination);
  noise.connect(noiseGain);
  noiseGain.connect(destination);
  
  osc.start(t);
  osc.stop(t + note.duration);
  noise.start(t);
  noise.stop(t + 0.01);
}

// Render snare (noise + tone)
function renderSnare(
  ctx: OfflineAudioContext | AudioContext,
  note: NoteEvent,
  destination: GainNode
): void {
  const t = note.time;
  
  // Tone component
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(200, t);
  osc.frequency.exponentialRampToValueAtTime(150, t + 0.05);
  oscGain.gain.setValueAtTime(note.velocity * 0.5, t);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + note.duration);
  
  // Noise component
  const bufferSize = ctx.sampleRate * 0.1;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  
  noiseGain.gain.setValueAtTime(note.velocity * 0.7, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + note.duration * 1.5);
  
  osc.connect(oscGain);
  oscGain.connect(destination);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(destination);
  
  osc.start(t);
  osc.stop(t + note.duration);
  noise.start(t);
}

// Render hi-hat (high-frequency noise)
function renderHihat(
  ctx: OfflineAudioContext | AudioContext,
  note: NoteEvent,
  destination: GainNode
): void {
  const t = note.time;
  
  const bufferSize = Math.ceil(ctx.sampleRate * 0.05);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = note.frequency;
  
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = note.frequency * 1.5;
  bandpass.Q.value = 1;
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(note.velocity * 0.4, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + note.duration);
  
  noise.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(gain);
  gain.connect(destination);
  
  noise.start(t);
  noise.stop(t + note.duration);
}

// Render bass (sine/sawtooth)
function renderBass(
  ctx: OfflineAudioContext | AudioContext,
  note: NoteEvent,
  destination: GainNode,
  genre: string
): void {
  const t = note.time;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc.type = genre === 'Dark Trap' ? 'sine' : 'triangle';
  osc.frequency.setValueAtTime(note.frequency, t);
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.linearRampToValueAtTime(200, t + note.duration * 0.5);
  
  gain.gain.setValueAtTime(note.velocity * 0.7, t);
  gain.gain.setTargetAtTime(0.001, t + note.duration * 0.3, note.duration * 0.3);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  
  osc.start(t);
  osc.stop(t + note.duration + 0.1);
}

// Render melody (synth tone)
function renderMelody(
  ctx: OfflineAudioContext | AudioContext,
  note: NoteEvent,
  destination: GainNode,
  genre: string
): void {
  const t = note.time;
  
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc1.type = genre === 'Lo-Fi' ? 'sine' : 'triangle';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(note.frequency, t);
  osc2.frequency.setValueAtTime(note.frequency * 1.01, t); // Slight detune
  
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, t);
  filter.frequency.linearRampToValueAtTime(800, t + note.duration);
  filter.Q.value = 1;
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(note.velocity * 0.4, t + 0.05);
  gain.gain.setTargetAtTime(0.001, t + note.duration * 0.5, note.duration * 0.3);
  
  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  
  osc1.start(t);
  osc2.start(t);
  osc1.stop(t + note.duration + 0.05);
  osc2.stop(t + note.duration + 0.05);
}

// Render pad (ambient sustained tone)
function renderPad(
  ctx: OfflineAudioContext | AudioContext,
  note: NoteEvent,
  destination: GainNode
): void {
  const t = note.time;
  
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc3.type = 'triangle';
  osc1.frequency.setValueAtTime(note.frequency, t);
  osc2.frequency.setValueAtTime(note.frequency * 1.5, t); // 5th
  osc3.frequency.setValueAtTime(note.frequency * 2, t);   // Octave
  
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.5;
  
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(note.velocity, t + 0.3);
  gain.gain.setTargetAtTime(0.001, t + note.duration * 0.6, note.duration * 0.4);
  
  osc1.connect(filter);
  osc2.connect(filter);
  osc3.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  
  osc1.start(t);
  osc2.start(t);
  osc3.start(t);
  osc1.stop(t + note.duration);
  osc2.stop(t + note.duration);
  osc3.stop(t + note.duration);
}

// Playback controller
export class PlaybackController {
  private ctx: AudioContext;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode;
  private analyser: AnalyserNode;
  private startTime = 0;
  private pauseTime = 0;
  private isPlaying = false;
  private buffer: AudioBuffer | null = null;
  private onEndedCallback: (() => void) | null = null;
  
  constructor() {
    this.ctx = getAudioContext();
    this.gainNode = this.ctx.createGain();
    this.analyser = createAnalyser();
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }
  
  getAnalyser(): AnalyserNode {
    return this.analyser;
  }
  
  play(buffer: AudioBuffer, onEnded?: () => void): void {
    if (this.isPlaying) {
      this.stop();
    }
    
    this.buffer = buffer;
    this.onEndedCallback = onEnded || null;
    
    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.gainNode);
    
    const offset = this.pauseTime > 0 ? this.pauseTime : 0;
    this.startTime = this.ctx.currentTime - offset;
    this.pauseTime = 0;
    this.isPlaying = true;
    
    this.source.onended = () => {
      if (this.isPlaying && this.onEndedCallback) {
        this.onEndedCallback();
      }
    };
    
    this.source.start(0, offset);
  }
  
  pause(): void {
    if (!this.isPlaying || !this.source) return;
    
    this.pauseTime = this.ctx.currentTime - this.startTime;
    this.isPlaying = false;
    this.source.stop();
    this.source = null;
  }
  
  stop(): void {
    if (this.source) {
      this.source.stop();
      this.source = null;
    }
    this.isPlaying = false;
    this.pauseTime = 0;
    this.startTime = 0;
  }
  
  seek(time: number): void {
    const wasPlaying = this.isPlaying;
    const buffer = this.buffer;
    const onEnded = this.onEndedCallback;
    
    this.stop();
    this.pauseTime = time;
    
    if (wasPlaying && buffer) {
      this.play(buffer, onEnded || undefined);
    }
  }
  
  getCurrentTime(): number {
    if (!this.isPlaying) return this.pauseTime;
    return this.ctx.currentTime - this.startTime;
  }
  
  getIsPlaying(): boolean {
    return this.isPlaying;
  }
  
  setVolume(vol: number): void {
    this.gainNode.gain.value = vol;
  }
  
  dispose(): void {
    this.stop();
    try {
      this.gainNode.disconnect();
      this.analyser.disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }
}
