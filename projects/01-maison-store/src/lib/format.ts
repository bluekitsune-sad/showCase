export function formatPrice(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

const COLOUR_HEX: Record<string, string> = {
  ink: "#23201c",
  charcoal: "#3b3a36",
  stone: "#cfc6b6",
  ash: "#b8b3a9",
  oat: "#ded3bf",
  tan: "#b58a5e",
  black: "#1a1a1a",
  brown: "#6b4a34",
  chalk: "#f1ede3",
  sky: "#b9cdd4",
  sand: "#d8c5a8",
  olive: "#6c7255",
  ecru: "#ece4d4",
  clay: "#a9705a",
  natural: "#d9cbb2",
  chestnut: "#7a4a2f",
  brass: "#b08d57",
  rust: "#a5573c",
  moss: "#5f6b4d",
};

export function colourHex(name: string): string {
  return COLOUR_HEX[name.trim().toLowerCase()] ?? "#b8b3a9";
}

// Generated placeholder art. The demo ships without photography, so every
// product image is a deterministic gradient rather than a hot-linked file.
const GRADIENTS = [
  "linear-gradient(140deg, #e6e0d3 0%, #c9c0ad 100%)",
  "linear-gradient(150deg, #d9dcd3 0%, #a8b0a0 100%)",
  "linear-gradient(135deg, #e4dcd1 0%, #b9a897 100%)",
  "linear-gradient(160deg, #dfe1e2 0%, #adb3b6 100%)",
  "linear-gradient(145deg, #e8e3d6 0%, #c3b59c 100%)",
  "linear-gradient(130deg, #dcd9d1 0%, #a9a49a 100%)",
];

export function toneGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
