// src/audio/keySound.js
// Lightweight keyboard typing sounds using the Web Audio API.
// Works on react-native-web + Electron (Chromium). No-op on native.

let audioCtx = null;
const KEY_FREQS = { correct: 620, wrong: 300, key: 480 };

function ensureCtx() {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') {
    return null;
  }
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function blip(freq = KEY_FREQS.key, duration = 0.045, gain = 0.06) {
  const ctx = ensureCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  } catch (e) {}
}

export function playKeySound(type = 'key') {
  const freq = KEY_FREQS[type] || KEY_FREQS.key;
  blip(freq, type === 'wrong' ? 0.1 : 0.045, type === 'wrong' ? 0.07 : 0.055);
}

export function unlockAudio() {
  ensureCtx();
}