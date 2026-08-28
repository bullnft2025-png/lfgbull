const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const CHAR = path.join(ROOT, "web", "public", "characters");
const OUT = __dirname;

const GOLD = { r: 201, g: 162, b: 74, alpha: 1 };
const GOLD_DARK = { r: 90, g: 58, b: 18, alpha: 1 };
const INK = { r: 16, g: 6, b: 8, alpha: 1 };

const GLYPHS = {
  B: ["11110", "10001", "11110", "10001", "11110"],
  U: ["10001", "10001", "10001", "10001", "11111"],
  L: ["10000", "10000", "10000", "10000", "11111"],
};

function pixelText(word, scale, color) {
  const rows = 5;
  const cols = word.length * 6 - 1;
  const w = cols * scale;
  const h = rows * scale;
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < word.length; i++) {
    const g = GLYPHS[word[i]];
    if (!g) continue;
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        if (g[y][x] !== "1") continue;
        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const dx = (i * 6 + x) * scale + px;
            const dy = y * scale + py;
            const o = (dy * w + dx) * 4;
            buf[o] = color.r;
            buf[o + 1] = color.g;
            buf[o + 2] = color.b;
            buf[o + 3] = 255;
          }
        }
      }
    }
  }
  return { buf, w, h };
}

async function framedPortrait(file, size) {
  const inner = size - 20;
  const art = await sharp(path.join(CHAR, file))
    .resize(inner, inner, { kernel: "nearest", fit: "fill" })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: GOLD },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${size}" height="${size}"><rect x="3" y="3" width="${size - 6}" height="${size - 6}" fill="#3b270a"/></svg>`
        ),
        top: 0,
        left: 0,
      },
      { input: art, top: 10, left: 10 },
    ])
    .png()
    .toBuffer();
}

function pixelGlyph(ch, scale, color) {
  const g = GLYPHS[ch];
  const w = 5 * scale;
  const h = 5 * scale;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      if (g[y][x] !== "1") continue;
      for (let py = 0; py < scale; py++) {
        for (let px = 0; px < scale; px++) {
          const o = ((y * scale + py) * w + (x * scale + px)) * 4;
          buf[o] = color.r;
          buf[o + 1] = color.g;
          buf[o + 2] = color.b;
          buf[o + 3] = 255;
        }
      }
    }
  }
  return { buf, w, h };
}

async function glyphPng(ch, scale, color) {
  const g = pixelGlyph(ch, scale, color);
  return sharp(g.buf, { raw: { width: g.w, height: g.h, channels: 4 } })
    .png()
    .toBuffer();
}

async function makeAvatar() {
  const size = 800;
  const scale = 48;
  const gap = 36;
  const letter = 5 * scale;
  const block = letter * 2 + gap;
  const origin = Math.round((size - block) / 2);
  const seal = Buffer.from(`<svg width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#14080a"/>
    <circle cx="400" cy="400" r="388" fill="#1c0a0e"/>
    <circle cx="400" cy="400" r="388" fill="none" stroke="#c9a24a" stroke-width="22"/>
    <circle cx="400" cy="400" r="368" fill="none" stroke="#3b270a" stroke-width="6"/>
    <circle cx="400" cy="400" r="356" fill="none" stroke="#c9a24a" stroke-width="3"/>
  </svg>`);
  const letters = await Promise.all(["B", "U", "L", "L"].map((ch) => glyphPng(ch, scale, GOLD)));
  await sharp(seal)
    .composite([
      { input: letters[0], top: origin, left: origin },
      { input: letters[1], top: origin, left: origin + letter + gap },
      { input: letters[2], top: origin + letter + gap, left: origin },
      { input: letters[3], top: origin + letter + gap, left: origin + letter + gap },
    ])
    .png()
    .toFile(path.join(OUT, "x-avatar.png"));
}

async function makeBanner() {
  const W = 1500;
  const H = 500;
  const lineup = [
    { file: "cow-person-holstein-pink-goggles.png", size: 118 },
    { file: "cow-new-gold-grill.png", size: 118 },
    { file: "cow-rare-crown-king.png", size: 156 },
    { file: "cow-rare-rainbow-horns.png", size: 118 },
    { file: "cow-rare-diamond.png", size: 118 },
  ];
  const portraits = await Promise.all(lineup.map((item) => framedPortrait(item.file, item.size)));
  const title = pixelText("BULL", 18, GOLD);
  const floor = Buffer.from(`<svg width="${W}" height="${H}">
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2a1016"/>
        <stop offset="64%" stop-color="#1a080c"/>
        <stop offset="64%" stop-color="#3a2418"/>
        <stop offset="100%" stop-color="#24140e"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#wall)"/>
    <rect x="0" y="318" width="${W}" height="3" fill="#c9a24a66"/>
    <circle cx="96" cy="96" r="10" fill="#e8c56a" opacity="0.9"/>
    <circle cx="96" cy="96" r="28" fill="#e8c56a" opacity="0.18"/>
    <text x="300" y="156" font-family="Georgia, 'Times New Roman', serif" font-size="20" letter-spacing="10" fill="#c9a24a">MUSÉE NOCTURNE</text>
  </svg>`);

  const overlays = [
    { input: floor, top: 0, left: 0 },
    { input: await sharp(title.buf, { raw: { width: title.w, height: title.h, channels: 4 } }).png().toBuffer(), top: 178, left: 292 },
  ];

  const rail = 318;
  let x = 760;
  lineup.forEach((item, i) => {
    overlays.push({
      input: portraits[i],
      top: rail - item.size + 4,
      left: x,
    });
    x += item.size + 14;
  });

  await sharp({
    create: { width: W, height: H, channels: 4, background: INK },
  })
    .composite(overlays)
    .png()
    .toFile(path.join(OUT, "x-banner.png"));
}

fs.mkdirSync(OUT, { recursive: true });

(async () => {
  await makeAvatar();
  await makeBanner();
  console.log("Wrote brand/x-avatar.png and brand/x-banner.png");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
