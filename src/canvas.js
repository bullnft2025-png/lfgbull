class Pixels {
  constructor(size) {
    this.size = size;
    this.data = Buffer.alloc(size * size * 4);
  }

  idx(x, y) {
    return (y * this.size + x) * 4;
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  set(x, y, color) {
    if (!color || !this.inBounds(x, y)) return;
    const i = this.idx(x, y);
    this.data[i] = color[0];
    this.data[i + 1] = color[1];
    this.data[i + 2] = color[2];
    this.data[i + 3] = color[3] == null ? 255 : color[3];
  }

  get(x, y) {
    if (!this.inBounds(x, y)) return null;
    const i = this.idx(x, y);
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }

  fillRect(x, y, w, h, color) {
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) this.set(x + xx, y + yy, color);
    }
  }

  outlineRect(x, y, w, h, color) {
    for (let xx = 0; xx < w; xx++) {
      this.set(x + xx, y, color);
      this.set(x + xx, y + h - 1, color);
    }
    for (let yy = 0; yy < h; yy++) {
      this.set(x, y + yy, color);
      this.set(x + w - 1, y + yy, color);
    }
  }

  hLine(x, y, w, color) {
    for (let i = 0; i < w; i++) this.set(x + i, y, color);
  }

  vLine(x, y, h, color) {
    for (let i = 0; i < h; i++) this.set(x, y + i, color);
  }

  fill(color) {
    this.fillRect(0, 0, this.size, this.size, color);
  }

  stamp(dots, color) {
    for (const [x, y] of dots) this.set(x, y, color);
  }

  blit(rows, palette) {
    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const c = palette[row[x]];
        if (c) this.set(x, y, c);
      }
    }
  }
}

function hex(rgb) {
  return [parseInt(rgb.slice(1, 3), 16), parseInt(rgb.slice(3, 5), 16), parseInt(rgb.slice(5, 7), 16), 255];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
    255,
  ];
}

module.exports = { Pixels, hex, mix };
