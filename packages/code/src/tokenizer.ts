import type { CodeLine, Token, TokenType } from "./types";

export type Language =
  | "javascript"
  | "python"
  | "json"
  | "jsonc"
  | "bash"
  | "html"
  | "css"
  | "scss"
  | "less"
  | "sql"
  | "markdown"
  | "generic";

// ---------------------------------------------------------------------------
// 1. Universal Lexical Primitives (Module-Level Sticky RegExp)
// ---------------------------------------------------------------------------
const WHITESPACE = /[^\S\r\n]+/y;
const NEWLINE = /\r\n|\r|\n/y;

// Identifiers
const JS_IDENTIFIER = /[\p{ID_Start}_$][\p{ID_Continue}$]*/uy;
const PY_IDENTIFIER = /[\p{XID_Start}_][\p{XID_Continue}]*/uy;
const SQL_IDENTIFIER = /[a-zA-Z_][a-zA-Z0-9_]*/y;
const BASH_IDENTIFIER = /[a-zA-Z_][a-zA-Z0-9_]*/y;
const GENERIC_IDENTIFIER = /[a-zA-Z_$][a-zA-Z0-9_$]*/y;

// Numbers
const JS_NUMBER =
  /(?:\b0[xX][\da-fA-F](?:[\da-fA-F_]*[\da-fA-F])?n?|\b0[bB][01](?:[01_]*[01])?n?|\b0[oO][0-7](?:[0-7_]*[0-7])?n?|\b\d[\d_]*(?:\.[\d_]*)?(?:[eE][+-]?[\d_]+)?n?\b|\.\d[\d_]*(?:[eE][+-]?[\d_]+)?)/y;

const PY_NUMBER =
  /\b(?:0[xX][\da-fA-F](?:[\da-fA-F_]*[\da-fA-F])?|0[bB][01](?:[01_]*[01])?|0[oO][0-7](?:[0-7_]*[0-7])?|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?[\d_]+)?j?)\b/y;

const SQL_NUMBER = /\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/iy;
const GENERIC_NUMBER = /\b\d+(?:\.\d+)?\b/y;

// Comments: ReDoS-immune deterministic scanners (no polynomial backtracking)
const matchBlockComment = (
  source: string,
  cursor: number,
  openSeq = "/*",
  closeSeq = "*/",
): string | undefined => {
  if (!source.startsWith(openSeq, cursor)) return undefined;
  const end = source.indexOf(closeSeq, cursor + openSeq.length);
  return end === -1
    ? source.slice(cursor)
    : source.slice(cursor, end + closeSeq.length);
};

const matchLineComment = (
  source: string,
  cursor: number,
  prefix: string,
): string | undefined => {
  if (!source.startsWith(prefix, cursor)) return undefined;
  let end = cursor + prefix.length;
  while (end < source.length && source[end] !== "\r" && source[end] !== "\n") {
    end++;
  }
  return source.slice(cursor, end);
};

// ---------------------------------------------------------------------------
// Strings & Literals: ReDoS-immune deterministic scanners
// ---------------------------------------------------------------------------
const matchDoubleQuoteString = (
  source: string,
  cursor: number,
): string | undefined => {
  if (source[cursor] !== '"') return undefined;
  let i = cursor + 1;
  while (i < source.length) {
    if (source[i] === "\\") {
      i += 2;
    } else if (source[i] === '"') {
      return source.slice(cursor, i + 1);
    } else if (source[i] === "\r" || source[i] === "\n") {
      return source.slice(cursor, i);
    } else {
      i++;
    }
  }
  return source.slice(cursor);
};

const matchSingleOrDoubleQuoteString = (
  source: string,
  cursor: number,
): string | undefined => {
  const quote = source[cursor];
  if (quote !== '"' && quote !== "'") return undefined;
  let i = cursor + 1;
  while (i < source.length) {
    if (source[i] === "\\") {
      i += 2;
    } else if (source[i] === quote) {
      return source.slice(cursor, i + 1);
    } else if (source[i] === "\r" || source[i] === "\n") {
      return source.slice(cursor, i);
    } else {
      i++;
    }
  }
  return source.slice(cursor);
};

const matchJsString = (source: string, cursor: number): string | undefined => {
  const quote = source[cursor];
  if (quote === "`") {
    let i = cursor + 1;
    while (i < source.length) {
      if (source[i] === "\\") {
        i += 2;
      } else if (source[i] === "`") {
        return source.slice(cursor, i + 1);
      } else {
        i++;
      }
    }
    return source.slice(cursor);
  }
  if (quote === '"' || quote === "'") {
    let i = cursor + 1;
    while (i < source.length) {
      if (source[i] === "\\") {
        i += 2;
      } else if (source[i] === quote) {
        return source.slice(cursor, i + 1);
      } else if (source[i] === "\r" || source[i] === "\n") {
        return source.slice(cursor, i);
      } else {
        i++;
      }
    }
    return source.slice(cursor);
  }
  return undefined;
};

const matchPythonTripleQuote = (
  source: string,
  cursor: number,
  prefixLen: number,
  delimiter: '"""' | "'''",
): string => {
  let i = cursor + prefixLen + 3;
  while (i < source.length) {
    const nextIdx = source.indexOf(delimiter, i);
    if (nextIdx === -1) {
      return source.slice(cursor);
    }
    let backslashes = 0;
    let b = nextIdx - 1;
    while (b >= cursor + prefixLen + 3 && source[b] === "\\") {
      backslashes++;
      b--;
    }
    if (backslashes % 2 === 0) {
      return source.slice(cursor, nextIdx + 3);
    }
    i = nextIdx + 1;
  }
  return source.slice(cursor);
};

const matchPythonString = (
  source: string,
  cursor: number,
): string | undefined => {
  let p = cursor;
  const rem = source.length - p;
  if (rem >= 2) {
    const two = source.slice(p, p + 2).toLowerCase();
    if (two === "fr" || two === "rf" || two === "br" || two === "rb") {
      p += 2;
    }
  }
  if (p === cursor && rem >= 1) {
    const one = source[p].toLowerCase();
    if (one === "r" || one === "u" || one === "b" || one === "f") {
      p += 1;
    }
  }

  if (source.startsWith('"""', p)) {
    return matchPythonTripleQuote(source, cursor, p - cursor, '"""');
  }
  if (source.startsWith("'''", p)) {
    return matchPythonTripleQuote(source, cursor, p - cursor, "'''");
  }

  const quote = source[p];
  if (quote === '"' || quote === "'") {
    let i = p + 1;
    while (i < source.length) {
      if (source[i] === "\\") {
        i += 2;
      } else if (source[i] === quote) {
        return source.slice(cursor, i + 1);
      } else if (source[i] === "\r" || source[i] === "\n") {
        return source.slice(cursor, i);
      } else {
        i++;
      }
    }
    return source.slice(cursor);
  }

  return undefined;
};

const matchSqlString = (source: string, cursor: number): string | undefined => {
  const quote = source[cursor];
  if (quote !== "'" && quote !== '"') return undefined;
  let i = cursor + 1;
  while (i < source.length) {
    if (source[i] === quote) {
      if (i + 1 < source.length && source[i + 1] === quote) {
        i += 2;
      } else {
        return source.slice(cursor, i + 1);
      }
    } else {
      i++;
    }
  }
  return source.slice(cursor);
};

const matchMarkdownInlineCode = (
  source: string,
  cursor: number,
): string | undefined => {
  if (source[cursor] !== "`") return undefined;
  let count = 0;
  while (cursor + count < source.length && source[cursor + count] === "`") {
    count++;
  }
  const fence = source.slice(cursor, cursor + count);
  let i = cursor + count;
  while (i < source.length && source[i] !== "\n" && source[i] !== "\r") {
    if (source.startsWith(fence, i)) {
      return source.slice(cursor, i + count);
    }
    i++;
  }
  return undefined;
};

// JavaScript Context-Sensitive Regex Literal Detection
const matchJsRegexLiteral = (
  source: string,
  cursor: number,
): string | undefined => {
  if (source[cursor] !== "/") return undefined;
  const next = source[cursor + 1];
  if (
    next === "/" ||
    next === "*" ||
    next === "\r" ||
    next === "\n" ||
    next === undefined
  ) {
    return undefined;
  }

  let i = cursor + 1;
  let inClass = false;

  while (i < source.length) {
    const ch = source[i];
    if (ch === "\r" || ch === "\n") {
      return undefined;
    }
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (inClass) {
      if (ch === "]") {
        inClass = false;
      }
      i++;
      continue;
    }
    if (ch === "[") {
      inClass = true;
      i++;
      continue;
    }
    if (ch === "/") {
      i++;
      while (
        i < source.length &&
        (source[i] === "d" ||
          source[i] === "g" ||
          source[i] === "i" ||
          source[i] === "m" ||
          source[i] === "s" ||
          source[i] === "u" ||
          source[i] === "v" ||
          source[i] === "y")
      ) {
        i++;
      }
      return source.slice(cursor, i);
    }
    i++;
  }
  return undefined;
};
const CAN_START_REGEX =
  /(?:[({[=,:;!?&|+*%^~<>-]|\b(?:return|throw|case|delete|void|typeof|instanceof|in|of|yield|await|else|do))$/;
const canStartRegex = (previous: string): boolean =>
  previous === "" || CAN_START_REGEX.test(previous);

// Operators — strictly sorted longest-match-first
const JS_OPERATORS =
  /(?:\?\?=|&&=|\|\|=|\*\*=|>>>=|<<=|>>=|===|!==|=>|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\+\+|--|\+=|-=|\*=|\/=|%=|\*\*|\.\.\.|<<|>>|[+\-*/%&|^!<>=?:~])/y;

const PY_OPERATORS =
  /(?:\*\*=|[/]{2}=|\*\*=|[/]{2}=|<<=|>>=|:=|\*\*|[/]{2}|==|!=|<=|>=|\+=|-=|\*=|\/=|%=|<<|>>|->|[+\-*/%&|^~=<>@])/y;

const SQL_OPERATORS = /<=|>=|!=|<>|:=|=>|=|<|>|\+|-|\*|\/|%|\|\|/y;

const BASH_OPERATORS = /&&|\|\||>>|<<|>&|\|&|[&<>;=|]/y;

const GENERIC_OPERATORS = /==|!=|<=|>=|&&|\|\||[+\-*/%=!<>]/y;

// Punctuation
const JS_PUNCTUATION = /[{}()[\];.,]/y;
const PY_PUNCTUATION = /[{}()[\];:,.]/y;
const JSON_PUNCTUATION = /[{}[\]:,]/y;
const SQL_PUNCTUATION = /[(),;.[\]]/y;
const BASH_PUNCTUATION = /[{}()[\]]/y;
const CSS_PUNCTUATION = /[{}();:,]/y;
const GENERIC_PUNCTUATION = /[{}()[\];:,.]/y;

const matchThematicBreak = (
  source: string,
  cursor: number,
): string | undefined => {
  let i = cursor;
  let spaces = 0;
  while (i < source.length && source[i] === " " && spaces < 3) {
    i++;
    spaces++;
  }
  if (i >= source.length) return undefined;
  const marker = source[i];
  if (marker !== "*" && marker !== "-" && marker !== "_") return undefined;
  let count = 0;
  let end = i;
  while (end < source.length && source[end] !== "\r" && source[end] !== "\n") {
    if (source[end] === marker) {
      count++;
    } else if (source[end] !== " " && source[end] !== "\t") {
      return undefined;
    }
    end++;
  }
  return count >= 3 ? source.slice(cursor, end) : undefined;
};

// Markdown Block Structures (evaluated at line start before consuming indentation)
type BlockRule = [TokenType, RegExp];
const MD_BLOCK_RULES: BlockRule[] = [
  ["keyword", / {0,3}#{1,6}(?=\s|$)/y],
  ["operator", / {0,3}(?:[-+*]|\d+[.)])(?=\s)/y],
  ["operator", / {0,3}>/y],
];

// ---------------------------------------------------------------------------
// 2. Precomputed Keyword & Builtin Dictionaries
// ---------------------------------------------------------------------------
const JS_KEYWORDS = new Set([
  "abstract",
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "declare",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "get",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "namespace",
  "new",
  "of",
  "override",
  "package",
  "private",
  "protected",
  "public",
  "readonly",
  "return",
  "satisfies",
  "set",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

const JS_BOOLEANS = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity",
]);

const JS_BUILTINS = new Set([
  "console",
  "window",
  "document",
  "globalThis",
  "Math",
  "JSON",
  "Object",
  "Array",
  "String",
  "Number",
  "Boolean",
  "BigInt",
  "Symbol",
  "Promise",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "RegExp",
  "Error",
  "Date",
  "Function",
  "Proxy",
  "Reflect",
  "Intl",
  "URL",
  "URLSearchParams",
  "AbortController",
  "Blob",
  "FormData",
  "Headers",
  "Request",
  "Response",
  "ReadableStream",
  "TextEncoder",
  "TextDecoder",
  "parseInt",
  "parseFloat",
  "isNaN",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "Record",
  "Partial",
  "Required",
  "Readonly",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
]);

const PY_KEYWORDS = new Set([
  "and",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "class",
  "continue",
  "def",
  "del",
  "elif",
  "else",
  "except",
  "finally",
  "for",
  "from",
  "global",
  "if",
  "import",
  "in",
  "is",
  "lambda",
  "nonlocal",
  "not",
  "or",
  "pass",
  "raise",
  "return",
  "try",
  "while",
  "with",
  "yield",
]);

const PY_BOOLEANS = new Set([
  "True",
  "False",
  "None",
  "NotImplemented",
  "Ellipsis",
]);

// self and cls are explicit non-builtins (variables/parameters per Python conventions)
const PY_BUILTINS = new Set([
  "__import__",
  "abs",
  "all",
  "any",
  "ascii",
  "bin",
  "bool",
  "breakpoint",
  "bytearray",
  "bytes",
  "callable",
  "chr",
  "classmethod",
  "compile",
  "complex",
  "delattr",
  "dict",
  "dir",
  "divmod",
  "enumerate",
  "eval",
  "exec",
  "filter",
  "float",
  "format",
  "frozenset",
  "getattr",
  "globals",
  "hasattr",
  "hash",
  "help",
  "hex",
  "id",
  "input",
  "int",
  "isinstance",
  "issubclass",
  "iter",
  "len",
  "list",
  "locals",
  "map",
  "max",
  "memoryview",
  "min",
  "next",
  "object",
  "oct",
  "open",
  "ord",
  "pow",
  "print",
  "property",
  "range",
  "repr",
  "reversed",
  "round",
  "set",
  "setattr",
  "slice",
  "sorted",
  "staticmethod",
  "str",
  "sum",
  "super",
  "tuple",
  "type",
  "vars",
  "zip",
]);

const SQL_KEYWORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "INSERT",
  "INTO",
  "VALUES",
  "UPDATE",
  "DELETE",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "FULL",
  "CROSS",
  "NATURAL",
  "ON",
  "USING",
  "GROUP",
  "BY",
  "ORDER",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "FETCH",
  "UNION",
  "INTERSECT",
  "EXCEPT",
  "ALL",
  "AS",
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "NULL",
  "LIKE",
  "ILIKE",
  "BETWEEN",
  "EXISTS",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "CREATE",
  "ALTER",
  "DROP",
  "TRUNCATE",
  "TABLE",
  "VIEW",
  "INDEX",
  "SCHEMA",
  "DATABASE",
  "PRIMARY",
  "KEY",
  "FOREIGN",
  "REFERENCES",
  "DEFAULT",
  "CONSTRAINT",
  "DISTINCT",
  "RETURNING",
  "WITH",
  "RECURSIVE",
  "ASC",
  "DESC",
  "NULLS",
  "FIRST",
  "LAST",
  "BEGIN",
  "COMMIT",
  "ROLLBACK",
  "GRANT",
  "REVOKE",
  "CASCADE",
  "IF",
  "REPLACE",
  "TEMP",
  "TEMPORARY",
]);

const SQL_BUILTINS = new Set([
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "COALESCE",
  "NULLIF",
  "NOW",
  "CURRENT_DATE",
  "CURRENT_TIME",
  "CURRENT_TIMESTAMP",
  "LOWER",
  "UPPER",
  "LENGTH",
  "SUBSTRING",
  "CONCAT",
  "CAST",
  "EXTRACT",
  "DATE_TRUNC",
  "JSON",
  "JSONB",
  "VARCHAR",
  "CHAR",
  "CHARACTER",
  "INT",
  "INTEGER",
  "BIGINT",
  "SMALLINT",
  "BOOLEAN",
  "DATE",
  "TIME",
  "TIMESTAMP",
  "DECIMAL",
  "NUMERIC",
  "REAL",
  "DOUBLE",
  "PRECISION",
  "TEXT",
  "BLOB",
  "UUID",
  "SERIAL",
  "BIGSERIAL",
  "FLOAT",
]);

const BASH_KEYWORDS = new Set([
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "case",
  "esac",
  "for",
  "while",
  "until",
  "do",
  "done",
  "in",
  "function",
  "select",
  "time",
  "export",
  "source",
  "alias",
  "set",
  "unset",
  "readonly",
  "return",
  "exit",
  "local",
  "declare",
  "typeset",
  "shift",
  "break",
  "continue",
]);

const BASH_BUILTINS = new Set([
  "echo",
  "printf",
  "cd",
  "pwd",
  "ls",
  "cat",
  "mkdir",
  "rmdir",
  "rm",
  "cp",
  "mv",
  "chmod",
  "chown",
  "grep",
  "sed",
  "awk",
  "cut",
  "sort",
  "uniq",
  "head",
  "tail",
  "wc",
  "xargs",
  "find",
  "curl",
  "wget",
  "git",
  "pnpm",
  "npm",
  "yarn",
  "node",
  "npx",
  "sudo",
  "touch",
  "test",
  "read",
  "eval",
  "exec",
  "trap",
  "wait",
  "kill",
  "jobs",
]);

const CSS_BUILTINS = new Set([
  "important",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
  "auto",
  "none",
  "solid",
  "dashed",
  "dotted",
  "flex",
  "grid",
  "block",
  "inline",
  "inline-block",
  "absolute",
  "relative",
  "fixed",
  "sticky",
  "center",
  "left",
  "right",
  "top",
  "bottom",
  "transparent",
  "currentColor",
]);

const GENERIC_KEYWORDS = new Set([
  "function",
  "def",
  "class",
  "return",
  "if",
  "else",
  "for",
  "while",
  "import",
  "from",
  "const",
  "let",
  "var",
  "public",
  "private",
  "static",
  "void",
  "bool",
  "int",
  "string",
  "true",
  "false",
  "null",
  "nil",
]);

// ---------------------------------------------------------------------------
// 3. Normalization Helper
// ---------------------------------------------------------------------------
export const normalizeLanguage = (language?: string): Language => {
  const lang = language?.toLowerCase().trim() ?? "";
  if (
    [
      "js",
      "javascript",
      "ts",
      "typescript",
      "jsx",
      "tsx",
      "mjs",
      "cjs",
      "javascriptreact",
      "typescriptreact",
    ].includes(lang)
  ) {
    return "javascript";
  }
  if (["py", "python", "pyw"].includes(lang)) return "python";
  if (lang === "json") return "json";
  if (lang === "jsonc") return "jsonc";
  if (["sh", "bash", "shell", "zsh", "shellscript"].includes(lang)) {
    return "bash";
  }
  if (["html", "xml", "svg", "vue", "svelte"].includes(lang)) return "html";
  if (lang === "css") return "css";
  if (lang === "scss") return "scss";
  if (lang === "less") return "less";
  if (
    ["sql", "pgsql", "postgresql", "mysql", "sqlite", "plsql"].includes(lang)
  ) {
    return "sql";
  }
  if (["md", "markdown", "mdx"].includes(lang)) return "markdown";
  return "generic";
};

const isNextCall = (source: string, indexAfterWord: number): boolean => {
  let idx = indexAfterWord;
  const len = source.length;
  while (idx < len) {
    const code = source.charCodeAt(idx);
    if (code === 32 || code === 9) {
      idx++;
      continue;
    }
    return code === 40; // '('
  }
  return false;
};

// ---------------------------------------------------------------------------
// 4. Tokenizer Engine Following Strict Lexical Precedence
// ---------------------------------------------------------------------------
/**
 * Tokenizes entire code block string into a flat token list.
 * Adheres to fundamental compiler lexical precedence:
 * 1. Whitespace & universal newlines (\r\n, \n, standalone \r)
 * 2. Comments (line & block)
 * 3. Strings & prefixed literals (e.g. f"...", r"...", `...`)
 * 4. Context-sensitive RegExp literals (JavaScript)
 * 5. Numbers (hex, binary, float, bigint, complex, CSS hex colors)
 * 6. Identifiers + O(1) Set classifications (keywords, builtins, booleans, functions)
 * 7. Operators (longest match first) & Punctuation
 * 8. Fallback character preservation
 */
export const tokenizeCode = (source: string, language?: string): Token[] => {
  const lang = normalizeLanguage(language);
  const tokens: Token[] = [];
  let cursor = 0;
  const len = source.length;
  let previousSignificant = "";

  const push = (type: TokenType, value: string, significant = true) => {
    if (!value) return;
    const last = tokens[tokens.length - 1];
    if (type === "text" && last?.type === "text") {
      last.value += value;
    } else {
      tokens.push({ type, value });
    }
    if (significant) {
      previousSignificant = value;
    }
  };

  while (cursor < len) {
    // -------------------------------------------------------------------------
    // Phase 0: Markdown Block Anchors (at start of line before whitespace)
    // -------------------------------------------------------------------------
    if (
      lang === "markdown" &&
      (cursor === 0 ||
        source[cursor - 1] === "\n" ||
        source[cursor - 1] === "\r")
    ) {
      const hr = matchThematicBreak(source, cursor);
      if (hr) {
        push("keyword", hr);
        cursor += hr.length;
        continue;
      }
      let blockMatched = false;
      for (const [type, regex] of MD_BLOCK_RULES) {
        regex.lastIndex = cursor;
        const match = regex.exec(source);
        if (match && match.index === cursor && match[0].length > 0) {
          push(type, match[0]);
          cursor += match[0].length;
          blockMatched = true;
          break;
        }
      }
      if (blockMatched) continue;
    }

    // -------------------------------------------------------------------------
    // Phase 1: Whitespace & Universal Newline Preservation
    // -------------------------------------------------------------------------
    WHITESPACE.lastIndex = cursor;
    const wsMatch = WHITESPACE.exec(source);
    if (wsMatch) {
      push("text", wsMatch[0], false);
      cursor += wsMatch[0].length;
      continue;
    }

    NEWLINE.lastIndex = cursor;
    const nlMatch = NEWLINE.exec(source);
    if (nlMatch) {
      push("text", nlMatch[0], false);
      cursor += nlMatch[0].length;
      continue;
    }

    // -------------------------------------------------------------------------
    // Phase 2: Comments (MUST PRECEDES STRINGS & IDENTIFIERS)
    // -------------------------------------------------------------------------
    let comment: string | undefined;
    if (
      lang === "javascript" ||
      lang === "jsonc" ||
      lang === "scss" ||
      lang === "less"
    ) {
      comment =
        matchBlockComment(source, cursor, "/*", "*/") ??
        matchLineComment(source, cursor, "//");
    } else if (lang === "python" || lang === "bash") {
      comment = matchLineComment(source, cursor, "#");
    } else if (lang === "html" || lang === "markdown") {
      // promptshield-ignore -- ok
      comment = matchBlockComment(source, cursor, "<!--", "-->");
    } else if (lang === "css") {
      // Standard CSS strictly does NOT accept // line comments
      comment = matchBlockComment(source, cursor, "/*", "*/");
    } else if (lang === "sql") {
      comment =
        matchLineComment(source, cursor, "--") ??
        matchLineComment(source, cursor, "#") ??
        matchBlockComment(source, cursor, "/*", "*/");
    } else if (lang === "generic") {
      comment =
        matchBlockComment(source, cursor, "/*", "*/") ??
        matchLineComment(source, cursor, "//") ??
        matchLineComment(source, cursor, "#");
    }

    if (comment) {
      push("comment", comment);
      cursor += comment.length;
      continue;
    }

    // -------------------------------------------------------------------------
    // Phase 3: Strings & Prefixed String Literals (MUST PRECEDE IDENTIFIERS)
    // -------------------------------------------------------------------------
    if (lang === "python") {
      // Handles raw (r""), format (f""), bytes (b""), and triple-quoted blocks
      const match = matchPythonString(source, cursor);
      if (match) {
        push("string", match);
        cursor += match.length;
        continue;
      }
    } else if (lang === "javascript") {
      const match = matchJsString(source, cursor);
      if (match) {
        push("string", match);
        cursor += match.length;
        continue;
      }
    } else if (lang === "json" || lang === "jsonc") {
      const match = matchDoubleQuoteString(source, cursor);
      if (match) {
        let peek = cursor + match.length;
        while (
          peek < source.length &&
          (source[peek] === " " ||
            source[peek] === "\t" ||
            source[peek] === "\r" ||
            source[peek] === "\n")
        ) {
          peek++;
        }
        const type = source[peek] === ":" ? "keyword" : "string";
        push(type, match);
        cursor += match.length;
        continue;
      }
    } else if (lang === "sql") {
      const match = matchSqlString(source, cursor);
      if (match) {
        push("string", match);
        cursor += match.length;
        continue;
      }
    } else if (
      lang === "html" ||
      lang === "css" ||
      lang === "scss" ||
      lang === "less" ||
      lang === "bash"
    ) {
      const match = matchSingleOrDoubleQuoteString(source, cursor);
      if (match) {
        push("string", match);
        cursor += match.length;
        continue;
      }
    } else if (lang === "markdown") {
      const match = matchMarkdownInlineCode(source, cursor);
      if (match) {
        push("string", match);
        cursor += match.length;
        continue;
      }
    } else if (lang === "generic") {
      const match = matchJsString(source, cursor);
      if (match) {
        push("string", match);
        cursor += match.length;
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // Phase 4: JavaScript Regex Literals (after comments & strings, before division)
    // -------------------------------------------------------------------------
    if (
      lang === "javascript" &&
      source[cursor] === "/" &&
      canStartRegex(previousSignificant)
    ) {
      const literal = matchJsRegexLiteral(source, cursor);
      if (literal) {
        push("string", literal);
        cursor += literal.length;
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // Phase 5: Numbers (MUST PRECEDE IDENTIFIERS & OPERATORS)
    // -------------------------------------------------------------------------
    if (lang === "javascript") {
      JS_NUMBER.lastIndex = cursor;
      const match = JS_NUMBER.exec(source);
      if (match && match.index === cursor) {
        push("number", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "python") {
      PY_NUMBER.lastIndex = cursor;
      const match = PY_NUMBER.exec(source);
      if (match && match.index === cursor) {
        push("number", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "css" || lang === "scss" || lang === "less") {
      // Hex colors MUST precede selector classes/IDs (e.g. #fff must match as number)
      const CSS_HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/y;
      CSS_HEX_COLOR.lastIndex = cursor;
      let match = CSS_HEX_COLOR.exec(source);
      if (match && match.index === cursor) {
        push("number", match[0]);
        cursor += match[0].length;
        continue;
      }
      const CSS_MEASURE = /-?(?:\d+(?:\.\d+)?|\.\d+)(?:%|[a-zA-Z]+)?/y;
      CSS_MEASURE.lastIndex = cursor;
      match = CSS_MEASURE.exec(source);
      if (match && match.index === cursor) {
        push("number", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "sql") {
      SQL_NUMBER.lastIndex = cursor;
      const match = SQL_NUMBER.exec(source);
      if (match && match.index === cursor) {
        push("number", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "json" || lang === "jsonc") {
      const JSON_NUM = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
      JSON_NUM.lastIndex = cursor;
      const match = JSON_NUM.exec(source);
      if (match && match.index === cursor) {
        const nextChar = source.charCodeAt(cursor + match[0].length);
        const isIdent =
          (nextChar >= 65 && nextChar <= 90) ||
          (nextChar >= 97 && nextChar <= 122) ||
          nextChar === 95 ||
          nextChar === 46;
        if (!isIdent) {
          push("number", match[0]);
          cursor += match[0].length;
          continue;
        }
      }
    } else {
      GENERIC_NUMBER.lastIndex = cursor;
      const match = GENERIC_NUMBER.exec(source);
      if (match && match.index === cursor) {
        push("number", match[0]);
        cursor += match[0].length;
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // Phase 6: Identifiers + Keyword / Builtin / Boolean Classification
    // -------------------------------------------------------------------------
    if (lang === "javascript") {
      JS_IDENTIFIER.lastIndex = cursor;
      const idMatch = JS_IDENTIFIER.exec(source);
      if (idMatch && idMatch.index === cursor) {
        const word = idMatch[0];
        let type: TokenType;
        if (JS_KEYWORDS.has(word)) {
          type = "keyword";
        } else if (JS_BOOLEANS.has(word)) {
          type = "boolean";
        } else if (JS_BUILTINS.has(word)) {
          type = "builtin";
        } else if (isNextCall(source, cursor + word.length)) {
          type = "function";
        } else {
          type = "variable";
        }
        push(type, word);
        cursor += word.length;
        continue;
      }
    } else if (lang === "python") {
      // Python decorators (@decorator)
      if (source[cursor] === "@") {
        const PY_DECORATOR = /@[\p{XID_Start}_][\p{XID_Continue}.]*/uy;
        PY_DECORATOR.lastIndex = cursor;
        const decMatch = PY_DECORATOR.exec(source);
        if (decMatch && decMatch.index === cursor) {
          push("function", decMatch[0]);
          cursor += decMatch[0].length;
          continue;
        }
      }
      PY_IDENTIFIER.lastIndex = cursor;
      const idMatch = PY_IDENTIFIER.exec(source);
      if (idMatch && idMatch.index === cursor) {
        const word = idMatch[0];
        let type: TokenType;
        if (PY_KEYWORDS.has(word)) {
          type = "keyword";
        } else if (PY_BOOLEANS.has(word)) {
          type = "boolean";
        } else if (PY_BUILTINS.has(word)) {
          type = "builtin";
        } else if (isNextCall(source, cursor + word.length)) {
          type = "function";
        } else {
          type = "variable";
        }
        push(type, word);
        cursor += word.length;
        continue;
      }
    } else if (lang === "sql") {
      SQL_IDENTIFIER.lastIndex = cursor;
      const idMatch = SQL_IDENTIFIER.exec(source);
      if (idMatch && idMatch.index === cursor) {
        const word = idMatch[0];
        const upper = word.toUpperCase();
        let type: TokenType;
        if (SQL_KEYWORDS.has(upper)) {
          type = "keyword";
        } else if (SQL_BUILTINS.has(upper)) {
          type = "builtin";
        } else {
          type = "variable";
        }
        push(type, word);
        cursor += word.length;
        continue;
      }
    } else if (lang === "bash") {
      // Bash variables: ${VAR}, $VAR, $0-$9, $?
      const BASH_VAR = /\$\{[^}{\r\n]+\}|\$[a-zA-Z_]\w*|\$[0-9?*@#$!]/y;
      BASH_VAR.lastIndex = cursor;
      let match = BASH_VAR.exec(source);
      if (match && match.index === cursor) {
        push("variable", match[0]);
        cursor += match[0].length;
        continue;
      }
      BASH_IDENTIFIER.lastIndex = cursor;
      match = BASH_IDENTIFIER.exec(source);
      if (match && match.index === cursor) {
        const word = match[0];
        let type: TokenType;
        if (BASH_KEYWORDS.has(word)) {
          type = "keyword";
        } else if (BASH_BUILTINS.has(word)) {
          type = "builtin";
        } else {
          type = "variable";
        }
        push(type, word);
        cursor += word.length;
        continue;
      }
    } else if (lang === "html") {
      // HTML doctype / tags
      const HTML_TAG = /<!DOCTYPE\b[^>]*>|<\/?[a-zA-Z][\w:.-]*/iy;
      HTML_TAG.lastIndex = cursor;
      let match = HTML_TAG.exec(source);
      if (match && match.index === cursor) {
        push("keyword", match[0]);
        cursor += match[0].length;
        continue;
      }
      // HTML attributes
      const HTML_ATTR = /[a-zA-Z_:][\w:.-]*/y;
      HTML_ATTR.lastIndex = cursor;
      match = HTML_ATTR.exec(source);
      if (match && match.index === cursor) {
        let peek = cursor + match[0].length;
        while (
          peek < source.length &&
          (source[peek] === " " || source[peek] === "\t")
        ) {
          peek++;
        }
        if (source[peek] === "=") {
          push("function", match[0]);
          cursor += match[0].length;
          continue;
        }
      }
      // HTML entities
      const HTML_ENTITY = /&(?:#\d+|#x[\da-fA-F]+|[a-zA-Z][\da-zA-Z]+);/y;
      HTML_ENTITY.lastIndex = cursor;
      match = HTML_ENTITY.exec(source);
      if (match && match.index === cursor) {
        push("builtin", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "css" || lang === "scss" || lang === "less") {
      // CSS at-rules: @media, @import
      const CSS_AT_RULE = /@[\w-]+/y;
      CSS_AT_RULE.lastIndex = cursor;
      let match = CSS_AT_RULE.exec(source);
      if (match && match.index === cursor) {
        push("keyword", match[0]);
        cursor += match[0].length;
        continue;
      }
      // CSS custom property or property name: --var or margin(?=:)
      const CSS_PROP = /--[\w-]+|[a-zA-Z-]+/y;
      CSS_PROP.lastIndex = cursor;
      match = CSS_PROP.exec(source);
      if (match && match.index === cursor) {
        let peek = cursor + match[0].length;
        while (
          peek < source.length &&
          (source[peek] === " " || source[peek] === "\t")
        ) {
          peek++;
        }
        if (source[peek] === ":" && source[peek + 1] !== ":") {
          push("keyword", match[0]);
          cursor += match[0].length;
          continue;
        }
      }
      // CSS selector class/pseudo: .class or :hover or #id
      const CSS_SELECTOR = /[.#:][\w-]+/y;
      CSS_SELECTOR.lastIndex = cursor;
      match = CSS_SELECTOR.exec(source);
      if (match && match.index === cursor) {
        push("function", match[0]);
        cursor += match[0].length;
        continue;
      }
      // CSS keyword values
      const CSS_IDENT = /[a-zA-Z-]+/y;
      CSS_IDENT.lastIndex = cursor;
      match = CSS_IDENT.exec(source);
      if (match && match.index === cursor) {
        const word = match[0];
        push(CSS_BUILTINS.has(word) ? "builtin" : "variable", word);
        cursor += word.length;
        continue;
      }
    } else if (lang === "json" || lang === "jsonc") {
      const JSON_BOOL = /\b(?:true|false|null)\b/y;
      JSON_BOOL.lastIndex = cursor;
      const match = JSON_BOOL.exec(source);
      if (match && match.index === cursor) {
        push("boolean", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else {
      GENERIC_IDENTIFIER.lastIndex = cursor;
      const idMatch = GENERIC_IDENTIFIER.exec(source);
      if (idMatch && idMatch.index === cursor) {
        const word = idMatch[0];
        let type: TokenType;
        if (GENERIC_KEYWORDS.has(word)) {
          type = "keyword";
        } else if (isNextCall(source, cursor + word.length)) {
          type = "function";
        } else {
          type = "variable";
        }
        push(type, word);
        cursor += word.length;
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // Phase 7: Operators & Punctuation
    // -------------------------------------------------------------------------
    if (lang === "javascript") {
      JS_OPERATORS.lastIndex = cursor;
      let match = JS_OPERATORS.exec(source);
      if (match && match.index === cursor) {
        push("operator", match[0]);
        cursor += match[0].length;
        continue;
      }
      JS_PUNCTUATION.lastIndex = cursor;
      match = JS_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "python") {
      PY_OPERATORS.lastIndex = cursor;
      let match = PY_OPERATORS.exec(source);
      if (match && match.index === cursor) {
        push("operator", match[0]);
        cursor += match[0].length;
        continue;
      }
      PY_PUNCTUATION.lastIndex = cursor;
      match = PY_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "sql") {
      SQL_OPERATORS.lastIndex = cursor;
      let match = SQL_OPERATORS.exec(source);
      if (match && match.index === cursor) {
        push("operator", match[0]);
        cursor += match[0].length;
        continue;
      }
      SQL_PUNCTUATION.lastIndex = cursor;
      match = SQL_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "bash") {
      BASH_OPERATORS.lastIndex = cursor;
      let match = BASH_OPERATORS.exec(source);
      if (match && match.index === cursor) {
        push("operator", match[0]);
        cursor += match[0].length;
        continue;
      }
      BASH_PUNCTUATION.lastIndex = cursor;
      match = BASH_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "json" || lang === "jsonc") {
      JSON_PUNCTUATION.lastIndex = cursor;
      const match = JSON_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "css" || lang === "scss" || lang === "less") {
      CSS_PUNCTUATION.lastIndex = cursor;
      const match = CSS_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "html") {
      const HTML_OP_PUNCT = /[<>/=]/y;
      HTML_OP_PUNCT.lastIndex = cursor;
      const match = HTML_OP_PUNCT.exec(source);
      if (match && match.index === cursor) {
        push(match[0] === "=" ? "operator" : "punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else if (lang === "markdown") {
      const MD_PUNCT = /[*_~`#]/y;
      MD_PUNCT.lastIndex = cursor;
      const match = MD_PUNCT.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    } else {
      GENERIC_OPERATORS.lastIndex = cursor;
      let match = GENERIC_OPERATORS.exec(source);
      if (match && match.index === cursor) {
        push("operator", match[0]);
        cursor += match[0].length;
        continue;
      }
      GENERIC_PUNCTUATION.lastIndex = cursor;
      match = GENERIC_PUNCTUATION.exec(source);
      if (match && match.index === cursor) {
        push("punctuation", match[0]);
        cursor += match[0].length;
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // Phase 8: Fallback Character Preservation
    // -------------------------------------------------------------------------
    push("text", source[cursor]);
    cursor++;
  }

  return tokens;
};

/**
 * Splits flat tokens across newlines (CRLF, LF, or standalone CR) into per-line token arrays.
 */
export const splitTokensIntoLines = (tokens: Token[]): Token[][] => {
  const lines: Token[][] = [[]];

  for (const token of tokens) {
    const parts = token.value.split(/\r\n|\r|\n/);
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        lines.push([]);
      }
      const part = parts[i];
      if (part.length > 0) {
        lines[lines.length - 1].push({ type: token.type, value: part });
      }
    }
  }

  return lines;
};

/**
 * High-level tokenizer breaking code into per-line token arrays.
 */
export const tokenize = (code: string, language?: string): Token[][] => {
  const tokens = tokenizeCode(code, language);
  return splitTokensIntoLines(tokens);
};

const classifyDiffLine = (line: string): CodeLine["diffType"] => {
  if (/^(?:diff --git\s|index\s|---\s|\+\+\+\s|\*\*\*\s|@@)/.test(line)) {
    return "header";
  }
  if (line.startsWith("+")) return "add";
  if (line.startsWith("-")) return "delete";
  return "none";
};

/**
 * Parses source code into structured lines with tokens and git diff metadata.
 */
export const parseCodeLines = (
  code: string,
  language?: string,
  diffHighlight = true,
  customTokenizer?: (code: string, lang?: string) => Token[][],
): CodeLine[] => {
  const normalizedLang = language?.toLowerCase().trim();
  const isDiffLang = normalizedLang === "diff" || normalizedLang === "patch";

  let rawLinesOfTokens: Token[][];

  if (customTokenizer) {
    rawLinesOfTokens = customTokenizer(code, normalizedLang);
  } else if (isDiffLang) {
    const rawLines = code.split(/\r\n|\r|\n/);
    rawLinesOfTokens = rawLines.map((line) => {
      if (
        line.startsWith("+++") ||
        line.startsWith("---") ||
        line.startsWith("@@")
      ) {
        return [{ type: "diffHeader", value: line }];
      }
      if (line.startsWith("+")) {
        return [{ type: "diffAdd", value: line }];
      }
      if (line.startsWith("-")) {
        return [{ type: "diffDelete", value: line }];
      }
      return [{ type: "text", value: line }];
    });
  } else {
    const tokens = tokenizeCode(code, normalizedLang);
    rawLinesOfTokens = splitTokensIntoLines(tokens);
  }

  const codeLines: CodeLine[] = rawLinesOfTokens.map((tokens) => {
    const raw = tokens.map((t) => t.value).join("");
    let diffType: CodeLine["diffType"] = "none";

    if (isDiffLang) {
      diffType = classifyDiffLine(raw);
    } else if (diffHighlight) {
      if (raw.startsWith("+ ") || raw.startsWith("+\t") || raw === "+") {
        diffType = "add";
      } else if (raw.startsWith("- ") || raw.startsWith("-\t") || raw === "-") {
        diffType = "delete";
      }
    }

    return {
      diffType,
      tokens,
      raw,
    };
  });

  return codeLines;
};
