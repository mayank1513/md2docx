import type { EmptyNode, IPlugin } from "@m2d/core";
// skipcq: JS-C1003
import type * as latex from "@unified-latex/unified-latex-types";
// skipcq: JS-C1003
import type * as DOCX from "docx";
import { parseMath } from "latex-math";

/**
 * Checks if the AST argument node is enclosed by curly brackets (`{...}`).
 *
 * @param arg - LaTeX argument node to check.
 * @returns `true` if the argument is bounded by curly braces, otherwise `false`.
 */
const hasCurlyBrackets = (
  arg: latex.Argument | undefined,
): arg is latex.Argument =>
  Boolean(arg && arg.openMark === "{" && arg.closeMark === "}");

/**
 * Converts a plain string to a DOCX MathRun instance.
 *
 * @param docx - The docx library instance.
 * @param s - String to convert.
 * @returns A new DOCX MathRun node.
 */
const mapString = (docx: typeof DOCX, s: string): DOCX.MathRun =>
  new docx.MathRun(s);

const LATEX_SYMBOLS: Record<string, string> = {
  textasciitilde: "~",
  textasciicircum: "^",
  textbackslash: "∖",
  textbar: "|",
  textless: "<",
  textgreater: ">",
  neq: "≠",
  sim: "∼",
  simeq: "≃",
  approx: "≈",
  fallingdotseq: "≒",
  risingdotseq: "≓",
  equiv: "≡",
  geq: "≥",
  geqq: "≧",
  leq: "≤",
  leqq: "≦",
  gg: "≫",
  ll: "≪",
  times: "×",
  div: "÷",
  pm: "±",
  mp: "∓",
  oplus: "⊕",
  ominus: "⊖",
  otimes: "⊗",
  oslash: "⊘",
  circ: "∘",
  cdot: "⋅",
  bullet: "∙",
  ltimes: "⋉",
  rtimes: "⋊",
  in: "∈",
  ni: "∋",
  notin: "∉",
  subset: "⊂",
  supset: "⊃",
  subseteq: "⊆",
  supseteq: "⊇",
  nsubseteq: "⊈",
  nsupseteq: "⊉",
  subsetneq: "⊊",
  supsetneq: "⊋",
  cap: "∩",
  cup: "∪",
  emptyset: "∅",
  infty: "∞",
  partial: "∂",
  aleph: "ℵ", // promptshield-ignore
  hbar: "ℏ", // promptshield-ignore
  wp: "℘",
  Re: "ℜ", // promptshield-ignore
  Im: "ℑ", // promptshield-ignore
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ϵ", // promptshield-ignore
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "ϕ", // promptshield-ignore
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  varepsilon: "ε",
  vartheta: "ϑ", // promptshield-ignore
  varrho: "ϱ", // promptshield-ignore
  varsigma: "ς",
  varphi: "φ",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Upsilon: "Υ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  int: "∫",
  oint: "∮",
  prod: "∏",
  coprod: "∐",
  sum: "∑",
  log: "log",
  exp: "exp",
  lim: "lim",
  inf: "∞",
  perp: "⊥",
  and: "∧",
  or: "∨",
  not: "¬",
  to: "→",
  gets: "⟹",
  implies: "⟹",
  impliedby: "⟸",
  forall: "∀",
  exists: "∃",
  empty: "∅",
  nabla: "∇",
  top: "⊤",
  bot: "⊥",
  angle: "∠",
  backslash: "∖",
  neg: "¬",
  lnot: "¬",
  flat: "♭",
  natural: "♮",
  sharp: "♯",
  clubsuit: "♣",
  diamondsuit: "♦",
  heartsuit: "♥",
  spadesuit: "♠",
  varnothing: "∅",
  S: "∖",
  P: "∏",
  bigcap: "⋀",
  bigcup: "⋁",
  bigwedge: "⊓",
  bigvee: "⊔",
  bigsqcap: "⊓",
  bigsqcup: "⊔",
  biguplus: "⊕",
  bigoplus: "⊕",
  bigotimes: "⊗",
  bigodot: "⊙",
  biginterleave: "⊺",
  bigtimes: "⨯",
};

/**
 * Serializes an AST node or argument back into its raw LaTeX string representation.
 *
 * @param node - The LaTeX AST node or argument to serialize.
 * @returns Serialized LaTeX string.
 */
const printRawNode = (node: latex.Node | latex.Argument): string => {
  if (!node) return "";
  switch (node.type) {
    case "string":
      return node.content;
    case "whitespace":
      return " ";
    case "group":
      return `{${node.content.map(printRawNode).join("")}}`;
    case "argument": {
      const open = node.openMark ?? "{";
      const close = node.closeMark ?? "}";
      return `${open}${node.content.map(printRawNode).join("")}${close}`;
    }
    case "macro": {
      const escapeToken =
        node.escapeToken !== undefined ? node.escapeToken : "\\";
      const args = (node.args || []).map(printRawNode).join("");
      return `${escapeToken}${node.content}${args}`;
    }
    case "inlinemath":
      return `$${node.content.map(printRawNode).join("")}$`;
    case "displaymath":
      return `\\[${node.content.map(printRawNode).join("")}\\]`;
    case "environment":
    case "mathenv": {
      const envName =
        typeof node.env === "string" ? node.env : printRawNode(node.env);
      return `\\begin{${envName}}${node.content.map(printRawNode).join("")}\\end{${envName}}`;
    }
    case "comment":
      return `%${node.content}\n`;
    case "parbreak":
      return "\n\n";
    default:
      if (
        "content" in node &&
        Array.isArray((node as { content?: unknown }).content)
      ) {
        return (node as { content: (latex.Node | latex.Argument)[] }).content
          .map(printRawNode)
          .join("");
      }
      return "content" in node &&
        typeof (node as { content?: unknown }).content === "string"
        ? (node as { content: string }).content
        : "";
  }
};

/**
 * Serializes an array of AST nodes or arguments into a contiguous raw LaTeX string.
 *
 * @param nodes - Array of LaTeX AST nodes or arguments.
 * @returns Combined LaTeX string.
 */
const printRawNodes = (nodes: (latex.Node | latex.Argument)[]): string =>
  nodes.map(printRawNode).join("");

/**
 * Recursively inspects an AST subtree for unparsed script operators (`^` or `_`).
 *
 * @param nodes - Array of LaTeX AST nodes to inspect.
 * @returns `true` if any string or nested group node contains `^` or `_`, otherwise `false`.
 */
const hasUnparsedScript = (nodes: latex.Node[]): boolean =>
  nodes.some((n) => {
    if (
      n.type === "string" &&
      (n.content.includes("^") || n.content.includes("_"))
    ) {
      return true;
    }
    return Boolean(n.type === "group" && hasUnparsedScript(n.content));
  });

/**
 * Re-parses script argument nodes through `parseMath` if text-mode parsing left
 * nested superscripts or subscripts (`^` or `_`) as unparsed literal strings.
 *
 * @param nodes - Array of LaTeX AST nodes within the script argument.
 * @returns Re-parsed AST nodes in math mode, or original nodes on error or when no scripts exist.
 */
const resolveScriptArg = (nodes: latex.Node[]): latex.Node[] => {
  if (hasUnparsedScript(nodes)) {
    try {
      return parseMath(printRawNodes(nodes));
    } catch {
      return nodes;
    }
  }
  return nodes;
};

/**
 * Converts an array of LaTeX AST nodes into an array of DOCX MathRun/math elements.
 *
 * @param docx - The docx library instance.
 * @param nodes - Array of LaTeX AST nodes.
 * @returns Array of converted DOCX MathRun nodes.
 */
const mapGroup = (docx: typeof DOCX, nodes: latex.Node[]): DOCX.MathRun[] => {
  const group: DOCX.MathRun[] = [];
  for (const c of nodes) {
    // skipcq: JS-0357
    group.push(...(mapNode(docx, c, group) || []));
  }
  return group;
};

/**
 * Handles mapping of LaTeX macro nodes (e.g. `^`, `_`, `\frac`, `\sqrt`, `\textcolor`) to DOCX math nodes.
 *
 * @param docx - The docx library instance.
 * @param node - The LaTeX macro node to map.
 * @param runs - Accumulated preceding MathRun nodes in the current scope.
 * @returns Converted DOCX MathRun node(s), or `null` for line breaks.
 */
// skipcq: JS-R1005
const mapMacro = (
  docx: typeof DOCX,
  node: latex.Macro,
  runs: DOCX.MathRun[],
): DOCX.MathRun[] | DOCX.MathRun | null => {
  let returnVal: DOCX.MathRun[] | DOCX.MathRun | null = null;
  switch (node.content) {
    case "newline":
    case "\\":
      // line break
      return null;
    case "textcolor": {
      const args = node.args ?? [];
      // const _color = (hasCurlyBrackets(args[1]) && args[1]?.content?.[0]?.content) || "";
      if (hasCurlyBrackets(args[2])) {
        returnVal = mapGroup(docx, args[2].content);
      }
      break;
    }
    case "text": {
      const args = node.args ?? [];
      if (hasCurlyBrackets(args[0])) {
        returnVal = mapGroup(docx, args[0].content);
      }
      break;
    }
    case "^": {
      const prev = runs.pop();
      if (!prev) break;
      const superScript = mapGroup(
        docx,
        resolveScriptArg(node.args?.[0]?.content ?? []),
      );
      // @ts-expect-error -- using extra vars
      if (prev.isSum) {
        const docNode = new docx.MathSum({
          children: [],
          superScript,
          // @ts-expect-error -- reading extra field
          subScript: prev.sub,
        });

        // @ts-expect-error -- attaching extra field
        docNode.sub = prev.sub;
        // @ts-expect-error -- attaching extra field
        docNode.sup = superScript;
        // @ts-expect-error -- attaching extra field
        docNode.isSum = 1;
        return docNode;
        // @ts-expect-error -- attaching extra field
      } else if (prev.sub) {
        return new docx.MathSubSuperScript({
          // @ts-expect-error -- attaching extra field
          subScript: prev.sub,
          superScript,
          // @ts-expect-error -- attaching extra field
          children: [prev.prev],
        });
      }
      const docxNode = new docx.MathSuperScript({
        children: [prev],
        superScript,
      });
      // @ts-expect-error -- attaching extra field
      docxNode.sup = superScript;
      // @ts-expect-error -- attaching extra field
      docxNode.prev = prev;
      return docxNode;
    }
    case "_": {
      const prev = runs.pop();
      if (!prev) break;
      const subScript = mapGroup(
        docx,
        resolveScriptArg(node.args?.[0]?.content ?? []),
      );
      // @ts-expect-error -- attaching extra field
      if (prev.isSum) {
        const docNode = new docx.MathSum({
          children: [],
          subScript,
          // @ts-expect-error -- reading extra field
          superScript: prev.sup,
        });
        // @ts-expect-error -- attaching extra field
        docNode.sup = prev.sup;
        // @ts-expect-error -- attaching extra field
        docNode.sub = subScript;
        // @ts-expect-error -- attaching extra field
        docNode.isSum = 1;
        return docNode;
        // @ts-expect-error -- attaching extra field
      } else if (prev.sup) {
        return new docx.MathSubSuperScript({
          subScript,
          // @ts-expect-error -- attaching extra field
          superScript: prev.sup,
          // @ts-expect-error -- attaching extra field
          children: [prev.prev],
        });
      }
      const docxNode = new docx.MathSubScript({
        children: [prev],
        subScript,
      });
      // @ts-expect-error -- attaching extra field
      docxNode.sub = subScript;
      // @ts-expect-error -- attaching extra field
      docxNode.prev = prev;
      return docxNode;
    }
    case "hat":
    case "widehat":
      // returnVal = docx.MathAccentCharacter(n)
      returnVal = docx.createMathAccentCharacter({ accent: "^" });
      break;
    case "sum": {
      const docNode = new docx.MathSum({
        children: [],
      });
      // @ts-expect-error - extra var
      docNode.isSum = 1;
      return docNode;
    }
    case "frac":
    case "tfrac":
    case "dfrac": {
      const args = node.args ?? [];
      if (
        args.length === 2 &&
        hasCurlyBrackets(args[0]) &&
        hasCurlyBrackets(args[1])
      ) {
        returnVal = new docx.MathFraction({
          numerator: mapGroup(docx, args[0].content),
          denominator: mapGroup(docx, args[1].content),
        });
      }
      break;
    }
    case "sqrt": {
      const args = node.args ?? [];
      if (args.length === 1) {
        returnVal = new docx.MathRadical({
          children: mapGroup(docx, args[0].content),
        });
      } else if (args.length === 2) {
        returnVal = new docx.MathRadical(
          args[0].content
            ? {
                children: mapGroup(docx, args[1].content),
                degree: mapGroup(docx, args[0].content),
              }
            : { children: mapGroup(docx, args[1].content) },
        );
      }
      break;
    }
    case "left":
    case "right":
    case "vec":
      return [];
    case "mathbf":
      return mapGroup(docx, node.args?.[0]?.content ?? []);
    default:
      returnVal = mapString(docx, LATEX_SYMBOLS[node.content] ?? node.content);
  }
  // @ts-expect-error -- reading extra field
  if (runs[runs.length - 1]?.isSum && returnVal) {
    const prev = runs.pop();
    return [
      new docx.MathSum({
        children: Array.isArray(returnVal) ? returnVal : [returnVal],
        // @ts-expect-error -- reading extra field
        superScript: prev.sup,
        // @ts-expect-error -- reading extra field
        subScript: prev.sub,
      }),
    ];
  }
  return returnVal;
};

/**
 * Processes a single LaTeX AST node and converts it into corresponding DOCX MathRun nodes.
 *
 * @param docx - The docx library instance.
 * @param node - LaTeX AST node to process.
 * @param runs - Accumulated preceding MathRun nodes in the current scope.
 * @returns Array of converted DOCX MathRun nodes, or `false` on line break.
 */
const mapNode = (
  docx: typeof DOCX,
  node: latex.Node,
  runs: DOCX.MathRun[],
): DOCX.MathRun[] | false => {
  let docxNodes: DOCX.MathRun[] = [];
  switch (node.type) {
    case "string":
      docxNodes = [mapString(docx, node.content)];
      break;
    case "whitespace":
      docxNodes = [mapString(docx, " ")];
      break;
    case "macro": {
      const run = mapMacro(docx, node, runs);
      if (!run) {
        // line break
        return false;
      } else {
        docxNodes = Array.isArray(run) ? run : [run];
      }
      break;
    }
    case "group":
      docxNodes = mapGroup(docx, node.content);
      break;
    case "environment":
      // NOT SUPPORTED BY DOCX library
      break;
    default:
  }

  // @ts-expect-error -- reading extra field
  if (node.type !== "macro" && runs[runs.length - 1]?.isSum) {
    const prev = runs.pop();
    return [
      new docx.MathSum({
        children: docxNodes,
        // @ts-expect-error -- reading extra field
        superScript: prev.sup,
        // @ts-expect-error -- reading extra field
        subScript: prev.sub,
      }),
    ];
  }

  return docxNodes;
};

/**
 * Parses a LaTeX mathematical expression string and converts it into grouped DOCX MathRun arrays (paragraphs).
 *
 * @param docx - The docx library instance.
 * @param value - Raw LaTeX string.
 * @returns 2D array of DOCX MathRun nodes grouped into paragraphs.
 */
export const parseLatex = (
  docx: typeof DOCX,
  value: string,
): DOCX.MathRun[][] => {
  const latexNodes = parseMath(value);

  const paragraphs: DOCX.MathRun[][] = [[]];
  let runs: DOCX.MathRun[] = paragraphs[0];

  for (const node of latexNodes) {
    const res = mapNode(docx, node, runs);
    if (!res) {
      // line break
      runs = [];
      paragraphs.push(runs);
    } else {
      runs.push(...res);
    }
  }
  return paragraphs;
};

export type MathErrorMode = "warn" | "raw" | "throw";

export interface IMathPluginOptions {
  /**
   * Error handling strategy when LaTeX parsing fails or runaway syntax is detected.
   * - "warn": Emits a styled warning text badge: `⚠️ [Math Syntax Error: ...]`
   * - "raw": Emits the raw formula string as monospace code text
   * - "throw": Re-throws the underlying parse error
   * @default "warn"
   */
  errorMode?: MathErrorMode;
  /**
   * Maximum character length allowed for inline equations.
   * Prevents runaway AST nodes when unclosed dollar signs occur.
   * @default 1000
   */
  maxInlineLength?: number;
}

const BLOCK_MARKER_REGEX =
  /\n\s*(?:#{1,6}\s+|---|\*\*\*|___|```|>|\s*[-*+]\s+|\s*\d+\.\s+|\|)/;

/**
 * Validates a math string against length constraints and markdown block marker collisions.
 *
 * @param value - Raw equation text to validate.
 * @param isInline - Whether the equation is inline math (`$..$`).
 * @param maxInlineLength - Maximum permitted length for inline math.
 * @returns Error message string if invalid, or `null` if valid.
 */
const validateMathString = (
  value: string,
  isInline: boolean,
  maxInlineLength: number,
): string | null => {
  if (isInline && value.length > maxInlineLength) {
    return `Inline equation length (${value.length}) exceeds maximum allowed (${maxInlineLength})`;
  }
  if (BLOCK_MARKER_REGEX.test(value)) {
    return "Unclosed equation delimiter: content contains structural markdown block markers";
  }
  return null;
};

/**
 * Generates fallback DOCX TextRun nodes when an inline equation fails parsing or validation.
 *
 * @param docx - The docx library instance.
 * @param errorMessage - Description of the syntax/validation error.
 * @param rawValue - Original unparsed formula string.
 * @param options - Math plugin configuration options.
 * @param runProps - Optional run properties from markdown AST.
 * @returns Array of fallback TextRun nodes.
 */
const createMathErrorRuns = (
  docx: typeof DOCX,
  errorMessage: string,
  rawValue: string,
  options?: IMathPluginOptions,
  runProps?: DOCX.IRunOptions,
): DOCX.TextRun[] => {
  const errorMode = options?.errorMode ?? "warn";
  if (errorMode === "raw") {
    return [
      new docx.TextRun({
        text: `$${rawValue}$`,
        font: "Consolas",
        ...runProps,
      }),
    ];
  }
  return [
    new docx.TextRun({
      text: `⚠️ [Math Error: ${errorMessage}]`,
      color: "C00000",
      italics: true,
      ...runProps,
    }),
  ];
};

/**
 * Generates fallback DOCX Paragraph nodes when a block equation fails parsing or validation.
 *
 * @param docx - The docx library instance.
 * @param errorMessage - Description of the syntax/validation error.
 * @param rawValue - Original unparsed formula string.
 * @param options - Math plugin configuration options.
 * @returns Array of fallback Paragraph nodes.
 */
const createMathErrorParagraphs = (
  docx: typeof DOCX,
  errorMessage: string,
  rawValue: string,
  options?: IMathPluginOptions,
): DOCX.Paragraph[] => {
  const errorMode = options?.errorMode ?? "warn";
  if (errorMode === "raw") {
    return [
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: rawValue,
            font: "Consolas",
          }),
        ],
      }),
    ];
  }
  return [
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: `⚠️ [Math Syntax Error: ${errorMessage}]`,
          color: "C00000",
          italics: true,
        }),
      ],
    }),
  ];
};

/**
 * Creates the md2docx math plugin for compiling LaTeX math expressions (MDAST `math` and `inlineMath`)
 * to native Microsoft Word OpenXML Math elements (`m:oMath`).
 *
 * @param options - Configuration options for error modes and inline length constraints.
 * @returns Configured md2docx plugin object with inline and block handlers.
 */
export const mathPlugin: (options?: IMathPluginOptions) => IPlugin<{
  type: "" | "math" | "inlineMath";
  value?: string;
}> = (options) => {
  const errorMode = options?.errorMode ?? "warn";
  const maxInlineLength = options?.maxInlineLength ?? 1000;

  return {
    inline: (docx, node, runProps) => {
      if (node.type !== "inlineMath" && node.type !== "math") return [];
      (node as unknown as EmptyNode)._type = node.type;
      node.type = "";
      const rawValue = node.value ?? "";

      const validationError = validateMathString(
        rawValue,
        true,
        maxInlineLength,
      );
      if (validationError) {
        if (errorMode === "throw") {
          throw new Error(`[m2d/math] ${validationError}`);
        }
        return createMathErrorRuns(
          docx,
          validationError,
          rawValue,
          options,
          runProps as DOCX.IRunOptions | undefined,
        );
      }

      try {
        const paragraphs = parseLatex(docx, rawValue);
        return [new docx.Math({ children: paragraphs.flat() })];
      } catch (err) {
        if (errorMode === "throw") {
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        return createMathErrorRuns(
          docx,
          message,
          rawValue,
          options,
          runProps as DOCX.IRunOptions | undefined,
        );
      }
    },
    block: (docx, node) => {
      if (node.type !== "math" && node.type !== "inlineMath") return [];
      node.type = "";
      const rawValue = node.value ?? "";

      const validationError = validateMathString(
        rawValue,
        false,
        maxInlineLength,
      );
      if (validationError) {
        if (errorMode === "throw") {
          throw new Error(`[m2d/math] ${validationError}`);
        }
        return createMathErrorParagraphs(
          docx,
          validationError,
          rawValue,
          options,
        );
      }

      try {
        const paragraphs = parseLatex(docx, rawValue);
        return paragraphs.map(
          (runs) =>
            new docx.Paragraph({
              children: [new docx.Math({ children: runs })],
            }),
        );
      } catch (err) {
        if (errorMode === "throw") {
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        return createMathErrorParagraphs(docx, message, rawValue, options);
      }
    },
  };
};
