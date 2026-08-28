const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { pinFolder } = require("./src/pinata-folder");

const root = __dirname;
const envPath = path.join(root, ".env");
const imagesDir = path.join(root, "output", "unrevealed-media", "images");
const videosDir = path.join(root, "output", "unrevealed-media", "videos");
const metaDir = path.join(root, "output", "unrevealed");

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

function run(script, extraArgs = []) {
  const res = spawnSync(process.execPath, [path.join(root, script), ...extraArgs], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  });
  if (res.status !== 0) throw new Error(`${script} failed`);
}

async function main() {
  loadEnv();
  const jwt = process.env.PINATA_JWT || process.env.PINATA_JWT_TOKEN || process.env.JWT;
  if (!jwt) {
    console.error("Create cow-people/.env with PINATA_JWT=...");
    process.exit(1);
  }

  run("stage-unrevealed-media.js");

  console.log("\nPinning sealed box stills...");
  const imageCid = await pinFolder(imagesDir, jwt, {
    name: "bull-unrevealed-boxes",
    prefix: "boxes",
    ext: ".png",
    mime: "image/png",
  });
  const images = `ipfs://${imageCid}/`;
  console.log("BOX IMAGES CID:", imageCid);

  console.log("\nPinning sealed box videos...");
  const videoCid = await pinFolder(videosDir, jwt, {
    name: "bull-unrevealed-box-videos",
    prefix: "boxes",
    ext: ".mp4",
    mime: "video/mp4",
  });
  const videos = `ipfs://${videoCid}/`;
  console.log("BOX VIDEOS CID:", videoCid);

  run("prepare-unrevealed.js", ["--images", images, "--videos", videos]);

  const jsons = fs.readdirSync(metaDir).filter((name) => name.toLowerCase().endsWith(".json"));
  if (jsons.length !== 10000) {
    throw new Error(`Expected 10000 unrevealed json files, found ${jsons.length}`);
  }

  console.log("\nPinning sealed metadata...");
  const metaCid = await pinFolder(metaDir, jwt, {
    name: "bull-unrevealed-metadata",
    prefix: "meta",
    ext: ".json",
    mime: "application/json",
  });
  const base = `ipfs://${metaCid}/`;
  fs.writeFileSync(
    path.join(root, "output", "unrevealed-cid.txt"),
    `${imageCid}\n${images}\n${videoCid}\n${videos}\n${metaCid}\n${base}\n`
  );
  console.log("\nUNREVEALED METADATA CID:");
  console.log(metaCid);
  console.log(base);
  console.log(`Owner must call setBaseURI("${base}")`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
