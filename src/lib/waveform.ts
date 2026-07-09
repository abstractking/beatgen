// Generate a static waveform silhouette from audio data
export function generateWaveformData(audioBuffer: AudioBuffer, points: number = 200): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const step = Math.floor(channelData.length / points);
  const data: number[] = [];
  
  for (let i = 0; i < points; i++) {
    let sum = 0;
    const start = i * step;
    const end = Math.min(start + step, channelData.length);
    for (let j = start; j < end; j++) {
      sum += Math.abs(channelData[j]);
    }
    data.push(sum / (end - start));
  }
  
  // Normalize to 0-1 range
  const maxVal = Math.max(...data, 0.001);
  return data.map(v => v / maxVal);
}

// Create SVG path from waveform data
export function createWaveformPath(data: number[], width: number, height: number): string {
  const stepX = width / data.length;
  const midY = height / 2;
  
  let path = `M 0 ${midY}`;
  
  // Top half
  for (let i = 0; i < data.length; i++) {
    const x = i * stepX;
    const y = midY - data[i] * midY;
    path += ` L ${x} ${y}`;
  }
  
  // Bottom half (mirrored)
  for (let i = data.length - 1; i >= 0; i--) {
    const x = i * stepX;
    const y = midY + data[i] * midY * 0.5;
    path += ` L ${x} ${y}`;
  }
  
  path += ' Z';
  return path;
}

// Format seconds to MM:SS
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
