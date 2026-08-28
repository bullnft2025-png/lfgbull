import "./style.css";
import { createHallAudio } from "./audio.js";
import { TOKENS, SUPPLY } from "./catalog.js";
import { REVEALED, boxSrc, missSrc } from "./reveal.js";
import { createParlor } from "./parlor.js";
import { detectLang, I18N, saveLang } from "./i18n.js";
import {
  CHAIN_ERR,
  connectWallet,
  connectWithEthereum,
  formatEther,
  hasWallet,
  isInWalletApp,
  isMobile,
  listInjectedWallets,
  openInBinance,
  openInMetaMask,
  openInOkx,
  readDesk,
  sendPull,
  setAccountListener,
  tokensOf,
  loadGuestbook,
  readPublicMeters,
} from "./chain.js";

if (!REVEALED) document.documentElement.classList.add("sealed");

const CHARACTERS = [
  { file: "cow-person-holstein-pink-goggles.png", name: "Holstein Pink Goggles", tier: "common", inv: "BULL-I" },
  { file: "cow-person-blue-hood.png", name: "Blue Hood", tier: "common", inv: "BULL-II" },
  { file: "cow-person-black-hoodie.png", name: "Black Hoodie", tier: "common", inv: "BULL-III" },
  { file: "cow-person-brown-beanie.png", name: "Brown Beanie", tier: "common", inv: "BULL-IV" },
  { file: "cow-person-blue-gold-goggles.png", name: "Blue Gold Goggles", tier: "common", inv: "BULL-V" },
  { file: "cow-person-pink-blue-beanie.png", name: "Pink Blue Beanie", tier: "common", inv: "BULL-VI" },
  { file: "cow-person-white-hood-spots.png", name: "White Hood Spots", tier: "common", inv: "BULL-VII" },
  { file: "cow-person-red-pipe.png", name: "Red Pipe", tier: "common", inv: "BULL-VIII" },
  { file: "cow-person-gold.png", name: "Gold Smoke", tier: "rare", inv: "BULL-IX" },
  { file: "cow-person-gold-beanie.png", name: "Gold Beanie", tier: "rare", inv: "BULL-X" },
  { file: "cow-new-cowboy-bell.png", name: "Cowboy Bell", tier: "rare", inv: "BULL-XI" },
  { file: "cow-new-gold-grill.png", name: "Gold Grill", tier: "rare", inv: "BULL-XII" },
  { file: "cow-new-headphones.png", name: "Headphones", tier: "rare", inv: "BULL-XIII" },
  { file: "cow-new-viking.png", name: "Viking", tier: "rare", inv: "BULL-XIV" },
  { file: "cow-new-wizard.png", name: "Wizard", tier: "rare", inv: "BULL-XV" },
  { file: "cow-rare-crown-king.png", name: "Crown King", tier: "legendary", inv: "BULL-XVI" },
  { file: "cow-rare-laser-eyes.png", name: "Laser Eyes", tier: "legendary", inv: "BULL-XVII" },
  { file: "cow-rare-diamond.png", name: "Diamond", tier: "legendary", inv: "BULL-XVIII" },
  { file: "cow-rare-alien.png", name: "Alien", tier: "legendary", inv: "BULL-XIX" },
  { file: "cow-rare-zombie.png", name: "Zombie", tier: "legendary", inv: "BULL-XX" },
  { file: "cow-rare-halo-wings.png", name: "Halo Wings", tier: "legendary", inv: "BULL-XXI" },
  { file: "cow-rare-rainbow-horns.png", name: "Rainbow Horns", tier: "legendary", inv: "BULL-XXII" },
];

const TIER_WEIGHT = { common: 70, rare: 18, legendary: 4 };
const MAX_WALK = 2100;
const PRICE = 0.0004;
const MAX_QTY = 100;

const GUESTS = [
  { file: "cow-rare-crown-king.png", name: "Crown King", tier: "legendary", inv: "BULL-XVI", who: "0x7e41…c90a" },
  { file: "cow-rare-diamond.png", name: "Diamond", tier: "legendary", inv: "BULL-XVIII", who: "0xb2d0…11ef" },
  { file: "cow-new-wizard.png", name: "Wizard", tier: "rare", inv: "BULL-XV", who: "0x91aa…4402" },
  { file: "cow-new-gold-grill.png", name: "Gold Grill", tier: "rare", inv: "BULL-XII", who: "0x33f8…9c1b" },
  { file: "cow-person-holstein-pink-goggles.png", name: "Holstein Pink Goggles", tier: "common", inv: "BULL-I", who: "0xbe91…aa04" },
  { file: "cow-person-blue-hood.png", name: "Blue Hood", tier: "common", inv: "BULL-II", who: "0x8f2a…11c0" },
];

const audio = createHallAudio();
const state = {
  connected: false,
  address: "",
  minted: 0,
  pulls: 0,
  pulling: false,
  walk: 80,
  night: true,
  lang: detectLang(),
  holdings: [],
  guestbookRows: [],
  lastStepAt: 0,
  qty: 1,
  viewingHits: [],
  viewingIndex: 0,
  catalogId: 1,
  priceWei: 0n,
  owner: "",
  treasury: "",
};

const world = document.getElementById("world");
const hangings = document.getElementById("hangings");
const ghosts = document.getElementById("ghosts");
const decor = document.getElementById("decor");
const feed = document.getElementById("feed");
const walk = document.getElementById("walk");
const connectBtn = document.getElementById("connectBtn");
const pullBtn = document.getElementById("pullBtn");
const overlay = document.getElementById("overlay");
const inspect = document.getElementById("inspect");
const reelImg = document.getElementById("reelImg");
const reelStatus = document.getElementById("reelStatus");
const reelResult = document.getElementById("reelResult");
const whisper = document.getElementById("whisper");
const door = document.getElementById("secretDoor");
const salon = document.getElementById("salon");
const deny = document.getElementById("deny");
const muteBtn = document.getElementById("muteBtn");
const themeBtn = document.getElementById("themeBtn");
const langBtn = document.getElementById("langBtn");
const keyBadge = document.getElementById("keyBadge");

function pack() {
  const dict = I18N[state.lang] || I18N.zh;
  const theme = state.night ? dict.night : dict.day;
  return { ...dict, ...theme };
}

function characterLore(name) {
  return pack().lores[name] || "";
}

function guestLore(name) {
  return pack().guestLores[name] || characterLore(name);
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function walletDisplayName(wallet) {
  const p = pack();
  if (wallet.id === "binance" || wallet.name === "Binance") return p.walletBinance;
  if (wallet.name === "Browser wallet") return p.walletBrowser;
  if (wallet.name === "Wallet") return p.walletGeneric;
  return wallet.name;
}

function src(file) {
  if (!file) return "";
  if (file.startsWith("/") || file.startsWith("http")) return file;
  return `/characters/${file}`;
}

function tokenSrc(id) {
  return `/tokens/${id}.png`;
}

function cowSrc(cow) {
  if (!REVEALED && cow.tier) return boxSrc(cow.tier);
  if (cow.id) return tokenSrc(cow.id);
  return src(cow.file);
}

function imgTag(cow, extra = "") {
  const fallback = !REVEALED && cow.tier ? boxSrc(cow.tier) : src(cow.file);
  return `<img src="${cowSrc(cow)}" alt="${cow.name || ""}" ${extra} onerror="this.onerror=null;this.src='${fallback}'" />`;
}

function claimedIds() {
  return new Set(state.holdings.filter((h) => h.id).map((h) => h.id));
}

function tokenLore(token) {
  const p = pack();
  if (!REVEALED) return p.boxLore(token.tier);
  return p.tokenLore(token.character, token.background, token.grade, token.frame, characterLore(token.character));
}

function asHolding(token) {
  return {
    id: token.id,
    file: token.file,
    character: token.character,
    name: `BULL #${token.id}`,
    tier: token.tier,
    inv: `#${String(token.id).padStart(4, "0")}`,
    lore: tokenLore(token),
    background: token.background,
    grade: token.grade,
    frame: token.frame,
  };
}

function pickToken(taken = claimedIds()) {
  const pool = TOKENS.filter((t) => !taken.has(t.id));
  if (!pool.length) return null;
  let total = 0;
  for (const token of pool) total += TIER_WEIGHT[token.tier] || 1;
  let roll = Math.random() * total;
  for (const token of pool) {
    roll -= TIER_WEIGHT[token.tier] || 1;
    if (roll <= 0) return asHolding(token);
  }
  return asHolding(pool[pool.length - 1]);
}

function randomToken() {
  return TOKENS[Math.floor(Math.random() * TOKENS.length)];
}

function holdingFromId(id) {
  const token = TOKENS[id - 1];
  return token ? asHolding(token) : null;
}

function grantIfNew(cow) {
  if (!cow || state.holdings.some((h) => h.id === cow.id)) return;
  grantHolding(cow, true);
}

function txError(err) {
  const p = pack();
  const code = err?.code;
  const msg = err?.shortMessage || err?.reason || err?.message || String(err);
  if (code === CHAIN_ERR.NO_WALLET || msg === CHAIN_ERR.NO_WALLET) return p.errNoWallet;
  if (code === CHAIN_ERR.OPEN_IN_APP || msg === CHAIN_ERR.OPEN_IN_APP) return p.errOpenInApp;
  if (code === CHAIN_ERR.NOT_CONNECTED || msg === CHAIN_ERR.NOT_CONNECTED) return p.errNotConnected;
  if (code === CHAIN_ERR.GUESTBOOK || msg === CHAIN_ERR.GUESTBOOK) return p.errGuestbook;
  if (/user rejected|denied|ACTION_REJECTED/i.test(msg)) return p.errReject;
  if (/insufficient/i.test(msg)) return p.errFunds;
  return msg.replace(/^Error:\s*/, "").slice(0, 180);
}

function setRiteLook(tier) {
  overlay.classList.remove("rite-miss", "rite-common", "rite-rare", "rite-legendary");
  const frame = document.getElementById("revealFrame");
  frame.classList.remove("glow-miss", "glow-common", "glow-rare", "glow-legendary");
  if (!tier) return;
  overlay.classList.add(`rite-${tier}`);
  frame.classList.add(`glow-${tier}`);
}

function clearRite() {
  overlay.classList.remove("rite-play", "rite-miss", "rite-common", "rite-rare", "rite-legendary");
  document.getElementById("revealFrame").classList.remove("glow-miss", "glow-common", "glow-rare", "glow-legendary");
}

async function playRite(tier) {
  overlay.classList.remove("rite-play");
  void overlay.offsetWidth;
  overlay.classList.add("rite-play");
  const tease = (tier === "rare" || tier === "legendary") && Math.random() < 0.4;
  if (tease) {
    setRiteLook("common");
    reelStatus.textContent = pack().whiteTease;
    audio.rite("common");
    await sleep(430);
  }
  setRiteLook(tier);
  const p = pack();
  const line = {
    miss: p.lightMiss,
    common: p.lightCommon,
    rare: p.lightRare,
    legendary: p.lightLegendary,
  };
  reelStatus.textContent = line[tier] || p.lightCommon;
  audio.rite(tier);
  const wait = tier === "legendary" ? 1150 : tier === "rare" ? 820 : 520;
  await sleep(wait);
  overlay.classList.remove("rite-play");
}

function setReelImage(cow) {
  reelImg.style.filter = "";
  reelImg.onerror = () => {
    reelImg.onerror = null;
    reelImg.src = !REVEALED && cow.tier ? boxSrc(cow.tier) : src(cow.file);
  };
  reelImg.src = cowSrc(cow);
}

function showViewingHit(index) {
  const hits = state.viewingHits;
  if (!hits.length) return;
  const i = Math.max(0, Math.min(hits.length - 1, index));
  state.viewingIndex = i;
  const cow = hits[i];
  setReelImage(cow);
  setRiteLook(cow.tier);
  const p = pack();
  reelStatus.textContent =
    cow.tier === "legendary" ? p.lightLegendary : cow.tier === "rare" ? p.lightRare : p.lightCommon;
  document.getElementById("resultKicker").textContent =
    hits.length > 1 ? p.hitSwitch(i, hits.length) : p.hitEntered(hits.length);
  document.getElementById("resultTitle").textContent = cow.name;
  const lore = document.getElementById("resultLore");
  if (lore) lore.textContent = cow.lore || "";
  const strip = document.getElementById("hitStrip");
  [...strip.querySelectorAll("button")].forEach((btn, n) => {
    btn.classList.toggle("on", n === i);
  });
}

function renderHitStrip(hits) {
  const strip = document.getElementById("hitStrip");
  if (!hits.length) {
    strip.hidden = true;
    strip.innerHTML = "";
    return;
  }
  strip.innerHTML = hits
    .map(
      (c, i) =>
        `<button type="button" class="${c.tier}" data-i="${i}" aria-label="${c.name}">${imgTag(c, `alt="${c.name}"`)}</button>`
    )
    .join("");
  strip.hidden = false;
}

function hitIndexFromX(el, clientX, count) {
  if (count <= 1) return 0;
  const rect = el.getBoundingClientRect();
  const t = (clientX - rect.left) / Math.max(1, rect.width);
  return Math.max(0, Math.min(count - 1, Math.floor(t * count)));
}

function showCatalogToken(id) {
  const token = TOKENS[id - 1];
  if (!token) return;
  state.catalogId = id;
  const cow = asHolding(token);
  const img = document.getElementById("catalogImg");
  img.onerror = () => {
    img.onerror = null;
    img.src = cowSrc(cow);
  };
  img.src = cowSrc(cow);
  document.getElementById("catalogKicker").textContent = `#${String(id).padStart(4, "0")} / ${SUPPLY.toLocaleString()}`;
  document.getElementById("catalogTitle").textContent = cow.name;
  document.getElementById("catalogLore").textContent = REVEALED
    ? `${cow.character} · ${cow.background} / ${cow.grade} / ${cow.frame}`
    : pack().boxLabel(cow.tier);
  const needle = document.getElementById("catalogNeedle");
  needle.style.left = `${((id - 1) / (SUPPLY - 1)) * 100}%`;
  const next = TOKENS[id];
  if (next) {
    const preload = new Image();
    preload.src = cowSrc(next);
  }
}

function catalogIdFromX(el, clientX) {
  const rect = el.getBoundingClientRect();
  const t = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
  return 1 + Math.round(t * (SUPPLY - 1));
}

function openCatalog() {
  document.getElementById("catalog").hidden = false;
  showCatalogToken(state.catalogId || 1);
}

function closeCatalog() {
  document.getElementById("catalog").hidden = true;
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function canEnter() {
  return state.holdings.length > 0;
}

function hasLegendary() {
  return state.holdings.some((h) => h.tier === "legendary");
}

function setWhisper(text) {
  if (whisper.textContent === text) return;
  whisper.style.opacity = "0";
  setTimeout(() => {
    whisper.textContent = text;
    whisper.style.opacity = "0.78";
  }, 280);
}

function applyCopy(relayout = false) {
  const p = pack();
  document.documentElement.lang = p.htmlLang;
  document.title = p.title;
  document.getElementById("mastKicker").textContent = p.kicker;
  document.getElementById("walkLatin").textContent = p.latin;
  document.getElementById("walkLabel").textContent = p.walk;
  document.getElementById("walkHint").textContent = p.walkHint;
  document.getElementById("walkBack").setAttribute("aria-label", p.walkBack);
  document.getElementById("walkFwd").setAttribute("aria-label", p.walkFwd);
  document.getElementById("deskKicker").textContent = p.deskKicker;
  document.getElementById("deskTitle").textContent = p.deskTitle;
  document.getElementById("rulesBtn").textContent = p.rulesBtn;
  document.getElementById("rulesKicker").textContent = p.rulesKicker;
  document.getElementById("rulesTitle").textContent = p.rulesTitle;
  document.getElementById("closeRulesSheet").textContent = p.rulesClose;
  document.getElementById("deskSeal").textContent = p.seal;
  document.getElementById("ledgerKicker").textContent = p.ledgerKicker;
  document.getElementById("ledgerTitle").textContent = p.ledgerTitle;
  document.getElementById("modeBadge").textContent = p.badge;
  document.getElementById("closeInspect").textContent = p.inspectClose;
  document.getElementById("statOnce").textContent = p.statOnce;
  document.getElementById("statOdds").textContent = p.statOdds;
  document.getElementById("statLedger").textContent = p.statLedger;
  document.getElementById("qtyWord").textContent = p.qty;
  document.getElementById("qtyMinus").setAttribute("aria-label", p.qtyMinus);
  document.getElementById("qtyPlus").setAttribute("aria-label", p.qtyPlus);
  document.getElementById("qtyTotalPrefix").textContent = p.qtyTotal;
  document.getElementById("ledgerNote").textContent = p.ledgerNote;
  document.getElementById("salonKicker").textContent = p.salonKicker;
  document.getElementById("salonTitle").textContent = p.salonTitle;
  document.getElementById("salonCopy").textContent = p.salonCopy;
  document.getElementById("parlorHint").textContent = p.parlorHint;
  document.getElementById("parlorStage").setAttribute("aria-label", p.parlorAria);
  document.getElementById("yourSeatsTitle").textContent = p.yourSeats;
  document.getElementById("leaveSalon").textContent = p.leaveSalon;
  document.getElementById("doorHint").textContent = p.doorEnter;
  document.getElementById("doorHint").setAttribute("aria-label", p.doorAria);
  document.getElementById("catalogBtn").textContent = p.catalogBtn;
  document.getElementById("catalogStatus").textContent = p.catalogStatus;
  document.getElementById("closeCatalog").textContent = p.catalogClose;
  document.getElementById("closeReel").textContent = p.closeReel;
  document.getElementById("walletTitle").textContent = p.walletTitle;
  document.getElementById("walletCopy").textContent = p.walletCopy;
  document.getElementById("walletBinance").textContent = p.walletBinance;
  document.getElementById("closeWalletSheet").textContent = p.walletCancel;
  document.getElementById("rulesList").innerHTML = p.rulesHtml.map((item) => `<li>${item}</li>`).join("");
  langBtn.textContent = p.langBtn;
  langBtn.title = p.langBtnTitle;
  themeBtn.textContent = p.themeBtn;
  muteBtn.textContent = audio.muted || !audio.ready ? p.muteOn : p.muteOff;
  if (!state.connected) connectBtn.textContent = p.connect;
  if (!keyBadge.hidden) keyBadge.textContent = hasLegendary() ? p.keyLoge : p.keyAdmit;
  if (!state.pulling && overlay.hidden) {
    document.getElementById("reelStatus").textContent = p.reelReview;
  }
  if (!overlay.hidden && !reelResult.hidden && !state.viewingHits.length) {
    document.getElementById("resultTitle").textContent = p.missTitle;
  }
  const injectedBtn = document.getElementById("injectedWalletBtn");
  const wallets = listInjectedWallets();
  injectedBtn.textContent =
    !document.getElementById("walletSheet").hidden && wallets.length === 1
      ? walletDisplayName(wallets[0])
      : p.walletInjected;
  refreshMeters();
  if (relayout) {
    syncHoldingLore();
    renderGallery();
    setWalk(state.walk);
    renderSalon();
    if (state.guestbookRows.length) renderGuestbook(state.guestbookRows);
    else showEmptyFeed();
    if (state.viewingHits.length) {
      state.viewingHits = state.viewingHits.map((h) => (h.id ? holdingFromId(h.id) || h : h));
      showViewingHit(state.viewingIndex);
    }
    if (!inspect.hidden && inspecting) {
      const next = { ...inspecting };
      if (next.ghost) {
        next.name = p.ghostName;
        next.lore = p.ghostLore;
      } else if (next.id) {
        const held = holdingFromId(next.id);
        if (held) {
          next.lore = held.lore;
          next.name = held.name;
        }
      } else {
        next.lore = characterLore(next.name) || guestLore(next.name) || next.lore;
      }
      openInspect(next);
    }
  }
  const line = [...p.whisper].reverse().find(([at]) => state.walk >= at);
  if (line) setWhisper(line[1]);
}

function applyTheme() {
  const p = pack();
  document.body.classList.toggle("day", !state.night);
  const h = String(Math.floor(p.hour / 60)).padStart(2, "0");
  const m = String(p.hour % 60).padStart(2, "0");
  document.getElementById("hour").textContent = `${h}:${m}`;
  applyCopy();
  if (state.night && !audio.muted) audio.startCandle();
  else audio.stopCandle();
}

function setLang(lang) {
  state.lang = lang === "en" ? "en" : "zh";
  saveLang(state.lang);
  applyCopy(true);
}

function setWalk(z) {
  const prev = state.walk;
  state.walk = Math.max(0, Math.min(MAX_WALK, z));
  world.style.setProperty("--cam", `${-260 + state.walk}px`);
  walk.value = String(Math.round((state.walk / MAX_WALK) * 100));
  hangings.querySelectorAll(".hanging").forEach((el) => {
    if (el.classList.contains("feature")) return;
    const hz = Number(el.dataset.z);
    const depth = -260 + state.walk + hz;
    const passed = depth > -120;
    el.style.opacity = passed ? "0" : "1";
    el.style.pointerEvents = passed ? "none" : "auto";
  });
  const now = performance.now();
  if (Math.abs(state.walk - prev) > 18 && now - state.lastStepAt > 260) {
    audio.footstep();
    state.lastStepAt = now;
  }
  const line = [...pack().whisper].reverse().find(([at]) => state.walk >= at);
  if (line) setWhisper(line[1]);
  document.getElementById("doorHint").hidden = state.walk < 1650;
}

function hangingHtml(c, extraClass, style, z, veiled) {
  const veil = veiled ? "veiled" : "";
  const lore = escapeAttr(characterLore(c.name));
  return `
    <button class="hanging ${c.tier} ${veil} ${extraClass}" type="button" data-file="${c.file}" data-name="${c.name}" data-tier="${c.tier}" data-inv="${c.inv}" data-lore="${lore}" data-z="${z}" style="${style}">
      <div class="lamp"></div>
      <div class="frame">
        <img src="${src(c.file)}" alt="${c.name}" />
        <div class="veil"></div>
      </div>
      <div class="plinth"><i>${c.inv}</i><b>${c.name}</b><span>${c.tier}</span></div>
    </button>`;
}

function renderGallery() {
  const feature = CHARACTERS[CHARACTERS.length - 1];
  const left = CHARACTERS.slice(0, 11);
  const right = CHARACTERS.slice(11, -1);
  const bits = [];
  const veiled = new Set(["BULL-III", "BULL-VII", "BULL-XIX"]);

  left.forEach((c, i) => {
    const z = -80 - i * 200;
    bits.push(
      hangingHtml(c, "", `transform: translate(-50%,-48%) translate3d(-368px, 6px, ${z}px) rotateY(28deg)`, z, veiled.has(c.inv))
    );
  });

  right.forEach((c, i) => {
    const z = -180 - i * 200;
    bits.push(
      hangingHtml(c, "", `transform: translate(-50%,-48%) translate3d(368px, 6px, ${z}px) rotateY(-28deg)`, z, veiled.has(c.inv))
    );
  });

  bits.push(
    hangingHtml(
      feature,
      "feature",
      "transform: translate(-50%,-50%) translate3d(0, -20px, -2280px)",
      -2280,
      false
    )
  );

  hangings.innerHTML = bits.join("");

  const lamps = [];
  for (let i = 0; i < 8; i++) {
    const z = -100 - i * 280;
    lamps.push(`<div class="sconce" style="transform: translate(-50%,-50%) translate3d(-442px, -92px, ${z}px); animation-delay: ${i * 0.35}s"></div>`);
    lamps.push(`<div class="sconce" style="transform: translate(-50%,-50%) translate3d(442px, -92px, ${z - 80}px); animation-delay: ${i * 0.35 + 0.8}s"></div>`);
  }
  decor.innerHTML = lamps.join("");
}

function chipHtml(holder) {
  const key = holder.id ? `yours-${holder.id}` : `yours-${holder.file}`;
  const face = cowSrc(holder);
  const fallback = !REVEALED && holder.tier ? boxSrc(holder.tier) : src(holder.file);
  const lore = escapeAttr(holder.lore || (!REVEALED ? pack().boxLore(holder.tier) : characterLore(holder.character || holder.name)));
  return `<button type="button" class="salon-chip ${holder.tier}" data-key="${key}" data-file="${holder.file}" data-name="${holder.name}" data-tier="${holder.tier}" data-inv="${holder.inv}" data-lore="${lore}" ${holder.id ? `data-token="${holder.id}"` : ""}>
    <img src="${face}" alt="" onerror="this.onerror=null;this.src='${fallback}'" />
    <span>${holder.name}</span>
  </button>`;
}

function syncHoldingLore() {
  state.holdings = state.holdings.map((h) => {
    if (h.id) {
      const token = TOKENS[h.id - 1];
      if (token) return { ...h, lore: tokenLore(token) };
    }
    return { ...h, lore: characterLore(h.character || h.name) };
  });
}

function renderSalon() {
  const p = pack();
  const yours = document.getElementById("yourSeats");
  if (!state.holdings.length) {
    yours.innerHTML = `<div class="salon-chip empty">${p.salonEmpty}</div>`;
  } else {
    yours.innerHTML = state.holdings.map(chipHtml).join("");
  }
  const onFloor = Math.min(state.holdings.length, parlor.floorMax);
  const extra = state.holdings.length - onFloor;
  const loges = state.holdings.filter((h) => h.tier === "legendary").length;
  document.getElementById("salonCount").textContent = p.salonCount(onFloor, loges, extra);
  parlor.setCast(
    state.holdings,
    GUESTS.map((g) => ({ ...g, lore: guestLore(g.name) }))
  );
}

function grantHolding(cow, silent = false) {
  const holder = { ...cow, who: shortAddr(state.address) };
  state.holdings.push(holder);
  keyBadge.hidden = false;
  keyBadge.textContent = hasLegendary() ? pack().keyLoge : pack().keyAdmit;
  door.classList.add("keyed");
  renderSalon();
  if (silent) return;
  audio.bell();
  setWhisper(cow.tier === "legendary" ? pack().keyedLoge : pack().keyedAdmit);
}

function addFeed(item) {
  const li = document.createElement("li");
  const who = item.who || "";
  const short = who.startsWith("0x") ? shortAddr(who) : who;
  const wallet = `<span class="wallet" title="${who}">${short}</span>`;
  if (item.hit) {
    li.innerHTML = `${imgTag(item)}<div><strong class="hit">${pack().feedHit} · ${item.name}</strong>${wallet}</div>`;
  } else {
    const missLabel = pack().feedMissLabel(item.misses || 1);
    li.innerHTML = `<img src="${missSrc()}" alt="" class="feed-miss" /><div><strong class="miss">${missLabel}</strong>${wallet}</div>`;
  }
  feed.prepend(li);
  while (feed.children.length > 24) feed.lastElementChild.remove();
}

function showEmptyFeed() {
  feed.innerHTML = `<li class="empty-feed">${pack().emptyFeed}</li>`;
}

function renderGuestbook(rows) {
  state.guestbookRows = rows;
  feed.innerHTML = "";
  if (!rows.length) {
    showEmptyFeed();
    return;
  }
  for (const row of [...rows].reverse()) {
    if (row.hit) {
      const cow = holdingFromId(row.tokenId);
      if (cow) addFeed({ hit: true, ...cow, who: row.who });
      else addFeed({ hit: true, name: `BULL #${row.tokenId}`, file: missSrc(), who: row.who });
    } else {
      addFeed({ hit: false, misses: row.misses, who: row.who });
    }
  }
}

async function refreshGuestbook() {
  try {
    renderGuestbook(await loadGuestbook());
  } catch {
    if (!state.guestbookRows.length && !feed.querySelector(".wallet")) showEmptyFeed();
  }
}

function totalEth() {
  if (state.priceWei) return Number(formatEther(state.priceWei * BigInt(state.qty))).toFixed(4);
  return (PRICE * state.qty).toFixed(4);
}

function setQty(n) {
  state.qty = Math.max(1, Math.min(MAX_QTY, n));
  refreshPullUi();
}

function refreshPullUi() {
  const qtyLabel = document.getElementById("qtyLabel");
  const costLabel = document.getElementById("costLabel");
  if (qtyLabel) qtyLabel.textContent = String(state.qty);
  if (costLabel) costLabel.textContent = `${totalEth()} ETH`;
  document.querySelectorAll("[data-qty]").forEach((btn) => {
    btn.classList.toggle("on", Number(btn.dataset.qty) === state.qty);
  });
  const minus = document.getElementById("qtyMinus");
  const plus = document.getElementById("qtyPlus");
  if (minus) minus.disabled = state.qty <= 1;
  if (plus) plus.disabled = state.qty >= MAX_QTY;
  if (!state.connected) {
    pullBtn.disabled = false;
    pullBtn.textContent = pack().connectPull;
    return;
  }
  pullBtn.disabled = state.pulling;
  pullBtn.textContent = `${pack().pull} ×${state.qty} · ${totalEth()} ETH`;
}

function refreshMeters() {
  document.getElementById("mintedLabel").textContent = `${state.minted.toLocaleString()} / ${SUPPLY.toLocaleString()}`;
  refreshPullUi();
}

async function syncChain() {
  const desk = await readDesk();
  state.minted = desk.minted;
  state.pulls = desk.pulls;
  state.priceWei = desk.price;
  state.owner = desk.owner;
  state.treasury = desk.treasury;
  refreshMeters();
}

async function syncPublicDesk() {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const meters = await readPublicMeters();
      state.minted = meters.minted;
      state.pulls = meters.pulls;
      refreshMeters();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

async function hydrateHoldings(address) {
  try {
    const ids = await tokensOf(address);
    state.holdings = [];
    ids.forEach((id) => {
      const cow = holdingFromId(id);
      if (cow) grantHolding(cow, true);
    });
    renderSalon();
  } catch {
    renderSalon();
  }
}

async function finishConnect(address) {
  state.connected = true;
  state.address = address;
  connectBtn.textContent = shortAddr(address);
  pullBtn.disabled = false;
  await syncChain();
  await hydrateHoldings(address);
  await refreshGuestbook();
  refreshPullUi();
  enableSound();
  setWhisper(pack().connected);
}

function closeWalletSheet() {
  document.getElementById("walletSheet").hidden = true;
}

function closeRulesSheet() {
  document.getElementById("rulesSheet").hidden = true;
}

function openRulesSheet() {
  document.getElementById("rulesSheet").hidden = false;
}

function openWalletSheet() {
  const injectedBtn = document.getElementById("injectedWalletBtn");
  const wallets = listInjectedWallets();
  injectedBtn.hidden = wallets.length === 0;
  injectedBtn.textContent = wallets.length === 1 ? walletDisplayName(wallets[0]) : pack().walletInjected;
  document.getElementById("walletSheet").hidden = false;
}

async function connect() {
  if (state.connected || state.pulling) return;
  if (hasWallet() && (isInWalletApp() || !isMobile())) {
    try {
      connectBtn.disabled = true;
      pullBtn.disabled = true;
      await finishConnect(await connectWallet());
    } catch (err) {
      showDeny(txError(err));
    } finally {
      connectBtn.disabled = false;
      refreshPullUi();
    }
    return;
  }
  openWalletSheet();
}

async function connectInjected() {
  try {
    closeWalletSheet();
    connectBtn.disabled = true;
    pullBtn.disabled = true;
    const wallets = listInjectedWallets();
    if (!wallets.length) {
      showDeny(pack().errNoInjected);
      return;
    }
    await finishConnect(await connectWithEthereum(wallets[0].ethereum));
  } catch (err) {
    showDeny(txError(err));
  } finally {
    connectBtn.disabled = false;
    refreshPullUi();
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let inspecting = null;

function openInspect(c) {
  inspecting = c;
  const img = document.getElementById("inspectImg");
  img.onerror = () => {
    img.onerror = null;
    img.src = cowSrc(c);
  };
  img.src = cowSrc(c);
  img.style.filter = c.ghost ? "grayscale(1) brightness(0.6)" : "";
  document.getElementById("inspectInv").textContent = c.inv || "—";
  document.getElementById("inspectTitle").textContent = c.name;
  document.getElementById("inspectTier").textContent = REVEALED
    ? (c.tier || "").toUpperCase()
    : pack().boxLabel(c.tier);
  document.getElementById("inspectLore").textContent = c.lore || pack().missingPage;
  inspect.hidden = false;
}

const parlor = createParlor({
  stage: document.getElementById("parlorStage"),
  onInspect: openInspect,
  onFootstep: () => audio.footstep(),
});

if (import.meta.env.DEV) {
  window.__enterSalonPreview = () => {
    [1, 16, 88, 404].forEach((id) => {
      const cow = holdingFromId(id);
      if (cow) grantIfNew(cow);
    });
    keyBadge.hidden = false;
    door.classList.add("keyed");
    tryDoor();
  };
}

function showDeny(text) {
  deny.textContent = text;
  deny.hidden = false;
  setTimeout(() => {
    deny.hidden = true;
  }, 2600);
}

function tryDoor() {
  enableSound();
  if (!canEnter()) {
    audio.footstep();
    showDeny(pack().noHoldings);
    setWhisper(pack().noHoldings);
    return;
  }
  audio.bell();
  renderSalon();
  salon.hidden = false;
  parlor.start();
}

function spawnGhost() {
  const cow = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  const left = Math.random() < 0.5;
  const z = -220 - Math.random() * 1600;
  const x = left ? -390 : 390;
  const rot = left ? 26 : -26;
  const el = document.createElement("button");
  el.className = "hanging ghost";
  el.type = "button";
  el.dataset.file = cow.file;
  const p = pack();
  el.dataset.name = p.ghostName;
  el.dataset.tier = "unlisted";
  el.dataset.inv = "—";
  el.dataset.lore = p.ghostLore;
  el.dataset.ghost = "1";
  el.dataset.z = String(z);
  el.style.transform = `translate(-50%,-48%) translate3d(${x}px, 10px, ${z}px) rotateY(${rot}deg)`;
  el.innerHTML = `
    <div class="lamp"></div>
    <div class="frame"><img src="${src(cow.file)}" alt="" /></div>
    <div class="plinth"><i>—</i><b>${p.ghostName}</b><span>${p.ghostPlinth}</span></div>`;
  ghosts.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 1100);
  }, 3200);
}

async function pull() {
  if (state.pulling || state.minted >= SUPPLY) return;
  if (!state.connected) {
    connect();
    return;
  }
  const qty = state.qty;
  state.pulling = true;
  pullBtn.disabled = true;
  overlay.hidden = false;
  reelResult.hidden = true;
  state.viewingHits = [];
  clearRite();
  const strip = document.getElementById("hitStrip");
  strip.hidden = true;
  strip.innerHTML = "";
  const lore = document.getElementById("resultLore");
  if (lore) lore.textContent = "";
  reelStatus.textContent = pack().confirmTx;
  document.getElementById("revealFrame").classList.add("spin");
  reelImg.style.filter = "";

  reelImg.onerror = () => {
    reelImg.onerror = null;
    reelImg.src = missSrc();
  };

  let keepSpin = true;
  const spinLoop = (async () => {
    while (keepSpin) {
      const spin = randomToken();
      reelImg.src = cowSrc(spin);
      await sleep(90);
    }
  })();

  let result;
  try {
    result = await sendPull(qty, state.priceWei || 400000000000000n);
  } catch (err) {
    keepSpin = false;
    state.pulling = false;
    document.getElementById("revealFrame").classList.remove("spin");
    overlay.hidden = true;
    clearRite();
    showDeny(txError(err));
    pullBtn.disabled = false;
    return;
  }

  keepSpin = false;
  reelStatus.textContent = pack().confirmed;
  await sleep(120);
  document.getElementById("revealFrame").classList.remove("spin");
  reelImg.style.filter = "brightness(0.12)";
  await sleep(180);

  const hits = result.tokenIds.map(holdingFromId).filter(Boolean);
  const misses = Math.max(0, qty - hits.length);
  hits.forEach((cow) => {
    grantIfNew(cow);
    addFeed({ hit: true, ...cow, who: state.address });
  });
  if (misses > 0) addFeed({ hit: false, misses, who: state.address });
  await syncChain();
  await refreshGuestbook();

  if (!hits.length) {
    state.viewingHits = [];
    await playRite("miss");
    reelImg.src = missSrc();
    reelImg.onerror = null;
    reelImg.style.filter = "";
    document.getElementById("resultKicker").textContent = pack().missKicker(qty);
    document.getElementById("resultTitle").textContent = pack().missTitle;
    if (lore) lore.textContent = "";
    renderHitStrip([]);
  } else {
    const shown = [...hits].sort((a, b) => {
      const rank = { legendary: 0, rare: 1, common: 2 };
      return rank[a.tier] - rank[b.tier];
    })[0];
    await playRite(shown.tier);
    state.viewingHits = hits;
    renderHitStrip(hits);
    showViewingHit(hits.indexOf(shown));
    setWhisper(hits.some((c) => c.tier === "legendary") ? pack().keyedLoge : pack().keyedAdmit);
  }

  reelResult.hidden = false;
  refreshMeters();
  state.pulling = false;
  pullBtn.disabled = false;
}

function startDust() {
  const canvas = document.getElementById("dust");
  const ctx = canvas.getContext("2d");
  const motes = Array.from({ length: 48 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.6 + 0.4,
    s: Math.random() * 0.00035 + 0.00012,
    a: Math.random() * 0.35 + 0.08,
  }));

  function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const m of motes) {
      m.y -= m.s;
      m.x += Math.sin(m.y * 20) * 0.0002;
      if (m.y < -0.02) {
        m.y = 1.02;
        m.x = Math.random();
      }
      ctx.fillStyle = `rgba(245, 230, 190, ${m.a})`;
      ctx.beginPath();
      ctx.arc(m.x * canvas.width, m.y * canvas.height, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
}

function startClock() {
  const el = document.getElementById("hour");
  setInterval(() => {
    const base = pack().hour;
    const t = new Date();
    const minutes = (base + t.getMinutes() + t.getSeconds()) % (24 * 60);
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    el.textContent = `${h}:${m}`;
  }, 9000);
}

async function enableSound() {
  await audio.unlock();
  audio.setMuted(false);
  muteBtn.textContent = pack().muteOff;
  if (state.night) audio.startCandle();
}

function bindInspect(root) {
  root.addEventListener("click", (e) => {
    if (walkGesture.moved > 10) return;
    const btn = e.target.closest(".hanging, .seat");
    if (!btn || btn.classList.contains("empty")) return;
    if (btn.id === "secretDoor") return;
    if (!btn.dataset.file) return;
    openInspect({
      id: btn.dataset.token ? Number(btn.dataset.token) : undefined,
      file: btn.dataset.file,
      name: btn.dataset.name,
      tier: btn.dataset.tier,
      inv: btn.dataset.inv,
      lore: btn.dataset.lore,
      ghost: btn.dataset.ghost === "1",
    });
  });
}

applyTheme();
renderGallery();
renderSalon();
showEmptyFeed();
refreshMeters();
syncPublicDesk().then(() => refreshGuestbook());
setInterval(syncPublicDesk, 20000);
setWalk(80);
startDust();
startClock();
spawnGhost();

connectBtn.addEventListener("click", connect);
document.getElementById("closeWalletSheet").addEventListener("click", closeWalletSheet);
document.getElementById("walletSheet").addEventListener("click", (e) => {
  if (e.target.id === "walletSheet") closeWalletSheet();
});
document.getElementById("rulesBtn").addEventListener("click", openRulesSheet);
document.getElementById("closeRulesSheet").addEventListener("click", closeRulesSheet);
document.getElementById("rulesSheet").addEventListener("click", (e) => {
  if (e.target.id === "rulesSheet") closeRulesSheet();
});
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const kind = btn.dataset.open;
    if (kind === "injected") {
      connectInjected();
      return;
    }
    if (kind === "okx") openInOkx();
    if (kind === "binance") openInBinance();
    if (kind === "metamask") openInMetaMask();
  });
});
setAccountListener((accounts) => {
  if (!accounts?.length) {
    state.connected = false;
    state.address = "";
    connectBtn.textContent = pack().connect;
    refreshPullUi();
    return;
  }
  connectInjected();
});
pullBtn.addEventListener("click", pull);
document.getElementById("qtyMinus").addEventListener("click", () => setQty(state.qty - 1));
document.getElementById("qtyPlus").addEventListener("click", () => setQty(state.qty + 1));
document.querySelectorAll("[data-qty]").forEach((btn) => {
  btn.addEventListener("click", () => setQty(Number(btn.dataset.qty)));
});
themeBtn.addEventListener("click", () => {
  state.night = !state.night;
  applyTheme();
  enableSound();
});
langBtn.addEventListener("click", () => {
  setLang(state.lang === "zh" ? "en" : "zh");
});
muteBtn.addEventListener("click", async () => {
  if (audio.muted || !audio.ready) {
    await enableSound();
    audio.bell();
    return;
  }
  audio.setMuted(true);
  muteBtn.textContent = pack().muteOn;
});
walk.addEventListener("input", () => setWalk((Number(walk.value) / 100) * MAX_WALK));
walk.addEventListener("change", () => setWalk((Number(walk.value) / 100) * MAX_WALK));
document.getElementById("walkBack").addEventListener("click", () => setWalk(state.walk - 140));
document.getElementById("walkFwd").addEventListener("click", () => setWalk(state.walk + 140));

const walkGesture = { y: 0, moved: 0, active: false };
const viewportEl = document.getElementById("viewport");
viewportEl.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  if (e.target.closest("button, input, label, a")) return;
  walkGesture.active = true;
  walkGesture.y = e.clientY;
  walkGesture.moved = 0;
});
viewportEl.addEventListener("pointermove", (e) => {
  if (!walkGesture.active) return;
  const dy = walkGesture.y - e.clientY;
  walkGesture.y = e.clientY;
  walkGesture.moved += Math.abs(dy);
  setWalk(state.walk + dy * 2.6);
});
const endWalkGesture = () => {
  walkGesture.active = false;
};
viewportEl.addEventListener("pointerup", endWalkGesture);
viewportEl.addEventListener("pointercancel", endWalkGesture);
viewportEl.addEventListener("pointerleave", endWalkGesture);

document.getElementById("viewport").addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    setWalk(state.walk + e.deltaY * 0.9);
  },
  { passive: false }
);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeRulesSheet();
    closeWalletSheet();
    return;
  }
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") setWalk(state.walk + 40);
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") setWalk(state.walk - 40);
});

bindInspect(hangings);
bindInspect(ghosts);
door.addEventListener("click", tryDoor);
document.getElementById("doorHint").addEventListener("click", tryDoor);
document.getElementById("leaveSalon").addEventListener("click", () => {
  salon.hidden = true;
  parlor.stop();
});
document.getElementById("yourSeats").addEventListener("click", (e) => {
  const btn = e.target.closest(".salon-chip[data-key]");
  if (!btn) return;
  parlor.callKey(btn.dataset.key);
});

document.getElementById("closeInspect").addEventListener("click", () => {
  inspect.hidden = true;
  inspecting = null;
});
inspect.addEventListener("click", (e) => {
  if (e.target === inspect) {
    inspect.hidden = true;
    inspecting = null;
  }
});

function closeReel() {
  overlay.hidden = true;
  reelImg.style.filter = "";
  state.viewingHits = [];
  clearRite();
  document.getElementById("hitStrip").hidden = true;
}

document.getElementById("closeReel").addEventListener("click", closeReel);
overlay.addEventListener("click", (e) => {
  if (e.target === overlay && !state.pulling) closeReel();
});

const hitStrip = document.getElementById("hitStrip");
hitStrip.addEventListener("mousemove", (e) => {
  const btn = e.target.closest("button[data-i]");
  if (!btn || !state.viewingHits.length) return;
  showViewingHit(Number(btn.dataset.i));
});
hitStrip.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-i]");
  if (!btn || !state.viewingHits.length) return;
  e.stopPropagation();
  showViewingHit(Number(btn.dataset.i));
});
document.getElementById("revealFrame").addEventListener("mousemove", (e) => {
  if (state.pulling || state.viewingHits.length < 2) return;
  showViewingHit(hitIndexFromX(e.currentTarget, e.clientX, state.viewingHits.length));
});

document.getElementById("catalogBtn").addEventListener("click", openCatalog);
document.getElementById("closeCatalog").addEventListener("click", closeCatalog);
const catalogEl = document.getElementById("catalog");
catalogEl.addEventListener("click", (e) => {
  if (e.target === catalogEl) closeCatalog();
});
function scrubCatalog(e) {
  if (catalogEl.hidden) return;
  if (e.target.closest("button")) return;
  showCatalogToken(catalogIdFromX(catalogEl, e.clientX));
}
catalogEl.addEventListener("mousemove", scrubCatalog);

setInterval(() => spawnGhost(), 9000 + Math.random() * 4000);
setInterval(() => {
  if (!audio.muted) audio.bell();
}, 28000);
