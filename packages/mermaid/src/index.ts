import type {
  IPlugin,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
  SVG,
} from "@m2d/core";
import {
  type CacheConfigType,
  createPersistentCache,
  simpleCleanup,
} from "@m2d/core/cache";
import mermaid, { type MermaidConfig, type RenderResult } from "mermaid";

export interface IMermaidPluginOptions {
  /**
   * Options for configuring Mermaid rendering.
   *
   * Pass a partial MermaidConfig object to customize behavior.
   * Refer to the Mermaid documentation for full configuration options:
   * @see https://mermaid.js.org/configuration.html
   */
  mermaidConfig?: MermaidConfig;

  /**
   * Optional fixer function to repair invalid Mermaid code before retrying render.
   */
  fixMermaid?: (mermaidCode: string, error: Error) => string;

  /**
   * Whether to automatically attempt best-effort repair of common Mermaid syntax errors
   * (e.g. unquoted labels containing special characters like @, :, /, parentheses).
   * @default true
   */
  autoFix?: boolean;

  /**
   * In-memory cache object, useful for cache sharing across plugins/tabs.
   */
  cache?: Record<string, Promise<unknown>>;

  /** Configure caching */
  cacheConfig?: CacheConfigType<RenderResult | undefined>;

  /** Clean up the entries that are not used for following minutes. @default 30 * 24 * 60 -- that is 30 days */
  maxAgeMinutes?: number;
}

/** Namespace used for persistent cache cleanup */
const NAMESPACE = "mmd";

/**
 * Default configuration for Mermaid rendering.
 *
 * Sets a fixed `fontFamily` ("sans-serif") to avoid inconsistent
 * rendering due to platform font differences.
 *
 * @see https://mermaid.js.org/configuration.html#fontfamily
 */
const defaultMermaidConfig: MermaidConfig = {
  fontFamily: "sans-serif",
  suppressErrorRendering: true,
  htmlLabels: false,
  flowchart: { htmlLabels: false },
};

const defaultCacheConfig = {
  cacheMode: "both",
  ignoreKeys: ["type", "lang"],
  parallel: true,
};

/**
 * Wraps a diagram node or edge label safely in double quotes.
 *
 * @param text - The raw label text.
 * @returns Double-quoted string with inner double quotes sanitized.
 */
const quoteLabel = (text: string): string => {
  const trimmed = text.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed;
  }
  return `"${trimmed.replace(/"/g, "'")}"`;
};

/**
 * Best-effort auto-fixer for Mermaid diagrams.
 *
 * Quotes unquoted flowchart node labels and connection texts containing special characters.
 *
 * @param value - Original Mermaid diagram source code.
 * @param _error - Optional parse error from Mermaid.
 * @returns Repaired Mermaid source code.
 */
export const defaultMermaidFixer = (value: string, _error?: Error): string => {
  return (
    value
      // Stadium shape: ID([ ... ])
      .replace(
        /\b([a-zA-Z0-9_-]+)\(\[\s*([^"\r\n\]]+?)\s*\]\)/g,
        (_match, id, text) => `${id}([${quoteLabel(text)}])`,
      )
      // Cylinder shape: ID[( ... )]
      .replace(
        /\b([a-zA-Z0-9_-]+)\[\(\s*([^"\r\n)]+?)\s*\)\]/g,
        (_match, id, text) => `${id}[(${quoteLabel(text)})]`,
      )
      // Subroutine shape: ID[[ ... ]]
      .replace(
        /\b([a-zA-Z0-9_-]+)\[\[\s*([^"\r\n\]]+?)\s*\]\]/g,
        (_match, id, text) => `${id}[[${quoteLabel(text)}]]`,
      )
      // Circle shape: ID(( ... ))
      .replace(
        /\b([a-zA-Z0-9_-]+)\(\(\s*([^"\r\n)]+?)\s*\)\)/g,
        (_match, id, text) => `${id}((${quoteLabel(text)}))`,
      )
      // Rhombus / Decision shape: ID{ ... }
      .replace(
        /\b([a-zA-Z0-9_-]+)\{\s*([^"\r\n}]+?)\s*\}/g,
        (_match, id, text) => `${id}{${quoteLabel(text)}}`,
      )
      // Rectangle shape: ID[ ... ]
      .replace(
        /\b([a-zA-Z0-9_-]+)\[\s*([^"\r\n\]]+?)\s*\]/g,
        (_match, id, text) => `${id}[${quoteLabel(text)}]`,
      )
      // Rounded shape: ID( ... )
      .replace(
        /\b([a-zA-Z0-9_-]+)\(\s*([^"\r\n)]+?)\s*\)/g,
        (_match, id, text) => `${id}(${quoteLabel(text)})`,
      )
      // Pipe edge labels: -->| ... |
      .replace(
        /(\|)([^"\r\n|]+?)(\|)/g,
        (_match, _p1, text) => `|${quoteLabel(text)}|`,
      )
  );
};

/**
 * Attempts to render Mermaid diagram into SVG, falling back to custom or built-in auto-fixers on failure.
 *
 * @param value - Mermaid diagram definition string.
 * @param options - Plugin options including custom fixer and autoFix flag.
 * @returns RenderResult or undefined on failure.
 */
const renderMermaidDiagram = async (
  value: string,
  options?: IMermaidPluginOptions,
): Promise<RenderResult | undefined> => {
  const mId = `m${crypto.randomUUID()}`; // Must not start with a number

  try {
    return await mermaid.render(mId, value);
  } catch (error) {
    console.warn(
      "[m2d/mermaid] Initial render failed, attempting recovery:",
      error,
    );

    if (options?.fixMermaid) {
      try {
        return await mermaid.render(
          mId,
          options.fixMermaid(value, error as Error),
        );
      } catch (error1) {
        console.warn("[m2d/mermaid] Custom fixMermaid attempt failed:", error1);
      }
    }

    const autoFixEnabled = options?.autoFix ?? true;
    if (autoFixEnabled) {
      try {
        const autoFixed = defaultMermaidFixer(value, error as Error);
        if (autoFixed !== value) {
          return await mermaid.render(mId, autoFixed);
        }
      } catch (error2) {
        console.warn(
          "[m2d/mermaid] Built-in auto-fixer attempt failed:",
          error2,
        );
      }
    }

    return undefined;
  }
};

/**
 * Mermaid plugin for @m2d/core.
 * Detects `mermaid`, `mmd`, and `mindmap` code blocks and converts them to SVG.
 * The resulting SVGs are later rendered as images in DOCX exports.
 */
export const mermaidPlugin: (options?: IMermaidPluginOptions) => IPlugin = (
  options,
) => {
  // Merge user config with defaults and initialize Mermaid
  const finalConfig: MermaidConfig = {
    ...defaultMermaidConfig,
    ...options?.mermaidConfig,
    flowchart: {
      ...defaultMermaidConfig.flowchart,
      ...options?.mermaidConfig?.flowchart,
    },
  };
  mermaid.initialize(finalConfig);

  const cacheConfig = {
    cache: options?.cache ?? undefined,
    ...defaultCacheConfig,
    ...options?.cacheConfig,
  } as CacheConfigType<RenderResult | undefined>;

  const maxAgeMinutes = options?.maxAgeMinutes ?? 30 * 24 * 60;
  let cleanupDone = false;

  const mermaidProcessor = (value: string, _config?: MermaidConfig) =>
    renderMermaidDiagram(value, options);

  const preprocess = (node: Root | RootContent | PhrasingContent) => {
    // Recursively walk the AST
    (node as Parent).children?.forEach(preprocess);

    // Replace supported code blocks with async SVG nodes
    if (node.type === "code" && /(mindmap|mermaid|mmd)/.test(node.lang ?? "")) {
      let value = node.value;

      // Add missing "mindmap" prefix if needed
      if (node.lang === "mindmap" && !value.startsWith("mindmap")) {
        value = `mindmap\n${value}`;
      }

      // Normalize whitespace unless the diagram type is known to be sensitive
      if (!/^mindmap|gantt|gitGraph|timeline/i.test(value)) {
        value = value
          .split("\n")
          .map((line) => line.trim())
          .join("\n");
      }
      const svgNode: SVG = {
        type: "svg",
        value: createPersistentCache(mermaidProcessor, NAMESPACE, {
          ...cacheConfig,
          shouldCache: (res) => Boolean(res?.svg?.length),
        })(value, finalConfig),
        data: { mermaid: value }, // Preserve original source
      };

      Object.assign(node, {
        type: "paragraph",
        children: [svgNode],
        data: { alignment: "center" }, // Center-align diagram
      });
    }
  };

  return {
    /**
     * Transforms supported code blocks into centered SVGs for DOCX output.
     */
    preprocess,
    /** clean up IndexedDB once the document is packed */
    postprocess: () => {
      if (
        (options?.cacheConfig?.cacheMode
          ? options?.cacheConfig?.cacheMode !== "memory"
          : true) &&
        !cleanupDone
      ) {
        cleanupDone = true;
        simpleCleanup(maxAgeMinutes, NAMESPACE);
      }
    },
  };
};
