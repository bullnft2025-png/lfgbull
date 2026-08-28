const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..");
const logo = path.join(__dirname, "opensea-logo.png");
const out = path.join(root, "web", "public");

fs.mkdirSync(out, { recursive: true });

(async () => {
  await sharp(logo).resize(32, 32).png().toFile(path.join(out, "favicon-32.png"));
  await sharp(logo).resize(48, 48).png().toFile(path.join(out, "favicon.png"));
  await sharp(logo).resize(180, 180).png().toFile(path.join(out, "apple-touch-icon.png"));
  await sharp(logo).resize(512, 512).png().toFile(path.join(out, "logo.png"));

  const mark = await sharp(logo).resize(380, 380).png().toBuffer();
  const card = Buffer.from(`<svg width="1200" height="630">
    <rect width="1200" height="630" fill="#0a0507"/>
    <text x="760" y="292" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="#c9a24a" letter-spacing="18">BULL</text>
    <text x="760" y="348" font-family="Georgia, 'Times New Roman', serif" font-size="28" fill="#d4c4a8" letter-spacing="8">MUSÉE NOCTURNE</text>
    <text x="760" y="408" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#9a8a72">lfgbull.com</text>
  </svg>`);
  await sharp(card)
    .composite([{ input: mark, left: 220, top: 125 }])
    .png()
    .toFile(path.join(out, "og.png"));

  for (const name of ["favicon.png", "favicon-32.png", "apple-touch-icon.png", "logo.png", "og.png"]) {
    const m = await sharp(path.join(out, name)).metadata();
    console.log(`${name} ${m.width}x${m.height}`);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
