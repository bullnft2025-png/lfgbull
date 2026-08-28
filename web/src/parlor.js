import { REVEALED, boxSrc } from "./reveal.js";

const FLOOR_MAX = 12;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function keyOf(holder, kind) {
  return holder.id ? `${kind}-${holder.id}` : `${kind}-${holder.file}`;
}

function speedOf(holder, kind) {
  if (kind === "ghost") return 11;
  if (holder.tier === "legendary") return 9;
  if (holder.tier === "rare") return 13;
  return 17;
}

function pickWander(actor) {
  if (actor.kind === "ghost") {
    actor.tx = 12 + Math.random() * 76;
    actor.tz = 0.06 + Math.random() * 0.5;
    return;
  }
  if (actor.holder.tier === "legendary") {
    actor.tx = 24 + Math.random() * 52;
    actor.tz = 0.08 + Math.random() * 0.28;
    return;
  }
  actor.tx = 10 + Math.random() * 80;
  actor.tz = 0.18 + Math.random() * 0.72;
}

function cutoutSrc(file) {
  return `/cutouts/${file}`;
}

function faceSrc(holder) {
  if (!REVEALED && holder.tier) return boxSrc(holder.tier);
  return cutoutSrc(holder.file);
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function actorHtml(actor) {
  const h = actor.holder;
  const yours = actor.kind === "yours";
  const label = h.id ? `BULL #${h.id}` : h.name;
  const tokenAttr = h.id ? `data-token="${h.id}"` : "";
  return `
    <button type="button" class="parlor-actor ${actor.kind} ${h.tier || ""}" data-key="${actor.key}" ${tokenAttr} data-file="${h.file}" data-name="${esc(h.name)}" data-tier="${h.tier}" data-inv="${esc(h.inv || "")}" data-lore="${esc(h.lore || "")}" data-ghost="${yours ? "0" : "1"}" aria-label="${esc(label)}">
      <span class="parlor-shadow"></span>
      <span class="parlor-face">
        <span class="parlor-bob">
          <img src="${faceSrc(h)}" alt="" draggable="false" onerror="this.onerror=null;this.src='${REVEALED ? `/characters/${h.file}` : faceSrc(h)}'" />
        </span>
      </span>
      <span class="parlor-tag">${label}</span>
    </button>`;
}

function pickYours(holdings) {
  const rank = { legendary: 0, rare: 1, common: 2 };
  return [...holdings]
    .sort((a, b) => (rank[a.tier] ?? 3) - (rank[b.tier] ?? 3) || (a.id || 0) - (b.id || 0))
    .slice(0, FLOOR_MAX);
}

export function createParlor({ stage, onInspect, onFootstep }) {
  const byKey = new Map();
  let actors = [];
  let raf = 0;
  let last = 0;
  let running = false;

  function layout(actor) {
    const el = actor.el;
    if (!el) return;
    const scale = 0.52 + actor.z * 0.58;
    el.style.left = `${actor.x}%`;
    el.style.bottom = `${7 + (1 - actor.z) * 38}%`;
    el.style.zIndex = String(10 + Math.round(actor.z * 80));
    el.style.setProperty("--depth", String(scale));
    const face = el.querySelector(".parlor-face");
    if (face) face.style.transform = `scaleX(${actor.facing})`;
    el.classList.toggle("is-walk", actor.walking);
  }

  function bindEls() {
    const els = [...stage.querySelectorAll(".parlor-actor")];
    for (const actor of actors) {
      actor.el = els.find((el) => el.dataset.key === actor.key) || null;
      layout(actor);
    }
  }

  function rebuild() {
    stage.innerHTML = actors.map(actorHtml).join("");
    bindEls();
  }

  function pointFromEvent(e) {
    const rect = stage.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / Math.max(1, rect.width)) * 100, 8, 92);
    const y = clamp((e.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
    const z = clamp((y - 0.22) / 0.7, 0.06, 0.98);
    return { x, z };
  }

  function callTo(x, z, onlyKey) {
    const now = performance.now();
    let n = 0;
    for (const actor of actors) {
      if (actor.kind !== "yours") continue;
      if (onlyKey && actor.key !== onlyKey) continue;
      const spread = onlyKey ? 0 : n * 5.5 - 4;
      actor.tx = clamp(x + spread, 8, 92);
      actor.tz = clamp(z + (onlyKey ? 0 : (n % 3) * 0.04), 0.06, 0.98);
      actor.pauseUntil = now + n * 90;
      actor.called = true;
      n += 1;
    }
    if (n && onFootstep) onFootstep();
  }

  function setCast(holdings, guests) {
    const next = [];
    const yours = pickYours(holdings);
    for (const holder of yours) {
      const key = keyOf(holder, "yours");
      const prev = byKey.get(key);
      next.push(
        prev
          ? { ...prev, holder, kind: "yours", key }
          : {
              key,
              holder,
              kind: "yours",
              x: 18 + Math.random() * 64,
              z: holder.tier === "legendary" ? 0.16 + Math.random() * 0.18 : 0.35 + Math.random() * 0.5,
              facing: Math.random() < 0.5 ? 1 : -1,
              tx: null,
              tz: null,
              pauseUntil: performance.now() + 400 + Math.random() * 1200,
              walking: false,
              called: false,
              speed: speedOf(holder, "yours"),
              el: null,
            }
      );
    }
    for (const holder of guests) {
      const key = keyOf(holder, "ghost");
      const prev = byKey.get(key);
      next.push(
        prev
          ? { ...prev, holder, kind: "ghost", key }
          : {
              key,
              holder,
              kind: "ghost",
              x: 12 + Math.random() * 76,
              z: 0.08 + Math.random() * 0.42,
              facing: Math.random() < 0.5 ? 1 : -1,
              tx: null,
              tz: null,
              pauseUntil: performance.now() + Math.random() * 1800,
              walking: false,
              called: false,
              speed: speedOf(holder, "ghost"),
              el: null,
            }
      );
    }
    actors = next;
    byKey.clear();
    for (const actor of actors) byKey.set(actor.key, actor);
    rebuild();
  }

  function separate(dt) {
    for (let i = 0; i < actors.length; i++) {
      for (let j = i + 1; j < actors.length; j++) {
        const a = actors[i];
        const b = actors[j];
        const dx = a.x - b.x;
        const dz = (a.z - b.z) * 70;
        const d2 = dx * dx + dz * dz;
        if (d2 < 36 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = ((6 - d) / d) * 8 * dt;
          a.x = clamp(a.x + (dx / d) * push, 8, 92);
          b.x = clamp(b.x - (dx / d) * push, 8, 92);
        }
      }
    }
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    for (const actor of actors) {
      if (now < actor.pauseUntil) {
        actor.walking = false;
        layout(actor);
        continue;
      }
      if (actor.tx == null) {
        pickWander(actor);
      }
      const dx = actor.tx - actor.x;
      const dz = actor.tz - actor.z;
      const dist = Math.hypot(dx, dz * 70);
      if (dist < 1.4) {
        actor.x = actor.tx;
        actor.z = actor.tz;
        actor.tx = null;
        actor.tz = null;
        actor.walking = false;
        actor.pauseUntil = now + (actor.called ? 1600 : 900 + Math.random() * 2800);
        actor.called = false;
        layout(actor);
        continue;
      }
      if (Math.abs(dx) > 0.4) actor.facing = dx >= 0 ? 1 : -1;
      const ratio = Math.min(1, (actor.speed * dt) / dist);
      actor.x = clamp(actor.x + dx * ratio, 6, 94);
      actor.z = clamp(actor.z + dz * ratio, 0.04, 0.99);
      actor.walking = true;
      layout(actor);
    }
    separate(dt);
    for (const actor of actors) layout(actor);
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  stage.addEventListener("click", (e) => {
    const btn = e.target.closest(".parlor-actor");
    if (btn) {
      e.stopPropagation();
      onInspect({
        id: btn.dataset.token ? Number(btn.dataset.token) : undefined,
        file: btn.dataset.file,
        name: btn.dataset.name,
        tier: btn.dataset.tier,
        inv: btn.dataset.inv,
        lore: btn.dataset.lore,
        ghost: btn.dataset.ghost === "1",
      });
      return;
    }
    const p = pointFromEvent(e);
    callTo(p.x, p.z);
  });

  return {
    setCast,
    start,
    stop,
    callKey(key) {
      const actor = byKey.get(key);
      if (!actor) return;
      callTo(50, 0.82, key);
    },
    floorMax: FLOOR_MAX,
  };
}
