const { Pixels, hex, mix } = require("./canvas");

const BG = {
  Pink: hex("#F54B9A"),
  Teal: hex("#2EC4B6"),
  Navy: hex("#1D3557"),
  Charcoal: hex("#2A2D34"),
  Orange: hex("#FF7A18"),
  Olive: hex("#6B8F3A"),
  Lavender: hex("#C5A3FF"),
  Cream: hex("#F3E6C4"),
  Maroon: hex("#7A1F3D"),
  Mint: hex("#7DFFB3"),
  Purple: hex("#6C3CE1"),
  Sky: hex("#7EC8E3"),
  Gold: hex("#D4A017"),
  Sunset: hex("#FF5E5B"),
  "Space Rainbow": hex("#0B1026"),
};

const FUR = {
  Cream: { body: hex("#E8D5A8"), shadow: hex("#C4B07A"), snout: hex("#F3E6C4"), ear: hex("#F0B7C4") },
  Holstein: { body: hex("#F0E6D0"), shadow: hex("#D0C4A8"), snout: hex("#FAF4E8"), ear: hex("#F0B7C4"), spots: hex("#1A1A1A") },
  Brown: { body: hex("#8B5A2B"), shadow: hex("#5C3A1A"), snout: hex("#C4A574"), ear: hex("#E09AA8") },
  Black: { body: hex("#2A2A2A"), shadow: hex("#141414"), snout: hex("#4A4A4A"), ear: hex("#C97B88") },
  Gray: { body: hex("#9AA0A6"), shadow: hex("#6D7378"), snout: hex("#D5D8DC"), ear: hex("#E09AA8") },
  Tan: { body: hex("#C4A574"), shadow: hex("#8C7048"), snout: hex("#E8D5B5"), ear: hex("#E09AA8") },
  Pink: { body: hex("#FF8FAB"), shadow: hex("#E06888"), snout: hex("#FFD1DC"), ear: hex("#FFC2D0") },
  Blue: { body: hex("#4DA3FF"), shadow: hex("#2B6CB0"), snout: hex("#B8DCFF"), ear: hex("#FFB3C4") },
  Maroon: { body: hex("#9B2335"), shadow: hex("#6B1522"), snout: hex("#E0A3AD"), ear: hex("#F0B7C4") },
  "Blue Spots": { body: hex("#4DA3FF"), shadow: hex("#2B6CB0"), snout: hex("#B8DCFF"), ear: hex("#FFB3C4"), spots: hex("#14233A") },
  "Gold Metallic": { body: hex("#E6C35C"), shadow: hex("#C9A227"), snout: hex("#F8E19A"), ear: hex("#F0B7C4") },
  "Zombie Green": { body: hex("#6B8F4E"), shadow: hex("#3D5C2E"), snout: hex("#A4C07A"), ear: hex("#7A4A52") },
  "Alien Purple": { body: hex("#B44AFF"), shadow: hex("#7A1FD4"), snout: hex("#E2B8FF"), ear: hex("#FF9AD1") },
  "Diamond Crystal": { body: hex("#C8F4FF"), shadow: hex("#7FD6F0"), snout: hex("#F2FCFF"), ear: hex("#FFD6E8") },
};

const BLACK = hex("#111111");
const WHITE = hex("#F5F5F5");
const GOLD = hex("#F0C94A");
const SILVER = hex("#C9D2D8");
const RED = hex("#E23A3A");
const CYAN = hex("#3DE0FF");
const PINK = hex("#FF5AB3");
const WOOD = hex("#8B5A2B");

// Cow bust facing right: big round head, boxy muzzle, short wide shoulders.
// K outline, B fur, D shadow, S muzzle, N nose leather, O nostril, I inner ear.
const BODY = [
  "................................",
  "................................",
  "................................",
  "................................",
  "................................",
  "......KKKKKKKKKKKKKK............",
  "....KKBBBBBBBBBBBBBBKK..........",
  "...KBBBBBBBBBBBBBBBBBBK.........",
  "..KBBBBBBBBBBBBBBBBBBBBK........",
  ".KIIBBBBBBBBBBBBBBBBBBBK........",
  ".KIIIKBBBBBBBBBBBBBBBBBK........",
  ".KKIIIKBBBBBBBBBBBBBBBKKK.......",
  "..KKKKDBBBBBBBBBBBBBKKSSSK......",
  "...KDBBBBBBBBBBBBBKSSSSSSSK.....",
  "...KDBBBBBBBBBBBBKKSSSSSSSK.....",
  "....KBBBBBBBBBBBBKSSSSSSSSK.....",
  "....KBBBBBBBBBBBKKSSSSSSNNK.....",
  ".....KBBBBBBBBBBKSSSSSSSNOK.....",
  ".....KBBBBBBBBBKKSSSSSSNOOK.....",
  "......KBBBBBBBBKSSSSSSSSSK......",
  "......KKBBBBBBBKKSSSSSSKK.......",
  "......KKBBBBBBBBBKKKK...........",
  ".....KBBBBBBBBBBBBBBK...........",
  "....KBBBBBBBBBBBBBBBBK..........",
  "...KDBBBBBBBBBBBBBBBBK..........",
  "...KDBBBBBBBBBBBBBBBBK..........",
  "...KBBBBBBBBBBBBBBBBBK..........",
  "...KBBBBBBBBBBBBBBBBBK..........",
  "...KKKKKKKKKKKKKKKKKK...........",
  "................................",
  "................................",
  "................................",
];

function drawBackground(px, name) {
  if (name === "Sunset") {
    px.fillRect(0, 0, 32, 16, hex("#FF7A18"));
    px.fillRect(0, 16, 32, 16, hex("#FF5E5B"));
    px.fillRect(0, 14, 32, 3, hex("#FFC14A"));
    return;
  }
  px.fill(BG[name] || BG.Charcoal);
  if (name === "Space Rainbow") {
    const stars = [
      [3, 4, hex("#FF5AB3")],
      [8, 2, WHITE],
      [14, 6, hex("#3DE0FF")],
      [22, 3, hex("#7DFFB3")],
      [28, 8, hex("#F0C94A")],
      [5, 12, WHITE],
      [18, 1, hex("#C5A3FF")],
      [26, 14, WHITE],
      [11, 9, hex("#FF7A18")],
      [30, 5, CYAN],
    ];
    for (const [x, y, c] of stars) px.set(x, y, c);
  }
}

function drawSpots(px, color) {
  const spots = [
    [11, 12, 4, 4],
    [16, 10, 3, 3],
    [9, 17, 3, 3],
    [12, 23, 4, 3],
    [16, 26, 3, 2],
  ];
  for (const [x, y, w, h] of spots) {
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const cur = px.get(x + xx, y + yy);
        if (cur && cur[3] > 0 && cur[0] < 40 && cur[1] < 40 && cur[2] < 40) continue;
        if (cur && cur[3] > 0) px.set(x + xx, y + yy, color);
      }
    }
  }
}

function drawBody(px, furName) {
  const f = FUR[furName];
  px.blit(BODY, {
    K: BLACK,
    B: f.body,
    D: f.shadow,
    S: f.snout,
    N: hex("#C48A7A"),
    O: BLACK,
    I: f.ear,
  });

  if (f.spots) drawSpots(px, f.spots);

  if (furName === "Diamond Crystal") {
    px.stamp([[11, 11], [15, 8], [13, 16], [10, 24], [17, 22], [23, 16]], WHITE);
  }

  if (furName === "Zombie Green") {
    px.fillRect(13, 13, 2, 2, hex("#2A3B1C"));
    px.set(14, 13, BLACK);
    px.set(13, 14, BLACK);
    px.set(15, 14, BLACK);
    px.set(14, 15, BLACK);
  }

  if (furName === "Alien Purple") {
    px.fillRect(13, 11, 7, 6, BLACK);
    px.fillRect(14, 12, 5, 4, hex("#1A1028"));
    px.set(15, 13, hex("#7DFFB3"));
    px.set(18, 13, hex("#7DFFB3"));
  }
}

function hornColor(name) {
  if (name === "Silver") return { main: SILVER, dark: hex("#8A949C") };
  if (name === "Gold") return { main: GOLD, dark: hex("#B8860B") };
  if (name === "Ice") return { main: hex("#D7F4FF"), dark: hex("#7FC7E0") };
  return { main: hex("#D2B48C"), dark: hex("#8B6914") };
}

function drawHornShape(px, fill) {
  const leftFill = [
    [8, 5], [9, 5], [10, 5], [11, 5],
    [7, 4], [8, 4], [9, 4], [10, 4],
    [6, 3], [7, 3], [8, 3], [9, 3],
    [5, 2], [6, 2], [7, 2], [8, 2],
    [5, 1], [6, 1], [7, 1],
    [5, 0], [6, 0],
  ];
  const rightFill = [
    [18, 5], [19, 5], [20, 5], [21, 5],
    [19, 4], [20, 4], [21, 4], [22, 4],
    [20, 3], [21, 3], [22, 3], [23, 3],
    [21, 2], [22, 2], [23, 2], [24, 2],
    [22, 1], [23, 1], [24, 1],
    [23, 0], [24, 0],
  ];
  const outline = [
    [7, 5], [12, 5], [6, 4], [11, 4], [5, 3], [10, 3], [4, 2], [9, 2], [4, 1], [8, 1], [4, 0], [7, 0],
    [17, 5], [22, 5], [18, 4], [23, 4], [19, 3], [24, 3], [20, 2], [25, 2], [21, 1], [25, 1], [22, 0], [25, 0],
  ];
  for (const [x, y] of outline) px.set(x, y, BLACK);
  for (const [x, y] of leftFill) px.set(x, y, fill);
  for (const [x, y] of rightFill) px.set(x, y, fill);
  const shade = hex("#8B6914");
  for (const [x, y] of [[8, 5], [7, 4], [6, 3], [5, 2], [5, 1], [21, 5], [22, 4], [23, 3], [24, 2], [24, 1]]) {
    px.set(x, y, shade);
  }
}

function drawHorns(px, name) {
  const c = hornColor(name);

  if (name === "Rainbow") {
    const colors = [hex("#FF3B3B"), hex("#FF7A18"), hex("#F0C94A"), hex("#3DDC84"), hex("#3DE0FF"), hex("#C5A3FF")];
    drawHornShape(px, hex("#F2E2C0"));
    for (let i = 0; i < 6; i++) {
      px.fillRect(5, i, 3, 1, colors[i]);
      px.fillRect(22, i, 3, 1, colors[i]);
    }
    return;
  }

  if (name === "Small") {
    for (const [x, y] of [[8, 5], [9, 5], [10, 5], [8, 4], [9, 4], [8, 3], [9, 3]]) px.set(x, y, c.main);
    for (const [x, y] of [[19, 5], [20, 5], [21, 5], [20, 4], [21, 4], [20, 3], [21, 3]]) px.set(x, y, c.main);
    for (const [x, y] of [[7, 5], [11, 5], [7, 4], [10, 4], [7, 3], [10, 3], [8, 2], [9, 2]]) px.set(x, y, BLACK);
    for (const [x, y] of [[18, 5], [22, 5], [19, 4], [22, 4], [19, 3], [22, 3], [20, 2], [21, 2]]) px.set(x, y, BLACK);
    return;
  }

  if (name === "Broken") {
    const leftFill = [
      [8, 5], [9, 5], [10, 5], [11, 5],
      [7, 4], [8, 4], [9, 4], [10, 4],
      [6, 3], [7, 3], [8, 3], [9, 3],
      [5, 2], [6, 2], [7, 2], [8, 2],
      [5, 1], [6, 1], [7, 1],
      [5, 0], [6, 0],
    ];
    for (const [x, y] of [[7, 5], [12, 5], [6, 4], [11, 4], [5, 3], [10, 3], [4, 2], [9, 2], [4, 1], [8, 1], [4, 0], [7, 0]]) {
      px.set(x, y, BLACK);
    }
    for (const [x, y] of leftFill) px.set(x, y, c.main);
    px.fillRect(19, 4, 4, 3, BLACK);
    px.fillRect(19, 5, 3, 2, c.main);
    return;
  }

  drawHornShape(px, c.main);
}

function drawNormalEyes(px, furName) {
  if (furName === "Alien Purple") return;
  px.fillRect(14, 12, 5, 4, WHITE);
  px.fillRect(16, 13, 3, 3, BLACK);
  px.set(17, 13, hex("#3DE0FF"));
}

function drawEyes(px, name, furName) {
  if (furName === "Alien Purple" && (name === "Normal" || name === "Sleepy")) return;

  if (name === "Normal") {
    drawNormalEyes(px, furName);
    return;
  }
  if (name === "Sleepy") {
    px.hLine(14, 14, 6, BLACK);
    px.set(14, 13, BLACK);
    px.set(19, 13, BLACK);
    return;
  }
  if (name === "Eye Patch") {
    drawNormalEyes(px, furName);
    px.fillRect(13, 11, 6, 6, BLACK);
    px.hLine(10, 12, 4, BLACK);
    return;
  }
  if (name === "Laser") {
    px.fillRect(14, 12, 5, 4, RED);
    px.hLine(19, 13, 13, RED);
    px.hLine(19, 14, 11, hex("#FF8A8A"));
    return;
  }
  if (name === "Diamond Eyes") {
    px.fillRect(14, 12, 6, 4, hex("#C8F4FF"));
    px.fillRect(15, 13, 4, 2, WHITE);
    px.set(17, 13, CYAN);
    return;
  }

  const frames = {
    "Black Shades": BLACK,
    "Pink Goggles": PINK,
    "Cyan Goggles": CYAN,
    "Gold Goggles": GOLD,
    "White Visor": WHITE,
    "Red Visor": RED,
    "3D Glasses": hex("#3B5BFF"),
  };
  const frame = frames[name] || BLACK;
  px.fillRect(12, 11, 10, 6, frame);
  if (name === "3D Glasses") {
    px.fillRect(13, 12, 4, 4, RED);
    px.fillRect(17, 12, 4, 4, hex("#3B5BFF"));
  } else if (name === "White Visor" || name === "Red Visor") {
    px.fillRect(13, 12, 8, 4, name === "Red Visor" ? hex("#7A1020") : hex("#9BE7FF"));
  } else {
    px.fillRect(13, 12, 8, 4, hex("#1A1A1A"));
    if (name === "Pink Goggles") px.fillRect(14, 13, 3, 2, PINK);
    if (name === "Cyan Goggles") px.fillRect(14, 13, 3, 2, CYAN);
    if (name === "Gold Goggles") px.fillRect(14, 13, 3, 2, GOLD);
  }
}

function beanieColor(name) {
  if (name === "Pink Beanie") return hex("#FF6BA8");
  if (name === "Blue Beanie") return hex("#4DA3FF");
  return hex("#8B9198");
}

function drawHeadwear(px, name) {
  if (name === "None") return;

  if (name === "White Hoodie" || name === "Black Hoodie") {
    const cloth = name === "White Hoodie" ? WHITE : hex("#2A2A2A");
    const shade = name === "White Hoodie" ? hex("#C8C8C8") : hex("#111111");
    px.fillRect(3, 22, 18, 7, cloth);
    px.fillRect(2, 10, 4, 13, cloth);
    px.fillRect(3, 7, 8, 4, cloth);
    px.fillRect(2, 10, 2, 13, shade);
    px.hLine(3, 22, 18, name === "White Hoodie" ? hex("#9A9A9A") : BLACK);
    px.set(6, 26, GOLD);
    return;
  }

  if (name.endsWith("Beanie")) {
    const c = beanieColor(name);
    px.fillRect(8, 5, 14, 5, c);
    px.fillRect(9, 4, 12, 2, c);
    px.fillRect(20, 5, 3, 3, mix(c, WHITE, 0.3));
    px.hLine(8, 9, 14, mix(c, BLACK, 0.25));
    return;
  }

  if (name === "Cowboy Hat") {
    const hat = hex("#8B5A2B");
    px.fillRect(4, 7, 22, 2, hat);
    px.fillRect(9, 3, 12, 5, hat);
    px.fillRect(10, 2, 10, 2, hex("#6B3F1D"));
    return;
  }

  if (name === "Baseball Cap") {
    const cap = hex("#2B6CB0");
    px.fillRect(8, 5, 14, 4, cap);
    px.fillRect(19, 7, 8, 2, hex("#1D4E89"));
    return;
  }

  if (name === "Bandana") {
    px.fillRect(8, 8, 13, 3, RED);
    px.fillRect(3, 9, 5, 3, RED);
    px.set(3, 12, RED);
    return;
  }

  if (name === "Flower") {
    px.fillRect(2, 9, 4, 4, PINK);
    px.set(4, 10, GOLD);
    px.set(1, 10, hex("#3DDC84"));
    px.set(6, 12, hex("#3DDC84"));
    return;
  }

  if (name === "Viking Helm") {
    px.fillRect(8, 5, 14, 6, SILVER);
    px.fillRect(7, 7, 16, 3, hex("#8A949C"));
    px.fillRect(9, 1, 3, 5, SILVER);
    px.fillRect(19, 1, 3, 5, SILVER);
    return;
  }

  if (name === "Wizard Hat") {
    const hat = hex("#5B2C91");
    px.fillRect(11, 0, 5, 3, hat);
    px.fillRect(9, 3, 9, 3, hat);
    px.fillRect(7, 6, 14, 3, hat);
    px.set(13, 1, GOLD);
    return;
  }

  if (name === "Headphones") {
    px.fillRect(5, 10, 4, 7, BLACK);
    px.fillRect(20, 10, 4, 7, BLACK);
    px.hLine(8, 6, 13, BLACK);
    px.vLine(8, 6, 5, BLACK);
    px.vLine(20, 6, 5, BLACK);
    px.fillRect(5, 11, 4, 5, hex("#3A3A3A"));
    px.fillRect(20, 11, 4, 5, hex("#3A3A3A"));
    return;
  }

  if (name === "Crown") {
    px.fillRect(9, 4, 13, 4, GOLD);
    px.set(9, 3, GOLD);
    px.set(12, 2, GOLD);
    px.set(16, 2, GOLD);
    px.set(21, 3, GOLD);
    px.set(13, 5, RED);
    px.set(17, 5, CYAN);
    return;
  }

  if (name === "Halo") {
    const y = hex("#FFE566");
    px.hLine(9, 1, 13, y);
    px.hLine(10, 0, 11, y);
    px.hLine(10, 2, 11, mix(y, hex("#D4A017"), 0.4));
  }
}

function drawMouth(px, name) {
  if (name === "None") {
    px.hLine(20, 19, 4, BLACK);
    return;
  }
  if (name === "Smile") {
    px.set(20, 19, BLACK);
    px.set(21, 20, BLACK);
    px.set(22, 20, BLACK);
    px.set(23, 19, BLACK);
    return;
  }
  if (name === "Tongue") {
    px.hLine(20, 19, 4, BLACK);
    px.fillRect(22, 20, 3, 3, hex("#FF6BA8"));
    return;
  }
  if (name === "Gold Grill") {
    px.hLine(20, 19, 5, GOLD);
    px.set(21, 20, GOLD);
    px.set(23, 20, GOLD);
    return;
  }
  if (name === "Bubblegum") {
    px.hLine(20, 19, 3, BLACK);
    px.fillRect(26, 14, 5, 5, PINK);
    px.fillRect(27, 15, 3, 3, hex("#FF8FAB"));
    return;
  }
  if (name === "Cigarette") {
    px.hLine(20, 19, 3, BLACK);
    px.hLine(27, 18, 5, WHITE);
    px.set(32 - 1, 18, hex("#C4A574"));
    px.set(31, 18, RED);
    px.set(31, 17, hex("#FF7A18"));
    return;
  }
  if (name === "Cigar") {
    px.hLine(20, 19, 3, BLACK);
    px.fillRect(26, 17, 6, 2, hex("#5C3A1A"));
    px.set(31, 17, hex("#FF7A18"));
    px.set(31, 16, hex("#888888"));
    return;
  }
  if (name === "Pipe") {
    px.hLine(20, 19, 3, BLACK);
    px.hLine(26, 19, 4, WOOD);
    px.fillRect(29, 16, 3, 4, WOOD);
    px.set(30, 15, hex("#888888"));
    return;
  }
  if (name === "Wheat Straw") {
    px.hLine(20, 19, 3, BLACK);
    px.hLine(26, 20, 6, hex("#E4C56A"));
    px.set(31, 19, hex("#E4C56A"));
  }
}

function drawAccessory(px, name) {
  if (name === "None") return;

  if (name === "Wings") {
    px.fillRect(0, 16, 5, 11, WHITE);
    px.fillRect(1, 15, 3, 2, WHITE);
    px.set(0, 18, hex("#D0D0D0"));
    px.set(2, 20, hex("#D0D0D0"));
    px.set(1, 24, hex("#D0D0D0"));
    px.fillRect(0, 21, 4, 1, hex("#C8C8C8"));
    return;
  }

  if (name === "Gold Nose Ring" || name === "Silver Nose Ring") {
    const c = name.startsWith("Gold") ? GOLD : SILVER;
    px.set(28, 17, c);
    px.set(29, 18, c);
    px.set(29, 19, c);
    px.set(28, 20, c);
    return;
  }

  if (name === "Cow Bell") {
    px.fillRect(13, 25, 5, 4, GOLD);
    px.hLine(14, 24, 3, hex("#B8860B"));
    px.set(15, 29, hex("#B8860B"));
    return;
  }

  if (name === "Gold Chain") {
    for (let x = 8; x <= 19; x += 2) px.set(x, 22, GOLD);
    for (let x = 9; x <= 18; x += 2) px.set(x, 23, GOLD);
    return;
  }

  if (name === "Earring") {
    px.set(3, 14, GOLD);
    px.set(3, 15, GOLD);
    px.set(2, 16, GOLD);
    return;
  }

  if (name === "Scarf") {
    px.fillRect(6, 21, 15, 3, hex("#E23A3A"));
    px.fillRect(17, 24, 3, 6, hex("#E23A3A"));
    return;
  }

  if (name === "Bowtie") {
    px.fillRect(11, 22, 4, 3, hex("#1D3557"));
    px.fillRect(16, 22, 4, 3, hex("#1D3557"));
    px.fillRect(14, 23, 3, 2, GOLD);
    return;
  }

  if (name === "Medal") {
    px.vLine(14, 22, 4, GOLD);
    px.fillRect(13, 26, 3, 3, hex("#E23A3A"));
    px.set(14, 27, GOLD);
    return;
  }

  if (name === "Butterfly") {
    px.set(2, 8, PINK);
    px.set(4, 8, CYAN);
    px.set(3, 9, BLACK);
    px.set(2, 10, PINK);
    px.set(4, 10, CYAN);
  }
}

function renderCow(dna) {
  const px = new Pixels(32);
  drawBackground(px, dna.Background);
  if (dna.Accessory === "Wings") drawAccessory(px, "Wings");
  drawBody(px, dna.Fur);
  drawHeadwear(px, dna.Headwear);
  drawHorns(px, dna.Horns);
  drawEyes(px, dna.Eyes, dna.Fur);
  drawMouth(px, dna.Mouth);
  if (dna.Accessory !== "Wings") drawAccessory(px, dna.Accessory);
  return px;
}

function renderLayer(layer, name) {
  const px = new Pixels(32);
  if (layer === "Background") drawBackground(px, name);
  else if (layer === "Fur") drawBody(px, name);
  else if (layer === "Horns") drawHorns(px, name);
  else if (layer === "Headwear") drawHeadwear(px, name);
  else if (layer === "Eyes") drawEyes(px, name, "Cream");
  else if (layer === "Mouth") drawMouth(px, name);
  else if (layer === "Accessory") drawAccessory(px, name);
  return px;
}

module.exports = { renderCow, renderLayer, BG, FUR };
