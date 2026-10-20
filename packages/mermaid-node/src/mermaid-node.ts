import type {
  IPlugin,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
  SVG,
} from "@m2d/core";
import { type CacheConfigType, createPersistentCache } from "@m2d/core/cache";
import { renderMermaidSVGAsync, THEMES } from "beautiful-mermaid";

export { THEMES };
export type MermaidTheme = keyof typeof THEMES | Record<string, unknown>;

export interface RenderResultLike {
  svg: string;
  diagramType: string;
}

export interface IMermaidNodePluginOptions {
  /**
   * Built-in theme name (e.g. 'zinc-light', 'github-light', 'dracula') or custom theme object.
   * @default 'zinc-light'
   */
  theme?: MermaidTheme;

  /**
   * Additional render options passed to beautiful-mermaid.
   */
  renderOptions?: Record<string, unknown>;

  /**
   * Optional fixer function to repair invalid Mermaid code before retrying render.
   */
  fixMermaid?: (mermaidCode: string, error: Error) => string;

  /**
   * In-memory cache object, useful for cache sharing across plugins.
   */
  cache?: Record<string, Promise<unknown>>;

  /** Configure caching */
  cacheConfig?: CacheConfigType<RenderResultLike | undefined>;
}

/** Cache namespace for Node.js Mermaid rendering */
const NAMESPACE = "mmd-node";

const defaultCacheConfig = {
  cacheMode: "both",
  ignoreKeys: ["type", "lang"],
  parallel: true,
};

const hexToRgb = (hex: string): [number, number, number] => {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  }
  const num = Number.parseInt(c, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const rgbToHex = ([r, g, b]: [number, number, number]): string => {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

const mixColors = (
  color1Hex: string,
  color2Hex: string,
  pct1: number,
): string => {
  const [r1, g1, b1] = hexToRgb(color1Hex);
  const [r2, g2, b2] = hexToRgb(color2Hex);
  const factor = pct1 / 100;
  return rgbToHex([
    Math.round(r1 * factor + r2 * (1 - factor)),
    Math.round(g1 * factor + g2 * (1 - factor)),
    Math.round(b1 * factor + b2 * (1 - factor)),
  ]);
};

/**
 * Inlines CSS custom properties and color-mix values in beautiful-mermaid SVG
 * so that librsvg / sharp renders them in full color rather than solid black.
 */
export const inlineSvgCssVariables = (
  svg: string,
  transparent = true,
): string => {
  const styleMatch = svg.match(/style="([^"]+)"/);
  if (!styleMatch) {
    return svg;
  }
  const styleStr = styleMatch[1];
  const vars: Record<string, string> = {};
  for (const part of styleStr.split(";")) {
    const [k, v] = part.split(":").map((s) => s?.trim());
    if (k && v) {
      vars[k] = v;
    }
  }
  const bg = vars["--bg"] || "#FFFFFF";
  const fg = vars["--fg"] || "#27272A";

  const colorMap: Record<string, string> = {
    "var(--_text)": fg,
    "var(--_text-sec)": vars["--muted"] || mixColors(fg, bg, 60),
    "var(--_text-muted)": vars["--muted"] || mixColors(fg, bg, 40),
    "var(--_text-faint)": mixColors(fg, bg, 25),
    "var(--_line)": vars["--line"] || mixColors(fg, bg, 50),
    "var(--_arrow)": vars["--accent"] || mixColors(fg, bg, 85),
    "var(--_node-fill)":
      vars["--surface"] || (transparent ? "#FFFFFF" : mixColors(fg, bg, 3)),
    "var(--_node-stroke)": vars["--border"] || mixColors(fg, bg, 20),
    "var(--_group-fill)": transparent ? "none" : bg,
    "var(--_group-hdr)": mixColors(fg, bg, 5),
    "var(--_inner-stroke)": mixColors(fg, bg, 12),
    "var(--_key-badge)": mixColors(fg, bg, 10),
    "var(--bg)": bg,
    "var(--fg)": fg,
  };

  let inlined = svg;
  for (const [varRef, resolvedHex] of Object.entries(colorMap)) {
    inlined = inlined.replaceAll(varRef, resolvedHex);
  }

  if (transparent) {
    inlined = inlined.replace(/background:\s*var\(--bg\);?/, "");
    inlined = inlined.replace(/background-color:\s*[^;"]+;?/, "");
  }

  return inlined;
};

/**
 * Auto-normalizes sequence diagrams with multi-word actor names (which beautiful-mermaid
 * would otherwise skip because its parser regex expects non-whitespace actor IDs).
 */
export const normalizeSequenceDiagram = (code: string): string => {
  const lines = code.split("\n");
  const first = lines[0].trim();
  if (!/^sequenceDiagram/i.test(first)) {
    return code;
  }

  const msgRe =
    /^(\s*)(.+?)\s*(--?>?>|--?[)x]|--?>>|--?>)\s*([+-]?)(.+?)\s*:\s*(.+)$/;
  const participantsWithSpaces = new Map<string, string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("participant ") || trimmed.startsWith("actor ")) {
      continue;
    }
    const m = trimmed.match(msgRe);
    if (m) {
      const from = m[2].trim();
      const to = m[5].trim();
      if (from.includes(" ")) {
        participantsWithSpaces.set(from, from.replace(/\s+/g, "_"));
      }
      if (to.includes(" ")) {
        participantsWithSpaces.set(to, to.replace(/\s+/g, "_"));
      }
    }
  }

  if (participantsWithSpaces.size === 0) {
    return code;
  }

  const participantDecls: string[] = [];
  for (const [name, id] of participantsWithSpaces.entries()) {
    participantDecls.push(`    participant ${id} as ${name}`);
  }

  const newLines = [lines[0], ...participantDecls];
  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];
    const m = line.match(msgRe);
    if (m) {
      const from = m[2].trim();
      const to = m[5].trim();
      const updatedFrom = participantsWithSpaces.get(from) ?? from;
      const updatedTo = participantsWithSpaces.get(to) ?? to;
      line = `${m[1]}${updatedFrom} ${m[3]} ${m[4]}${updatedTo}: ${m[6]}`;
    }
    newLines.push(line);
  }

  return newLines.join("\n");
};

/**
 * Resolves theme configuration from a name or custom object.
 */
const resolveTheme = (
  theme?: MermaidTheme,
  renderOptions?: Record<string, unknown>,
): Record<string, unknown> => {
  const baseTheme =
    typeof theme === "string"
      ? (THEMES[theme as keyof typeof THEMES] ?? THEMES["zinc-light"])
      : (theme ?? THEMES["zinc-light"]);

  return {
    transparent: true,
    ...baseTheme,
    ...renderOptions,
  };
};

/**
 * Renders a Mermaid diagram into an SVG string using beautiful-mermaid.
 */
const renderDiagram = async (
  code: string,
  options?: IMermaidNodePluginOptions,
): Promise<RenderResultLike | undefined> => {
  const themeConfig = resolveTheme(options?.theme, options?.renderOptions);
  const normalizedCode = normalizeSequenceDiagram(code);
  const isTransparent = Boolean(themeConfig.transparent ?? true);

  try {
    const rawSvg = await renderMermaidSVGAsync(normalizedCode, themeConfig);
    if (/viewBox="0\s+0\s+0\s+0"/.test(rawSvg)) {
      throw new Error("Empty diagram rendered (viewBox 0 0 0 0)");
    }
    const svg = inlineSvgCssVariables(rawSvg, isTransparent);
    return { svg, diagramType: "mermaid" };
  } catch (error) {
    if (options?.fixMermaid) {
      try {
        const fixed = options.fixMermaid(code, error as Error);
        const fixedNormalized = normalizeSequenceDiagram(fixed);
        const rawSvg = await renderMermaidSVGAsync(
          fixedNormalized,
          themeConfig,
        );
        if (/viewBox="0\s+0\s+0\s+0"/.test(rawSvg)) {
          throw new Error("Empty diagram rendered (viewBox 0 0 0 0)");
        }
        const svg = inlineSvgCssVariables(rawSvg, isTransparent);
        return { svg, diagramType: "mermaid" };
      } catch (fixErr) {
        console.warn(
          "[m2d/mermaid-node] Custom fixMermaid attempt failed:",
          fixErr,
        );
      }
    }
    console.warn("[m2d/mermaid-node] Failed to render diagram:", error);
    return undefined;
  }
};

/**
 * Recursively walks AST to replace mermaid code blocks with SVG nodes.
 */
const walkAndTransform = (
  node: Root | RootContent | PhrasingContent,
  renderFn: (code: string) => Promise<RenderResultLike | undefined>,
): void => {
  (node as Parent).children?.forEach((child) => {
    walkAndTransform(child, renderFn);
  });

  if (node.type === "code" && /(mindmap|mermaid|mmd)/.test(node.lang ?? "")) {
    const code = node.value.trim();
    const svgNode: SVG = {
      type: "svg",
      value: renderFn(code),
      data: {
        ...node.data,
        mermaid: code,
      },
    };
    Object.assign(node, {
      type: "paragraph",
      children: [svgNode],
      data: { alignment: "center" },
    });
  }
};

/**
 * Server-side Mermaid plugin for @m2d/core using beautiful-mermaid.
 * Replaces mermaid code blocks with SVG nodes without requiring a DOM.
 */
export const mermaidNodePlugin: (
  options?: IMermaidNodePluginOptions,
) => IPlugin = (options) => {
  const cacheConfig = {
    cache: options?.cache ?? undefined,
    ...defaultCacheConfig,
    ...options?.cacheConfig,
  } as CacheConfigType<RenderResultLike | undefined>;

  const cachedRenderer = createPersistentCache(
    (code: string) => renderDiagram(code, options),
    NAMESPACE,
    {
      ...cacheConfig,
      shouldCache: (res) => Boolean(res?.svg?.length),
    },
  );

  return {
    preprocess: async (root: Root) => {
      walkAndTransform(root, cachedRenderer);
    },
  };
};

/** Alias for mermaidNodePlugin */
export const nodeMermaidPlugin = mermaidNodePlugin;
