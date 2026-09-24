const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { renderCow } = require("./src/draw");

const ROOT = __dirname;
const OUT = path.join(ROOT, "output", "eye-samples");

async function writePng(px, file, scale) {
  const size = px.size * scale;
  await sharp(px.data, { raw: { width: px.size, height: px.size, channels: 4 } })
    .resize(size, size, { kernel: "nearest" })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

// Generate individual samples for each eye type
async function generateEyeSamples() {
  fs.mkdirSync(OUT, { recursive: true });

  const allEyes = [
    // New eyes
    { name: "X Eyes", tier: "common", isNew: true },
    { name: "Heart Eyes", tier: "uncommon", isNew: true },
    { name: "Star Eyes", tier: "uncommon", isNew: true },
    { name: "Money Eyes", tier: "uncommon", isNew: true },
    { name: "Spiral Eyes", tier: "rare", isNew: true },
    { name: "Flame Eyes", tier: "rare", isNew: true },
    { name: "Rainbow Eyes", tier: "legendary", isNew: true },
    // Original eyes
    { name: "Normal", tier: "common", isNew: false },
    { name: "Black Shades", tier: "common", isNew: false },
    { name: "Pink Goggles", tier: "common", isNew: false },
    { name: "Cyan Goggles", tier: "common", isNew: false },
    { name: "Gold Goggles", tier: "uncommon", isNew: false },
    { name: "White Visor", tier: "uncommon", isNew: false },
    { name: "Red Visor", tier: "uncommon", isNew: false },
    { name: "Eye Patch", tier: "uncommon", isNew: false },
    { name: "3D Glasses", tier: "rare", isNew: false },
    { name: "Sleepy", tier: "rare", isNew: false },
    { name: "Laser", tier: "legendary", isNew: false },
    { name: "Diamond Eyes", tier: "legendary", isNew: false },
  ];

  const baseDna = {
    Background: "Charcoal",
    Fur: "Holstein",
    Horns: "Medium",
    Eyes: "Normal",
    Headwear: "None",
    Mouth: "Smile",
    Accessory: "None",
  };

  console.log(`Generating individual samples for ${allEyes.length} eye types...`);

  for (const eye of allEyes) {
    const dna = { ...baseDna, Eyes: eye.name };
    const px = renderCow(dna);
    
    const fileName = eye.name.toLowerCase().replace(/\s+/g, "-");
    const newTag = eye.isNew ? "-NEW" : "";
    const fullPath = path.join(OUT, `${fileName}${newTag}-${eye.tier}.png`);
    
    await writePng(px, fullPath, 10);
    console.log(`  ✅ ${eye.name} (${eye.tier})${eye.isNew ? " ⭐NEW" : ""}`);
  }

  console.log(`\n✨ Generated ${allEyes.length} eye type samples in: ${OUT}`);
  
  // Create a comparison grid
  await createComparisonGrid(allEyes, baseDna);
}

async function createComparisonGrid(allEyes, baseDna) {
  const tierOrder = ["legendary", "rare", "uncommon", "common"];
  const tierColors = {
    legendary: { r: 218, g: 165, b: 32 },   // Gold
    rare: { r: 138, g: 43, b: 226 },        // Purple
    uncommon: { r: 30, g: 144, b: 255 },    // Blue
    common: { r: 128, g: 128, b: 128 },     // Gray
  };

  const cell = 160;
  const gap = 8;
  const labelHeight = 30;
  const pad = 20;
  const cols = 5;
  
  let currentY = pad;
  const composites = [];
  const width = pad * 2 + cols * cell + (cols - 1) * gap;

  for (const tier of tierOrder) {
    const eyesInTier = allEyes.filter(e => e.tier === tier);
    if (eyesInTier.length === 0) continue;

    const rows = Math.ceil(eyesInTier.length / cols);
    
    // Add tier label background
    const tierLabelHeight = 40;
    
    for (let i = 0; i < eyesInTier.length; i++) {
      const eye = eyesInTier[i];
      const dna = { ...baseDna, Eyes: eye.name };
      const px = renderCow(dna);
      
      const buf = await sharp(px.data, { raw: { width: 32, height: 32, channels: 4 } })
        .resize(cell, cell, { kernel: "nearest" })
        .png()
        .toBuffer();

      composites.push({
        input: buf,
        left: pad + (i % cols) * (cell + gap),
        top: currentY + tierLabelHeight + Math.floor(i / cols) * (cell + labelHeight + gap),
      });
    }

    currentY += tierLabelHeight + rows * (cell + labelHeight + gap) + 20;
  }

  const totalHeight = currentY;

  await sharp({
    create: { width, height: totalHeight, channels: 3, background: { r: 18, g: 18, b: 22 } },
  })
    .composite(composites)
    .png()
    .toFile(path.join(OUT, "all-eyes-comparison.png"));

  console.log(`\n🎨 Created comparison grid: ${path.join(OUT, "all-eyes-comparison.png")}`);
}

generateEyeSamples().catch(err => {
  console.error(err);
  process.exit(1);
});
