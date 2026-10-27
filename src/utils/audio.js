/**
 * 100% Offline Web Audio API Synthesizer
 * Zero external audio files or network requests.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessSound(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Play cheerful triad C5 -> E5 -> G5 -> C6
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.08);

    gain.gain.setValueAtTime(0, now + index * 0.08);
    gain.gain.linearRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.08);
    osc.stop(now + index * 0.08 + 0.3);
  });
}

export function playGentleWrongSound(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Soft, warm two-tone "hmmm" (D4 -> B3)
  const notes = [293.66, 246.94];
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.12);

    gain.gain.setValueAtTime(0, now + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.12, now + index * 0.12 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.24);
  });
}

export function playCelebrationFanfare(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Fanfare: C5, G5, C6, E6, G6
  const chords = [
    { freq: 523.25, time: 0.0, dur: 0.15 },
    { freq: 659.25, time: 0.12, dur: 0.15 },
    { freq: 783.99, time: 0.24, dur: 0.18 },
    { freq: 1046.5, time: 0.38, dur: 0.45 },
    { freq: 1318.51, time: 0.44, dur: 0.55 }
  ];

  chords.forEach(({ freq, time, dur }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + time);

    gain.gain.setValueAtTime(0, now + time);
    gain.gain.linearRampToValueAtTime(0.22, now + time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + time);
    osc.stop(now + time + dur + 0.05);
  });
}

export function playPop(enabled = true) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.06);
}
