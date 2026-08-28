const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const sharp = require("sharp");

const DIR = path.join(__dirname, "boxes");
const TMP = path.join(DIR, "_spin");
const FFMPEG =
  process.env.FFMPEG ||
  path.join(
    process.env.LOCALAPPDATA,
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe"
  );

const SIZE = 960;
const TEX = 512;
const FPS = 24;
const SECONDS = 8;
const FRAMES = FPS * SECONDS;
const RATE = 44100;

const GLYPHS = {
  B: ["11110", "10001", "11110", "10001", "11110"],
  U: ["10001", "10001", "10001", "10001", "11111"],
  L: ["10000", "10000", "10000", "10000", "11111"],
};

const BOXES = [
  {
    id: "white",
    body: "#e6d9c4",
    ink: "#24160f",
    accent: "#f7f1e4",
    edge: "#b8bcc2",
    glow: { r: 255, g: 244, b: 220 },
    freqs: [1318.5, 1975.5],
    shimmer: 2400,
    rumble: 52,
  },
  {
    id: "violet",
    body: "#3a1548",
    ink: "#f3e9ff",
    accent: "#c47bff",
    edge: "#8a6230",
    glow: { r: 176, g: 92, b: 255 },
    freqs: [392.0, 587.33, 739.99],
    shimmer: 1180,
    rumble: 46,
  },
  {
    id: "gold",
    body: "#140c08",
    ink: "#e2c36a",
    accent: "#c9a24a",
    edge: "#c9a24a",
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
  if (res.status !== 0) throw new Error("ffmpeg failed");
}

function pixelWord(word, color) {
  const scale = 14;
  const cols = word.length * 6 - 1;
  const w = cols * scale;
  const h = 5 * scale;
  let rects = "";
  for (let i = 0; i < word.length; i++) {
    const g = GLYPHS[word[i]];
    if (!g) continue;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        if (g[y][x] !== "1") continue;
        rects += `<rect x="${i * 6 * scale + x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${color}"/>`;
      }
    }
  }
  return { svg: rects, w, h };
}

async function faceTexture(kind, pal) {
  const bull = pixelWord("BULL", pal.ink);
  const ox = (TEX - bull.w) / 2;
  const sideBull = pixelWord("BULL", pal.accent);
  let inner = "";
  if (kind === "front" || kind === "back") {
    inner = `
      <rect x="28" y="28" width="456" height="456" fill="none" stroke="${pal.accent}" stroke-width="6"/>
      <g transform="translate(${ox}, 78)">${bull.svg}</g>
      <text x="256" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="6" fill="${pal.ink}">MUSÉE NOCTURNE</text>
      <circle cx="256" cy="355" r="58" fill="none" stroke="${pal.accent}" stroke-width="4"/>
      <circle cx="256" cy="355" r="44" fill="${pal.accent}" opacity="0.35"/>
      <text x="256" y="363" text-anchor="middle" font-family="Georgia, serif" font-size="15" letter-spacing="3" fill="${pal.ink}">SEALED</text>
      <text x="256" y="470" text-anchor="middle" font-family="Georgia, serif" font-size="16" letter-spacing="8" fill="${pal.ink}">${kind === "front" ? "BULL" : "NOCTURNE"}</text>
    `;
  } else if (kind === "left" || kind === "right") {
    inner = `
      <g transform="translate(256,256) rotate(-90) translate(${-sideBull.w / 2},${-sideBull.h / 2})">${sideBull.svg}</g>
      <rect x="36" y="36" width="440" height="440" fill="none" stroke="${pal.accent}" stroke-width="5" opacity="0.7"/>
    `;
  } else if (kind === "top") {
    inner = `
      <rect x="48" y="48" width="416" height="416" fill="none" stroke="${pal.accent}" stroke-width="8"/>
      <circle cx="256" cy="256" r="70" fill="none" stroke="${pal.ink}" stroke-width="5"/>
      <circle cx="256" cy="256" r="28" fill="${pal.accent}"/>
    `;
  } else {
    inner = `<rect x="40" y="40" width="432" height="432" fill="#0a0706" opacity="0.35"/>`;
  }
  const svg = Buffer.from(`<svg width="${TEX}" height="${TEX}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${TEX}" height="${TEX}" fill="${pal.body}"/>
    ${inner}
  </svg>`);
  const { data, info } = await sharp(svg).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function rotX(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}
function rotY(p, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}
function project(p) {
  const camZ = 5.1;
  const f = 3.4;
  const z = p.z + camZ;
  const sc = (SIZE * 0.38 * f) / z;
  return { x: SIZE / 2 + p.x * sc, y: SIZE / 2 - (p.y - 0.08) * sc + 36, z };
}

function sample(tex, u, v) {
  const x = Math.max(0, Math.min(tex.w - 1, (u * (tex.w - 1)) | 0));
  const y = Math.max(0, Math.min(tex.h - 1, ((1 - v) * (tex.h - 1)) | 0));
  const i = (y * tex.w + x) * 4;
  return [tex.data[i], tex.data[i + 1], tex.data[i + 2]];
}

function drawTri(buf, zbuf, a, b, c, ua, ub, uc, tex, shade, glow) {
  const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
  const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
  const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
  const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(a.y, b.y, c.y)));
  const area = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  if (Math.abs(area) < 1e-6) return;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const w0 = ((b.x - x) * (c.y - y) - (b.y - y) * (c.x - x)) / area;
      const w1 = ((c.x - x) * (a.y - y) - (c.y - y) * (a.x - x)) / area;
      const w2 = 1 - w0 - w1;
      if (w0 < 0 || w1 < 0 || w2 < 0) continue;
      const z = w0 * a.z + w1 * b.z + w2 * c.z;
      const zi = y * SIZE + x;
      if (z >= zbuf[zi]) continue;
      zbuf[zi] = z;
      const u = w0 * ua[0] + w1 * ub[0] + w2 * uc[0];
      const v = w0 * ua[1] + w1 * ub[1] + w2 * uc[1];
      const [r, g, bcol] = sample(tex, u, v);
      const spec = Math.max(0, shade - 0.72) * 2.4;
      const o = zi * 4;
      buf[o] = Math.min(255, r * shade + glow.r * 0.08 + spec * 255);
      buf[o + 1] = Math.min(255, g * shade + glow.g * 0.08 + spec * 255);
      buf[o + 2] = Math.min(255, bcol * shade + glow.b * 0.08 + spec * 220);
      buf[o + 3] = 255;
    }
  }
}

function drawQuad(buf, zbuf, pts, uvs, tex, shade, glow) {
  drawTri(buf, zbuf, pts[0], pts[1], pts[2], uvs[0], uvs[1], uvs[2], tex, shade, glow);
  drawTri(buf, zbuf, pts[0], pts[2], pts[3], uvs[0], uvs[2], uvs[3], tex, shade, glow);
}

function faceNormal(pts) {
  const ux = pts[1].x - pts[0].x, uy = pts[1].y - pts[0].y, uz = pts[1].z - pts[0].z;
  const vx = pts[3].x - pts[0].x, vy = pts[3].y - pts[0].y, vz = pts[3].z - pts[0].z;
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

function renderFrame(textures, pal, angle) {
  const buf = Buffer.alloc(SIZE * SIZE * 4, 0);
  const zbuf = new Float32Array(SIZE * SIZE);
  zbuf.fill(1e9);
  const tilt = 0.42;
  const s = 1.05;
  const raw = [
    { x: -s, y: -s * 0.92, z: s * 0.78 },
    { x: s, y: -s * 0.92, z: s * 0.78 },
    { x: s, y: s * 0.92, z: s * 0.78 },
    { x: -s, y: s * 0.92, z: s * 0.78 },
    { x: -s, y: -s * 0.92, z: -s * 0.78 },
    { x: s, y: -s * 0.92, z: -s * 0.78 },
    { x: s, y: s * 0.92, z: -s * 0.78 },
    { x: -s, y: s * 0.92, z: -s * 0.78 },
  ];
  const world = raw.map((p) => rotX(rotY(p, angle), tilt));
  const verts = world.map(project);

  const faces = [
    { idx: [0, 1, 2, 3], tex: textures.front },
    { idx: [5, 4, 7, 6], tex: textures.back },
    { idx: [4, 0, 3, 7], tex: textures.left },
    { idx: [1, 5, 6, 2], tex: textures.right },
    { idx: [3, 2, 6, 7], tex: textures.top },
    { idx: [4, 5, 1, 0], tex: textures.bottom },
  ];
  const uvs = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const light = { x: 0.45, y: 0.7, z: 0.55 };

  for (let i = 0; i < SIZE * SIZE; i++) {
    const y = (i / SIZE) | 0;
    const x = i % SIZE;
    const dx = (x - SIZE / 2) / SIZE;
    const dy = (y - SIZE * 0.62) / SIZE;
    const shadow = Math.exp(-(dx * dx * 18 + dy * dy * 70)) * 38;
    buf[i * 4] = shadow;
    buf[i * 4 + 1] = shadow * 0.7;
    buf[i * 4 + 2] = shadow * 0.45;
    buf[i * 4 + 3] = 255;
  }

  for (const face of faces) {
    const wpts = face.idx.map((i) => world[i]);
    const n = faceNormal(wpts);
    if (n.z <= 0.04) continue;
    const shade = Math.max(
      0.28,
      Math.min(1, 0.38 + 0.72 * Math.max(0, n.x * light.x + n.y * light.y + n.z * light.z))
    );
    drawQuad(
      buf,
      zbuf,
      face.idx.map((i) => verts[i]),
      uvs,
      face.tex,
      shade,
      pal.glow
    );
  }
  return buf;
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
    buf.writeInt16LE((Math.max(-1, Math.min(1, left[i])) * 32767) | 0, 44 + i * 4);
    buf.writeInt16LE((Math.max(-1, Math.min(1, right[i])) * 32767) | 0, 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}

function env(t, a, d, s, r, dur) {
  if (t < 0 || t > dur) return 0;
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * ((t - a) / d);
  if (t < dur - r) return s;
  return s * Math.max(0, 1 - (t - (dur - r)) / r);
}

function synth(box) {
  const n = Math.floor(RATE * SECONDS);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const add = (i, l, r) => {
    if (i >= 0 && i < n) {
      L[i] += l;
      R[i] += r;
    }
  };
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const breathe = 0.55 + 0.45 * Math.sin(t * Math.PI * 0.7);
    const rumble =
      Math.sin(2 * Math.PI * box.rumble * t) * 0.1 * breathe +
      Math.sin(2 * Math.PI * (box.rumble * 1.5) * t) * 0.04;
    add(i, rumble + (Math.random() * 2 - 1) * 0.012, rumble * 0.9);
  }
  const chordAt = 1.6;
  box.freqs.forEach((freq, k) => {
    const start = Math.floor((chordAt + k * 0.08) * RATE);
    const dur = 2.6 + k * 0.15;
    for (let i = 0; i < dur * RATE; i++) {
      const t = i / RATE;
      const e = env(t, 0.02, 0.2, 0.4, 1.7, dur) * (0.085 - k * 0.01);
      const s = Math.sin(2 * Math.PI * freq * t) * e;
      add(start + i, s, s * 0.9);
    }
  });
  let peak = 0.0001;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.84 / peak;
  for (let i = 0; i < n; i++) {
    const fade = i < RATE * 0.1 ? i / (RATE * 0.1) : i > n - RATE * 0.4 ? (n - i) / (RATE * 0.4) : 1;
    L[i] *= g * fade;
    R[i] *= g * fade;
  }
  return { L, R };
}

async function renderBox(pal) {
  const textures = {
    front: await faceTexture("front", pal),
    back: await faceTexture("back", pal),
    left: await faceTexture("left", pal),
    right: await faceTexture("right", pal),
    top: await faceTexture("top", pal),
    bottom: await faceTexture("bottom", pal),
  };
  const frameDir = path.join(TMP, pal.id);
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  for (let f = 0; f < FRAMES; f++) {
    const angle = (f / FRAMES) * Math.PI * 2;
    const buf = renderFrame(textures, pal, angle);
    await sharp(buf, { raw: { width: SIZE, height: SIZE, channels: 4 } })
      .jpeg({ quality: 90 })
      .toFile(path.join(frameDir, `${String(f).padStart(4, "0")}.jpg`));
    if (f % 24 === 0) process.stdout.write(`  ${pal.id} ${f}/${FRAMES}\n`);
  }

  const still = renderFrame(textures, pal, 0.55);
  await sharp(still, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png()
    .toFile(path.join(DIR, `box-${pal.id}-spin.png`));

  const wav = path.join(DIR, `box-${pal.id}-spin.wav`);
  const { L, R } = synth(pal);
  writeWav(wav, L, R);
  const mp4 = path.join(DIR, `box-${pal.id}-spin.mp4`);
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
  fs.unlinkSync(wav);
  fs.rmSync(frameDir, { recursive: true, force: true });
  return mp4;
}

(async () => {
  if (!fs.existsSync(FFMPEG)) throw new Error(`ffmpeg missing: ${FFMPEG}`);
  fs.mkdirSync(TMP, { recursive: true });
  for (const pal of BOXES) {
    console.log("spin", pal.id);
    console.log("wrote", await renderBox(pal));
  }
  fs.rmSync(TMP, { recursive: true, force: true });
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
