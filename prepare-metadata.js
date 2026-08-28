const fs = require("fs");
const path = require("path");

const collectionPath = path.join(__dirname, "output", "collection.json");
const outDir = path.join(__dirname, "output", "metadata");

function parseArgs(argv) {
  const args = { images: "ipfs://IMAGES_CID/" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--images" && argv[i + 1]) {
      args.images = argv[++i];
    }
  }
  if (!args.images.endsWith("/")) args.images += "/";
  return args;
}

const args = parseArgs(process.argv);
if (!fs.existsSync(collectionPath)) {
  console.error("Missing output/collection.json. Run generate-from-art.js first.");
  process.exit(1);
}

const collection = JSON.parse(fs.readFileSync(collectionPath, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

for (let i = 0; i < collection.tokens.length; i++) {
  const token = collection.tokens[i];
  const id = i + 1;
  const json = {
    name: token.name,
    description: token.description,
    image: `${args.images}${id}.png`,
    attributes: token.attributes,
  };
  fs.writeFileSync(path.join(outDir, `${id}.json`), `${JSON.stringify(json, null, 2)}\n`);
}

fs.writeFileSync(
  path.join(__dirname, "output", "metadata-base.json"),
  `${JSON.stringify({ images: args.images, count: collection.tokens.length }, null, 2)}\n`
);

console.log(`Wrote ${collection.tokens.length} files to output/metadata/`);
console.log(`image base: ${args.images}`);
console.log("After pinning images, re-run: node prepare-metadata.js --images ipfs://QmYourImagesCid/");
