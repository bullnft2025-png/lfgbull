const fs = require("fs");
const path = require("path");

const collectionPath = path.join(__dirname, "output", "collection.json");
const outDir = path.join(__dirname, "output", "unrevealed");

function parseArgs(argv) {
  const args = { images: "ipfs://BOX_IMAGES/", videos: "ipfs://BOX_VIDEOS/" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--images" && argv[i + 1]) args.images = argv[++i];
    if (argv[i] === "--videos" && argv[i + 1]) args.videos = argv[++i];
  }
  if (!args.images.endsWith("/")) args.images += "/";
  if (!args.videos.endsWith("/")) args.videos += "/";
  return args;
}

function lightOf(tier) {
  if (tier === "legendary") return { file: "gold", trait: "Gold", zh: "金光" };
  if (tier === "rare") return { file: "violet", trait: "Violet", zh: "紫光" };
  return { file: "white", trait: "White", zh: "白光" };
}

const args = parseArgs(process.argv);
if (!fs.existsSync(collectionPath)) {
  console.error("Missing output/collection.json");
  process.exit(1);
}

const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < collection.tokens.length; i++) {
  const token = collection.tokens[i];
  const id = i + 1;
  const tier = token.attributes.find((a) => a.trait_type === "Character Tier")?.value || "common";
  const light = lightOf(tier);
  const json = {
    name: `BULL #${id}`,
    description: "A sealed BULL casket. The portrait remains unrevealed.",
    image: `${args.images}${light.file}.png`,
    animation_url: `${args.videos}${light.file}.mp4`,
    attributes: [
      { trait_type: "Light", value: light.trait },
      { trait_type: "Status", value: "Sealed" },
    ],
  };
  fs.writeFileSync(path.join(outDir, `${id}.json`), `${JSON.stringify(json, null, 2)}\n`);
}

fs.writeFileSync(
  path.join(__dirname, "output", "unrevealed-base.json"),
  `${JSON.stringify({ images: args.images, videos: args.videos, count: collection.tokens.length }, null, 2)}\n`
);

console.log(`Wrote ${collection.tokens.length} sealed files to output/unrevealed/`);
console.log(`boxes: ${args.images}`);
console.log(`videos: ${args.videos}`);
