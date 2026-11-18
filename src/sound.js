// Sound preference plus a tiny pixel blip for completed cases (no audio files needed).
const KEY = 'sound';

export function soundEnabled() {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundEnabled(on) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Storage unavailable: the choice just won't persist.
  }
}

let audio = null;

export function playBlip() {
  if (!soundEnabled()) return;
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    [660, 880].forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.05, now + i * 0.08);
      gain.gain.setValueAtTime(0, now + i * 0.08 + 0.07);
      osc.connect(gain).connect(audio.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.08);
    });
  } catch {
    // Audio unavailable: stay silent.
  }
}
