export function detectLang() {
  try {
    const saved = localStorage.getItem("bull-lang");
    if (saved === "en" || saved === "zh") return saved;
  } catch {
    /* private mode */
  }
  return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function saveLang(lang) {
  try {
    localStorage.setItem("bull-lang", lang);
  } catch {
    /* private mode */
  }
}

const LORES_ZH = {
  "Holstein Pink Goggles": "粉紅目鏡。據夜簿所載，牠能看見尚未鑄成的靈魂。",
  "Blue Hood": "藍兜。雨夜閉館時，牆面會多出一件沒有影子的斗篷。",
  "Black Hoodie": "黑帽衫。守夜人說，牠不喜歡被點名。",
  "Brown Beanie": "褐毛線帽。最常被認錯，因此最常走失。",
  "Blue Gold Goggles": "金邊藍鏡。鏡片映出的不是觀者，是下一次獻納。",
  "Pink Blue Beanie": "雙色帽。據說是兩隻牛共用一個名字。",
  "White Hood Spots": "斑點白兜。斑點會在月圓時換位。",
  "Red Pipe": "紅煙斗。煙是畫裡的，味道卻會留在長廊。",
  "Gold Smoke": "金煙。稀有。煙散之後，畫框會暫時變熱。",
  "Gold Beanie": "金帽。戴過的人，後來都改用假名入館。",
  "Cowboy Bell": "鈴與牛仔。鈴響一次，夜簿多一行無名。",
  "Gold Grill": "金齒。它不說話。靠近時，牙會自己亮。",
  "Headphones": "耳機。裡面放的是閉館後的腳步，不是音樂。",
  Viking: "維京。盔上的角不是裝飾，是從別的館藏借來的。",
  Wizard: "巫師。長廊盡頭的霧，是牠袖口漏出來的。",
  "Crown King": "加冕。傳說級。王冠只在無人注視時端正。",
  "Laser Eyes": "目光。傳說級。不要對視太久。夜簿有過塗黑的一頁。",
  Diamond: "鑽石。傳說級。反光不是鑽石，是別的訪客留下的。",
  Alien: "異客。傳說級。牠不是走進來的。是被目錄收進去的。",
  Zombie: "復生。傳說級。修復紀錄寫著：原作已失，此為夜間重繪。",
  "Halo Wings": "光環與翼。傳說級。翼展超過畫框，所以有一部分在牆裡。",
  "Rainbow Horns": "虹角。傳說級。最後一件底稿。角的顏色會隨獻金增減。",
};

const LORES_EN = {
  "Holstein Pink Goggles": "Pink goggles. The night ledger says it can see souls that have not been minted yet.",
  "Blue Hood": "Blue hood. On rainy closing nights, a cloak with no shadow appears on the wall.",
  "Black Hoodie": "Black hoodie. The night watch says it does not like being called by name.",
  "Brown Beanie": "Brown beanie. Most often mistaken for another, and so most often lost.",
  "Blue Gold Goggles": "Gold-rimmed blue lenses. They do not show the viewer. They show the next offering.",
  "Pink Blue Beanie": "Two-tone cap. Said to be two bulls sharing a single name.",
  "White Hood Spots": "Spotted white hood. The spots trade places at the full moon.",
  "Red Pipe": "Red pipe. The smoke is painted. The smell stays in the gallery.",
  "Gold Smoke": "Gold smoke. Rare. After it thins, the frame runs warm for a while.",
  "Gold Beanie": "Gold beanie. Those who wore it later entered under assumed names.",
  "Cowboy Bell": "Bell and cowboy. Each ring adds an unnamed line to the night ledger.",
  "Gold Grill": "Gold grill. It does not speak. Up close, the teeth light themselves.",
  Headphones: "Headphones. What plays is footsteps after closing, not music.",
  Viking: "Viking. The horns on the helm are not ornament. They were borrowed from another holding.",
  Wizard: "Wizard. The fog at the end of the hall leaks from its sleeves.",
  "Crown King": "Crowned. Legendary. The crown sits true only when no one is looking.",
  "Laser Eyes": "Gaze. Legendary. Do not hold the stare. The night ledger has a blacked-out page.",
  Diamond: "Diamond. Legendary. The glint is not the stone. It is what other visitors left.",
  Alien: "Stranger. Legendary. It did not walk in. The catalogue took it.",
  Zombie: "Returned. Legendary. Conservation notes: original lost; this is a nocturnal redraw.",
  "Halo Wings": "Halo and wings. Legendary. The span exceeds the frame, so part of it is inside the wall.",
  "Rainbow Horns": "Rainbow horns. Legendary. The last study. The horns shift with the offerings.",
};

const GUESTS_ZH = {
  "Crown King": "上席。王冠在包廂裡比較端正。",
  Diamond: "上席。鑽石映出別的持有者。",
  Wizard: "稀有席。袖口的霧是包廂的空調。",
  "Gold Grill": "稀有席。金齒在暗處自己亮。",
  "Holstein Pink Goggles": "普通席。第一隻進包廂的牛。",
  "Blue Hood": "普通席。斗篷蓋住錢包地址。",
};

const GUESTS_EN = {
  "Crown King": "High seat. The crown sits truer in the parlor.",
  Diamond: "High seat. The diamond reflects other holders.",
  Wizard: "Rare seat. The fog at the sleeves is the parlor air.",
  "Gold Grill": "Rare seat. In the dark, the teeth light themselves.",
  "Holstein Pink Goggles": "Common seat. The first bull to enter the parlor.",
  "Blue Hood": "Common seat. The cloak covers the wallet address.",
};

const RULES_ZH = [
  "每次 <em>0.0004 ETH</em>（約 $1）",
  "抽中機率 <em>10%</em>",
  "未中的 ETH 獻入館庫",
  "單次最多 mint <em>100</em> 張",
  "Ethereum 主網。錢包確認後，約等一個區塊（約 12 秒）",
  "沒有 TGE 計畫，純粹牛回 NFT",
  "手機請用 OKX、幣安或 MetaMask App 的瀏覽器打開本頁再 mint",
];

const RULES_EN = [
  "Each pull is <em>0.0004 ETH</em> (about $1)",
  "<em>10%</em> chance to mint",
  "ETH from misses goes to the gallery treasury",
  "Up to <em>100</em> mints per transaction",
  "Ethereum mainnet. After wallet confirmation, wait about one block (~12 seconds)",
  "No TGE planned. This is a bull NFT only",
  "On mobile, open this page in the OKX, Binance, or MetaMask in-app browser before minting",
];

const ZH = {
  htmlLang: "zh-Hant",
  langBtn: "EN",
  langBtnTitle: "English",
  connect: "連接錢包",
  muteOn: "聲",
  muteOff: "靜",
  catalogBtn: "冊",
  catalogStatus: "左右移動滑鼠，查看每一張",
  catalogClose: "合上目錄",
  statOnce: "單次",
  statOdds: "機率",
  qty: "數量",
  qtyMinus: "減少數量",
  qtyPlus: "增加數量",
  qtyTotal: "合計",
  network: "Ethereum 主網",
  ledgerNote: "紀錄錢包：誰獲得 · 誰未獲得",
  salonKicker: "Loge privée",
  salonTitle: "持有者包廂",
  salonCopy: "畫已離框。點地板喚你的館藏過來；點角色近看。傳說級愛待在上席。",
  parlorHint: "點地板，喚牠過來",
  parlorAria: "包廂廳。點地板喚角色，點角色近看。",
  yourSeats: "你的席",
  leaveSalon: "退回長廊",
  doorEnter: "進入",
  doorAria: "持有者包廂",
  salonEmpty: "抽中即可入廳",
  walletTitle: "選擇錢包",
  walletCopy: "手機請先在錢包 App 內打開本頁；或點下方用 App 開啟。",
  walletBinance: "幣安",
  walletInjected: "瀏覽器已安裝的錢包",
  walletGeneric: "錢包",
  walletBrowser: "瀏覽器錢包",
  walletCancel: "取消",
  closeReel: "退下",
  reelReview: "館方正在審視你的獻納…",
  confirmTx: "請在錢包確認交易…",
  confirmed: "鏈上已確認，正在開封…",
  whiteTease: "白光…",
  lightMiss: "燭滅 · 無光",
  lightCommon: "白光",
  lightRare: "紫光",
  lightLegendary: "金光",
  missingPage: "目錄缺頁。",
  ghostName: "沒有來源",
  ghostLore: "此框不在目錄。有人剛從這裡走過。",
  ghostPlinth: "訪客殘影",
  feedHit: "獲得",
  feedMiss: "未獲得",
  emptyFeed: "尚無抽卡紀錄。連上錢包抽卡後，獲得與未獲得都會記在這裡。",
  connected: "錢包已連上 Ethereum 主網。",
  noHoldings: "沒有館藏。抽中才能入包廂。",
  keyLoge: "上席",
  keyAdmit: "入廳",
  keyedLoge: "上席已為你點燭。盡頭那扇門認得你。",
  keyedAdmit: "你有館藏了。盡頭那扇門會開。",
  errReject: "你在錢包取消了交易。",
  errFunds: "ETH 不足（含 gas）。",
  errNoWallet: "找不到錢包。請用 OKX、幣安或 MetaMask App 打開本頁。",
  errOpenInApp: "請用 OKX、幣安或 MetaMask App 的瀏覽器打開本頁。",
  errNotConnected: "尚未連接錢包",
  errGuestbook: "無法讀取訪客簿",
  errNoInjected: "這個瀏覽器沒有錢包。請用 OKX、幣安或 MetaMask App 打開本頁。",
  rulesHtml: RULES_ZH,
  lores: LORES_ZH,
  guestLores: GUESTS_ZH,
  tokenLore(character, background, grade, frame, lore) {
    return `一萬張之一。${character} · ${background} / ${grade} / ${frame}。${lore}`;
  },
  boxLabel(tier) {
    if (tier === "legendary") return "金光匣 · 封存";
    if (tier === "rare") return "紫光匣 · 封存";
    return "白光匣 · 封存";
  },
  boxLore(tier) {
    const label = this.boxLabel(tier);
    return `${label}。開盒日才見館藏。`;
  },
  salonCount(onFloor, loges, extra) {
    const side = extra > 0 ? ` · 另有 ${extra} 在側廳` : "";
    return `廳上 ${onFloor} · 上席 ${loges}${side}`;
  },
  hitSwitch(i, n) {
    return `${i + 1} / ${n} · 滑鼠移動切換`;
  },
  hitEntered(n) {
    return `${n} 張入藏`;
  },
  missKicker(qty) {
    return `${qty} 次 · 獲准 0`;
  },
  feedMissLabel(n) {
    return n > 1 ? `未獲得 ×${n}` : "未獲得";
  },
  night: {
    title: "Nocturne · Galerie BULL",
    kicker: "Musée · Salle nocturne",
    whisper: [
      [0, "燈已熄。只准持燭者入內。"],
      [350, "普通之作近門。稀有的，還在霧裡。"],
      [800, "畫框自己發亮的，不要用手碰。"],
      [1300, "傳說級館藏不喜歡被點算。"],
      [1750, "盡頭那扇門，是持有者的包廂。"],
    ],
    latin: "quod occultum est",
    walk: "深入長廊",
    walkHint: "上下滑動畫面，走入長廊",
    walkBack: "後退",
    walkFwd: "前進",
    deskKicker: "Cabinet d’acquisition",
    deskTitle: "夜間獻納",
    rulesBtn: "規則",
    rulesKicker: "Règlement",
    rulesTitle: "獻納規則",
    rulesClose: "知道了",
    seal: "以蠟封為記",
    ledgerKicker: "Livre d’or",
    ledgerTitle: "夜間訪客簿",
    statLedger: "夜簿",
    badge: "NOCTURNE",
    themeBtn: "晝",
    inspectClose: "將燭收回",
    pull: "獻納",
    connectPull: "連接錢包",
    missTitle: "獻金已入館庫",
    pullsUnit: "次獻納",
    hour: 2 * 60 + 17,
  },
  day: {
    title: "Grande Galerie · BULL",
    kicker: "Musée · Grande Galerie",
    whisper: [
      [0, "請保持安靜。請勿觸碰畫作。"],
      [350, "導覽由近至遠。稀有之作在長廊中段。"],
      [800, "今日開放至日落。閉館後改為夜間廳。"],
      [1300, "傳說級在日光下較不容易被認出。"],
      [1750, "盡頭有一扇門。持有者下午也可入包廂。"],
    ],
    latin: "grande galerie",
    walk: "漫步長廊",
    walkHint: "上下滑動畫面，漫步長廊",
    walkBack: "後退",
    walkFwd: "前進",
    deskKicker: "Billetterie",
    deskTitle: "購票入場",
    rulesBtn: "規則",
    rulesKicker: "Règlement",
    rulesTitle: "購票規則",
    rulesClose: "知道了",
    seal: "憑票入內",
    ledgerKicker: "Livre d’or",
    ledgerTitle: "今日訪客",
    statLedger: "館藏",
    badge: "JOUR",
    themeBtn: "夜",
    inspectClose: "返回大廳",
    pull: "購票",
    connectPull: "連接錢包",
    missTitle: "票款已入館庫",
    pullsUnit: "張票",
    hour: 14 * 60 + 32,
  },
};

const EN = {
  htmlLang: "en",
  langBtn: "中",
  langBtnTitle: "中文",
  connect: "Connect",
  muteOn: "SND",
  muteOff: "MUTE",
  catalogBtn: "CAT",
  catalogStatus: "Move left and right to view each piece",
  catalogClose: "Close the catalogue",
  statOnce: "Each",
  statOdds: "Odds",
  qty: "Qty",
  qtyMinus: "Decrease quantity",
  qtyPlus: "Increase quantity",
  qtyTotal: "Total",
  network: "Ethereum mainnet",
  ledgerNote: "Wallet record: who hit · who missed",
  salonKicker: "Loge privée",
  salonTitle: "Holders’ parlor",
  salonCopy: "The paintings have left their frames. Tap the floor to call yours over; tap a figure to inspect. Legendaries prefer the high seats.",
  parlorHint: "Tap the floor to call them over",
  parlorAria: "Parlor. Tap the floor to call a figure; tap a figure to inspect.",
  yourSeats: "Your seats",
  leaveSalon: "Return to the gallery",
  doorEnter: "Enter",
  doorAria: "Holders’ parlor",
  salonEmpty: "Mint a hit to enter",
  walletTitle: "Choose a wallet",
  walletCopy: "On mobile, open this page inside a wallet app first, or tap below to launch it.",
  walletBinance: "Binance",
  walletInjected: "Installed browser wallet",
  walletGeneric: "Wallet",
  walletBrowser: "Browser wallet",
  walletCancel: "Cancel",
  closeReel: "Withdraw",
  reelReview: "The gallery is reviewing your offering…",
  confirmTx: "Confirm the transaction in your wallet…",
  confirmed: "Confirmed on-chain. Opening…",
  whiteTease: "White light…",
  lightMiss: "Candle out · no light",
  lightCommon: "White light",
  lightRare: "Violet light",
  lightLegendary: "Gold light",
  missingPage: "A missing catalogue page.",
  ghostName: "Unlisted",
  ghostLore: "This frame is not in the catalogue. Someone just walked through.",
  ghostPlinth: "Visitor afterimage",
  feedHit: "Hit",
  feedMiss: "Miss",
  emptyFeed: "No pulls yet. Connect a wallet and pull; hits and misses are recorded here.",
  connected: "Wallet connected to Ethereum mainnet.",
  noHoldings: "No holdings. Mint a hit to enter the parlor.",
  keyLoge: "LOGE",
  keyAdmit: "KEY",
  keyedLoge: "A candle is lit at the high seats. The door at the end knows you.",
  keyedAdmit: "You have a holding. The door at the end will open.",
  errReject: "You cancelled the transaction in your wallet.",
  errFunds: "Not enough ETH (including gas).",
  errNoWallet: "No wallet found. Open this page in OKX, Binance, or MetaMask.",
  errOpenInApp: "Open this page in the OKX, Binance, or MetaMask in-app browser.",
  errNotConnected: "Wallet not connected",
  errGuestbook: "Could not load the guestbook",
  errNoInjected: "This browser has no wallet. Open this page in OKX, Binance, or MetaMask.",
  rulesHtml: RULES_EN,
  lores: LORES_EN,
  guestLores: GUESTS_EN,
  tokenLore(character, background, grade, frame, lore) {
    return `One of ten thousand. ${character} · ${background} / ${grade} / ${frame}. ${lore}`;
  },
  boxLabel(tier) {
    if (tier === "legendary") return "Gold casket · sealed";
    if (tier === "rare") return "Violet casket · sealed";
    return "White casket · sealed";
  },
  boxLore(tier) {
    return `${this.boxLabel(tier)}. The portrait waits for the opening day.`;
  },
  salonCount(onFloor, loges, extra) {
    const side = extra > 0 ? ` · ${extra} more in the side hall` : "";
    return `On the floor ${onFloor} · High seats ${loges}${side}`;
  },
  hitSwitch(i, n) {
    return `${i + 1} / ${n} · move to switch`;
  },
  hitEntered(n) {
    return `${n} entered the collection`;
  },
  missKicker(qty) {
    return `${qty} pulls · 0 admitted`;
  },
  feedMissLabel(n) {
    return n > 1 ? `Miss ×${n}` : "Miss";
  },
  night: {
    title: "Nocturne · Galerie BULL",
    kicker: "Musée · Salle nocturne",
    whisper: [
      [0, "The lamps are out. Only candle-bearers may enter."],
      [350, "Common works hang near the door. The rare ones are still in the fog."],
      [800, "Do not touch a frame that lights itself."],
      [1300, "Legendary holdings dislike being counted."],
      [1750, "The door at the end is the holders’ parlor."],
    ],
    latin: "quod occultum est",
    walk: "Deeper into the gallery",
    walkHint: "Swipe the hall to walk",
    walkBack: "Back",
    walkFwd: "Forward",
    deskKicker: "Cabinet d’acquisition",
    deskTitle: "Night offering",
    rulesBtn: "Rules",
    rulesKicker: "Règlement",
    rulesTitle: "Offering rules",
    rulesClose: "Understood",
    seal: "Sealed in wax",
    ledgerKicker: "Livre d’or",
    ledgerTitle: "Night guestbook",
    statLedger: "Ledger",
    badge: "NOCTURNE",
    themeBtn: "DAY",
    inspectClose: "Take the candle back",
    pull: "Offer",
    connectPull: "Connect wallet",
    missTitle: "The offering entered the treasury",
    pullsUnit: "rites",
    hour: 2 * 60 + 17,
  },
  day: {
    title: "Grande Galerie · BULL",
    kicker: "Musée · Grande Galerie",
    whisper: [
      [0, "Please keep quiet. Do not touch the paintings."],
      [350, "The tour runs near to far. Rare works hang mid-gallery."],
      [800, "Open until sunset. After closing, the hall turns nocturnal."],
      [1300, "Legendaries are harder to recognize in daylight."],
      [1750, "There is a door at the end. Holders may enter the parlor in the afternoon too."],
    ],
    latin: "grande galerie",
    walk: "Walk the gallery",
    walkHint: "Swipe the hall to walk",
    walkBack: "Back",
    walkFwd: "Forward",
    deskKicker: "Billetterie",
    deskTitle: "Admission",
    rulesBtn: "Rules",
    rulesKicker: "Règlement",
    rulesTitle: "Ticket rules",
    rulesClose: "Understood",
    seal: "Ticket required",
    ledgerKicker: "Livre d’or",
    ledgerTitle: "Today’s visitors",
    statLedger: "Holdings",
    badge: "JOUR",
    themeBtn: "NIGHT",
    inspectClose: "Return to the hall",
    pull: "Ticket",
    connectPull: "Connect wallet",
    missTitle: "The fare entered the treasury",
    pullsUnit: "tickets",
    hour: 14 * 60 + 32,
  },
};

export const I18N = { zh: ZH, en: EN };
