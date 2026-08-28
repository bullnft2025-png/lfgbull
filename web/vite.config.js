import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { REVEALED, boxColor } from "./src/reveal.js";
import { TOKENS } from "./src/catalog.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const IMG = path.resolve(root, "../output/images");
const BOXES = path.join(root, "public", "boxes");

function sendTokenPng(req, res, next) {
  const url = req.url?.split("?")[0] || "";
  const match = url.match(/^\/tokens\/(\d+)\.png$/);
  if (!match) return next();
  let file = path.join(IMG, `${match[1]}.png`);
  if (!REVEALED) {
    const token = TOKENS[Number(match[1]) - 1];
    file = path.join(BOXES, `${boxColor(token?.tier)}.png`);
  }
  if (!fs.existsSync(file)) {
    res.statusCode = 404;
    res.end();
    return;
  }
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400");
  fs.createReadStream(file).pipe(res);
}

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    fs: { allow: [path.resolve(root, "..")] },
  },
  plugins: [
    {
      name: "cow-token-images",
      configureServer(server) {
        server.middlewares.use(sendTokenPng);
      },
      configurePreviewServer(server) {
        server.middlewares.use(sendTokenPng);
      },
    },
  ],
});
