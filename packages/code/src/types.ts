import type { EmptyNode, IPlugin } from "@m2d/core";

/**
 * Standard token classification for syntax highlighting.
 */
export type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "operator"
  | "punctuation"
  | "boolean"
  | "builtin"
  | "variable"
  | "diffAdd"
  | "diffDelete"
  | "diffHeader"
  | "text";

/**
 * Single token representation.
 */
export interface Token {
  type: TokenType;
  value: string;
}

/**
 * A line of code with associated tokens and diff status.
 */
export interface CodeLine {
  diffType?: "add" | "delete" | "header" | "none";
  tokens: Token[];
  raw: string;
}

/**
 * Theme color specification for code syntax highlighting.
 */
export interface ICodeTheme {
  name?: string;
  text: string;
  background: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  operator: string;
  punctuation: string;
  boolean: string;
  builtin: string;
  variable: string;
  gutterText: string;
  gutterBackground: string;
  diffAddBackground: string;
  diffAddText: string;
  diffDeleteBackground: string;
  diffDeleteText: string;
  border?: string;
  diffHeader?: string;
}

/**
 * Built-in preset theme names.
 */
export type PresetThemeName =
  | "github-light"
  | "github-dark"
  | "monokai"
  | "executive-print";

/**
 * Configuration options for the code plugin.
 */
export interface ICodePluginOptions {
  /**
   * Active theme name or custom theme object.
   * @default "github-light"
   */
  theme?: PresetThemeName | ICodeTheme;

  /**
   * Additional custom themes catalog mapped by name.
   */
  customThemes?: Record<string, Partial<ICodeTheme>>;

  /**
   * Whether to display line numbers in a gutter column.
   * @default false
   */
  lineNumbers?: boolean;

  /**
   * Starting line number for gutter.
   * @default 1
   */
  gutterStart?: number;

  /**
   * Width percentage allocated to gutter column when lineNumbers is true.
   * Auto-calculated based on line count if not specified.
   */
  gutterWidthPercent?: number;

  /**
   * Monospace font family for code blocks and inline code runs.
   * @default "Consolas"
   */
  fontFamily?: string;

  /**
   * Font size in half-points (e.g. 19 = 9.5pt, 20 = 10pt, 24 = 12pt).
   * @default 19
   */
  fontSize?: number;

  /**
   * Block presentation type when lineNumbers is false:
   * - "table": renders a padded single-cell table with background shading and border.
   * - "paragraph": renders as a native shaded Paragraph.
   * @default "table"
   */
  blockType?: "table" | "paragraph";

  /**
   * Whether to intercept and highlight inlineCode MDAST nodes.
   * @default true
   */
  highlightInline?: boolean;

  /**
   * Whether to detect and style git diff additions and deletions.
   * @default true
   */
  diffHighlight?: boolean;

  /**
   * Number of spaces to replace tab (\t) characters with.
   * @default 2
   */
  tabSize?: number;

  /**
   * Optional custom tokenizer override.
   */
  tokenizer?: (code: string, language?: string) => Token[][];
}

export type CodePluginFactory = (
  options?: ICodePluginOptions,
) => IPlugin<EmptyNode>;
