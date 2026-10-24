import type { IDocxProps, IPlugin, Root, RootContent } from "@m2d/core";
import { warnOnce } from "@m2d/core/utils";

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

export type FrontmatterParser = (
  raw: string,
  type?: "yaml" | "toml" | string,
) => FrontmatterData;

export interface FrontmatterPluginOptions {
  /**
   * Custom parser function to parse the raw front-matter string.
   */
  parser?: FrontmatterParser;

  /**
   * Custom transformer to map parsed front-matter fields to DOCX document properties.
   */
  transform?: (frontmatter: FrontmatterData, docxProps: IDocxProps) => void;

  /**
   * Whether to render a visual title block at the top of the document.
   * @default false
   */
  renderTitleBlock?: boolean;
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
 * Strips comments from a YAML line while preserving '#' within quotes or URLs.
 */
const stripYamlComment = (line: string): string => {
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === "#" && !inDouble && !inSingle) {
      if (i === 0 || /\s/.test(line[i - 1])) {
        return line.slice(0, i).trimEnd();
      }
    }
  }
  return line.trimEnd();
};

/**
 * Splits comma-separated array items respecting quoted segments.
 */
const splitQuotedArray = (str: string): string[] => {
  const items: string[] = [];
  let current = "";
  let inDouble = false;
  let inSingle = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '"' && !inSingle) inDouble = !inDouble;
    else if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === "," && !inDouble && !inSingle) {
      items.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  if (current.trim()) items.push(current.trim());
  return items;
};

/**
 * Unquotes and parses scalar YAML values (quoted strings, booleans, numbers, inline arrays).
 */
const parseScalar = (val: string): unknown => {
  const trimmed = val.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return splitQuotedArray(inner).map((item) => {
      const s = item.trim();
      if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
      ) {
        return s.slice(1, -1);
      }
      return s;
    });
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) return num;
  }

  return trimmed;
};

/**
 * Attempts to load optional smol-toml parser.
 */
const tryParseToml = (raw: string): FrontmatterData | null => {
  try {
    // skipcq: JS-C1003
    // biome-ignore lint/suspicious/noExplicitAny: dynamic optional dependency import
    const toml = (globalThis as any).smolToml ?? require("smol-toml");
    if (typeof toml?.parse === "function") {
      return toml.parse(raw) as FrontmatterData;
    }
  } catch {
    // smol-toml not installed
  }
  warnOnce(
    "frontmatter-toml-missing",
    "TOML front-matter detected. Please install 'smol-toml' or provide a custom parser in frontmatterPlugin options to enable TOML parsing.",
  );
  return null;
};

/**
 * Parses YAML front-matter blocks, or delegates TOML to smol-toml if available.
 */
export const parseFrontmatter: FrontmatterParser = (
  raw: string,
  type = "yaml",
): FrontmatterData => {
  if (!raw || typeof raw !== "string") return {};

  if (type === "toml") {
    const tomlData = tryParseToml(raw);
    return tomlData ?? {};
  }

  const result: FrontmatterData = Object.create(null);
  const lines = raw.split(/\r?\n/);
  let currentKey: string | null = null;
  let currentArray: unknown[] | null = null;

  for (const rawLine of lines) {
    const line = stripYamlComment(rawLine);
    if (!line.trim() || line.trim() === "---") continue;

    // List item: "- value"
    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!currentArray) {
        currentArray = [];
        result[currentKey] = currentArray;
      }
      currentArray.push(parseScalar(listMatch[1]));
      continue;
    }

    // YAML Key-value pair (strict colon separation)
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();

      if (!key || FORBIDDEN_KEYS.has(key)) continue;

      if (!val) {
        currentKey = key;
        currentArray = null;
        result[key] = "";
      } else {
        currentKey = null;
        currentArray = null;
        result[key] = parseScalar(val);
      }
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
    const data = parser(fmNode.value, fmNode.type);

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
        if (!docxProps[prop]) {
          docxProps[prop] = Array.isArray(rawVal)
            ? rawVal.join(", ")
            : String(rawVal);
        }
      } else if (lowerKey === "revision") {
        const rev = Number(rawVal);
        if (
          !docxProps.revision &&
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
