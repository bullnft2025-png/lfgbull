export function createHallAudio() {
  let ctx = null;
  let master = null;
  let candle = null;
  let muted = true;
  let ready = false;

  async function unlock() {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = 0.2;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") await ctx.resume();
    ready = true;
  }

  function noise(seconds) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function live() {
    return ready && !muted && ctx;
  }

  function footstep() {
    if (!live()) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noise(0.18);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 160;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.38, t + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    src.connect(lp).connect(g).connect(master);
    src.start(t);
    src.stop(t + 0.26);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 62 + Math.random() * 10;
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.1, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(og).connect(master);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  function ping(freq, at, dur, vol, type = "sine") {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.018);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g).connect(master);
    osc.start(at);
    osc.stop(at + dur + 0.04);
  }

  function shimmer(at, seconds, freq, vol) {
    const src = ctx.createBufferSource();
    src.buffer = noise(Math.max(seconds, 0.08));
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = freq;
    bp.Q.value = 3.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
    src.connect(bp).connect(g).connect(master);
    src.start(at);
    src.stop(at + seconds);
  }

  function rite(kind) {
    if (!live()) return;
    const t = ctx.currentTime;
    if (kind === "miss") {
      shimmer(t, 0.42, 380, 0.07);
      ping(86, t, 0.38, 0.11, "triangle");
      return;
    }
    if (kind === "common") {
      ping(1318.5, t, 0.32, 0.09);
      ping(1975.5, t + 0.05, 0.38, 0.055);
      shimmer(t, 0.28, 2400, 0.035);
      return;
    }
    if (kind === "rare") {
      ping(392.0, t, 0.72, 0.08);
      ping(587.33, t + 0.06, 0.9, 0.07);
      ping(739.99, t + 0.14, 1.05, 0.045);
      shimmer(t, 0.75, 1180, 0.05);
      return;
    }
    ping(261.63, t, 1.7, 0.1);
    ping(523.25, t + 0.05, 2.0, 0.08);
    ping(784.0, t + 0.1, 2.2, 0.07);
    ping(1046.5, t + 0.16, 2.35, 0.05);
    shimmer(t, 1.35, 1760, 0.055);
  }

  function bell() {
    if (!live()) return;
    const t = ctx.currentTime;
    [523.25, 784.0, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.985, t + 2.4);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07 / (i + 1), t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 2.7);
    });
  }

  function startCandle() {
    if (!live() || candle) return;
    const src = ctx.createBufferSource();
    src.buffer = noise(2);
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1900;
    bp.Q.value = 0.55;
    const g = ctx.createGain();
    g.gain.value = 0.028;
    src.connect(hp).connect(bp).connect(g).connect(master);
    src.start();
    candle = { src, g };
  }

  function stopCandle() {
    if (!candle) return;
    try {
      candle.src.stop();
    } catch {
      /* already stopped */
    }
    candle = null;
  }

  function setMuted(value) {
    muted = value;
    if (muted) stopCandle();
  }

  return {
    unlock,
    footstep,
    bell,
    rite,
    startCandle,
    stopCandle,
    setMuted,
    get muted() {
      return muted;
    },
    get ready() {
      return ready;
    },
  };
}
