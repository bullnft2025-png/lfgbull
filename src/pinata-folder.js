const fs = require("fs");
const path = require("path");
const https = require("https");
const { PassThrough } = require("stream");

function write(stream, data) {
  return new Promise((resolve, reject) => {
    if (stream.write(data)) resolve();
    else stream.once("drain", resolve);
    stream.once("error", reject);
  });
}

function pipeFile(out, filePath) {
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(filePath);
    rs.on("error", reject);
    rs.on("end", resolve);
    rs.pipe(out, { end: false });
  });
}

function partHeader(boundary, name, filename, type) {
  const disp = filename
    ? `form-data; name="${name}"; filename="${filename}"`
    : `form-data; name="${name}"`;
  const extra = type ? `Content-Type: ${type}\r\n` : "";
  return `--${boundary}\r\nContent-Disposition: ${disp}\r\n${extra}\r\n`;
}

async function pinFolder(dir, jwt, { name, prefix, ext, mime }) {
  const files = fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(ext))
    .sort((a, b) => {
      const na = Number.parseInt(a, 10);
      const nb = Number.parseInt(b, 10);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return a.localeCompare(b);
    });
  if (!files.length) throw new Error(`No ${ext} files in ${dir}`);

  const boundary = `----bull${Date.now()}${Math.random().toString(16).slice(2)}`;
  const metadata = JSON.stringify({ name });
  const options = JSON.stringify({ cidVersion: 1 });
  let length = 0;
  const sizes = [];
  for (const file of files) {
    const header = partHeader(boundary, "file", `${prefix}/${file}`, mime);
    const size = fs.statSync(path.join(dir, file)).size;
    sizes.push(size);
    length += Buffer.byteLength(header) + size + 2;
  }
  const metaPart = partHeader(boundary, "pinataMetadata") + metadata + "\r\n";
  const optPart = partHeader(boundary, "pinataOptions") + options + "\r\n";
  const closer = `--${boundary}--\r\n`;
  length += Buffer.byteLength(metaPart) + Buffer.byteLength(optPart) + Buffer.byteLength(closer);

  console.log(`Streaming ${files.length} files to Pinata (${(length / (1024 * 1024)).toFixed(1)} MB)...`);

  const body = new PassThrough();

  const payload = await new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: "api.pinata.cloud",
        path: "/pinning/pinFileToIPFS",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": String(length),
        },
        timeout: 0,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`Pinata HTTP ${res.statusCode}: ${text.slice(0, 400)}`));
            return;
          }
          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error(`Pinata returned non-JSON: ${text.slice(0, 400)}`));
          }
        });
      }
    );
    req.on("error", reject);
    body.on("error", reject);
    body.pipe(req);
    (async () => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await write(body, partHeader(boundary, "file", `${prefix}/${file}`, mime));
        await pipeFile(body, path.join(dir, file));
        await write(body, "\r\n");
        if ((i + 1) % 500 === 0 || i + 1 === files.length) {
          console.log(`  packed ${i + 1}/${files.length}`);
        }
      }
      await write(body, metaPart);
      await write(body, optPart);
      await write(body, closer);
      body.end();
    })().catch(reject);
  });

  const cid = payload.IpfsHash;
  if (!cid) throw new Error("Pinata response missing IpfsHash");
  return cid;
}

module.exports = { pinFolder };
