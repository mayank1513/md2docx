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
  try {
    const svg = await renderMermaidSVGAsync(code, themeConfig);
    return { svg, diagramType: "mermaid" };
  } catch (error) {
    if (options?.fixMermaid) {
      try {
        const fixed = options.fixMermaid(code, error as Error);
        const svg = await renderMermaidSVGAsync(fixed, themeConfig);
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
    };
    Object.assign(node, svgNode);
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
