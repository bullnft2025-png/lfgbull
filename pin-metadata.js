const fs = require("fs");
const path = require("path");
const { pinFolder } = require("./src/pinata-folder");

const root = __dirname;
const metaDir = path.join(root, "output", "metadata");
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

function assertMetadata() {
  if (!fs.existsSync(metaDir)) {
    throw new Error("Missing output/metadata. Run prepare-metadata.js first.");
  }
  const jsons = fs.readdirSync(metaDir).filter((name) => name.toLowerCase().endsWith(".json"));
  if (jsons.length !== 10000) {
    throw new Error(`Expected 10000 json files, found ${jsons.length}`);
  }
  const sample = JSON.parse(fs.readFileSync(path.join(metaDir, "1.json"), "utf8"));
  if (!sample.image || sample.image.includes("IMAGES_CID")) {
    throw new Error("Metadata still has the placeholder image CID. Run prepare-metadata.js --images ipfs://YOUR_IMAGES_CID/images/");
  }
}

async function main() {
  loadEnv();
  const jwt = process.env.PINATA_JWT || process.env.PINATA_JWT_TOKEN || process.env.JWT;
  if (!jwt) {
    console.error("Create cow-people/.env with PINATA_JWT=...");
    process.exit(1);
  }
  assertMetadata();
  const cid = await pinFolder(metaDir, jwt, {
    name: "bull-metadata",
    prefix: "meta",
    ext: ".json",
    mime: "application/json",
  });
  const base = `ipfs://${cid}/meta/`;
  console.log("\nMETADATA CID:");
  console.log(cid);
  console.log(base);
  fs.writeFileSync(path.join(root, "output", "metadata-cid.txt"), `${cid}\n${base}\n`);
  console.log("Owner must call setBaseURI(\"" + base + "\")");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
