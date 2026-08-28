export const REVEALED = false;

export function boxColor(tier) {
  if (tier === "legendary") return "gold";
  if (tier === "rare") return "violet";
  return "white";
}

export function boxSrc(tier) {
  return `/boxes/${boxColor(tier)}.png`;
}

export function missSrc() {
  return "/boxes/void.png";
}
