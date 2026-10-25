import type { IDocxProps, IPlugin, Root, RootContent } from "@m2d/core";

import { DOCX_METADATA_MAP } from "@m2d/core/utils";

export interface FrontmatterData {
  title?: string;
  subject?: string;
  author?: string;
  creator?: string;
  description?: string;
  keywords?: string | string[];
  tags?: string | string[];
  categories?: string | string[];
  lastModifiedBy?: string;
  modifiedBy?: string;
  revision?: number;
  date?: string;
  [key: string]: unknown;
}

export type FrontmatterType = "yaml" | "toml" | (string & {});

export type FrontmatterParser = (
  raw: string,
  type?: FrontmatterType,
) => FrontmatterData;

export interface CoverPageOptions {
  /** Whether the cover page is enabled */
  enabled?: boolean;
  /** Title override (defaults to frontmatter.title or docxProps.title) */
  title?: string;
  /** Subtitle or description override (defaults to frontmatter.subtitle or frontmatter.description or frontmatter.subject) */
  subtitle?: string;
  /** Author override (defaults to frontmatter.author or frontmatter.creator) */
  author?: string;
  /** Date string override (defaults to frontmatter.date) */
  date?: string;
  /** Version or revision override (defaults to frontmatter.version or frontmatter.revision) */
  version?: string | number;
  /** Organization or company name */
  organization?: string;
  /** Whether to remove duplicate H1 heading from body if it matches the cover title. Default: true */
  removeMatchingHeading?: boolean;
}

export interface InfoBoxOptions {
  /** Whether the info box is enabled */
  enabled?: boolean;
  /** Format of the info box: "blockquote" (callout box) or "table". Default: "blockquote" */
  format?: "blockquote" | "table";
  /** Placement: "after-title" (after first H1) or "top" (at the very beginning). Default: "after-title" */
  position?: "after-title" | "top";
  /** Header title inside the info box, e.g. "Document Overview" */
  header?: string;
  /** Specific frontmatter fields to display, and their order. Default: ["author", "date", "version", "status", "tags"] */
  fields?: string[];
  /** Custom label mapping, e.g. { author: "Author", lastModifiedBy: "Last Updated" } */
  labels?: Record<string, string>;
}

export interface FrontmatterPluginOptions {
  /**
   * Custom parser function to parse the raw front-matter string.
   * Enables full YAML 1.2 (e.g. via 'yaml') or full TOML (e.g. via 'smol-toml').
   *
   * @example
   * ```ts
   * import { parse as parseToml } from "smol-toml";
   * frontmatterPlugin(undefined, {
   *   parser: (raw, type) => type === "toml" ? parseToml(raw) : parseFrontmatter(raw, type)
   * });
   * ```
   */
  parser?: FrontmatterParser;

  /**
   * Custom transformer to map parsed front-matter fields to DOCX document properties.
   */
  transform?: (frontmatter: FrontmatterData, docxProps: IDocxProps) => void;

  /**
   * Automatically generate a cover page from frontmatter metadata.
   */
  coverPage?: boolean | CoverPageOptions;

  /**
   * Automatically generate a styled info-box / callout banner from frontmatter metadata.
   */
  infoBox?: boolean | InfoBoxOptions;
}

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

interface QuoteState {
  inDouble: boolean;
  inSingle: boolean;
  backslashCount: number;
}

const updateQuoteState = (
  char: string,
  nextChar: string | undefined,
  state: QuoteState,
): { handledEscape: boolean; skipNext: boolean } => {
  if (char === "\\") {
    state.backslashCount++;
    return { handledEscape: true, skipNext: false };
  }
  const isEscaped = state.backslashCount % 2 === 1;
  state.backslashCount = 0;

  if (char === '"' && !state.inSingle && !isEscaped) {
    state.inDouble = !state.inDouble;
  } else if (char === "'" && !state.inDouble) {
    if (state.inSingle && nextChar === "'") {
      return { handledEscape: false, skipNext: true };
    }
    state.inSingle = !state.inSingle;
  }
  return { handledEscape: false, skipNext: false };
};

/**
 * Strips comments from a line while preserving '#' within quotes or URLs.
 * Tracks backslash parity to correctly identify escaped quotes.
 */
const stripComment = (line: string): string => {
  const state: QuoteState = {
    inDouble: false,
    inSingle: false,
    backslashCount: 0,
  };

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const { handledEscape, skipNext } = updateQuoteState(
      char,
      line[i + 1],
      state,
    );
    if (handledEscape) continue;
    if (skipNext) {
      i++;
      continue;
    }

    if (char === "#" && !state.inDouble && !state.inSingle) {
      if (i === 0 || /\s/.test(line[i - 1])) {
        return line.slice(0, i).trimEnd();
      }
    }
  }
  return line.trimEnd();
};

/**
 * Splits comma-separated array items respecting quoted segments and backslash escapes.
 */
const splitQuotedArray = (str: string): string[] => {
  const items: string[] = [];
  let current = "";
  const state: QuoteState = {
    inDouble: false,
    inSingle: false,
    backslashCount: 0,
  };

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const { handledEscape, skipNext } = updateQuoteState(
      char,
      str[i + 1],
      state,
    );
    if (handledEscape) {
      current += char;
      continue;
    }
    if (skipNext) {
      current += "''";
      i++;
      continue;
    }

    if (char === "," && !state.inDouble && !state.inSingle) {
      if (current.trim()) items.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) items.push(current.trim());
  return items;
};

/**
 * Parses scalar values (quoted strings, booleans, numbers, nulls, inline arrays).
 */
const parseScalar = (val: string): unknown => {
  const trimmed = val.trim();

  // Inline array: recursively parse each non-empty element
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitQuotedArray(inner).map((item) => parseScalar(item));
  }

  // Double-quoted string (decode escaped quotes and backslashes)
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\([\\"])/g, "$1");
  }

  // Single-quoted string (decode doubled quotes)
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1).replace(/''/g, "'");
  }

  // Null
  if (trimmed === "null" || trimmed === "~") return null;

  // Boolean
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) return num;
  }

  return trimmed;
};

/**
 * Zero-dependency parser for basic YAML and basic TOML front-matter.
 * Handles strings, quoted scalars, booleans, numbers, lists, and inline arrays.
 * For advanced TOML (tables, multi-line strings) or full YAML 1.2, pass a custom `parser`.
 */
export const parseFrontmatter: FrontmatterParser = (
  raw: string,
  type: FrontmatterType = "yaml",
): FrontmatterData => {
  if (!raw || typeof raw !== "string") return {};

  const isToml = type === "toml";
  const separator = isToml ? "=" : ":";
  const delimiter = isToml ? "+++" : "---";

  const result: FrontmatterData = Object.create(null);
  const lines = raw.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentArray: unknown[] | null = null;

  for (const rawLine of lines) {
    const line = stripComment(rawLine);
    const trimmedLine = line.trim();
    if (
      !trimmedLine ||
      trimmedLine === delimiter ||
      trimmedLine === "---" ||
      trimmedLine === "+++"
    ) {
      continue;
    }

    // Explicitly ignore TOML table headers ([table]) and array-of-tables ([[table]])
    if (isToml && /^\[{1,2}[^=]+\]{1,2}$/.test(trimmedLine)) {
      currentKey = null;
      currentArray = null;
      continue;
    }

    // List item (YAML): "- value"
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (!isToml && listMatch) {
      if (currentKey) {
        if (!currentArray) {
          currentArray = [];
          result[currentKey] = currentArray;
        }
        currentArray.push(parseScalar(listMatch[1]));
      }
      continue;
    }

    // Key-value pair based on format separator (: for YAML, = for TOML)
    const sepIdx = line.indexOf(separator);
    if (sepIdx !== -1) {
      const key = line.slice(0, sepIdx).trim();
      const val = line.slice(sepIdx + 1).trim();

      if (!key || FORBIDDEN_KEYS.has(key)) {
        currentKey = null;
        currentArray = null;
        continue;
      }

      if (!val) {
        currentKey = key;
        currentArray = null;
        result[key] = "";
      } else {
        currentKey = null;
        currentArray = null;
        result[key] = parseScalar(val);
      }
    } else {
      currentKey = null;
      currentArray = null;
    }
  }

  return result;
};

/**
 * Extracts front-matter AST node from Root or children array.
 */
export const extractFrontmatterNode = (
  root: Root | RootContent[] | undefined,
): (RootContent & { type: "yaml" | "toml"; value: string }) | undefined => {
  if (!root) return undefined;
  const children: RootContent[] = Array.isArray(root)
    ? root
    : (root.children as RootContent[]) || [];

  return children.find(
    (node): node is RootContent & { type: "yaml" | "toml"; value: string } =>
      (node.type === "yaml" || (node.type as string) === "toml") &&
      typeof (node as { value?: unknown }).value === "string",
  );
};

const getNodeText = (node: unknown): string => {
  if (!node || typeof node !== "object") return "";
  if (
    "value" in node &&
    typeof (node as { value: unknown }).value === "string"
  ) {
    return (node as { value: string }).value;
  }
  if (
    "children" in node &&
    Array.isArray((node as { children: unknown[] }).children)
  ) {
    return (node as { children: unknown[] }).children.map(getNodeText).join("");
  }
  return "";
};

const DEFAULT_INFO_BOX_FIELDS = [
  "author",
  "creator",
  "date",
  "version",
  "revision",
  "status",
  "category",
  "tags",
  "keywords",
];

const DEFAULT_FIELD_LABELS: Record<string, string> = {
  author: "Author",
  creator: "Author",
  date: "Date",
  version: "Version",
  revision: "Revision",
  status: "Status",
  category: "Category",
  tags: "Tags",
  keywords: "Keywords",
  subject: "Subject",
  description: "Description",
  organization: "Organization",
  company: "Company",
  lastModifiedBy: "Modified By",
};

const buildCoverPageNodes = (
  data: FrontmatterData,
  docxProps: IDocxProps,
  options: boolean | CoverPageOptions,
): RootContent[] => {
  const opts = typeof options === "object" ? options : {};
  if (opts.enabled === false) return [];

  const titleText =
    opts.title ??
    (typeof data.title === "string" ? data.title : docxProps.title);
  if (!titleText) return [];

  const subtitleText =
    opts.subtitle ??
    (typeof data.subtitle === "string"
      ? data.subtitle
      : typeof data.description === "string"
        ? data.description
        : typeof data.subject === "string"
          ? data.subject
          : docxProps.subject || docxProps.description);

  const authorText =
    opts.author ??
    (typeof data.author === "string"
      ? data.author
      : typeof data.creator === "string"
        ? data.creator
        : docxProps.creator);

  const dateText =
    opts.date ?? (typeof data.date === "string" ? data.date : undefined);

  const versionText =
    opts.version != null
      ? String(opts.version)
      : data.version != null
        ? String(data.version)
        : data.revision != null
          ? String(data.revision)
          : docxProps.revision != null
            ? String(docxProps.revision)
            : undefined;

  const orgText =
    opts.organization ??
    (typeof data.organization === "string"
      ? data.organization
      : typeof data.company === "string"
        ? data.company
        : undefined);

  const nodes: RootContent[] = [];

  // Title: H1
  nodes.push({
    type: "heading",
    depth: 1,
    children: [{ type: "text", value: titleText }],
  });

  // Subtitle: Italic paragraph
  if (subtitleText) {
    nodes.push({
      type: "paragraph",
      children: [
        {
          type: "emphasis",
          children: [{ type: "text", value: subtitleText }],
        },
      ],
    });
  }

  // Thematic Break (horizontal divider)
  nodes.push({
    type: "thematicBreak",
  });

  // Meta lines
  const metaLines: Array<{ label: string; value: string }> = [];
  if (authorText) metaLines.push({ label: "Author", value: authorText });
  if (orgText) metaLines.push({ label: "Organization", value: orgText });
  if (dateText) metaLines.push({ label: "Date", value: dateText });
  if (versionText) metaLines.push({ label: "Version", value: versionText });

  for (const { label, value } of metaLines) {
    nodes.push({
      type: "paragraph",
      children: [
        { type: "strong", children: [{ type: "text", value: `${label}: ` }] },
        { type: "text", value },
      ],
    });
  }

  // Page break indicator before body
  nodes.push({
    type: "paragraph",
    data: { pageBreakBefore: true } as unknown as RootContent["data"],
    children: [],
  });

  return nodes;
};

const buildInfoBoxNode = (
  data: FrontmatterData,
  docxProps: IDocxProps,
  options: boolean | InfoBoxOptions,
): RootContent | undefined => {
  const opts = typeof options === "object" ? options : {};
  if (opts.enabled === false) return undefined;

  const format = opts.format ?? "blockquote";
  const fields = opts.fields ?? DEFAULT_INFO_BOX_FIELDS;
  const labels = { ...DEFAULT_FIELD_LABELS, ...opts.labels };

  // Collect key-value pairs
  const entries: Array<{ label: string; value: string }> = [];

  for (const field of fields) {
    const rawVal =
      data[field] ??
      (field === "author" ? data.creator || docxProps.creator : undefined);
    if (rawVal != null) {
      const valStr = Array.isArray(rawVal) ? rawVal.join(", ") : String(rawVal);
      if (valStr.trim()) {
        const label =
          labels[field] ?? field.charAt(0).toUpperCase() + field.slice(1);
        entries.push({ label, value: valStr });
      }
    }
  }

  if (entries.length === 0) return undefined;

  if (format === "table") {
    const headerRow = {
      type: "tableRow" as const,
      children: [
        {
          type: "tableCell" as const,
          children: [
            { type: "strong", children: [{ type: "text", value: "Property" }] },
          ],
        },
        {
          type: "tableCell" as const,
          children: [
            { type: "strong", children: [{ type: "text", value: "Value" }] },
          ],
        },
      ],
    };

    const dataRows = entries.map((e) => ({
      type: "tableRow" as const,
      children: [
        {
          type: "tableCell" as const,
          children: [
            { type: "strong", children: [{ type: "text", value: e.label }] },
          ],
        },
        {
          type: "tableCell" as const,
          children: [{ type: "text", value: e.value }],
        },
      ],
    }));

    return {
      type: "table" as const,
      children: [headerRow, ...dataRows],
    } as unknown as RootContent;
  }

  // Default: blockquote format
  const blockquoteChildren: RootContent[] = [];

  if (opts.header) {
    blockquoteChildren.push({
      type: "paragraph",
      children: [
        {
          type: "strong",
          children: [{ type: "text", value: opts.header }],
        },
      ],
    });
  }

  for (const e of entries) {
    blockquoteChildren.push({
      type: "paragraph",
      children: [
        { type: "strong", children: [{ type: "text", value: `${e.label}: ` }] },
        { type: "text", value: e.value },
      ],
    });
  }

  return {
    type: "blockquote",
    children: blockquoteChildren,
  } as unknown as RootContent;
};

/**
 * Front-matter plugin for md2docx.
 */
export const frontmatterPlugin = (
  _docx?: unknown,
  options: FrontmatterPluginOptions = {},
): IPlugin => ({
  preprocess: (tree, _definitions, docxProps) => {
    if (!docxProps) return;
    const fmNode = extractFrontmatterNode(tree);
    if (!fmNode) return;

    const parser = options.parser ?? parseFrontmatter;
    const data = parser(fmNode.value, fmNode.type as FrontmatterType);

    if (options.transform) {
      options.transform(data, docxProps);
    } else {
      for (const [key, rawVal] of Object.entries(data)) {
        if (
          rawVal == null ||
          FORBIDDEN_KEYS.has(key) ||
          (typeof rawVal === "object" && !Array.isArray(rawVal))
        ) {
          continue;
        }

        const lowerKey = key.toLowerCase();
        const prop = DOCX_METADATA_MAP[lowerKey];

        if (prop) {
          if (docxProps[prop] == null || docxProps[prop] === "") {
            docxProps[prop] = Array.isArray(rawVal)
              ? rawVal.join(", ")
              : String(rawVal);
          }
        } else if (lowerKey === "revision") {
          const rev = Number(rawVal);
          if (
            (docxProps.revision == null || Number.isNaN(docxProps.revision)) &&
            !Number.isNaN(rev) &&
            Number.isInteger(rev)
          ) {
            docxProps.revision = rev;
          }
        } else {
          const customValue = Array.isArray(rawVal)
            ? rawVal.join(", ")
            : String(rawVal);

          if (!docxProps.customProperties) {
            docxProps.customProperties = [];
          }
          if (
            !docxProps.customProperties.some(
              (p) => p.name.toLowerCase() === key.toLowerCase(),
            )
          ) {
            (
              docxProps.customProperties as { name: string; value: string }[]
            ).push({
              name: key,
              value: customValue,
            });
          }
        }
      }
    }

    const children: RootContent[] = Array.isArray(tree)
      ? tree
      : (tree.children as RootContent[]) || [];

    const fmIndex = children.indexOf(fmNode);
    let insertIndex = fmIndex !== -1 ? fmIndex + 1 : 0;

    // 1. Cover Page
    if (options.coverPage) {
      const coverOpts =
        typeof options.coverPage === "object" ? options.coverPage : {};
      const coverNodes = buildCoverPageNodes(
        data,
        docxProps,
        options.coverPage,
      );
      if (coverNodes.length > 0) {
        // If removeMatchingHeading is not false, remove duplicate H1 heading from body
        if (coverOpts.removeMatchingHeading !== false) {
          const titleText =
            coverOpts.title ??
            (typeof data.title === "string" ? data.title : docxProps.title);
          if (titleText) {
            const matchIndex = children.findIndex(
              (n, idx) =>
                idx >= insertIndex &&
                n.type === "heading" &&
                (n as { depth?: number }).depth === 1 &&
                getNodeText(n).trim().toLowerCase() ===
                  titleText.trim().toLowerCase(),
            );
            if (matchIndex !== -1) {
              children.splice(matchIndex, 1);
            }
          }
        }

        children.splice(insertIndex, 0, ...coverNodes);
        insertIndex += coverNodes.length;
      }
    }

    // 2. Metadata Info-Box
    if (options.infoBox) {
      const infoBoxNode = buildInfoBoxNode(data, docxProps, options.infoBox);
      if (infoBoxNode) {
        const infoOpts =
          typeof options.infoBox === "object" ? options.infoBox : {};
        const position = infoOpts.position ?? "after-title";

        if (position === "top") {
          children.splice(insertIndex, 0, infoBoxNode);
        } else {
          // "after-title": insert immediately after the first H1 heading at or after insertIndex
          const firstH1Index = children.findIndex(
            (n, idx) =>
              idx >= insertIndex &&
              n.type === "heading" &&
              (n as { depth?: number }).depth === 1,
          );
          if (firstH1Index !== -1) {
            children.splice(firstH1Index + 1, 0, infoBoxNode);
          } else {
            children.splice(insertIndex, 0, infoBoxNode);
          }
        }
      }
    }
  },
});
