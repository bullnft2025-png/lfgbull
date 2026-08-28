const fs = require("fs");
const path = require("path");

const TUS_ENDPOINT = "https://uploads.pinata.cloud/v3/files";
const CHUNK = 32 * 1024 * 1024;

function encodeMeta(pairs) {
  return Object.entries(pairs)
    .map(([key, value]) => `${key} ${Buffer.from(String(value)).toString("base64")}`)
    .join(",");
}

async function fetchWithTimeout(url, options, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function headOffset(url, jwt) {
  const res = await fetchWithTimeout(
    url,
    {
      method: "HEAD",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Tus-Resumable": "1.0.0",
      },
    },
    30000
  );
  if (!res.ok) return null;
  const offset = Number(res.headers.get("Upload-Offset"));
  return Number.isFinite(offset) ? offset : null;
}

async function tusUploadFile(filePath, jwt, { filename, filetype, car, statePath }) {
  const size = fs.statSync(filePath).size;
  const stateFile = statePath || `${filePath}.tus.json`;
  let url = null;
  let offset = 0;

  if (fs.existsSync(stateFile)) {
    try {
      const saved = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      if (saved.url && saved.size === size) {
        const resumed = await headOffset(saved.url, jwt);
        if (resumed != null && resumed < size) {
          url = saved.url;
          offset = resumed;
          console.log(`Resuming TUS at ${(offset / (1024 * 1024)).toFixed(1)} MB`);
        } else if (resumed === size) {
          url = saved.url;
          offset = size;
          console.log("TUS session already complete, fetching CID...");
        }
      }
    } catch {
      /* start fresh */
    }
  }

  if (!url) {
    const metadata = { filename, filetype, network: "public" };
    if (car) metadata.car = "true";
    const create = await fetchWithTimeout(
      TUS_ENDPOINT,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Tus-Resumable": "1.0.0",
          "Upload-Length": String(size),
          "Upload-Metadata": encodeMeta(metadata),
        },
      },
      60000
    );
    url = create.headers.get("Location");
    if (!url) {
      const body = await create.text();
      throw new Error(`TUS create failed (${create.status}): ${body.slice(0, 500)}`);
    }
    offset = 0;
    fs.writeFileSync(stateFile, JSON.stringify({ url, size, filename }, null, 2));
    console.log(`TUS session started, ${(size / (1024 * 1024)).toFixed(1)} MB`);
  }

  const fd = fs.openSync(filePath, "r");
  let last = null;
  try {
    while (offset < size) {
      const len = Math.min(CHUNK, size - offset);
      const buf = Buffer.allocUnsafe(len);
      const read = fs.readSync(fd, buf, 0, len, offset);
      if (read !== len) throw new Error(`Short read at offset ${offset}`);

      let attempt = 0;
      for (;;) {
        attempt++;
        try {
          last = await fetchWithTimeout(
            url,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${jwt}`,
                "Tus-Resumable": "1.0.0",
                "Content-Type": "application/offset+octet-stream",
                "Upload-Offset": String(offset),
              },
              body: buf,
            },
            10 * 60 * 1000
          );
        } catch (err) {
          if (attempt >= 8) throw err;
          const wait = Math.min(2000 * 2 ** (attempt - 1), 30000);
          console.log(`  network retry ${attempt}: ${err.message}`);
          await new Promise((r) => setTimeout(r, wait));
          const resumed = await headOffset(url, jwt);
          if (resumed != null) offset = resumed;
          if (offset >= size) break;
          continue;
        }

        if (last.ok) {
          const reported = Number(last.headers.get("Upload-Offset"));
          offset = Number.isFinite(reported) && reported > offset ? reported : offset + len;
          break;
        }

        const errText = await last.text().catch(() => "");
        if (last.status === 409 || last.status === 404) {
          const resumed = await headOffset(url, jwt);
          if (resumed === size) {
            offset = size;
            break;
          }
          if (resumed != null && resumed !== offset) {
            console.log(`  server offset is ${(resumed / (1024 * 1024)).toFixed(1)} MB, syncing`);
            offset = resumed;
            break;
          }
        }
        if (attempt >= 8) {
          throw new Error(`TUS PATCH ${last.status} at ${offset}: ${errText.slice(0, 400)}`);
        }
        const wait = Math.min(2000 * 2 ** (attempt - 1), 30000);
        console.log(`  retry ${attempt} after ${last.status}, wait ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
      }

      const pct = ((Math.min(offset, size) / size) * 100).toFixed(1);
      console.log(`  ${pct}%  ${(Math.min(offset, size) / 1024 / 1024).toFixed(0)}/${(size / 1024 / 1024).toFixed(0)} MB`);
    }
  } finally {
    fs.closeSync(fd);
  }

  const cid =
    last?.headers.get("upload-cid") ||
    last?.headers.get("Upload-Cid") ||
    (await lookupCid(jwt, filename));
  if (cid) {
    try {
      fs.unlinkSync(stateFile);
    } catch {
      /* ignore */
    }
    return cid;
  }
  throw new Error("Upload finished but Pinata did not return a CID yet. Check Files in the Pinata dashboard.");
}

async function lookupCid(jwt, filename) {
  await new Promise((r) => setTimeout(r, 4000));
  const listed = await fetch(`https://api.pinata.cloud/v3/files/public?name=${encodeURIComponent(filename)}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  if (!listed.ok) return null;
  const json = await listed.json();
  const files = json?.data?.files || json?.data || [];
  const row = Array.isArray(files) ? files[0] : null;
  return row?.cid || null;
}

module.exports = { tusUploadFile };
