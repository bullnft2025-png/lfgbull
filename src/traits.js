const TIERS = {
  common: 70,
  uncommon: 22,
  rare: 7,
  legendary: 1,
};

const LAYERS = {
  Background: {
    common: ["Pink", "Teal", "Navy", "Charcoal", "Orange", "Olive", "Lavender", "Cream"],
    uncommon: ["Maroon", "Mint", "Purple", "Sky"],
    rare: ["Gold", "Sunset"],
    legendary: ["Space Rainbow"],
  },
  Fur: {
    common: ["Cream", "Holstein", "Brown", "Black", "Gray", "Tan"],
    uncommon: ["Pink", "Blue", "Maroon", "Blue Spots"],
    rare: ["Gold Metallic", "Zombie Green", "Alien Purple"],
    legendary: ["Diamond Crystal"],
  },
  Horns: {
    common: ["None", "Small", "Medium", "Large"],
    uncommon: ["Broken", "Silver"],
    rare: ["Gold", "Ice"],
    legendary: ["Rainbow"],
  },
  Eyes: {
    common: ["Normal", "Black Shades", "Pink Goggles", "Cyan Goggles", "X Eyes"],
    uncommon: ["Gold Goggles", "White Visor", "Red Visor", "Eye Patch", "Heart Eyes", "Star Eyes", "Money Eyes"],
    rare: ["3D Glasses", "Sleepy", "Spiral Eyes", "Flame Eyes"],
    legendary: ["Laser", "Diamond Eyes", "Rainbow Eyes"],
  },
  Headwear: {
    common: ["None", "White Hoodie", "Black Hoodie", "Pink Beanie", "Blue Beanie", "Gray Beanie"],
    uncommon: ["Cowboy Hat", "Baseball Cap", "Bandana", "Flower"],
    rare: ["Viking Helm", "Wizard Hat", "Headphones"],
    legendary: ["Crown", "Halo"],
  },
  Mouth: {
    common: ["None", "Smile", "Cigarette", "Pipe"],
    uncommon: ["Bubblegum", "Wheat Straw", "Tongue"],
    rare: ["Cigar", "Gold Grill"],
  },
  Accessory: {
    common: ["None", "Gold Nose Ring", "Silver Nose Ring", "Cow Bell"],
    uncommon: ["Gold Chain", "Earring", "Scarf", "Bowtie"],
    rare: ["Medal", "Butterfly"],
    legendary: ["Wings"],
  },
};

const BEANIE_LIKE = new Set(["Pink Beanie", "Blue Beanie", "Gray Beanie", "Cowboy Hat", "Baseball Cap", "Bandana", "Flower"]);
const TALL_HATS = new Set(["Viking Helm", "Wizard Hat", "Headphones", "Crown", "Halo"]);
const HOODIES = new Set(["White Hoodie", "Black Hoodie"]);

function expandLayer(groups) {
  const items = [];
  for (const [tier, names] of Object.entries(groups)) {
    const share = TIERS[tier];
    if (!share || !names.length) continue;
    const weight = share / names.length;
    for (const name of names) items.push({ name, tier, weight });
  }
  return items;
}

const TRAITS = Object.fromEntries(
  Object.entries(LAYERS).map(([layer, groups]) => [layer, expandLayer(groups)])
);

function isValid(dna) {
  if (dna.Horns === "Large" && BEANIE_LIKE.has(dna.Headwear)) return false;
  if (dna.Horns === "Rainbow" && TALL_HATS.has(dna.Headwear)) return false;
  if (dna.Accessory === "Wings" && HOODIES.has(dna.Headwear)) return false;
  return true;
}

function dnaKey(dna) {
  return [
    dna.Background,
    dna.Fur,
    dna.Horns,
    dna.Eyes,
    dna.Headwear,
    dna.Mouth,
    dna.Accessory,
  ].join("|");
}

function pickWeighted(items, rand) {
  let total = 0;
  for (const item of items) total += item.weight;
  let r = rand() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.name;
  }
  return items[items.length - 1].name;
}

function rollDna(rand) {
  const dna = {};
  for (const layer of Object.keys(TRAITS)) {
    dna[layer] = pickWeighted(TRAITS[layer], rand);
  }
  return dna;
}

function layerOptions() {
  return Object.fromEntries(
    Object.entries(LAYERS).map(([layer, groups]) => [
      layer,
      Object.values(groups).flat(),
    ])
  );
}

module.exports = {
  LAYERS,
  TRAITS,
  TIERS,
  isValid,
  dnaKey,
  rollDna,
  layerOptions,
};
