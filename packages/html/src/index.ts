import type {
  BlockContent,
  Data,
  Heading,
  Html,
  Image,
  IPlugin,
  Literal,
  Mutable,
  Parent,
  PhrasingContent,
  RootContent,
  TableRow,
} from "@m2d/core";
import {
  AlignmentType,
  BorderStyle,
  type IBorderOptions,
  type IBordersOptions,
} from "docx";
import { type DocumentLike, standardizeColor } from "./utils";

/**
 * HTML inline tags supported by the plugin for conversion.
 */
const INLINE_TAGS = [
  "A",
  "ABBR",
  "ACRONYM", // Deprecated but still inline
  "B",
  "BDI",
  "BDO",
  "BIG", // Deprecated but still inline
  "BR",
  "BUTTON", // Technically inline-block, but often treated inline
  "CITE",
  "CODE",
  "DATA",
  "DATALIST",
  "DEL",
  "DFN",
  "EM",
  "I",
  "IMG",
  "INPUT",
  "INS",
  "KBD",
  "LABEL",
  "MARK",
  "METER",
  "NOSCRIPT",
  "OBJECT",
  "OUTPUT",
  "Q",
  "RUBY",
  "RP",
  "RT",
  "S",
  "SAMP",
  "SCRIPT",
  "SELECT",
  "SLOT",
  "SMALL",
  "SPAN",
  "STRONG",
  "SUB",
  "SUP",
  "svg",
  "TEMPLATE",
  "TEXTAREA",
  "TIME",
  "U",
  "TT", // Deprecated
  "VAR",
  "WBR",
] as const;

const EMPTY_TAGS = ["br", "hr", "img", "input"];

/**
 * Mapping of DOM tag names to MDAST node types.
 */
const DOM_TO_MDAST_MAP = {
  A: "link",
  B: "strong",
  BR: "break",
  EM: "emphasis",
  STRONG: "strong",
  I: "emphasis",
  IMG: "image",
  DEL: "delete",
  S: "delete",
} as const;

/**
 * CSS border styles that are recognized for conversion.
 */
const CSS_BORDER_STYLES = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "none",
  "ridge",
  "groove",
  "inset",
  "outset",
];

interface HtmlNode extends Html {
  tag: string;
  children: (RootContent | PhrasingContent)[];
}

/**
 * Parsed CSS border representation.
 */
type CssBorder = { width?: number; color?: string; style?: string };

/**
 * Border settings parsed from individual sides.
 */
type CssBorders = Partial<
  Record<"border" | "top" | "bottom" | "left" | "right", CssBorder>
>;

/**
 * Extracts individual border styles from a CSS style string.
 *
 * @param borderString - Raw style string from the `style` attribute.
 * @returns Parsed border information by edge.
 */
const parseCssBorders = (borderString: string | null): CssBorders => {
  if (!borderString) return {};
  const borders: CssBorders = {};

  // Match individual border properties (border-left, border-right, etc.)
  const borderMatches = borderString.match(/border(-\w+)?:\s*[^;]+/gi);
  if (!borderMatches) return {};

  for (const match of borderMatches) {
    const [property, value] = match.split(":").map((s) => s.trim());
    const parts = value.split(/\s+/);

    // Extract width, style, and color
    const width = parts.find((p) => p.endsWith("px"))?.replace("px", "");
    const style = parts.find((p) =>
      CSS_BORDER_STYLES.includes(p.toLowerCase()),
    );
    const color = parts.find(
      (p) => !p.endsWith("px") && !CSS_BORDER_STYLES.includes(p.toLowerCase()),
    );

    // Determine border key (e.g., borderLeft, borderTop)
    const key =
      property === "border" ? "border" : property.replace("border-", "");

    // Assign parsed values to the correct property
    borders[key as keyof CssBorders] = {
      ...(width ? { width: parseInt(width, 10) } : {}),
      ...(style ? { style } : {}),
      ...(color ? { color } : {}),
    };
  }

  return borders;
};

/**
 * Maps CSS border styles to docx-compatible border styles.
 */
const STYLE_MAP = {
  solid: BorderStyle.SINGLE,
  dashed: BorderStyle.DASHED,
  dotted: BorderStyle.DOTTED,
  double: BorderStyle.DOUBLE,
  none: BorderStyle.NONE,
  ridge: BorderStyle.THREE_D_EMBOSS,
  groove: BorderStyle.THREE_D_ENGRAVE,
  inset: BorderStyle.INSET,
  outset: BorderStyle.OUTSET,
} as const;

/** Checks whether a node is a DOM element across browser and virtual DOM implementations */
const isElement = (node: unknown): node is HTMLElement | SVGElement =>
  Boolean(node && typeof node === "object" && (node as Node).nodeType === 1);

/**
 * Converts a parsed CSS border to a docx-compatible IBorderOptions.
 *
 * @param cssBorder - Parsed border properties.
 * @param doc - Optional DOM element creator.
 * @returns docx-compatible border settings or undefined.
 */
const getDocxBorder = (cssBorder?: CssBorder, doc?: DocumentLike) => {
  if (!cssBorder || !Object.keys(cssBorder).length) return undefined;
  const { width, color, style } = cssBorder;
  const border: Mutable<IBorderOptions> = {
    style: style
      ? STYLE_MAP[style as keyof typeof STYLE_MAP]
      : BorderStyle.SINGLE,
  };
  if (width) border.size = width;
  if (color) border.color = standardizeColor(color, doc);
  return border;
};

const getDocxBorders = (
  borders: ReturnType<typeof parseCssBorders>,
  doc?: DocumentLike,
) => ({
  left: getDocxBorder({ ...borders.border, ...borders.left }, doc),
  right: getDocxBorder({ ...borders.border, ...borders.right }, doc),
  top: getDocxBorder({ ...borders.border, ...borders.top }, doc),
  bottom: getDocxBorder({ ...borders.border, ...borders.bottom }, doc),
});

/**
 * Parses inline or block style metadata from a DOM node.
 *
 * @param el - DOM element to extract style from.
 * @param inline - Flag indicating if the style is for inline content.
 * @param doc - Optional DOM element creator.
 * @returns Style metadata as `Data`.
 * skipcq: JS-R1005
 */
const parseStyles = (el: Node, inline = true, doc?: DocumentLike): Data => {
  const data: Data = {};
  if (!isElement(el)) return data;
  const {
    textAlign,
    fontWeight,
    fontStyle,
    textDecoration,
    textTransform,
    color,
    backgroundColor,
  } = (el as HTMLElement).style ?? {};
  const style = el.getAttribute("style");
  const borders = parseCssBorders(style);
  data.style = style ?? undefined;
  if (inline && borders.border) {
    data.border = getDocxBorder(borders.border, doc);
  } else if (Object.keys(borders).length) {
    data.border = getDocxBorders(borders, doc);
  }

  if (textAlign) {
    const alignKey = textAlign.toUpperCase();
    if (Object.keys(AlignmentType).includes(alignKey))
      data.alignment = AlignmentType[alignKey as keyof typeof AlignmentType];
    else if (alignKey === "JUSTIFY") data.alignment = AlignmentType.JUSTIFIED;
  }

  if (/bold/.test(fontWeight) || parseInt(fontWeight, 10) >= 500)
    data.bold = true;

  if (/(italic|oblique)/.test(fontStyle)) data.italics = true;

  switch (textDecoration) {
    case "underline":
      data.underline = {};
      break;
    case "overline":
      data.emphasisMark = {};
      break;
    case "line-through":
      data.strike = true;
      break;
  }

  if (textTransform === "uppercase") data.allCaps = true;

  if (textTransform === "lowercase") data.smallCaps = true;

  if (color) data.color = standardizeColor(color, doc);
  else if (style) {
    const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/i);
    if (colorMatch) {
      const c = standardizeColor(colorMatch[1].trim(), doc);
      if (c && c !== "auto") data.color = c;
    }
  }

  if (backgroundColor) {
    const fill = standardizeColor(backgroundColor, doc);
    if (fill && fill !== "auto") {
      // @ts-expect-error -- docx shading fill metadata
      data.shading = { fill };
    }
  } else if (style) {
    const bgMatch = style.match(
      /(?:^|;)\s*background(?:-color)?\s*:\s*([^;!]+)/i,
    );
    if (bgMatch) {
      const fill = standardizeColor(bgMatch[1].trim(), doc);
      if (fill && fill !== "auto") {
        // @ts-expect-error -- docx shading fill metadata
        data.shading = { fill };
      }
    }
  }

  const tagName = (el as HTMLElement).tagName;
  if (tagName === "SUP") data.superScript = true;
  else if (tagName === "SUB") data.subScript = true;
  else if (["STRONG", "B"].includes(tagName)) data.bold = true;
  else if (["EM", "I"].includes(tagName)) data.italics = true;
  else if (["DEL", "S"].includes(tagName)) data.strike = true;
  else if (["U", "INS"].includes(tagName)) data.underline = {};
  else if (tagName === "MARK") {
    data.highlight = "yellow";
    data.emphasisMark = {};
  } else if (tagName === "PRE") {
    data.pre = true;
  } else if (tagName === "INPUT") {
    data.type = (el as HTMLInputElement).type;
    data.name = (el as HTMLInputElement).name;
    data.value =
      (el as HTMLInputElement).value ?? (el as HTMLInputElement).defaultValue;
    data.checked =
      (el as HTMLInputElement).checked ??
      (el as HTMLInputElement).defaultChecked;
  }
  data.tag = tagName.toLowerCase() as keyof HTMLElementTagNameMap;
  return data;
};

/**
 * Converts an inline HTML DOM node into MDAST `PhrasingContent`.
 *
 * @param el - DOM node to process.
 * @param isPre - Whether within a preformatted element.
 * @param doc - Optional DOM element creator.
 * @returns PhrasingContent-compatible node.
 */
const processInlineDOMNode = (
  el: Node,
  isPre = false,
  doc?: DocumentLike,
): PhrasingContent => {
  if (!isElement(el))
    return {
      type: "text",
      value:
        (isPre ? el.textContent : el.textContent?.replace(/^\s+|\s+$/g, " ")) ??
        "",
    };

  const children = Array.from(el.childNodes).map((cNode) =>
    processInlineDOMNode(cNode, isPre, doc),
  );
  const data = parseStyles(el, true, doc);
  const attributeNames = Array.from(el.getAttributeNames?.() ?? []);
  const attributes: Record<string, string> = attributeNames.reduce(
    (acc, cur) => {
      acc[cur] = el.getAttribute(cur) ?? "";
      return acc;
    },
    {} as Record<string, string>,
  );

  const tagName = (el as HTMLElement).tagName;
  switch (tagName) {
    case "BR":
      return { type: "break" };
    case "IMG":
      return {
        type: "image",
        url: attributes.src ?? "",
        alt: attributes.alt ?? "",
        data: { ...data, ...attributes },
      } as Image;
    case "svg":
      return {
        type: "svg",
        value: (el as SVGElement).outerHTML,
        data,
      };
    case "EM":
    case "I":
    case "STRONG":
    case "B":
    case "DEL":
    case "S":
      return {
        type: DOM_TO_MDAST_MAP[tagName],
        children,
        data,
      };
    case "A":
      return {
        type: "link",
        url: attributes.href ?? "",
        children,
        data,
      };
    case "INPUT":
      return /(radio|checkbox)/.test((el as HTMLInputElement).type)
        ? { type: "checkbox", data }
        : {
            type: "text",
            value:
              data.value ??
              `_${(el as HTMLInputElement).value || "_".repeat(20)}_`,
            data: {
              ...data,
              border: { style: BorderStyle.OUTSET },
            },
          };
  }
  // Security Note: script, iframe tags will be removed as fragment
  return { type: "fragment", children, data };
};

/**
 * Converts DOM structure into a paragraph or fragment of block nodes.
 *
 * @param el - Root DOM node to process.
 * @param data - Optional metadata to apply.
 * @param doc - Optional DOM element creator.
 * @returns A BlockContent node or fragment node.
 */
const createFragmentWithParentNodes = (
  el: Node,
  data?: Data,
  doc?: DocumentLike,
): BlockContent => {
  const childNodes = Array.from(el.childNodes);
  const children: BlockContent[] = [];
  const tmp: Node[] = [];
  for (const node of childNodes) {
    if (isElement(node) && (node as HTMLElement).tagName === "STYLE") {
      continue;
    }
    if (
      isElement(node) &&
      !INLINE_TAGS.includes(
        (node as HTMLElement).tagName as (typeof INLINE_TAGS)[number],
      )
    ) {
      if (tmp.length) {
        children.push({
          type: "paragraph",
          children: tmp.map((tNode) =>
            processInlineDOMNode(tNode, data?.pre, doc),
          ),
        });
        tmp.length = 0;
      }
      // skipcq: JS-0357
      children.push(processDOMNode(node as HTMLElement, doc));
    } else tmp.push(node);
  }
  if (tmp.length)
    children.push({
      type: "paragraph",
      children: tmp.map((tNode) => processInlineDOMNode(tNode, data?.pre, doc)),
    });
  return children.length === 1
    ? { ...children[0], data: { ...data, ...children[0].data } }
    : {
        type: "fragment",
        children,
        data,
      };
};

/**
 * Generates MDAST `tableRow` nodes from DOM table rows.
 *
 * @param el - Table DOM node.
 * @param data_ - Optional style metadata.
 * @param doc - Optional DOM element creator.
 * @returns List of table rows.
 */
const createRows = (
  el: HTMLElement,
  data_?: Data,
  doc?: DocumentLike,
): TableRow[] =>
  Array.from(el.children).flatMap((tr) => {
    const data = { ...data_, ...parseStyles(tr as HTMLElement, false, doc) };
    return (tr as HTMLElement).tagName === "TR"
      ? ({
          type: "tableRow",
          children: Array.from((tr as HTMLElement).children).map((col) => ({
            type: "tableCell",
            children: [
              createFragmentWithParentNodes(
                col,
                { ...data, tag: undefined },
                doc,
              ),
            ],
            data: { ...data, tag: (col as HTMLElement).tagName.toLowerCase() },
          })),
          data,
        } as TableRow)
      : createRows(tr as HTMLElement, data, doc);
  });

/**
 * Converts block-level HTML elements into MDAST `BlockContent` nodes.
 *
 * @param el - HTML or svg element to process.
 * @param doc - Optional DOM element creator.
 * @returns Converted block content node.
 */
const processDOMNode = (
  el: HTMLElement | SVGElement,
  doc?: DocumentLike,
): BlockContent => {
  const data = parseStyles(el, false, doc);
  const tagName = el.tagName;
  switch (tagName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      return {
        type: "heading",
        depth: parseInt(tagName[1], 10),
        children: Array.from(el.childNodes).map((cNode) =>
          processInlineDOMNode(cNode, false, doc),
        ),
        data,
      } as Heading;
    case "PRE":
    case "P":
    case "DIV":
    case "DETAILS":
    case "SUMMARY":
    case "FORM":
    case "LI":
      return createFragmentWithParentNodes(el, data, doc);
    case "UL":
    case "OL":
      return {
        type: "list",
        ordered: tagName === "OL",
        children: Array.from(el.childNodes).map((node) => ({
          type: "listItem",
          children: [createFragmentWithParentNodes(node, undefined, doc)],
          data,
        })),
      };
    case "HR":
      return { type: "thematicBreak", data };
    case "BLOCKQUOTE":
      return {
        type: "blockquote",
        children: Array.from(el.childNodes).map((node) =>
          createFragmentWithParentNodes(node, undefined, doc),
        ),
        data,
      };
    case "TABLE": {
      const children = createRows(el as HTMLElement, undefined, doc);
      return {
        type: "table",
        children,
        data,
      };
    }
    case "STYLE":
      return {
        type: "empty",
        _type: "style",
      } as unknown as BlockContent;
  }
  return {
    type: "paragraph",
    children: [processInlineDOMNode(el, false, doc)],
    data,
  };
};

/** process inline AST nodes */
const processInlineNode = (node: HtmlNode, doc: DocumentLike) => {
  const value = node.value?.trim() ?? "";
  const tag = value.split(" ")[0].slice(1);
  const el = doc.createElement("div") as HTMLElement;
  el.innerHTML = value.endsWith("/>") ? value : `${value}</${tag}>`;
  Object.assign(node, {
    ...processInlineDOMNode(el.children[0], false, doc),
    children: node.children ?? [],
  });
};

/**
 * Helper to convert CSS padding values into Word-compatible twip margins (1px ≈ 15 twips).
 */
const parseCssPadding = (str: string) => {
  const parts = str
    .trim()
    .split(/\s+/)
    .map((p) => {
      const val = parseInt(p.replace(/px|pt/g, ""), 10);
      return Number.isNaN(val) ? 0 : val * 15;
    });
  if (parts.length === 1) {
    return { top: parts[0], bottom: parts[0], left: parts[0], right: parts[0] };
  }
  if (parts.length === 2) {
    return { top: parts[0], bottom: parts[0], left: parts[1], right: parts[1] };
  }
  if (parts.length === 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }
  return undefined;
};

/**
 * Parsed CSS rule extracted from <style> blocks.
 */
export interface ParsedCssRule {
  selectors: string[];
  data: Data;
  shading?: { fill: string };
  borders?: Mutable<IBorderOptions | IBordersOptions>;
  margins?: { top?: number; bottom?: number; left?: number; right?: number };
}

/**
 * Parses CSS text into structured rules with docx-compatible metadata.
 *
 * @param cssText - Raw CSS content from <style> elements.
 * @param doc - Optional DOM element creator.
 * @returns Array of parsed CSS rules.
 */
export const parseCssRules = (
  cssText: string,
  doc?: DocumentLike,
): ParsedCssRule[] => {
  const rules: ParsedCssRule[] = [];
  const cleanCss = cssText.replace(/\/\*[\s\S]*?\*\//g, "");
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match: RegExpExecArray | null;

  // biome-ignore lint/suspicious/noAssignInExpressions: valid loop
  while ((match = ruleRegex.exec(cleanCss)) !== null) {
    const rawSelectors = match[1];
    const declarations = match[2].trim();
    if (!rawSelectors || !declarations) continue;

    const selectors = rawSelectors
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    let data: Data = {};

    if (doc) {
      try {
        const dummy = doc.createElement("div") as HTMLElement;
        dummy.setAttribute("style", declarations);
        data = parseStyles(dummy, false, doc);
      } catch {
        // fallback to manual extraction if DOM throws
      }
    }

    // Direct manual fallback if DOM didn't extract border
    if (!data.border) {
      const borders = parseCssBorders(declarations);
      if (Object.keys(borders).length) {
        data.border = getDocxBorders(borders, doc);
      }
    }

    // Direct text-align fallback
    if (!data.alignment) {
      const alignMatch = declarations.match(/text-align\s*:\s*(\w+)/i);
      if (alignMatch) {
        const alignKey = alignMatch[1].toUpperCase();
        if (Object.keys(AlignmentType).includes(alignKey)) {
          data.alignment =
            AlignmentType[alignKey as keyof typeof AlignmentType];
        } else if (alignKey === "JUSTIFY") {
          data.alignment = AlignmentType.JUSTIFIED;
        }
      }
    }

    // Direct color fallback
    if (!data.color) {
      const colorMatch = declarations.match(/(?:^|;)\s*color\s*:\s*([^;!]+)/i);
      if (colorMatch) {
        const c = standardizeColor(colorMatch[1].trim(), doc);
        if (c && c !== "auto") data.color = c;
      }
    }

    // Direct background / shading fallback
    // biome-ignore lint/suspicious/noExplicitAny: dynamic shading metadata
    let shading: { fill: string } | undefined = (data as any)?.shading;
    if (!shading) {
      const bgMatch = declarations.match(
        /(?:^|;)\s*background(?:-color)?\s*:\s*([^;!]+)/i,
      );
      if (bgMatch) {
        const fill = standardizeColor(bgMatch[1].trim(), doc);
        if (fill && fill !== "auto") {
          shading = { fill };
        }
      }
    }

    // Direct padding / margins fallback
    const padMatch = declarations.match(/(?:^|;)\s*padding\s*:\s*([^;!]+)/i);
    let margins:
      | { top?: number; bottom?: number; left?: number; right?: number }
      | undefined;
    if (padMatch) {
      margins = parseCssPadding(padMatch[1]);
    }

    rules.push({
      selectors,
      data,
      shading,
      borders: data.border,
      margins,
    });
  }

  return rules;
};

const matchesAnySelector = (selectors: string[], ...tags: string[]) =>
  selectors.some((sel) =>
    tags.some(
      (tag) =>
        sel === tag || sel.endsWith(` ${tag}`) || sel.endsWith(`>${tag}`),
    ),
  );

const mergeCssRuleData = (
  target: { data?: Data },
  rule: ParsedCssRule,
  includeMargins = false,
) => {
  target.data = {
    ...rule.data,
    ...(rule.shading ? { shading: rule.shading } : {}),
    ...(rule.borders ? { border: rule.borders } : {}),
    ...(includeMargins && rule.margins ? { margins: rule.margins } : {}),
    ...target.data,
  };
};

/**
 * Applies parsed CSS rules to the MDAST tree matching standard HTML tag selectors.
 *
 * @param parent - AST root or parent node.
 * @param rules - Parsed CSS rules to apply.
 */
const applyCssRulesToTree = (parent: Parent, rules: ParsedCssRule[]) => {
  for (const node of parent.children) {
    // 1. Table Matching
    if (node.type === "table") {
      for (const rule of rules) {
        if (matchesAnySelector(rule.selectors, "table")) {
          mergeCssRuleData(node, rule, true);
        }
      }

      // Match rows and cells inside table
      const table = node as unknown as { children: TableRow[] };
      table.children?.forEach((row, rowIndex) => {
        for (const rule of rules) {
          if (matchesAnySelector(rule.selectors, "tr")) {
            row.data = { ...rule.data, ...row.data };
          }
        }

        row.children?.forEach((cell) => {
          // biome-ignore lint/suspicious/noExplicitAny: dynamic AST cell structure
          const cData = (cell.data as any) ?? {};
          const isTh = rowIndex === 0 || cData.tag === "th";
          const tag = isTh ? "th" : "td";
          for (const rule of rules) {
            if (matchesAnySelector(rule.selectors, tag)) {
              mergeCssRuleData(cell, rule, true);
            }
          }
        });
      });
    }

    // 2. Headings: h1, h2, h3, h4, h5, h6
    if (node.type === "heading") {
      const hTag = `h${(node as Heading).depth}`;
      for (const rule of rules) {
        if (matchesAnySelector(rule.selectors, hTag)) {
          mergeCssRuleData(node, rule);
        }
      }
    }

    // 3. Paragraphs: p
    if (node.type === "paragraph") {
      for (const rule of rules) {
        if (matchesAnySelector(rule.selectors, "p")) {
          mergeCssRuleData(node, rule);
        }
      }
    }

    // 4. Blockquotes: blockquote
    if (node.type === "blockquote") {
      for (const rule of rules) {
        if (matchesAnySelector(rule.selectors, "blockquote")) {
          mergeCssRuleData(node, rule);
        }
      }
    }

    // 5. Code blocks: pre, code
    if (node.type === "code") {
      for (const rule of rules) {
        if (matchesAnySelector(rule.selectors, "code", "pre")) {
          mergeCssRuleData(node, rule);
        }
      }
    }

    // 6. Thematic Break (horizontal rule): hr
    if (node.type === "thematicBreak") {
      for (const rule of rules) {
        if (matchesAnySelector(rule.selectors, "hr")) {
          mergeCssRuleData(node, rule);
        }
      }
    }

    // 7. Lists: ul, ol
    if (node.type === "list") {
      // biome-ignore lint/suspicious/noExplicitAny: dynamic list AST node
      const listTag = (node as any).ordered ? "ol" : "ul";
      for (const rule of rules) {
        if (rule.selectors.includes(listTag)) {
          node.data = { ...rule.data, ...node.data };
        }
      }
    }

    // Recurse for nested blocks (e.g. lists, blockquotes, fragments)
    if ((node as Parent).children?.length && node.type !== "table") {
      applyCssRulesToTree(node as Parent, rules);
    }
  }
};

/**
 * Consolidates inline HTML tag children inside valid tag-matching groups.
 *
 * @param pNode - MDAST parent node.
 * @param isRoot - Whether currently at the root of the AST.
 * @param doc - DOM element creator.
 * @param collectedCss - Accumulator for CSS rules extracted from <style> blocks.
 */
const preprocess = (
  pNode: Parent,
  isRoot = true,
  doc?: DocumentLike,
  collectedCss: string[] = [],
) => {
  if (!doc) return;
  const children: RootContent[] = [];
  const htmlNodeStack: HtmlNode[] = [];

  for (const node of pNode.children) {
    if ((node as Parent).children?.length)
      preprocess(node as Parent, false, doc, collectedCss);
    const valueRaw = (node as Literal).value;
    // node.value could be a promise too, e.g., mermaid SVG
    const value = typeof valueRaw === "string" ? valueRaw : "";

    // Extract any <style> tags from HTML node
    if (node.type === "html" && /<style[\s>]/i.test(value)) {
      const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let sMatch: RegExpExecArray | null;
      // biome-ignore lint/suspicious/noAssignInExpressions: valid loop
      while ((sMatch = styleRegex.exec(value)) !== null) {
        collectedCss.push(sMatch[1]);
      }
      const remainingValue = value
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .trim();
      if (!remainingValue) {
        // The node only contained <style>, drop it
        continue;
      }
      (node as Literal).value = remainingValue;
    }

    // match only inline non-self-closing html nodes.
    const tag = value?.split?.(" ")[0].replace(/^<|\/?>$/g, "");
    if (
      node.type === "html" &&
      !EMPTY_TAGS.includes(tag) &&
      /^<[^>]*[^/]>$/.test(value)
    ) {
      // ending tag
      if (tag[0] === "/") {
        const hNode = htmlNodeStack.shift();
        if (!hNode) {
          console.warn(
            `[HTML Plugin] Invalid HTML detected: closing tag without matching opening tag: ${value}`,
          );
          continue;
        }
        processInlineNode(hNode, doc);
        (htmlNodeStack[0]?.children ?? children).push(hNode);
      } else {
        htmlNodeStack.unshift({ ...node, children: [], tag });
      }
    } else if (htmlNodeStack.length) {
      htmlNodeStack[0].children.push(node);
    } else {
      children.push(node);
    }

    const isSelfClosingTag =
      node.type === "html" &&
      (EMPTY_TAGS.includes(tag) || /^<[^>]*\/>$/.test(value));

    // self closing tags
    if (isSelfClosingTag && !isRoot) {
      // @ts-expect-error -- ok
      processInlineNode(node, doc);
    } else if (
      (isSelfClosingTag && isRoot) ||
      (node.type === "html" && !/^<[^>]*>$/.test(value))
    ) {
      // block html
      const el = doc.createElement("div") as HTMLElement;
      el.innerHTML = value;
      Object.assign(node, createFragmentWithParentNodes(el, undefined, doc));
    }
  }
  pNode.children = children;

  if (isRoot && collectedCss.length > 0) {
    const rules = parseCssRules(collectedCss.join("\n"), doc);
    if (rules.length > 0) {
      applyCssRulesToTree(pNode, rules);
    }
  }
};

/**
 * Options for configuring the HTML plugin.
 */
export interface HtmlPluginOptions {
  /**
   * Custom Document or element creator for parsing HTML.
   * Defaults to `globalThis.document`.
   */
  document?: DocumentLike;
}

/**
 * Creates an HTML plugin for MDAST-to-DOCX conversion with an optional DOM provider.
 *
 * @param options - Configuration options, including custom `document` implementation.
 * @returns Configured HTML plugin for MDAST parsing.
 */
export const createHtmlPlugin = (
  options?: HtmlPluginOptions,
): (() => IPlugin) => {
  return () => ({
    preprocess: (tree: Parent) => {
      const doc =
        options?.document ??
        (typeof document !== "undefined" ? document : undefined);
      if (!doc) {
        console.warn(
          "[HTML Plugin] document is not available in the current environment. To parse HTML on Node.js, use '@m2d/html-node' or pass a custom document implementation.",
        );
        return;
      }
      preprocess(tree, true, doc);
    },
  });
};

/**
 * HTML plugin for MDAST-to-DOCX conversion.
 * Converts inline and block-level HTML content within markdown into structured MDAST nodes.
 *
 * Supports `<br>`, `<img>`, `<strong>`, `<em>`, `<table>`, `<ul>`, `<input>`, and other inline tags.
 * Should be used before `image`, `table`, or other content plugins in the pipeline.
 *
 * @returns Configured HTML plugin for MDAST parsing.
 */
export const htmlPlugin: () => IPlugin = createHtmlPlugin();
