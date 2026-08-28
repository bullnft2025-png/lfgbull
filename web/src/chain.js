import { BrowserProvider, Contract, formatEther, Interface, JsonRpcProvider, ZeroAddress } from "ethers";

export const CONTRACT_ADDRESS = "0xC3e336D037707e8DBc63ffBD6b0024499f959004";
export const CHAIN_ID = 1n;
export const DEPLOY_BLOCK = 25846517;

const ABI = [
  "function pull(uint256 qty) payable",
  "function minted() view returns (uint256)",
  "function price() view returns (uint256)",
  "function treasury() view returns (address)",
  "function owner() view returns (address)",
  "function pulls() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "event Pull(address indexed player, uint256 qty, uint256 paid, uint256 hits)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const iface = new Interface(ABI);
const PUBLIC_RPCS = [
  "https://rpc.mevblocker.io",
  "https://ethereum.publicnode.com",
  "https://mainnet.gateway.tenderly.co",
  "https://eth.llamarpc.com",
];

let provider = null;
let signer = null;
let contract = null;
let eip1193 = null;
let accountListener = null;

function dappUrl() {
  return window.location.href.split("#")[0];
}

export const CHAIN_ERR = {
  NO_WALLET: "NO_WALLET",
  OPEN_IN_APP: "OPEN_IN_APP",
  NOT_CONNECTED: "NOT_CONNECTED",
  GUESTBOOK: "GUESTBOOK",
};

function fail(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function walletName(eth) {
  if (!eth) return "Wallet";
  if (eth.isOkxWallet || eth.isOKX) return "OKX";
  if (eth.isBinance) return "Binance";
  if (eth.isMetaMask) return "MetaMask";
  if (eth.isTrust || eth.isTrustWallet) return "Trust";
  if (eth.isCoinbaseWallet) return "Coinbase";
  return "Browser wallet";
}

export function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

export function isInWalletApp() {
  const ua = navigator.userAgent || "";
  return Boolean(
    window.okxwallet ||
      window.binancew3w ||
      /OKApp|OKXWallet|Binance|MetaMaskMobile|TrustWallet|imToken/i.test(ua)
  );
}

export function listInjectedWallets() {
  if (typeof window === "undefined") return [];
  const found = [];
  const seen = new Set();
  const add = (id, name, eth) => {
    if (!eth?.request || seen.has(eth)) return;
    seen.add(eth);
    found.push({ id, name, ethereum: eth });
  };
  add("okx", "OKX", window.okxwallet);
  add("binance", "Binance", window.binancew3w || window.BinanceChain);
  const injected = window.ethereum;
  if (injected?.providers?.length) {
    for (const p of injected.providers) add(walletName(p).toLowerCase(), walletName(p), p);
  } else {
    add("injected", walletName(injected), injected);
  }
  return found;
}

export function hasWallet() {
  return listInjectedWallets().length > 0;
}

export function openInOkx() {
  const deeplink = `okx://wallet/dapp/url?dappUrl=${encodeURIComponent(dappUrl())}`;
  window.location.href = `https://www.okx.com/download?deeplink=${encodeURIComponent(deeplink)}`;
}

export function openInBinance() {
  window.location.href = `https://app.binance.com/cedefi/web3?url=${encodeURIComponent(dappUrl())}`;
}

export function openInMetaMask() {
  const u = new URL(dappUrl());
  window.location.href = `https://metamask.app.link/dapp/${u.host}${u.pathname}${u.search}`;
}

export function setAccountListener(fn) {
  accountListener = fn;
}

function bindEip1193(eth) {
  if (eip1193?.removeListener && eip1193 !== eth) {
    try {
      eip1193.removeListener("accountsChanged", onAccountsChanged);
      eip1193.removeListener("chainChanged", onChainChanged);
    } catch {
      /* some wallets throw */
    }
  }
  eip1193 = eth;
  eth.on?.("accountsChanged", onAccountsChanged);
  eth.on?.("chainChanged", onChainChanged);
}

function onAccountsChanged(accounts) {
  accountListener?.(accounts);
}

function onChainChanged() {
  window.location.reload();
}

async function ensureMainnet(eth) {
  const chainId = await eth.request({ method: "eth_chainId" });
  if (chainId === "0x1") return;
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1" }],
    });
  } catch (err) {
    if (err?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x1",
            chainName: "Ethereum",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://cloudflare-eth.com"],
            blockExplorerUrls: ["https://etherscan.io"],
          },
        ],
      });
      return;
    }
    throw err;
  }
}

export async function connectWithEthereum(eth) {
  if (!eth?.request) throw fail(CHAIN_ERR.NO_WALLET);
  bindEip1193(eth);
  await eth.request({ method: "eth_requestAccounts" });
  await ensureMainnet(eth);
  provider = new BrowserProvider(eth);
  signer = await provider.getSigner();
  contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
  return signer.getAddress();
}

export async function connectWallet() {
  const wallets = listInjectedWallets();
  if (!wallets.length) throw fail(CHAIN_ERR.OPEN_IN_APP);
  const preferred =
    wallets.find((w) => w.id === "okx") ||
    wallets.find((w) => w.id === "binance") ||
    wallets[0];
  return connectWithEthereum(preferred.ethereum);
}

export function getContract() {
  if (!contract) throw fail(CHAIN_ERR.NOT_CONNECTED);
  return contract;
}

async function ethCallOn(url, name) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: CONTRACT_ADDRESS, data: iface.encodeFunctionData(name) }, "latest"],
    }),
  });
  const json = await res.json();
  if (!json.result || json.result === "0x") {
    throw new Error(json.error?.message || `${name} empty`);
  }
  return iface.decodeFunctionResult(name, json.result)[0];
}

async function readDeskFromRpc(url) {
  const minted = await ethCallOn(url, "minted");
  const pulls = await ethCallOn(url, "pulls");
  const price = await ethCallOn(url, "price");
  const treasury = await ethCallOn(url, "treasury");
  const owner = await ethCallOn(url, "owner");
  const supply = await ethCallOn(url, "MAX_SUPPLY");
  return {
    minted: Number(minted),
    price,
    pulls: Number(pulls),
    treasury,
    owner,
    supply: Number(supply),
  };
}

export async function readPublicMeters() {
  let lastErr;
  for (const url of PUBLIC_RPCS) {
    try {
      const minted = Number(await ethCallOn(url, "minted"));
      const pulls = Number(await ethCallOn(url, "pulls"));
      return { minted, pulls };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || fail(CHAIN_ERR.GUESTBOOK);
}

export async function readDesk() {
  if (contract) {
    try {
      const c = contract;
      const [minted, price, pulls, treasury, owner, supply] = await Promise.all([
        c.minted(),
        c.price(),
        c.pulls(),
        c.treasury(),
        c.owner(),
        c.MAX_SUPPLY(),
      ]);
      return {
        minted: Number(minted),
        price,
        pulls: Number(pulls),
        treasury,
        owner,
        supply: Number(supply),
      };
    } catch {
      /* fall through to public RPC */
    }
  }
  let lastErr;
  for (const url of PUBLIC_RPCS) {
    try {
      return await readDeskFromRpc(url);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || fail(CHAIN_ERR.GUESTBOOK);
}

export async function sendPull(qty, priceWei) {
  const c = getContract();
  const tx = await c.pull(qty, { value: priceWei * BigInt(qty) });
  const receipt = await tx.wait();
  return parsePullReceipt(receipt, await signer.getAddress());
}

export function parsePullReceipt(receipt, player) {
  const tokenIds = [];
  let hits = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      if (!parsed) continue;
      if (parsed.name === "Transfer" && parsed.args.from === ZeroAddress) {
        tokenIds.push(Number(parsed.args.tokenId));
      }
      if (parsed.name === "Pull" && parsed.args.player.toLowerCase() === player.toLowerCase()) {
        hits = Number(parsed.args.hits);
      }
    } catch {
      /* other contracts in the tx */
    }
  }
  return { hits, tokenIds, hash: receipt.hash };
}

export async function tokensOf(address) {
  const c = getContract();
  const filter = c.filters.Transfer(ZeroAddress, address);
  const logs = await c.queryFilter(filter, DEPLOY_BLOCK);
  return logs.map((log) => Number(log.args.tokenId));
}

function readProviders() {
  const list = [];
  if (provider) list.push(provider);
  for (const url of PUBLIC_RPCS) list.push(new JsonRpcProvider(url, 1, { staticNetwork: true }));
  return list;
}

export async function loadGuestbook(limit = 36) {
  let lastErr;
  for (const p of readProviders()) {
    try {
      const c = new Contract(CONTRACT_ADDRESS, ABI, p);
      const [pullLogs, mintLogs] = await Promise.all([
        c.queryFilter(c.filters.Pull(), DEPLOY_BLOCK),
        c.queryFilter(c.filters.Transfer(ZeroAddress), DEPLOY_BLOCK),
      ]);

      const mintsByTx = new Map();
      for (const log of mintLogs) {
        const hash = log.transactionHash;
        if (!mintsByTx.has(hash)) mintsByTx.set(hash, []);
        mintsByTx.get(hash).push(Number(log.args.tokenId));
      }

      const rows = [];
      for (const log of pullLogs.slice().reverse()) {
        const who = log.args.player;
        const qty = Number(log.args.qty);
        const hits = Number(log.args.hits);
        const tokenIds = mintsByTx.get(log.transactionHash) || [];
        const misses = Math.max(0, qty - (tokenIds.length || hits));
        for (const tokenId of tokenIds) {
          rows.push({ hit: true, tokenId, who, hash: log.transactionHash });
        }
        if (misses > 0) {
          rows.push({ hit: false, misses, who, hash: log.transactionHash });
        }
        if (rows.length >= limit) break;
      }
      return rows.slice(0, limit);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || fail(CHAIN_ERR.GUESTBOOK);
}

export function etherscanTx(hash) {
  return `https://etherscan.io/tx/${hash}`;
}

export { formatEther };
