let ctx: AudioContext | null = null;

const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  return ctx;
};

const tone = (freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.3) => {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    // Web Audio no disponible
  }
};

const sequence = (notes: { freq: number; delay: number; duration: number; type?: OscillatorType; vol?: number }[]) => {
  notes.forEach(n => setTimeout(() => tone(n.freq, n.duration, n.type, n.vol), n.delay * 1000));
};

export const sounds = {
  success: () => sequence([
    { freq: 523, delay: 0, duration: 0.1 },
    { freq: 659, delay: 0.1, duration: 0.1 },
    { freq: 784, delay: 0.2, duration: 0.2 },
  ]),

  complete: () => sequence([
    { freq: 784, delay: 0, duration: 0.15 },
    { freq: 880, delay: 0.15, duration: 0.15 },
    { freq: 1047, delay: 0.3, duration: 0.3 },
  ]),

  points: () => sequence([
    { freq: 440, delay: 0, duration: 0.08 },
    { freq: 554, delay: 0.08, duration: 0.08 },
    { freq: 659, delay: 0.16, duration: 0.08 },
    { freq: 880, delay: 0.24, duration: 0.2 },
  ]),

  alert: () => sequence([
    { freq: 440, delay: 0, duration: 0.15, type: 'square', vol: 0.2 },
    { freq: 370, delay: 0.2, duration: 0.15, type: 'square', vol: 0.2 },
    { freq: 440, delay: 0.4, duration: 0.15, type: 'square', vol: 0.2 },
  ]),

  error: () => sequence([
    { freq: 300, delay: 0, duration: 0.1, type: 'sawtooth', vol: 0.2 },
    { freq: 250, delay: 0.12, duration: 0.2, type: 'sawtooth', vol: 0.15 },
  ]),

  kidCheer: () => sequence([
    { freq: 523, delay: 0, duration: 0.07 },
    { freq: 659, delay: 0.07, duration: 0.07 },
    { freq: 784, delay: 0.14, duration: 0.07 },
    { freq: 1047, delay: 0.21, duration: 0.07 },
    { freq: 1319, delay: 0.28, duration: 0.25 },
  ]),

  tap: () => tone(660, 0.05, 'sine', 0.15),

  select: () => tone(800, 0.06, 'sine', 0.12),

  deselect: () => tone(500, 0.06, 'sine', 0.1),

  save: () => sequence([
    { freq: 440, delay: 0, duration: 0.08 },
    { freq: 660, delay: 0.1, duration: 0.15 },
  ]),
};
