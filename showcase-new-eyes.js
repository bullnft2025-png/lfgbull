const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { renderCow } = require("./src/draw");

const ROOT = __dirname;
const OUT = path.join(ROOT, "output");

async function writePng(px, file, scale) {
  const size = px.size * scale;
  await sharp(px.data, { raw: { width: px.size, height: px.size, channels: 4 } })
    .resize(size, size, { kernel: "nearest" })
    .png({ compressionLevel: 9 })
    .toFile(file);
}

// Create showcase of new eye types
async function createNewEyesShowcase() {
  const newEyes = [
    "X Eyes",
    "Heart Eyes",
    "Star Eyes", 
    "Money Eyes",
    "Spiral Eyes",
    "Flame Eyes",
    "Rainbow Eyes"
  ];

  const baseDna = {
    Background: "Navy",
    Fur: "Holstein",
    Horns: "Medium",
    Eyes: "Normal",
    Headwear: "None",
    Mouth: "Smile",
    Accessory: "None",
  };

  const cell = 200;
  const gap = 10;
  const pad = 20;
  const cols = 4;
  const rows = Math.ceil(newEyes.length / cols);
  const width = pad * 2 + cols * cell + (cols - 1) * gap;
  const height = pad * 2 + rows * cell + (rows - 1) * gap;

  const composites = [];

  for (let i = 0; i < newEyes.length; i++) {
    const eyeType = newEyes[i];
    const dna = { ...baseDna, Eyes: eyeType };
    const px = renderCow(dna);
    
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
    .toFile(path.join(OUT, "new-eyes-showcase.png"));

  console.log(`✅ Created new eyes showcase: ${path.join(OUT, "new-eyes-showcase.png")}`);
  console.log(`   Featuring ${newEyes.length} new eye types!`);
}

createNewEyesShowcase().catch(err => {
  console.error(err);
  process.exit(1);
});
