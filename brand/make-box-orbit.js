const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const sharp = require("sharp");

const DIR = path.join(__dirname, "boxes");
const ASSETS = path.join(
  process.env.USERPROFILE,
  ".cursor/projects/c-Users-User-Documents-pineapple-resume/assets"
);
const FFMPEG =
  process.env.FFMPEG ||
  path.join(
    process.env.LOCALAPPDATA,
    "Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.1-full_build/bin/ffmpeg.exe"
  );

const SIZE = 960;
const COLORS = ["white", "violet", "gold"];
const ANGLES = ["closed", "a90", "a180", "a270"];

function run(args) {
  const res = spawnSync(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
    windowsHide: true,
  });
  if (res.status !== 0) throw new Error("ffmpeg failed");
}

function srcName(color, angle) {
  return angle === "closed" ? `bull-box-${color}-closed.png` : `bull-box-${color}-${angle}.png`;
}

async function plate(src, dest) {
  await sharp(src)
    .resize(SIZE, SIZE, { fit: "cover", background: { r: 0, g: 0, b: 0, alpha: 1 } })
    .jpeg({ quality: 94 })
    .toFile(dest);
}

(async () => {
  for (const color of COLORS) {
    const tmp = path.join(DIR, `_orbit-${color}`);
    fs.rmSync(tmp, { recursive: true, force: true });
    fs.mkdirSync(tmp, { recursive: true });
    const jpgs = [];
    for (let i = 0; i < ANGLES.length; i++) {
      const src = path.join(ASSETS, srcName(color, ANGLES[i]));
      if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
      const dest = path.join(tmp, `${i}.jpg`);
      await plate(src, dest);
      jpgs.push(dest);
    }
    await plate(path.join(ASSETS, srcName(color, "closed")), path.join(tmp, "4.jpg"));

    const silent = path.join(DIR, `box-${color}-spin.mp4`);
    const args = [];
    for (let i = 0; i < 5; i++) {
      args.push("-loop", "1", "-t", "1.85", "-i", path.join(tmp, `${i}.jpg`));
    }
    args.push(
      "-filter_complex",
      "[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1:a=0,scale=960:960,fps=24,format=yuv420p[v]",
      "-map",
      "[v]",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      silent
    );
    run(args);

    const withAudio = path.join(DIR, `box-${color}-spin-tmp.mp4`);
    const wav = path.join(DIR, `box-${color}.wav`);
    // reuse existing spin audio if present by mixing sine via ffmpeg
    run([
      "-i",
      silent,
      "-f",
      "lavfi",
      "-i",
      color === "gold"
        ? "sine=frequency=262:duration=8,volume=0.08"
        : color === "violet"
          ? "sine=frequency=392:duration=8,volume=0.07"
          : "sine=frequency=1319:duration=8,volume=0.05",
      "-f",
      "lavfi",
      "-i",
      "anoisesrc=color=brown:duration=8:amplitude=0.015",
      "-filter_complex",
      "[1:a][2:a]amix=inputs=2:duration=first,afade=t=in:st=0:d=0.4,afade=t=out:st=7.2:d=0.7[a]",
      "-map",
      "0:v",
      "-map",
      "[a]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-shortest",
      "-movflags",
      "+faststart",
      withAudio,
    ]);
    fs.renameSync(withAudio, silent);
    try {
      fs.unlinkSync(wav);
    } catch {
      /* none */
    }
    fs.rmSync(tmp, { recursive: true, force: true });

    await sharp(path.join(ASSETS, srcName(color, "closed")))
      .resize(SIZE, SIZE, { fit: "cover" })
      .png()
      .toFile(path.join(DIR, `box-${color}.png`));
    console.log("wrote", silent);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
