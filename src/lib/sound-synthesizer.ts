/**
 * Zero-dependency Procedural Web Audio UI Sound Synthesizer
 * Generates tactile clicks, slider ticks, celebratory arpeggios, and warning tones.
 * Follows Web Audio API best practices: Lazy AudioContext init, volume control, mute persistence.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.25;

  constructor() {
    // Load persisted mute preference if available
    try {
      const savedMute = localStorage.getItem('au_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // Ignore SSR / localStorage restrictions
    }
  }

  private init(): boolean {
    if (this.isMuted) return false;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return false;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return true;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('au_sound_muted', String(muted));
    } catch {}
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Tactile soft click — for button presses and tab switches.
   */
  public playClick(freq = 800): void {
    try {
      if (!this.init() || !this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.04);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch {}
  }

  /**
   * Slider tick — subtle high-pitched micro-blip.
   */
  public playTick(): void {
    try {
      if (!this.init() || !this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.015);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.015);
    } catch {}
  }

  /**
   * Success chime — Cmaj9 arpeggio (C5 -> E5 -> G5 -> B5 -> D6).
   */
  public playSuccess(): void {
    try {
      if (!this.init() || !this.ctx || !this.masterGain) return;

      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5, E5, G5, B5, D6
      const t = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const noteTime = t + idx * 0.06;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.18, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });
    } catch {}
  }

  /**
   * Milestone / Goal Reached Fanfare — rich layered celebratory chord.
   */
  public playGoalCelebration(): void {
    try {
      if (!this.init() || !this.ctx || !this.masterGain) return;

      const chords = [
        [523.25, 659.25, 783.99],          // C major
        [587.33, 739.99, 880.00],          // D major
        [659.25, 830.61, 987.77, 1318.51], // E major / high peak
      ];
      const t = this.ctx.currentTime;

      chords.forEach((chord, step) => {
        const stepTime = t + step * 0.14;
        chord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, stepTime);

          const duration = step === chords.length - 1 ? 0.6 : 0.25;
          gain.gain.setValueAtTime(0.12, stepTime);
          gain.gain.exponentialRampToValueAtTime(0.001, stepTime + duration);

          osc.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(stepTime);
          osc.stop(stepTime + duration);
        });
      });
    } catch {}
  }

  /**
   * Warning / Limit Reached tone — gentle FM dual-tone.
   */
  public playWarning(): void {
    try {
      if (!this.init() || !this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(320, t);
      osc2.frequency.setValueAtTime(360, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.18);
      osc2.stop(t + 0.18);
    } catch {}
  }
}

export const sound = new SoundSynthesizer();
