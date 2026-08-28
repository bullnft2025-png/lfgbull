const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { TRAITS, isValid, dnaKey, rollDna, layerOptions } = require("./src/traits");
const { renderCow, renderLayer } = require("./src/draw");

const ROOT = __dirname;
const OUT = path.join(ROOT, "output");
const IMG = path.join(OUT, "images");
const LAYER_DIR = path.join(ROOT, "layers");

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function parseArgs(argv) {
  const args = {
    count: 10000,
    scale: 10,
    seed: 20260827,
    preview: 100,
    concurrency: 8,
  };
  for (let i = 2; i < argv.length; i++) {
    const [k, v] = argv[i].includes("=") ? argv[i].split("=") : [argv[i], argv[++i]];
    if (k === "--count") args.count = Number(v);
    else if (k === "--scale") args.scale = Number(v);
    else if (k === "--seed") args.seed = Number(v);
    else if (k === "--preview") args.preview = Number(v);
    else if (k === "--concurrency") args.concurrency = Number(v);
  }
  return args;
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildCollection(count, seed) {
  const rand = mulberry32(seed);
  const seen = new Set();
  const tokens = [];
  let attempts = 0;
  const maxAttempts = count * 50;
  while (tokens.length < count) {
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error(`Could not fill ${count} unique tokens after ${attempts} rolls`);
    }
    const dna = rollDna(rand);
    if (!isValid(dna)) continue;
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

async function writePng(px, file, scale) {
  const size = px.size * scale;
  await sharp(px.data, { raw: { width: px.size, height: px.size, channels: 4 } })
    .resize(size, size, { kernel: "nearest" })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

function tokenMetadata(token) {
  return {
    name: `BULL #${token.id}`,
    description: "BULL — a 10,000 generative pixel bull collection.",
    image: `images/${token.id}.png`,
    attributes: Object.entries(token.dna).map(([trait_type, value]) => ({
      trait_type,
      value,
    })),
  };
}

function rarityReport(tokens) {
  const report = {};
  for (const token of tokens) {
    for (const [layer, value] of Object.entries(token.dna)) {
      if (!report[layer]) report[layer] = {};
      report[layer][value] = (report[layer][value] || 0) + 1;
    }
  }
  const supply = tokens.length;
  const pretty = {};
  for (const [layer, counts] of Object.entries(report)) {
    pretty[layer] = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        count,
        pct: +((count / supply) * 100).toFixed(2),
      }));
  }
  return pretty;
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
    const px = renderCow(tokens[i].dna);
    const buf = await sharp(px.data, { raw: { width: 32, height: 32, channels: 4 } })
      .resize(cell, cell, { kernel: "nearest" })
      .png()
      .toBuffer();
    composites.push({
      input: buf,
      left: pad + (i % cols) * (cell + gap),
      top: pad + Math.floor(i / cols) * (cell + gap),
    });
  }
  await sharp({
    create: { width, height, channels: 3, background: { r: 18, g: 18, b: 22 } },
  })
    .composite(composites)
    .png()
    .toFile(file);
}

async function exportLayers(scale) {
  const options = layerOptions();
  const order = ["Background", "Fur", "Horns", "Headwear", "Eyes", "Mouth", "Accessory"];
  let count = 0;
  for (const layer of order) {
    const folder = path.join(LAYER_DIR, `${String(order.indexOf(layer) + 1).padStart(2, "0")}-${layer.toLowerCase()}`);
    fs.mkdirSync(folder, { recursive: true });
    for (const name of options[layer]) {
      if (name === "None") continue;
      const px = renderLayer(layer, name);
      await writePng(px, path.join(folder, `${slug(name)}.png`), scale);
      await writePng(px, path.join(folder, `${slug(name)}@32.png`), 1);
      count++;
    }
  }
  return count;
}

async function traitSheet(file) {
  const options = layerOptions();
  const defaultDna = {
    Background: "Charcoal",
    Fur: "Holstein",
    Horns: "Medium",
    Eyes: "Black Shades",
    Headwear: "None",
    Mouth: "Smile",
    Accessory: "None",
  };
  const tokens = [];
  for (const [layer, names] of Object.entries(options)) {
    for (const name of names) {
      tokens.push({ id: tokens.length + 1, dna: { ...defaultDna, [layer]: name } });
    }
  }
  await contactSheet(tokens, file, 12);
  return tokens.length;
}

async function main() {
  const args = parseArgs(process.argv);
  fs.mkdirSync(IMG, { recursive: true });

  console.log(`Exporting transparent trait layers...`);
  const layerCount = await exportLayers(args.scale);
  console.log(`Layers: ${layerCount} PNG files -> ${LAYER_DIR}`);

  console.log(`Building ${args.count} unique DNA (seed=${args.seed})...`);
  const t0 = Date.now();
  const { tokens, attempts } = buildCollection(args.count, args.seed);
  console.log(`DNA ready: ${tokens.length} unique / ${attempts} rolls in ${Date.now() - t0}ms`);

  const keys = new Set(tokens.map((t) => t.key));
  if (keys.size !== tokens.length) throw new Error("Duplicate DNA detected");

  const collection = {
    name: "BULL",
    symbol: "BULL",
    seed: args.seed,
    supply: tokens.length,
    size: 32,
    scale: args.scale,
    unique: true,
    layers: Object.fromEntries(
      Object.entries(TRAITS).map(([layer, items]) => [
        layer,
        items.map((i) => ({ name: i.name, tier: i.tier })),
      ])
    ),
    rarity: rarityReport(tokens),
    tokens: tokens.map(tokenMetadata),
  };
  fs.writeFileSync(path.join(OUT, "collection.json"), JSON.stringify(collection, null, 2));
  fs.writeFileSync(path.join(OUT, "rarity.json"), JSON.stringify(collection.rarity, null, 2));

  const traitCount = await traitSheet(path.join(OUT, "trait-sheet.png"));
  console.log(`Trait sheet: ${traitCount} variants`);

  const previewN = Math.min(args.preview, tokens.length);
  await contactSheet(tokens.slice(0, previewN), path.join(OUT, `preview-${previewN}.png`), 10);
  console.log(`Preview sheet: first ${previewN}`);

  console.log(`Rendering ${tokens.length} images at ${32 * args.scale}px, concurrency=${args.concurrency}...`);
  const t1 = Date.now();
  let done = 0;
  await pool(tokens, args.concurrency, async (token) => {
    const px = renderCow(token.dna);
    await writePng(px, path.join(IMG, `${token.id}.png`), args.scale);
    done++;
    if (done % 500 === 0 || done === tokens.length) {
      const elapsed = (Date.now() - t1) / 1000;
      const rate = done / elapsed;
      const eta = ((tokens.length - done) / rate).toFixed(0);
      console.log(`  ${done}/${tokens.length}  ${rate.toFixed(1)} img/s  eta ${eta}s`);
    }
  });

  const pngs = fs.readdirSync(IMG).filter((f) => f.endsWith(".png") && /^\d+\.png$/.test(f));
  const ids = pngs.map((f) => Number(f.replace(".png", ""))).filter((n) => n >= 1 && n <= tokens.length);
  if (ids.length !== tokens.length) {
    throw new Error(`Expected ${tokens.length} images, found ${ids.length}`);
  }

  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log(`Images: ${IMG}`);
  console.log(`Preview: ${path.join(OUT, `preview-${previewN}.png`)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
