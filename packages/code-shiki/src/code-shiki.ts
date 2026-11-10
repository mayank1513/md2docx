import {
  codePlugin,
  type ICodePluginOptions,
  type Token,
  type TokenType,
} from "@m2d/code";
import type { EmptyNode, IPlugin } from "@m2d/core";
import {
  type BundledLanguage,
  type BundledTheme,
  bundledLanguages,
  createHighlighter,
  type HighlighterGeneric,
} from "shiki";

export type ShikiHighlighter = HighlighterGeneric<
  BundledLanguage,
  BundledTheme
>;

/**
 * TextMate token structure with optional scope explanation.
 */
export interface ThemedTokenLike {
  content: string;
  explanation?: {
    scopes?: { scopeName: string }[];
  }[];
}

/**
 * Configuration options for the Shiki code highlighting plugin.
 */
export interface ICodeShikiOptions extends ICodePluginOptions {
  /**
   * Pre-configured Shiki highlighter instance.
   * If omitted, a shared singleton highlighter is automatically managed.
   */
  highlighter?: ShikiHighlighter;

  /**
   * Shiki theme identifier to use during tokenization.
   * Defaults to matching the plugin `theme` option if string, or "github-light".
   */
  shikiTheme?: string;

  /**
   * Additional languages to preload when auto-initializing Shiki.
   */
  langs?: BundledLanguage[];
}

export interface ICreateCodeShikiOptions extends ICodeShikiOptions {
  /**
   * Shiki themes to preload during creation.
   * @default ["github-light", "github-dark", "monokai"]
   */
  themes?: BundledTheme[];
}

/**
 * Default languages preloaded for common document compilation workloads.
 */
export const DEFAULT_SHIKI_LANGS: BundledLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "json",
  "html",
  "css",
  "markdown",
  "bash",
  "sql",
  "yaml",
];

/**
 * Default themes loaded in the shared highlighter.
 */
export const DEFAULT_SHIKI_THEMES: BundledTheme[] = [
  "github-light",
  "github-dark",
  "monokai",
];

/**
 * Rules mapping TextMate scope patterns to @m2d/code TokenType.
 * Ordered by precedence.
 */
export const SCOPE_RULES: [RegExp, TokenType][] = [
  [/(?:^|\.)comment(?:\.|$)/, "comment"],
  [/(?:^|\.)string(?:\.|$)/, "string"],
  [/(?:^|\.)constant\.numeric(?:\.|$)/, "number"],
  [/(?:^|\.)constant\.language\.(?:boolean|null|undefined)(?:\.|$)/, "boolean"],
  [/(?:^|\.)keyword\.operator(?:\.|$)/, "operator"],
  [/(?:^|\.)(?:keyword|storage\.type|storage\.modifier)(?:\.|$)/, "keyword"],
  [/(?:^|\.)(?:entity\.name\.function|support\.function)(?:\.|$)/, "function"],
  [
    /(?:^|\.)(?:support\.type|support\.class|entity\.name\.type|entity\.name\.class|support\.constant)(?:\.|$)/,
    "builtin",
  ],
  [/(?:^|\.)markup\.inserted(?:\.|$)/, "diffAdd"],
  [/(?:^|\.)markup\.deleted(?:\.|$)/, "diffDelete"],
  [/(?:^|\.)meta\.diff\.header(?:\.|$)/, "diffHeader"],
  [/(?:^|\.)(?:variable|entity\.name\.variable)(?:\.|$)/, "variable"],
  [/(?:^|\.)punctuation(?:\.|$)/, "punctuation"],
];

/**
 * Maps TextMate grammar scope chains to md2docx TokenType.
 * Searches from the most specific (innermost) scope to the outermost.
 */
export const resolveTokenType = (
  scopes?: string[] | null,
): TokenType | undefined => {
  if (!scopes || scopes.length === 0) return undefined;

  for (let i = scopes.length - 1; i >= 0; i--) {
    const scope = scopes[i];
    if (!scope) continue;

    for (const [pattern, tokenType] of SCOPE_RULES) {
      if (pattern.test(scope)) {
        return tokenType;
      }
    }
  }

  return undefined;
};

/**
 * Converts Shiki ThemedToken lines into @m2d/code Token[][] structure.
 */
export const shikiLinesToTokens = (lines: ThemedTokenLike[][]): Token[][] => {
  return lines.map((line) =>
    line.map((token) => {
      const scopes = (token.explanation ?? []).flatMap((exp) =>
        (exp.scopes ?? []).map((s) => s.scopeName),
      );
      const type = resolveTokenType(scopes) ?? "text";
      return {
        type,
        value: token.content,
      };
    }),
  );
};

/**
 * Recursively scans MDAST node tree to collect code language identifiers.
 */
export const collectCodeLanguages = (
  node: unknown,
  langs: Set<string> = new Set(),
): string[] => {
  if (!node || typeof node !== "object") return Array.from(langs);

  const n = node as Record<string, unknown>;
  if (n.type === "code" && typeof n.lang === "string") {
    const cleaned = n.lang.toLowerCase().trim();
    if (cleaned) langs.add(cleaned);
  }

  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      collectCodeLanguages(child, langs);
    }
  }

  return Array.from(langs);
};

/**
 * Creates a Shiki-powered tokenizer function compatible with @m2d/code.
 */
export const createShikiTokenizer = (
  highlighter: ShikiHighlighter,
  defaultTheme = "github-light",
) => {
  return (code: string, language?: string): Token[][] => {
    const normalizedLang = language?.toLowerCase().trim();
    const loadedLangs = highlighter.getLoadedLanguages();
    const loadedThemes = highlighter.getLoadedThemes();
    const activeTheme = loadedThemes.includes(defaultTheme)
      ? defaultTheme
      : (loadedThemes[0] ?? "github-light");

    if (normalizedLang && loadedLangs.includes(normalizedLang)) {
      try {
        const rawLines = highlighter.codeToTokensBase(code, {
          lang: normalizedLang as BundledLanguage,
          theme: activeTheme as BundledTheme,
          includeExplanation: true,
        });
        return shikiLinesToTokens(rawLines);
      } catch {
        // Fallback to plain text below
      }
    }

    // Graceful plain text fallback preserving lines
    return code.split(/\r\n|\r|\n/).map((line) => [
      {
        type: "text" as TokenType,
        value: line,
      },
    ]);
  };
};

let sharedHighlighterPromise: Promise<ShikiHighlighter> | undefined;

/**
 * Returns a shared singleton Shiki highlighter, dynamically loading missing languages.
 */
export const getSharedHighlighter = async (
  langs: BundledLanguage[] = DEFAULT_SHIKI_LANGS,
  themes: BundledTheme[] = DEFAULT_SHIKI_THEMES,
): Promise<ShikiHighlighter> => {
  if (!sharedHighlighterPromise) {
    sharedHighlighterPromise = createHighlighter({
      langs,
      themes,
    });
  } else {
    const highlighter = await sharedHighlighterPromise;
    const loadedLangs = new Set(highlighter.getLoadedLanguages());
    const missing = langs.filter(
      (lang) => !loadedLangs.has(lang) && lang in bundledLanguages,
    );
    if (missing.length > 0) {
      await highlighter.loadLanguage(...missing);
    }
  }
  return sharedHighlighterPromise;
};

/**
 * Plugin to convert Markdown code blocks to DOCX using Shiki syntax highlighting.
 */
export const codeShikiPlugin = (
  options: ICodeShikiOptions = {},
): IPlugin<EmptyNode> => {
  const { highlighter: userHighlighter, shikiTheme, ...restOptions } = options;

  const defaultThemeName =
    typeof options.theme === "string"
      ? options.theme
      : (shikiTheme ?? "github-light");

  let activeHighlighter = userHighlighter;
  let activeTokenizer = activeHighlighter
    ? createShikiTokenizer(activeHighlighter, defaultThemeName)
    : undefined;

  let basePlugin = codePlugin({
    ...(activeTokenizer ? { tokenizer: activeTokenizer } : {}),
    ...restOptions,
  });

  return {
    ...basePlugin,

    preprocess: async (tree, definitions, docxProps) => {
      if (!activeHighlighter) {
        const docLangs = collectCodeLanguages(tree) as BundledLanguage[];
        const targetLangs = Array.from(
          new Set([...DEFAULT_SHIKI_LANGS, ...docLangs]),
        ).filter((lang) => lang in bundledLanguages);

        activeHighlighter = await getSharedHighlighter(targetLangs);
        activeTokenizer = createShikiTokenizer(
          activeHighlighter,
          defaultThemeName,
        );
        basePlugin = codePlugin({
          tokenizer: activeTokenizer,
          ...restOptions,
        });
      } else {
        const docLangs = collectCodeLanguages(tree);
        const loaded = new Set(activeHighlighter.getLoadedLanguages());
        const missing = docLangs.filter(
          (lang) => !loaded.has(lang) && lang in bundledLanguages,
        ) as BundledLanguage[];

        if (missing.length > 0) {
          await activeHighlighter.loadLanguage(...missing);
        }
      }

      await basePlugin.preprocess?.(tree, definitions, docxProps);
    },

    block: (docx, node, paraProps, blockChildren, inlineChildren) => {
      return (
        basePlugin.block?.(
          docx,
          node,
          paraProps,
          blockChildren,
          inlineChildren,
        ) ?? []
      );
    },

    inline: (
      docx,
      node,
      runProps,
      definitions,
      footnoteDefinitions,
      inlineChildren,
    ) => {
      return (
        basePlugin.inline?.(
          docx,
          node,
          runProps,
          definitions,
          footnoteDefinitions,
          inlineChildren,
        ) ?? []
      );
    },
  };
};

/**
 * Default alias for codeShikiPlugin.
 */
export const codeShiki = codeShikiPlugin;

/**
 * Asynchronously creates a pre-warmed Shiki plugin instance.
 */
export const createCodeShikiPlugin = async (
  options: ICreateCodeShikiOptions = {},
): Promise<IPlugin<EmptyNode>> => {
  const highlighter =
    options.highlighter ??
    (await createHighlighter({
      themes: options.themes ?? DEFAULT_SHIKI_THEMES,
      langs: options.langs ?? DEFAULT_SHIKI_LANGS,
    }));

  return codeShikiPlugin({
    ...options,
    highlighter,
  });
};

/**
 * Default alias for createCodeShikiPlugin.
 */
export const createCodeShiki = createCodeShikiPlugin;
