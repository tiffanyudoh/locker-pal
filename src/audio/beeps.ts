let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function resumeAudio(): void {
  audio();
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain = 0.05,
  delay = 0,
): void {
  const c = audio();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g);
  g.connect(c.destination);
  const start = c.currentTime + delay;
  osc.start(start);
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.stop(start + duration + 0.02);
}

export function beepClick(): void {
  tone(920, 0.05, 'square', 0.04);
}

export function beepError(): void {
  tone(180, 0.18, 'sawtooth', 0.06);
  tone(140, 0.22, 'square', 0.04, 0.08);
}

export function beepOk(): void {
  tone(660, 0.09, 'square', 0.05);
  tone(880, 0.12, 'square', 0.05, 0.1);
}

export function beepBoot(): void {
  tone(392, 0.1, 'square', 0.04);
  tone(523, 0.1, 'square', 0.04, 0.12);
  tone(659, 0.16, 'square', 0.05, 0.24);
}

export function beepWin(): void {
  tone(523, 0.1, 'square', 0.05);
  tone(659, 0.1, 'square', 0.05, 0.1);
  tone(784, 0.18, 'square', 0.05, 0.2);
}

/** Sharp-era PDA alarm: three high square chirp bursts, then two pips. ~1.8s, once. */
export function beepAlarm(): void {
  const burst = (offset: number) => {
    tone(1760, 0.07, 'square', 0.07, offset);
    tone(2093, 0.07, 'square', 0.075, offset + 0.08);
    tone(1568, 0.06, 'square', 0.06, offset + 0.16);
    tone(2093, 0.09, 'square', 0.075, offset + 0.24);
  };
  burst(0);
  burst(0.42);
  burst(0.84);
  tone(2349, 0.05, 'square', 0.055, 1.38);
  tone(2349, 0.08, 'square', 0.06, 1.54);
}
