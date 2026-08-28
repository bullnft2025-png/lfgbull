const fs = require("fs");
const path = require("path");
const { pinFolder } = require("./src/pinata-folder");

const root = __dirname;
const imagesDir = path.join(root, "output", "images");
const envPath = path.join(root, ".env");

function loadEnv() {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function assertImages() {
  if (!fs.existsSync(imagesDir)) {
    throw new Error("Missing output/images. Generate art first.");
  }
  const pngs = fs.readdirSync(imagesDir).filter((name) => name.toLowerCase().endsWith(".png"));
  if (pngs.length !== 10000) {
    throw new Error(`Expected 10000 png files, found ${pngs.length}`);
  }
}

async function main() {
  loadEnv();
  const jwt = process.env.PINATA_JWT || process.env.PINATA_JWT_TOKEN || process.env.JWT;
  if (!jwt) {
    console.error("Create cow-people/.env with PINATA_JWT=...");
    process.exit(1);
  }
  assertImages();
  const cid = await pinFolder(imagesDir, jwt, {
    name: "bull-images",
    prefix: "images",
    ext: ".png",
    mime: "image/png",
  });
  const imageBase = `ipfs://${cid}/images/`;
  console.log("\nIMAGES CID:");
  console.log(cid);
  console.log(imageBase);
  fs.writeFileSync(path.join(root, "output", "images-cid.txt"), `${cid}\n${imageBase}\n`);
  console.log("Saved to output/images-cid.txt");
  console.log("Next: node prepare-metadata.js --images " + imageBase);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
