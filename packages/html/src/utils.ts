const NAMED_COLORS: Record<string, string> = {
  black: "000000",
  white: "ffffff",
  red: "ff0000",
  green: "008000",
  blue: "0000ff",
  yellow: "ffff00",
  cyan: "00ffff",
  magenta: "ff00ff",
  gray: "808080",
  grey: "808080",
  silver: "c0c0c0",
  maroon: "800000",
  olive: "808000",
  purple: "800080",
  teal: "008080",
  navy: "000080",
  orange: "ffa500",
};

export interface DocumentLike {
  createElement: (tagName: string) => unknown;
}

export const standardizeColor = (str: string, doc?: DocumentLike) => {
  if (str.startsWith("#")) return str.slice(1);
  const lower = str.toLowerCase();
  if (NAMED_COLORS[lower]) return NAMED_COLORS[lower];

  const d = doc ?? (typeof document !== "undefined" ? document : undefined);
  if (!d) return "auto";
  try {
    const canvas = d.createElement("canvas") as HTMLCanvasElement;
    const ctx =
      typeof canvas?.getContext === "function" ? canvas.getContext("2d") : null;
    /* v8 ignore next 4 - canvas is not supported in JSDOM / linkedom */
    if (!ctx) return "auto";
    ctx.fillStyle = str;
    return ctx.fillStyle.slice(1);
  } catch {
    return "auto";
  }
};
