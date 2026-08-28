import { BASES, BACKGROUNDS, GRADES, FRAMES, pick } from "./art-traits.js";

const SEED = 20260827;
const SUPPLY = 10000;

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dnaKey(dna) {
  return [dna.base.file, dna.background.name, dna.grade.name, dna.frame.name].join("|");
}

function buildCatalog(count = SUPPLY, seed = SEED) {
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
    tokens.push({
      id: tokens.length + 1,
      file: dna.base.file,
      character: dna.base.name,
      tier: dna.base.tier,
      background: dna.background.name,
      grade: dna.grade.name,
      frame: dna.frame.name,
    });
  }
  return tokens;
}

export { SUPPLY };
export const TOKENS = buildCatalog();
