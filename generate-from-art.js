const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { writeCutout } = require("./src/cutout");
const { BASES, BACKGROUNDS, GRADES, FRAMES, pick } = require("./src/art-traits");

const ROOT = __dirname;
const BASE_DIR = path.join(ROOT, "bases");
const CUT_DIR = path.join(ROOT, "cutouts");
const OUT = path.join(ROOT, "output");
const IMG = path.join(OUT, "images");
const SIZE = 512;

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv) {
  const args = { count: 10000, seed: 20260827, preview: 100, concurrency: 6 };
  for (let i = 2; i < argv.length; i++) {
    const [k, v] = argv[i].includes("=") ? argv[i].split("=") : [argv[i], argv[++i]];
    if (k === "--count") args.count = Number(v);
    else if (k === "--seed") args.seed = Number(v);
    else if (k === "--preview") args.preview = Number(v);
    else if (k === "--concurrency") args.concurrency = Number(v);
  }
  return args;
}

function dnaKey(dna) {
  return [dna.base.file, dna.background.name, dna.grade.name, dna.frame.name].join("|");
}

function buildCollection(count, seed) {
  const rand = mulberry32(seed);
  const seen = new Set();
  const tokens = [];
  let attempts = 0;
  while (tokens.length < count) {
    attempts++;
    if (attempts > count * 80) throw new Error("Could not fill unique set");
    const dna = {
      base: pick(BASES, rand),
      background: pick(BACKGROUNDS, rand),
      grade: pick(GRADES, rand),
      frame: pick(FRAMES, rand),
    };
    const key = dnaKey(dna);
    if (seen.has(key)) continue;
    seen.add(key);
    tokens.push({ id: tokens.length + 1, dna, key });
  }
  return { tokens, attempts };
}

async function pool(items, limit, worker) {
  const ret = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const cur = i++;
      ret[cur] = await worker(items[cur], cur);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return ret;
}

async function makeBackground(bg) {
  if (bg.name === "Sunset") {
    const top = await sharp({
      create: { width: SIZE, height: Math.floor(SIZE / 2), channels: 3, background: { r: 255, g: 122, b: 24 } },
    })
      .png()
      .toBuffer();
    return sharp({
      create: { width: SIZE, height: SIZE, channels: 3, background: { r: 255, g: 94, b: 91 } },
    })
      .png()
      .composite([{ input: top, top: 0, left: 0 }])
      .png()
      .toBuffer();
  }
  if (bg.name === "Space Rainbow") {
    const stars = Buffer.alloc(SIZE * SIZE * 3);
    for (let i = 0; i < stars.length; i += 3) {
      stars[i] = 11;
      stars[i + 1] = 16;
      stars[i + 2] = 38;
    }
    const palette = [
      [255, 255, 255],
      [255, 90, 179],
      [61, 224, 255],
      [125, 255, 179],
      [240, 201, 74],
      [197, 163, 255],
      [255, 122, 24],
    ];
    let seed = 0x51a7e11;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), t | 61)) | 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let n = 0; n < 240; n++) {
      const x = Math.floor(rand() * SIZE);
      const y = Math.floor(rand() * SIZE);
      const [r, g, b] = palette[Math.floor(rand() * palette.length)];
      const i = (y * SIZE + x) * 3;
      stars[i] = r;
      stars[i + 1] = g;
      stars[i + 2] = b;
      if (rand() < 0.28 && x + 1 < SIZE) {
        stars[i + 3] = r;
        stars[i + 4] = g;
        stars[i + 5] = b;
      }
      if (rand() < 0.12 && y + 1 < SIZE) {
        const j = ((y + 1) * SIZE + x) * 3;
        stars[j] = r;
        stars[j + 1] = g;
        stars[j + 2] = b;
      }
    }
    return sharp(stars, { raw: { width: SIZE, height: SIZE, channels: 3 } })
      .png()
      .toBuffer();
  }
  return sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: bg.color },
  })
    .png()
    .toBuffer();
}

async function characterBuffer(file, grade) {
  let img = sharp(path.join(CUT_DIR, file));
  if (grade.modulate) img = img.modulate(grade.modulate);
  return img.png().toBuffer();
}

function frameOverlay(frame) {
  if (!frame.width) return null;
  const w = frame.width;
  const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" fill="none" stroke="rgb(${frame.color.r},${frame.color.g},${frame.color.b})" stroke-width="${w * 2}"/>
  </svg>`;
  return Buffer.from(svg);
}

async function renderToken(token) {
  const { base, background, grade, frame } = token.dna;
  const [bgBuf, cowBuf] = await Promise.all([makeBackground(background), characterBuffer(base.file, grade)]);
  const composites = [{ input: cowBuf, gravity: "centre" }];
  const rim = frameOverlay(frame);
  if (rim) composites.push({ input: rim, gravity: "centre" });
  return sharp(bgBuf).composite(composites).png({ compressionLevel: 8 }).toBuffer();
}

async function contactSheet(tokens, file, cols) {
  const cell = 160;
  const gap = 4;
  const pad = 8;
  const rows = Math.ceil(tokens.length / cols);
  const width = pad * 2 + cols * cell + (cols - 1) * gap;
  const height = pad * 2 + rows * cell + (rows - 1) * gap;
  const composites = [];
  for (let i = 0; i < tokens.length; i++) {
    const buf = await renderToken(tokens[i]);
    const thumb = await sharp(buf).resize(cell, cell, { kernel: "nearest" }).png().toBuffer();
    composites.push({
      input: thumb,
      left: pad + (i % cols) * (cell + gap),
      top: pad + Math.floor(i / cols) * (cell + gap),
    });
  }
  await sharp({
    create: { width, height, channels: 3, background: { r: 18, g: 18, b: 22 } },
  })
    .png()
    .composite(composites)
    .png()
    .toFile(file);
}

function tokenMetadata(token) {
  const { base, background, grade, frame } = token.dna;
  return {
    name: `BULL #${token.id}`,
    description: "BULL — generated from the original bull character portraits.",
    image: `images/${token.id}.png`,
    attributes: [
      { trait_type: "Character", value: base.name },
      { trait_type: "Character Tier", value: base.tier },
      { trait_type: "Background", value: background.name },
      { trait_type: "Grade", value: grade.name },
      { trait_type: "Frame", value: frame.name },
    ],
  };
}

function rarityReport(tokens) {
  const report = {};
  for (const token of tokens) {
    for (const attr of tokenMetadata(token).attributes) {
      if (!report[attr.trait_type]) report[attr.trait_type] = {};
      report[attr.trait_type][attr.value] = (report[attr.trait_type][attr.value] || 0) + 1;
    }
  }
  const supply = tokens.length;
  const pretty = {};
  for (const [layer, counts] of Object.entries(report)) {
    pretty[layer] = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, pct: +((count / supply) * 100).toFixed(2) }));
  }
  return pretty;
}

async function prepareCutouts() {
  fs.mkdirSync(CUT_DIR, { recursive: true });
  const webCut = path.join(ROOT, "web", "public", "cutouts");
  fs.mkdirSync(webCut, { recursive: true });
  for (const base of BASES) {
    const dest = path.join(CUT_DIR, base.file);
    const cut = await writeCutout(path.join(BASE_DIR, base.file), dest, SIZE);
    fs.copyFileSync(dest, path.join(webCut, base.file));
    console.log(`  ${base.name}: ${(cut.stats.opaquePct * 100).toFixed(1)}%`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  fs.mkdirSync(IMG, { recursive: true });

  console.log("Cutting original cow portraits...");
  await prepareCutouts();

  console.log(`Building ${args.count} unique DNA (seed=${args.seed})...`);
  const t0 = Date.now();
  const { tokens, attempts } = buildCollection(args.count, args.seed);
  console.log(`DNA ready: ${tokens.length} unique / ${attempts} rolls`);

  const collection = {
    name: "BULL",
    symbol: "BULL",
    seed: args.seed,
    supply: tokens.length,
    size: SIZE,
    source: "original 22 cow portraits",
    rarity: rarityReport(tokens),
    tokens: tokens.map(tokenMetadata),
  };
  fs.writeFileSync(path.join(OUT, "collection.json"), JSON.stringify(collection, null, 2));
  fs.writeFileSync(path.join(OUT, "rarity.json"), JSON.stringify(collection.rarity, null, 2));

  const previewN = Math.min(args.preview, tokens.length);
  console.log(`Writing preview-${previewN}.png...`);
  await contactSheet(tokens.slice(0, previewN), path.join(OUT, `preview-${previewN}.png`), 10);

  console.log(`Rendering ${tokens.length} images at ${SIZE}px...`);
  const t1 = Date.now();
  let done = 0;
  await pool(tokens, args.concurrency, async (token) => {
    const buf = await renderToken(token);
    await sharp(buf).toFile(path.join(IMG, `${token.id}.png`));
    done++;
    if (done % 500 === 0 || done === tokens.length) {
      const elapsed = (Date.now() - t1) / 1000;
      const rate = done / Math.max(elapsed, 0.001);
      const eta = ((tokens.length - done) / rate).toFixed(0);
      console.log(`  ${done}/${tokens.length}  ${rate.toFixed(1)} img/s  eta ${eta}s`);
    }
  });

  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`Images: ${IMG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
