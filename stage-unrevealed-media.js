const fs = require("fs");
const path = require("path");

const root = __dirname;
const brand = path.join(root, "brand", "boxes");
const webBoxes = path.join(root, "web", "public", "boxes");
const images = path.join(root, "output", "unrevealed-media", "images");
const videos = path.join(root, "output", "unrevealed-media", "videos");
const colors = ["white", "violet", "gold"];

function copy(src, dest) {
  if (!fs.existsSync(src)) throw new Error(`Missing ${src}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}

for (const color of colors) {
  const png = path.join(brand, `box-${color}.png`);
  copy(png, path.join(webBoxes, `${color}.png`));
  copy(png, path.join(images, `${color}.png`));
  const mp4 = path.join(brand, `box-${color}-spin.mp4`);
  copy(mp4, path.join(videos, `${color}.mp4`));
}

console.log("Staged sealed box stills and orbit videos.");
