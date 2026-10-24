import type { IDocxProps, IPlugin, Root, RootContent } from "@m2d/core";

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
}

type StringMetadataKey =
  | "title"
  | "creator"
  | "description"
  | "subject"
  | "keywords"
  | "lastModifiedBy";

const DOCX_METADATA_MAP: Record<string, StringMetadataKey> = {
  title: "title",
  author: "creator",
  creator: "creator",
  description: "description",
  subject: "subject",
  keywords: "keywords",
  tags: "keywords",
  categories: "keywords",
  lastmodifiedby: "lastModifiedBy",
  modifiedby: "lastModifiedBy",
};

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Strips comments from a line while preserving '#' within quotes or URLs.
 * Tracks backslash parity to correctly identify escaped quotes.
 */
const stripComment = (line: string): string => {
  let inDouble = false;
  let inSingle = false;
  let backslashCount = 0;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\\") {
      backslashCount++;
      continue;
    }
    const isEscaped = backslashCount % 2 === 1;
    backslashCount = 0;

    if (char === '"' && !inSingle && !isEscaped) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble) {
      if (inSingle && line[i + 1] === "'") {
        i++;
        continue;
      }
      inSingle = !inSingle;
    } else if (char === "#" && !inDouble && !inSingle) {
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
  let inDouble = false;
  let inSingle = false;
  let backslashCount = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "\\") {
      backslashCount++;
      current += char;
      continue;
    }
    const isEscaped = backslashCount % 2 === 1;
    backslashCount = 0;

    if (char === '"' && !inSingle && !isEscaped) {
      inDouble = !inDouble;
    } else if (char === "'" && !inDouble) {
      if (inSingle && str[i + 1] === "'") {
        current += "''";
        i++;
        continue;
      }
      inSingle = !inSingle;
    } else if (char === "," && !inDouble && !inSingle) {
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
      return;
    }

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
  },
});
