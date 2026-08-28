const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const sharp = require("sharp");

const DIR = path.join(__dirname, "boxes");
const TMP = path.join(DIR, "_frames");
const FFMPEG =
  process.env.FFMPEG ||
  path.join(
    process.env.LOCALAPPDATA,
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe"
  );

const SIZE = 1080;
const FPS = 24;
const SECONDS = 6;
const FRAMES = FPS * SECONDS;
const RATE = 44100;

const BOXES = [
  {
    id: "white",
    src: "box-white.png",
    glow: { r: 255, g: 244, b: 220 },
    freqs: [1318.5, 1975.5],
    shimmer: 2400,
    rumble: 52,
  },
  {
    id: "violet",
    src: "box-violet.png",
    glow: { r: 176, g: 92, b: 255 },
    freqs: [392.0, 587.33, 739.99],
    shimmer: 1180,
    rumble: 46,
  },
  {
    id: "gold",
    src: "box-gold.png",
    glow: { r: 232, g: 176, b: 64 },
    freqs: [261.63, 523.25, 784.0, 1046.5],
    shimmer: 1760,
    rumble: 40,
  },
];

function run(args) {
  const res = spawnSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
    windowsHide: true,
  });
  if (res.status !== 0) throw new Error(`ffmpeg failed (${res.status})`);
}

function writeWav(file, left, right) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    buf.writeInt16LE((l * 32767) | 0, 44 + i * 4);
    buf.writeInt16LE((r * 32767) | 0, 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}

function env(t, a, d, s, r, dur) {
  if (t < 0) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < dur - r) return s;
  if (t > dur) return 0;
  return s * Math.max(0, 1 - (t - (dur - r)) / r);
}

function synth(box) {
  const n = Math.floor(RATE * SECONDS);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const add = (i, l, r) => {
    if (i < 0 || i >= n) return;
    L[i] += l;
    R[i] += r;
  };

  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const breathe = 0.55 + 0.45 * Math.sin(t * Math.PI * 0.85);
    const rumble =
      Math.sin(2 * Math.PI * box.rumble * t) * 0.11 * breathe +
      Math.sin(2 * Math.PI * (box.rumble * 1.5) * t) * 0.05 * breathe;
    const wood = (Math.random() * 2 - 1) * 0.018 * breathe;
    const creak = Math.sin(2 * Math.PI * 180 * t) * Math.sin(t * 1.7) * 0.012;
    add(i, rumble + wood + creak, rumble * 0.92 + wood + creak * 0.8);
  }

  const whooshAt = 0.35;
  for (let i = 0; i < RATE * 1.4; i++) {
    const t = i / RATE;
    const e = env(t, 0.08, 0.3, 0.25, 0.7, 1.35);
    const nse = (Math.random() * 2 - 1) * 0.07 * e;
    add(i + Math.floor(whooshAt * RATE), nse, nse * 0.9);
  }

  const sealAt = 1.15;
  for (let i = 0; i < RATE * 0.18; i++) {
    const t = i / RATE;
    const click = Math.sin(2 * Math.PI * 920 * t) * env(t, 0.004, 0.02, 0.15, 0.12, 0.16) * 0.16;
    const tick = (Math.random() * 2 - 1) * env(t, 0.001, 0.01, 0.08, 0.08, 0.12) * 0.08;
    add(i + Math.floor(sealAt * RATE), click + tick, click * 0.7 + tick);
  }

  const chordAt = 2.35;
  box.freqs.forEach((freq, k) => {
    const start = Math.floor((chordAt + k * 0.07) * RATE);
    const dur = 2.4 + k * 0.18;
    for (let i = 0; i < dur * RATE; i++) {
      const t = i / RATE;
      const e = env(t, 0.02, 0.18, 0.42, 1.6, dur) * (0.09 - k * 0.012);
      const s = Math.sin(2 * Math.PI * freq * t) * e;
      add(start + i, s, s * (0.85 + 0.15 * ((k + i) % 2)));
    }
  });

  const shimStart = Math.floor(chordAt * RATE);
  for (let i = 0; i < RATE * 1.6; i++) {
    const t = i / RATE;
    const e = env(t, 0.04, 0.2, 0.3, 0.9, 1.5) * 0.045;
    const band = Math.sin(2 * Math.PI * box.shimmer * t) * (Math.random() * 2 - 1);
    add(shimStart + i, band * e, band * e * 0.88);
  }

  let peak = 0.0001;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.86 / peak;
  for (let i = 0; i < n; i++) {
    const fade =
      i < RATE * 0.12 ? i / (RATE * 0.12) : i > n - RATE * 0.45 ? (n - i) / (RATE * 0.45) : 1;
    L[i] *= g * fade;
    R[i] *= g * fade;
  }
  return { L, R };
}

async function glowPng(color, alpha) {
  const { r, g, b } = color;
  const svg = Buffer.from(`<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="a" cx="50%" cy="42%" r="38%">
        <stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="${(alpha * 0.85).toFixed(3)}"/>
        <stop offset="42%" stop-color="rgb(${r},${g},${b})" stop-opacity="${(alpha * 0.28).toFixed(3)}"/>
        <stop offset="100%" stop-color="rgb(${r},${g},${b})" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="b" x1="20%" y1="38%" x2="80%" y2="38%">
        <stop offset="0%" stop-color="rgb(${r},${g},${b})" stop-opacity="0"/>
        <stop offset="50%" stop-color="rgb(${r},${g},${b})" stop-opacity="${(alpha * 0.7).toFixed(3)}"/>
        <stop offset="100%" stop-color="rgb(${r},${g},${b})" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#a)"/>
    <rect x="18%" y="36%" width="64%" height="8" fill="url(#b)"/>
  </svg>`);
  return sharp(svg).png().toBuffer();
}

async function renderClip(box) {
  const src = path.join(DIR, box.src);
  const frameDir = path.join(TMP, box.id);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  const base = sharp(src).resize(SIZE + 80, SIZE + 80, { fit: "cover" });
  const raw = await base.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FPS;
    const pulse = 0.22 + 0.2 * (0.5 + 0.5 * Math.sin(t * Math.PI * 1.15));
    const swell = t > 2.2 && t < 5.2 ? 0.18 * Math.sin(((t - 2.2) / 3) * Math.PI) : 0;
    const zoom = 1 + 0.045 * (t / SECONDS) + 0.008 * Math.sin(t * 0.9);
    const panX = 8 * Math.sin(t * 0.55);
    const panY = 6 * Math.cos(t * 0.42);
    const crop = Math.round(SIZE / zoom);
    const left = Math.max(0, Math.min(raw.info.width - crop, Math.round((raw.info.width - crop) / 2 + panX)));
    const top = Math.max(0, Math.min(raw.info.height - crop, Math.round((raw.info.height - crop) / 2 + panY)));
    const glow = await glowPng(box.glow, pulse + swell);
    await sharp(raw.data, { raw: raw.info })
      .extract({ left, top, width: crop, height: crop })
      .resize(SIZE, SIZE)
      .composite([{ input: glow, blend: "screen" }])
      .jpeg({ quality: 90 })
      .toFile(path.join(frameDir, `${String(f).padStart(4, "0")}.jpg`));
    if (f % 30 === 0) process.stdout.write(`  ${box.id} ${f}/${FRAMES}\n`);
  }

  const wav = path.join(DIR, `box-${box.id}.wav`);
  const { L, R } = synth(box);
  writeWav(wav, L, R);

  const mp4 = path.join(DIR, `box-${box.id}.mp4`);
  run([
    "-framerate",
    String(FPS),
    "-i",
    path.join(frameDir, "%04d.jpg"),
    "-i",
    wav,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-movflags",
    "+faststart",
    mp4,
  ]);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.unlinkSync(wav);
  return mp4;
}

(async () => {
  if (!fs.existsSync(FFMPEG)) throw new Error(`ffmpeg missing: ${FFMPEG}`);
  fs.mkdirSync(TMP, { recursive: true });
  for (const box of BOXES) {
    if (!fs.existsSync(path.join(DIR, box.src))) throw new Error(`missing ${box.src}`);
    console.log("rendering", box.id);
    const out = await renderClip(box);
    console.log("wrote", out);
  }
  fs.rmSync(TMP, { recursive: true, force: true });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
