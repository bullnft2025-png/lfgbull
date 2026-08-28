const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const CHAR = path.join(ROOT, "web", "public", "characters");
const DIR = path.join(__dirname, "trailer");
const SHOTS = path.join(DIR, "shots");
const CLIPS = path.join(DIR, "clips");
const FFMPEG =
  process.env.FFMPEG ||
  path.join(
    process.env.LOCALAPPDATA,
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe"
  );
const ASSETS = path.join(
  process.env.USERPROFILE,
  ".cursor/projects/c-Users-User-Documents-pineapple-resume/assets"
);

const W = 1920;
const H = 1080;
const GOLD = "#c9a24a";
const INK = { r: 10, g: 5, b: 7 };

function run(args) {
  const res = spawnSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
    windowsHide: true,
  });
  if (res.status !== 0) throw new Error(`ffmpeg failed: ${args.slice(0, 6).join(" ")}`);
}

async function plate(name, dest) {
  const src = path.join(ASSETS, name);
  if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
  await sharp(src).resize(W, H, { fit: "cover" }).jpeg({ quality: 92 }).toFile(dest);
}

async function portrait(file, dest) {
  const inner = 700;
  const art = await sharp(path.join(CHAR, file))
    .resize(inner, inner, { kernel: "nearest", fit: "fill" })
    .png()
    .toBuffer();
  const frame = 760;
  const left = Math.round((W - frame) / 2);
  const top = Math.round((H - frame) / 2);
  const svg = Buffer.from(`<svg width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#0a0507"/>
    <rect x="${left}" y="${top}" width="${frame}" height="${frame}" fill="${GOLD}"/>
    <rect x="${left + 10}" y="${top + 10}" width="${frame - 20}" height="${frame - 20}" fill="#1a1008"/>
  </svg>`);
  await sharp(svg)
    .composite([{ input: art, left: left + 30, top: top + 30 }])
    .jpeg({ quality: 92 })
    .toFile(dest);
}

async function card(lines, dest, size = 120) {
  const tspans = lines
    .map((line, i) => `<text x="960" y="${540 - (lines.length - 1) * 70 + i * 140}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${i === 0 ? size : 48}" fill="${GOLD}" letter-spacing="${i === 0 ? 18 : 10}">${line}</text>`)
    .join("");
  const svg = Buffer.from(`<svg width="${W}" height="${H}">
    <rect width="${W}" height="${H}" fill="#0a0507"/>
    ${tspans}
  </svg>`);
  await sharp(svg).jpeg({ quality: 94 }).toFile(dest);
}

function clip(src, dest, seconds, zoom = false) {
  const frames = Math.max(4, Math.round(seconds * 30));
  if (zoom) {
    run([
      "-loop",
      "1",
      "-i",
      src,
      "-vf",
      `scale=2400:1350,zoompan=z='min(1.12\\,1.0+0.003*on)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=30`,
      "-frames:v",
      String(frames),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      dest,
    ]);
    return;
  }
  run([
    "-loop",
    "1",
    "-framerate",
    "30",
    "-t",
    String(seconds),
    "-i",
    src,
    "-vf",
    `scale=${W}:${H}`,
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    dest,
  ]);
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  fs.mkdirSync(CLIPS, { recursive: true });

  await plate("trailer-hall.png", path.join(SHOTS, "hall.jpg"));
  await plate("trailer-candle.png", path.join(SHOTS, "candle.jpg"));
  await plate("trailer-door.png", path.join(SHOTS, "door.jpg"));
  await plate("trailer-seal.png", path.join(SHOTS, "seal.jpg"));
  await plate("trailer-burst.png", path.join(SHOTS, "burst.jpg"));
  await plate("trailer-out.png", path.join(SHOTS, "out.jpg"));
  await plate("trailer-frames.png", path.join(SHOTS, "frames.jpg"));
  await plate("trailer-crown.png", path.join(SHOTS, "crown.jpg"));

  const faces = [
    "cow-person-holstein-pink-goggles.png",
    "cow-new-gold-grill.png",
    "cow-new-viking.png",
    "cow-new-wizard.png",
    "cow-rare-laser-eyes.png",
    "cow-rare-crown-king.png",
    "cow-rare-rainbow-horns.png",
    "cow-rare-diamond.png",
    "cow-rare-alien.png",
    "cow-rare-halo-wings.png",
  ];
  for (let i = 0; i < faces.length; i++) {
    await portrait(faces[i], path.join(SHOTS, `face-${i}.jpg`));
  }

  await card(["BULL"], path.join(SHOTS, "title-bull.jpg"), 180);
  await card(["0.0004 ETH"], path.join(SHOTS, "title-eth.jpg"), 110);
  await card(["10%"], path.join(SHOTS, "title-ten.jpg"), 200);
  await card(["BULL", "a nocturnal gallery"], path.join(SHOTS, "title-end.jpg"), 160);

  const black = path.join(SHOTS, "black.jpg");
  await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
    .jpeg()
    .toFile(black);

  const timeline = [
    [black, 0.18, false],
    [path.join(SHOTS, "candle.jpg"), 0.55, true],
    [path.join(SHOTS, "hall.jpg"), 0.7, true],
    [path.join(SHOTS, "frames.jpg"), 0.4, true],
    ...faces.map((_, i) => [path.join(SHOTS, `face-${i}.jpg`), i === 5 ? 0.38 : 0.16, false]),
    [path.join(SHOTS, "title-ten.jpg"), 0.38, false],
    [path.join(SHOTS, "out.jpg"), 0.4, true],
    [path.join(SHOTS, "burst.jpg"), 0.45, true],
    [path.join(SHOTS, "crown.jpg"), 0.4, true],
    [path.join(SHOTS, "seal.jpg"), 0.45, true],
    [path.join(SHOTS, "door.jpg"), 0.55, true],
    [path.join(SHOTS, "title-bull.jpg"), 0.9, false],
    [path.join(SHOTS, "title-end.jpg"), 1.35, false],
    [black, 0.25, false],
  ];

  const list = [];
  for (let i = 0; i < timeline.length; i++) {
    const [src, sec, zoom] = timeline[i];
    const dest = path.join(CLIPS, `c${String(i).padStart(2, "0")}.mp4`);
    clip(src, dest, sec, zoom);
    list.push(`file '${dest.replace(/\\/g, "/")}'`);
  }
  const concat = path.join(DIR, "concat.txt");
  fs.writeFileSync(concat, `${list.join("\n")}\n`);

  const silent = path.join(DIR, "silent.mp4");
  run(["-f", "concat", "-safe", "0", "-i", concat, "-c", "copy", silent]);

  const audio = path.join(DIR, "score.wav");
  run([
    "-f",
    "lavfi",
    "-i",
    "anoisesrc=color=brown:amplitude=0.5:duration=14",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=48:duration=14",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=92:duration=14",
    "-filter_complex",
    "[0]lowpass=f=90,volume=0.55[r];[1]volume=0.12[a];[2]volume=0.05[b];[r][a][b]amix=inputs=3:normalize=0,afade=t=in:st=0:d=0.4,afade=t=out:st=11.5:d=1.8",
    audio,
  ]);

  const out = path.join(__dirname, "BULL-trailer.mp4");
  run([
    "-i",
    silent,
    "-i",
    audio,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-shortest",
    "-movflags",
    "+faststart",
    out,
  ]);

  console.log(`Wrote ${out}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
