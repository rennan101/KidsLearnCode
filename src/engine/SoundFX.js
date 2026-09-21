/**
 * SoundFX - Gerenciador de Efeitos Sonoros Táteis Procedurais (Web Audio API)
 * Gera sons instantâneos, leves e satisfatórios sem dependência de carregamento de arquivos de áudio externos.
 */

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. Som de "Pop" suave para passar o mouse pelos 20 bolsos circulares da Bolsa
  playPop(pitchMultiplier = 1.0) {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startFreq = 480 * pitchMultiplier;
      const endFreq = 960 * pitchMultiplier;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.038);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Ignora erro se áudio não estiver desbloqueado pelo navegador
    }
  }

  // 2. Som de "Pick Up" ao iniciar o arrasto de um bloco de código
  playPickUp() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch (e) {}
  }

  // 3. Som de "Snap" tátil e ressonante de madeira ao encaixar blocos de quebra-cabeça
  playSnap() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Click oscilador rápido
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.035);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.045);

      // Ressonância suave de madeira logo em seguida (+20ms)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now + 0.015);
      osc2.frequency.exponentialRampToValueAtTime(660, now + 0.06);
      gain2.gain.setValueAtTime(0.08, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.015);
      osc2.stop(now + 0.085);
    } catch (e) {}
  }

  // 4. Som cintilante de sucesso ao fabricar item com código validado
  playSuccess() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Acorde Maior)

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.09, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.2);
      });
    } catch (e) {}
  }
}

export const soundFX = new SoundFX();
