/* Planesbound PAS-39 — Web Audio combat cues + mute + music hook (no sample banks). */
(function (root) {
  "use strict";

  const MUTE_KEY = "planesbound-audio-mute-v1";
  const MUSIC_KEY = "planesbound-music-mute-v1";

  function readFlag(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v == null) return fallback;
      return v === "1" || v === "true";
    } catch (_) {
      return fallback;
    }
  }

  function writeFlag(key, on) {
    try {
      localStorage.setItem(key, on ? "1" : "0");
    } catch (_) {
      /* private mode */
    }
  }

  function createAudio() {
    let ctx = null;
    let muted = typeof localStorage !== "undefined" ? readFlag(MUTE_KEY, false) : false;
    let musicMuted =
      typeof localStorage !== "undefined" ? readFlag(MUSIC_KEY, false) : false;
    let master = null;
    let musicNodes = null;
    let musicLoc = null;

    function ensure() {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 1;
        master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function setMuted(on) {
      muted = !!on;
      writeFlag(MUTE_KEY, muted);
      if (master) master.gain.setTargetAtTime(muted ? 0 : 1, (ctx && ctx.currentTime) || 0, 0.02);
      if (muted) stopMusic(true);
      return muted;
    }

    function isMuted() {
      return muted;
    }

    function toggleMute() {
      return setMuted(!muted);
    }

    function setMusicMuted(on) {
      musicMuted = !!on;
      writeFlag(MUSIC_KEY, musicMuted);
      if (musicMuted) stopMusic(true);
      else if (musicLoc) startMusic(musicLoc);
      return musicMuted;
    }

    function isMusicMuted() {
      return musicMuted;
    }

    /**
     * Short synthesized cue. Uses exponential gain ramps so mute stays click-free.
     */
    function tone({ freq = 440, dur = 0.08, type = "sine", gain = 0.035, slide = 0, delay = 0 }) {
      if (muted) return;
      const c = ensure();
      if (!c || !master) return;
      const t0 = c.currentTime + Math.max(0, delay);
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slide) osc.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }

    function noiseBurst({ dur = 0.06, gain = 0.02, band = 800 }) {
      if (muted) return;
      const c = ensure();
      if (!c || !master) return;
      const n = Math.max(1, Math.floor(c.sampleRate * dur));
      const buf = c.createBuffer(1, n, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = band;
      filter.Q.value = 0.8;
      const g = c.createGain();
      const t0 = c.currentTime;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter);
      filter.connect(g);
      g.connect(master);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    }

    const cues = {
      hit() {
        tone({ freq: 240, dur: 0.09, type: "square", gain: 0.032, slide: 90 });
      },
      crit() {
        tone({ freq: 280, dur: 0.08, type: "square", gain: 0.036, slide: 140 });
        tone({ freq: 420, dur: 0.1, type: "sine", gain: 0.03, delay: 0.055 });
      },
      miss() {
        tone({ freq: 150, dur: 0.07, type: "triangle", gain: 0.022, slide: -45 });
      },
      hurt() {
        tone({ freq: 105, dur: 0.14, type: "sawtooth", gain: 0.028, slide: -55 });
      },
      soft() {
        tone({ freq: 520, dur: 0.12, type: "sine", gain: 0.028, slide: 130 });
      },
      kill() {
        tone({ freq: 300, dur: 0.08, type: "square", gain: 0.034 });
        tone({ freq: 520, dur: 0.12, type: "sine", gain: 0.03, delay: 0.07 });
      },
      /** Timed block / parry clang — ready for PAS-33 gates. */
      parry() {
        noiseBurst({ dur: 0.045, gain: 0.028, band: 1400 });
        tone({ freq: 680, dur: 0.06, type: "square", gain: 0.03, slide: -220 });
        tone({ freq: 920, dur: 0.05, type: "triangle", gain: 0.018, delay: 0.03 });
      },
      /** Dodge / stamina roll whoosh. */
      roll() {
        noiseBurst({ dur: 0.08, gain: 0.018, band: 420 });
        tone({ freq: 180, dur: 0.1, type: "triangle", gain: 0.02, slide: 260 });
      },
      travel() {
        tone({ freq: 360, dur: 0.1, type: "sine", gain: 0.022, slide: 180 });
      },
      target() {
        tone({ freq: 640, dur: 0.045, type: "sine", gain: 0.018 });
      },
      quest() {
        tone({ freq: 440, dur: 0.07, type: "sine", gain: 0.026 });
        tone({ freq: 660, dur: 0.1, type: "sine", gain: 0.028, delay: 0.085 });
      },
      ui() {
        tone({ freq: 480, dur: 0.04, type: "sine", gain: 0.014 });
      },
    };

    /**
     * Light procedural astral pad — no binary assets.
     * Call with location id; hub/parchment stays quiet, voyage/loading get a soft bed.
     */
    function startMusic(locationId) {
      musicLoc = locationId || musicLoc || "astral-sea";
      if (muted || musicMuted) return;
      const c = ensure();
      if (!c || !master) return;
      stopMusic(false);
      const bedGain = c.createGain();
      bedGain.gain.value = 0.0001;
      const freqs = musicLoc === "hub" ? [110, 164.8] : [98, 146.8, 196];
      const oscs = freqs.map((f, i) => {
        const osc = c.createOscillator();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = f;
        const g = c.createGain();
        g.gain.value = i === 0 ? 0.35 : 0.18;
        // Slow vibrato on pitch only — keeps bedGain free for fade in/out.
        const lfo = c.createOscillator();
        const lfoGain = c.createGain();
        lfo.frequency.value = 0.05 + i * 0.01;
        lfoGain.gain.value = 1.2 + i * 0.4;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        osc.connect(g);
        g.connect(bedGain);
        osc.start();
        return { osc, lfo };
      });
      bedGain.connect(master);
      const t0 = c.currentTime;
      bedGain.gain.exponentialRampToValueAtTime(0.04, t0 + 1.4);
      musicNodes = { bedGain, oscs };
    }

    function stopMusic(clearLoc) {
      if (clearLoc) musicLoc = null;
      if (!musicNodes || !ctx) {
        musicNodes = null;
        return;
      }
      const { bedGain, oscs } = musicNodes;
      const t0 = ctx.currentTime;
      try {
        bedGain.gain.cancelScheduledValues(t0);
        bedGain.gain.setValueAtTime(Math.max(0.0001, bedGain.gain.value), t0);
        bedGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45);
      } catch (_) {
        /* ignore */
      }
      const nodes = musicNodes;
      musicNodes = null;
      setTimeout(() => {
        try {
          oscs.forEach(({ osc, lfo }) => {
            osc.stop();
            lfo.stop();
          });
          bedGain.disconnect();
        } catch (_) {
          /* ignore */
        }
        void nodes;
      }, 500);
    }

    function syncMusicForLocation(locationId) {
      const astral =
        locationId === "astral-sea" ||
        locationId === "memory-isle" ||
        locationId === "dust-lane" ||
        locationId === "lighthouse-bearing" ||
        locationId === "color-pool" ||
        locationId === "loading";
      if (astral) startMusic(locationId);
      else stopMusic(false);
    }

    return {
      MUTE_KEY,
      MUSIC_KEY,
      ensure,
      setMuted,
      isMuted,
      toggleMute,
      setMusicMuted,
      isMusicMuted,
      tone,
      cues,
      hit: () => cues.hit(),
      crit: () => cues.crit(),
      miss: () => cues.miss(),
      hurt: () => cues.hurt(),
      soft: () => cues.soft(),
      kill: () => cues.kill(),
      parry: () => cues.parry(),
      roll: () => cues.roll(),
      travel: () => cues.travel(),
      target: () => cues.target(),
      quest: () => cues.quest(),
      ui: () => cues.ui(),
      startMusic,
      stopMusic,
      syncMusicForLocation,
      cueNames: Object.keys(cues),
    };
  }

  const api = createAudio();
  root.PlanesboundAudio = api;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createAudio, MUTE_KEY, MUSIC_KEY };
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
