const sharp = require("sharp");

function dist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function sampleBorderMode(data, w, h) {
  const counts = new Map();
  function add(x, y) {
    const i = (y * w + x) * 4;
    const key = `${data[i] >> 2},${data[i + 1] >> 2},${data[i + 2] >> 2}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  for (let x = 0; x < w; x++) {
    add(x, 0);
    add(x, 1);
    add(x, h - 1);
    add(x, h - 2);
  }
  for (let y = 0; y < h; y++) {
    add(0, y);
    add(1, y);
    add(w - 1, y);
    add(w - 2, y);
  }
  let best = null;
  let n = 0;
  for (const [key, c] of counts) {
    if (c > n) {
      n = c;
      best = key;
    }
  }
  const [r, g, b] = best.split(",").map((v) => (Number(v) << 2) + 1);
  return [r, g, b];
}

function thresholdFor(bg) {
  const lum = (bg[0] + bg[1] + bg[2]) / 3;
  const sat = Math.max(bg[0], bg[1], bg[2]) - Math.min(bg[0], bg[1], bg[2]);
  if (sat > 50) return 26;
  if (lum < 24) return 10;
  if (lum < 48) return 14;
  return 18;
}

function keepComponents(mask, w, h) {
  const seen = Buffer.alloc(w * h);
  const parts = [];
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || seen[start]) continue;
    const stack = [start];
    const cells = [];
    seen[start] = 1;
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    while (stack.length) {
      const idx = stack.pop();
      cells.push(idx);
      const x = idx % w;
      const y = (idx / w) | 0;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      for (let ny = y - 1; ny <= y + 1; ny++) {
        for (let nx = x - 1; nx <= x + 1; nx++) {
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const n = ny * w + nx;
          if (seen[n] || !mask[n]) continue;
          seen[n] = 1;
          stack.push(n);
        }
      }
    }
    parts.push({ cells, minX, minY, maxX, maxY });
  }
  parts.sort((a, b) => b.cells.length - a.cells.length);
  const kept = Buffer.alloc(w * h);
  if (!parts.length) return;
  const main = parts[0];
  const pad = Math.max(28, Math.round(Math.min(w, h) / 28));
  function nearMain(p) {
    return !(p.maxX < main.minX - pad || p.minX > main.maxX + pad || p.maxY < main.minY - pad || p.minY > main.maxY + pad);
  }
  for (const part of parts) {
    if (part === main || nearMain(part)) {
      for (const idx of part.cells) kept[idx] = 1;
    }
  }
  mask.set(kept);
}

function integral(mask, w, h) {
  const sat = new Uint32Array((w + 1) * (h + 1));
  const row = w + 1;
  for (let y = 1; y <= h; y++) {
    let run = 0;
    for (let x = 1; x <= w; x++) {
      run += mask[(y - 1) * w + (x - 1)];
      sat[y * row + x] = sat[(y - 1) * row + x] + run;
    }
  }
  return sat;
}

function windowSum(sat, w, x0, y0, x1, y1) {
  const row = w + 1;
  const a = sat[y0 * row + x0];
  const b = sat[y0 * row + x1];
  const c = sat[y1 * row + x0];
  const d = sat[y1 * row + x1];
  return d - b - c + a;
}

function fillHoles(mask, w, h) {
  const reach = Buffer.alloc(w * h);
  const q = [];
  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (mask[i] || reach[i]) return;
    reach[i] = 1;
    q.push(i);
  }
  for (let x = 0; x < w; x++) {
    enqueue(x, 0);
    enqueue(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    enqueue(0, y);
    enqueue(w - 1, y);
  }
  while (q.length) {
    const i = q.pop();
    const x = i % w;
    const y = (i / w) | 0;
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  let minY = h;
  let maxY = 0;
  for (let i = 0; i < w * h; i++) {
    if (!mask[i]) continue;
    const y = (i / w) | 0;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const topCut = minY + Math.round((maxY - minY) * 0.2);

  const seen = Buffer.alloc(w * h);
  for (let start = 0; start < w * h; start++) {
    if (mask[start] || reach[start] || seen[start]) continue;
    const stack = [start];
    const cells = [];
    seen[start] = 1;
    let sumY = 0;
    while (stack.length) {
      const i = stack.pop();
      cells.push(i);
      sumY += (i / w) | 0;
      const x = i % w;
      const y = (i / w) | 0;
      const nbrs = [i + 1, i - 1, i + w, i - w];
      for (const n of nbrs) {
        if (n < 0 || n >= w * h || seen[n] || mask[n] || reach[n]) continue;
        const nx = n % w;
        const ny = (n / w) | 0;
        if (Math.abs(nx - x) + Math.abs(ny - y) !== 1) continue;
        seen[n] = 1;
        stack.push(n);
      }
    }
    const cy = sumY / cells.length;
    if (cy < topCut && cells.length > 40) continue;
    for (const i of cells) mask[i] = 1;
  }
}

function peelFringe(mask, data, w, h, bg, threshold, passes = 3) {
  for (let pass = 0; pass < passes; pass++) {
    const drop = [];
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (!mask[idx]) continue;
        const p = idx * 4;
        if (dist([data[p], data[p + 1], data[p + 2]], bg) > threshold) continue;
        let edge = false;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
        else if (!mask[idx - 1] || !mask[idx + 1] || !mask[idx - w] || !mask[idx + w]) edge = true;
        if (edge) drop.push(idx);
      }
    }
    if (!drop.length) break;
    for (const idx of drop) mask[idx] = 0;
  }
}

function promoteEnclosed(mask, w, h, radius, ratio, rounds) {
  const area = (2 * radius + 1) * (2 * radius + 1);
  const need = Math.ceil(area * ratio);
  for (let round = 0; round < rounds; round++) {
    const sat = integral(mask, w, h);
    const next = Buffer.from(mask);
    let changed = 0;
    for (let y = 0; y < h; y++) {
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(h, y + radius + 1);
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        if (mask[idx]) continue;
        const x0 = Math.max(0, x - radius);
        const x1 = Math.min(w, x + radius + 1);
        const sum = windowSum(sat, w, x0, y0, x1, y1);
        const win = (x1 - x0) * (y1 - y0);
        if (sum * area >= need * win) {
          next[idx] = 1;
          changed++;
        }
      }
    }
    if (!changed) break;
    mask.set(next);
  }
}

function opaqueStats(mask, w, h) {
  let opaque = 0;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      opaque++;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return {
    opaque,
    opaquePct: opaque / (w * h),
    bbox: maxX < 0 ? null : { minX, minY, maxX, maxY, w: maxX - minX + 1, h: maxY - minY + 1 },
  };
}

async function cutout(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const bg = sampleBorderMode(data, w, h);
  const threshold = thresholdFor(bg);
  const mask = Buffer.alloc(w * h);

  for (let i = 0; i < w * h; i++) {
    const p = i * 4;
    if (dist([data[p], data[p + 1], data[p + 2]], bg) > threshold) mask[i] = 1;
  }

  keepComponents(mask, w, h);
  promoteEnclosed(mask, w, h, 10, 0.55, 8);
  fillHoles(mask, w, h);
  const sat = Math.max(bg[0], bg[1], bg[2]) - Math.min(bg[0], bg[1], bg[2]);
  if (sat > 50) peelFringe(mask, data, w, h, bg, threshold * 2.2, 4);

  const stats = opaqueStats(mask, w, h);
  const out = Buffer.from(data);
  for (let i = 0; i < w * h; i++) {
    out[i * 4 + 3] = mask[i] ? 255 : 0;
  }
  return { data: out, width: w, height: h, bg, threshold, stats };
}

async function writeCutout(src, dest, size = 512) {
  const cut = await cutout(src);
  let pipeline = sharp(cut.data, { raw: { width: cut.width, height: cut.height, channels: 4 } });
  if (cut.width !== size || cut.height !== size) {
    pipeline = pipeline.resize(size, size, {
      fit: "fill",
      kernel: "nearest",
    });
  }
  await pipeline.png({ compressionLevel: 9 }).toFile(dest);
  return cut;
}

module.exports = { cutout, writeCutout, sampleBorderMode };
