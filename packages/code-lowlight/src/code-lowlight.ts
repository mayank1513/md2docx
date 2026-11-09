import {
  codePlugin,
  type ICodePluginOptions,
  splitTokensIntoLines,
  type Token,
  type TokenType,
} from "@m2d/code";
import type { EmptyNode, IPlugin } from "@m2d/core";
import type { ElementContent, Root } from "hast";
import { common, createLowlight } from "lowlight";

export const defaultLowlight = createLowlight(common);

export type LowlightInstance = ReturnType<typeof createLowlight>;

export interface ICodeLowlightOptions extends ICodePluginOptions {
  /**
   * Custom lowlight instance with registered language grammars.
   * Defaults to `createLowlight(common)`.
   */
  lowlight?: LowlightInstance;

  /**
   * Whether to automatically detect language when the requested language is not registered.
   * @default true
   */
  highlightAuto?: boolean;
}

/**
 * Maps highlight.js CSS class names to md2docx TokenType.
 */
export const resolveTokenType = (
  classNames?: unknown[],
): TokenType | undefined => {
  if (!Array.isArray(classNames)) return undefined;

  for (const rawCls of classNames) {
    if (typeof rawCls !== "string") continue;
    const cls = rawCls.replace(/^hljs-/, "");

    switch (cls) {
      case "keyword":
      case "selector-tag":
      case "section":
        return "keyword";

      case "built_in":
      case "type":
        return "builtin";

      case "literal":
        return "boolean";

      case "number":
        return "number";

      case "string":
      case "regexp":
      case "template-variable":
        return "string";

      case "comment":
      case "doctag":
      case "meta":
        return "comment";

      case "title":
      case "title.function":
      case "function":
        return "function";

      case "variable":
      case "variable.language":
      case "params":
      case "attr":
      case "attribute":
      case "property":
      case "selector-attr":
      case "selector-class":
      case "selector-id":
        return "variable";

      case "operator":
        return "operator";

      case "punctuation":
        return "punctuation";

      case "addition":
        return "diffAdd";

      case "deletion":
        return "diffDelete";

      default:
        break;
    }
  }

  return undefined;
};

/**
 * Recursively walks HAST tree nodes, flattening them into typed Tokens.
 */
export const hastToTokens = (
  node: Root | ElementContent,
  currentType: TokenType = "text",
  tokens: Token[] = [],
): Token[] => {
  if (node.type === "text") {
    tokens.push({ type: currentType, value: node.value });
    return tokens;
  }

  if (node.type === "element") {
    const nodeType =
      resolveTokenType(node.properties?.className as unknown[]) ?? currentType;
    if (node.children) {
      for (const child of node.children) {
        hastToTokens(child, nodeType, tokens);
      }
    }
  } else if (node.type === "root" && node.children) {
    for (const child of node.children) {
      hastToTokens(child, currentType, tokens);
    }
  }

  return tokens;
};

/**
 * Creates a lowlight-powered tokenizer function compatible with @m2d/code.
 */
export const createLowlightTokenizer = (
  lowlight: LowlightInstance = defaultLowlight,
  highlightAuto = true,
) => {
  return (code: string, language?: string): Token[][] => {
    const normalizedLang = language?.toLowerCase().trim();

    let hastTree: Root | undefined;

    if (normalizedLang && lowlight.registered(normalizedLang)) {
      try {
        hastTree = lowlight.highlight(normalizedLang, code);
      } catch {
        // Fallback below
      }
    }

    if (!hastTree && highlightAuto) {
      try {
        hastTree = lowlight.highlightAuto(code);
      } catch {
        // Fallback below
      }
    }

    if (!hastTree) {
      return code.split(/\r\n|\r|\n/).map((line) => [
        {
          type: "text" as TokenType,
          value: line,
        },
      ]);
    }

    const flatTokens = hastToTokens(hastTree, "text", []);
    return splitTokensIntoLines(flatTokens);
  };
};

/**
 * Plugin to convert Markdown code blocks to DOCX using lowlight (highlight.js).
 */
export const codeLowlightPlugin = (
  options: ICodeLowlightOptions = {},
): IPlugin<EmptyNode> => {
  const {
    lowlight = defaultLowlight,
    highlightAuto = true,
    ...restOptions
  } = options;

  const lowlightTokenizer = createLowlightTokenizer(lowlight, highlightAuto);

  return codePlugin({
    tokenizer: lowlightTokenizer,
    ...restOptions,
  });
};

export const codeLowlight = codeLowlightPlugin;
