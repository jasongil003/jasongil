/**
 * Web Audio API Procedural Sound Engine
 * Provides authentic UI sound effects without requiring external audio assets.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = false;
        this.volume = 0.25;
        this.initStorage();
    }

    initStorage() {
        try {
            const saved = localStorage.getItem('portfolio_sound_enabled');
            this.enabled = saved === 'true';
        } catch (e) {
            this.enabled = false;
        }
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        try {
            localStorage.setItem('portfolio_sound_enabled', this.enabled ? 'true' : 'false');
        } catch (e) {}
        if (this.enabled) {
            this.initContext();
            this.play('toggle');
        }
        this.updateButtons();
        return this.enabled;
    }

    updateButtons() {
        document.querySelectorAll('[data-sound-toggle]').forEach(btn => {
            btn.setAttribute('aria-pressed', this.enabled ? 'true' : 'false');
            btn.setAttribute('title', this.enabled ? 'Sounds on (Click to mute)' : 'Sounds off (Click to enable)');
            const onIcon = btn.querySelector('[data-sound-on]');
            const offIcon = btn.querySelector('[data-sound-off]');
            if (onIcon && offIcon) {
                if (this.enabled) {
                    onIcon.removeAttribute('hidden');
                    offIcon.setAttribute('hidden', '');
                } else {
                    onIcon.setAttribute('hidden', '');
                    offIcon.removeAttribute('hidden');
                }
            }
        });
    }

    play(soundName) {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            switch (soundName) {
                case 'click':
                case 'press': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(420, now);
                    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
                    gain.gain.setValueAtTime(this.volume * 0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
                }
                case 'release':
                case 'tick': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now);
                    osc.frequency.exponentialRampToValueAtTime(440, now + 0.03);
                    gain.gain.setValueAtTime(this.volume * 0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.04);
                    break;
                }
                case 'toggle': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.exponentialRampToValueAtTime(640, now + 0.09);
                    gain.gain.setValueAtTime(this.volume * 0.35, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;
                }
                case 'droplet':
                case 'tap': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1100, now);
                    osc.frequency.exponentialRampToValueAtTime(550, now + 0.07);
                    gain.gain.setValueAtTime(this.volume * 0.4, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;
                }
                case 'success':
                case 'chime': {
                    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                    notes.forEach((freq, i) => {
                        const osc = this.ctx.createOscillator();
                        const gain = this.ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now + i * 0.06);
                        gain.gain.setValueAtTime(this.volume * 0.25, now + i * 0.06);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.22);
                        osc.connect(gain);
                        gain.connect(this.ctx.destination);
                        osc.start(now + i * 0.06);
                        osc.stop(now + i * 0.06 + 0.25);
                    });
                    break;
                }
                case 'step': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(120, now);
                    osc.frequency.exponentialRampToValueAtTime(60, now + 0.04);
                    gain.gain.setValueAtTime(this.volume * 0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;
                }
                case 'collision': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(180, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
                    gain.gain.setValueAtTime(this.volume * 0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.07);
                    break;
                }
                case 'open': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(900, now + 0.12);
                    gain.gain.setValueAtTime(this.volume * 0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
                }
                case 'close': {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(700, now);
                    osc.frequency.exponentialRampToValueAtTime(250, now + 0.1);
                    gain.gain.setValueAtTime(this.volume * 0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start(now);
                    osc.stop(now + 0.13);
                    break;
                }
            }
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }
}

window.siteSound = new SoundEngine();
document.addEventListener('DOMContentLoaded', () => {
    window.siteSound.updateButtons();
    const unlockAudio = () => {
        window.siteSound.initContext();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
});
