const TIER_WEIGHT = { common: 70, rare: 18, legendary: 4 };

const BASES_RAW = [
  { file: "cow-person-holstein-pink-goggles.png", name: "Holstein Pink Goggles", tier: "common" },
  { file: "cow-person-blue-hood.png", name: "Blue Hood", tier: "common" },
  { file: "cow-person-black-hoodie.png", name: "Black Hoodie", tier: "common" },
  { file: "cow-person-brown-beanie.png", name: "Brown Beanie", tier: "common" },
  { file: "cow-person-blue-gold-goggles.png", name: "Blue Gold Goggles", tier: "common" },
  { file: "cow-person-pink-blue-beanie.png", name: "Pink Blue Beanie", tier: "common" },
  { file: "cow-person-white-hood-spots.png", name: "White Hood Spots", tier: "common" },
  { file: "cow-person-red-pipe.png", name: "Red Pipe", tier: "common" },
  { file: "cow-person-gold.png", name: "Gold Smoke", tier: "rare" },
  { file: "cow-person-gold-beanie.png", name: "Gold Beanie", tier: "rare" },
  { file: "cow-new-cowboy-bell.png", name: "Cowboy Bell", tier: "rare" },
  { file: "cow-new-gold-grill.png", name: "Gold Grill", tier: "rare" },
  { file: "cow-new-headphones.png", name: "Headphones", tier: "rare" },
  { file: "cow-new-viking.png", name: "Viking", tier: "rare" },
  { file: "cow-new-wizard.png", name: "Wizard", tier: "rare" },
  { file: "cow-rare-crown-king.png", name: "Crown King", tier: "legendary" },
  { file: "cow-rare-laser-eyes.png", name: "Laser Eyes", tier: "legendary" },
  { file: "cow-rare-diamond.png", name: "Diamond", tier: "legendary" },
  { file: "cow-rare-alien.png", name: "Alien", tier: "legendary" },
  { file: "cow-rare-zombie.png", name: "Zombie", tier: "legendary" },
  { file: "cow-rare-halo-wings.png", name: "Halo Wings", tier: "legendary" },
  { file: "cow-rare-rainbow-horns.png", name: "Rainbow Horns", tier: "legendary" },
];

const BACKGROUNDS_RAW = [
  { name: "Pink", color: { r: 245, g: 75, b: 154 }, tier: "common" },
  { name: "Teal", color: { r: 46, g: 196, b: 182 }, tier: "common" },
  { name: "Navy", color: { r: 29, g: 53, b: 87 }, tier: "common" },
  { name: "Charcoal", color: { r: 42, g: 45, b: 52 }, tier: "common" },
  { name: "Orange", color: { r: 255, g: 122, b: 24 }, tier: "common" },
  { name: "Olive", color: { r: 107, g: 143, b: 58 }, tier: "common" },
  { name: "Lavender", color: { r: 197, g: 163, b: 255 }, tier: "common" },
  { name: "Cream", color: { r: 243, g: 230, b: 196 }, tier: "common" },
  { name: "Maroon", color: { r: 122, g: 31, b: 61 }, tier: "uncommon" },
  { name: "Mint", color: { r: 125, g: 255, b: 179 }, tier: "uncommon" },
  { name: "Purple", color: { r: 108, g: 60, b: 225 }, tier: "uncommon" },
  { name: "Sky", color: { r: 126, g: 200, b: 227 }, tier: "uncommon" },
  { name: "Gold", color: { r: 212, g: 160, b: 23 }, tier: "rare" },
  { name: "Sunset", color: { r: 255, g: 94, b: 91 }, tier: "rare" },
  { name: "Black", color: { r: 12, g: 12, b: 14 }, tier: "rare" },
  { name: "Space Rainbow", color: { r: 11, g: 16, b: 38 }, tier: "legendary" },
];

const GRADES_RAW = [
  { name: "Original", modulate: null, tier: "common" },
  { name: "Warm", modulate: { brightness: 1.06, saturation: 1.15, hue: 12 }, tier: "common" },
  { name: "Cool", modulate: { brightness: 1.02, saturation: 1.05, hue: 320 }, tier: "common" },
  { name: "Vivid", modulate: { brightness: 1.08, saturation: 1.35 }, tier: "uncommon" },
  { name: "Faded", modulate: { brightness: 1.1, saturation: 0.65 }, tier: "uncommon" },
  { name: "Night", modulate: { brightness: 0.78, saturation: 0.9, hue: 210 }, tier: "rare" },
  { name: "Gold Wash", modulate: { brightness: 1.12, saturation: 1.2, hue: 35 }, tier: "rare" },
  { name: "Contrast", modulate: { brightness: 1.05, saturation: 1.25 }, tier: "uncommon" },
];

const FRAMES_RAW = [
  { name: "None", width: 0, color: null, tier: "common" },
  { name: "Black Rim", width: 10, color: { r: 12, g: 12, b: 12 }, tier: "common" },
  { name: "Cream Rim", width: 12, color: { r: 243, g: 230, b: 196 }, tier: "uncommon" },
  { name: "Gold Rim", width: 10, color: { r: 212, g: 160, b: 23 }, tier: "rare" },
];

function expand(items, extraWeight) {
  return items.map((item) => ({
    ...item,
    weight: extraWeight[item.tier] || extraWeight.common || 1,
  }));
}

function pick(items, rand) {
  let total = 0;
  for (const item of items) total += item.weight;
  let r = rand() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export const BASES = expand(BASES_RAW, TIER_WEIGHT);
export const BACKGROUNDS = expand(BACKGROUNDS_RAW, { common: 70, uncommon: 22, rare: 7, legendary: 1 });
export const GRADES = expand(GRADES_RAW, { common: 70, uncommon: 22, rare: 7, legendary: 1 });
export const FRAMES = expand(FRAMES_RAW, { common: 70, uncommon: 22, rare: 7, legendary: 1 });
export { pick };
