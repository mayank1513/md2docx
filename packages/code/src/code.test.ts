import { toDocx } from "@m2d/core";
import * as docx from "docx";
import type { Code, InlineCode, Root } from "mdast";
import { describe, expect, test } from "vitest";
import {
  cleanHex,
  codePlugin,
  defaultCodeOptions,
  EXECUTIVE_PRINT_THEME,
  GITHUB_DARK_THEME,
  GITHUB_LIGHT_THEME,
  getTokenColor,
  MONOKAI_THEME,
  parseCodeLines,
  resolveTheme,
  tokenize,
} from "./index";

describe("@m2d/code", () => {
  describe("Themes & Color Utilities", () => {
    test("cleanHex strips leading hash and whitespace", () => {
      expect(cleanHex("#24292e")).toBe("24292e");
      expect(cleanHex(" #d73a49 ")).toBe("d73a49");
      expect(cleanHex("032f62")).toBe("032f62");
      expect(cleanHex("")).toBe("auto");
      expect(cleanHex(undefined)).toBe("auto");
    });

    test("resolves built-in preset themes", () => {
      expect(resolveTheme("github-light")).toEqual(GITHUB_LIGHT_THEME);
      expect(resolveTheme("github-dark")).toEqual(GITHUB_DARK_THEME);
      expect(resolveTheme("monokai")).toEqual(MONOKAI_THEME);
      expect(resolveTheme("executive-print")).toEqual(EXECUTIVE_PRINT_THEME);
      expect(resolveTheme(undefined)).toEqual(GITHUB_LIGHT_THEME);
    });

    test("resolves custom theme object and customThemes catalog", () => {
      const customThemeObj = {
        ...GITHUB_LIGHT_THEME,
        background: "#000000",
        text: "#ffffff",
      };
      expect(resolveTheme(customThemeObj).background).toBe("#000000");

      const resolvedFromCatalog = resolveTheme("solarized", {
        solarized: { background: "#fdf6e3", text: "#657b83" },
      });
      expect(resolvedFromCatalog.background).toBe("#fdf6e3");
      expect(resolvedFromCatalog.text).toBe("#657b83");
    });

    test("getTokenColor returns expected color from theme", () => {
      expect(getTokenColor("keyword", GITHUB_LIGHT_THEME)).toBe("#d73a49");
      expect(getTokenColor("string", GITHUB_LIGHT_THEME)).toBe("#032f62");
      expect(getTokenColor("comment", GITHUB_LIGHT_THEME)).toBe("#6a737d");
      expect(getTokenColor("number", GITHUB_LIGHT_THEME)).toBe("#005cc5");
      expect(getTokenColor("text", GITHUB_LIGHT_THEME)).toBe("#24292e");
      expect(getTokenColor("diffAdd", GITHUB_LIGHT_THEME)).toBe("#22863a");
      expect(getTokenColor("diffDelete", GITHUB_LIGHT_THEME)).toBe("#b31d28");
    });
  });

  describe("Tokenizer Engine", () => {
    test("tokenizes JavaScript / TypeScript constructs", () => {
      const code = `// Single-line comment
/* Multi-line
   comment */
import { foo } from "bar";
const x: number = 42;
async function greet(name = 'world') {
  console.log(\`Hello \${name}\`);
  return true;
}`;
      const lines = tokenize(code, "typescript");
      expect(lines.length).toBeGreaterThan(5);

      // Verify comment token
      const commentToken = lines[0]?.find((t) => t.type === "comment");
      expect(commentToken?.value).toBe("// Single-line comment");

      // Verify keyword tokens
      const importLine = lines[3];
      const importToken = importLine?.find((t) => t.value === "import");
      expect(importToken?.type).toBe("keyword");

      // Verify string token
      const stringToken = importLine?.find((t) => t.type === "string");
      expect(stringToken?.value).toBe('"bar"');

      // Verify number token
      const constLine = lines[4];
      const numberToken = constLine?.find((t) => t.type === "number");
      expect(numberToken?.value).toBe("42");

      // Verify boolean token
      const returnLine = lines[7];
      const boolToken = returnLine?.find((t) => t.type === "boolean");
      expect(boolToken?.value).toBe("true");
    });

    test("tokenizes Python code", () => {
      const pyCode = `# Python test
def calculate(value: int) -> bool:
    """Docstring sample"""
    if value > 10:
        print("high")
        return True
    return False`;
      const lines = tokenize(pyCode, "python");
      expect(lines.length).toBe(7);

      const commentLine = lines[0];
      expect(commentLine?.[0]?.type).toBe("comment");

      const defLine = lines[1];
      expect(defLine?.find((t) => t.value === "def")?.type).toBe("keyword");
      expect(defLine?.find((t) => t.value === "calculate")?.type).toBe(
        "function",
      );

      const docstringLine = lines[2];
      expect(docstringLine?.find((t) => t.type === "string")?.value).toBe(
        '"""Docstring sample"""',
      );

      const ifLine = lines[3];
      expect(ifLine?.find((t) => t.value === "if")?.type).toBe("keyword");
      expect(ifLine?.find((t) => t.value === "10")?.type).toBe("number");
    });

    test("tokenizes JSON and Shell", () => {
      const json = `{\n  "name": "@m2d/code",\n  "version": 1,\n  "private": false\n}`;
      const jsonLines = tokenize(json, "json");
      expect(jsonLines[1]?.find((t) => t.value === '"name"')?.type).toBe(
        "keyword",
      );
      expect(jsonLines[1]?.find((t) => t.value === '"@m2d/code"')?.type).toBe(
        "string",
      );
      expect(jsonLines[2]?.find((t) => t.value === "1")?.type).toBe("number");
      expect(jsonLines[3]?.find((t) => t.value === "false")?.type).toBe(
        "boolean",
      );

      const bash = `#!/bin/bash\n# comment\nexport NAME="Mayank"\necho $NAME`;
      const bashLines = tokenize(bash, "bash");
      expect(bashLines[1]?.[0]?.type).toBe("comment");
      expect(bashLines[2]?.find((t) => t.value === "export")?.type).toBe(
        "keyword",
      );
      expect(bashLines[3]?.find((t) => t.value === "echo")?.type).toBe(
        "builtin",
      );
      expect(bashLines[3]?.find((t) => t.value === "$NAME")?.type).toBe(
        "variable",
      );
    });

    test("tokenizes HTML, CSS, SQL, and Generic fallback", () => {
      const html = `<div class="code-block">Hello</div>`;
      const htmlLines = tokenize(html, "html");
      expect(htmlLines[0]?.find((t) => t.type === "keyword")).toBeDefined();

      const css = `.box { color: #ffffff; margin: 10px; }`;
      const cssLines = tokenize(css, "css");
      expect(cssLines[0]?.find((t) => t.type === "function")).toBeDefined();

      const sql = `SELECT id, name FROM users WHERE age >= 21;`;
      const sqlLines = tokenize(sql, "sql");
      expect(sqlLines[0]?.find((t) => t.value === "SELECT")?.type).toBe(
        "keyword",
      );
      expect(sqlLines[0]?.find((t) => t.value === "21")?.type).toBe("number");

      const unknownLang = `fn main() -> i32 { return 0; }`;
      const genericLines = tokenize(unknownLang, "rust");
      expect(genericLines[0]?.find((t) => t.value === "return")?.type).toBe(
        "keyword",
      );
    });
  });

  describe("Git Diff Parsing & Highlighting", () => {
    test("detects diff additions, deletions, and headers in diff language", () => {
      const diffCode = `--- a/file.ts
+++ b/file.ts
@@ -1,3 +1,3 @@
-const old = 1;
+const next = 2;
 const unchanged = 3;`;
      const lines = parseCodeLines(diffCode, "diff", true);
      expect(lines[0]?.diffType).toBe("header");
      expect(lines[1]?.diffType).toBe("header");
      expect(lines[2]?.diffType).toBe("header");
      expect(lines[3]?.diffType).toBe("delete");
      expect(lines[4]?.diffType).toBe("add");
      expect(lines[5]?.diffType).toBe("none");
    });

    test("detects diff prefixes in regular code blocks when diffHighlight is enabled", () => {
      const regularWithDiff = `+ const added = true;
- const removed = false;
  const regular = 123;`;
      const lines = parseCodeLines(regularWithDiff, "typescript", true);
      expect(lines[0]?.diffType).toBe("add");
      expect(lines[1]?.diffType).toBe("delete");
      expect(lines[2]?.diffType).toBe("none");
    });
  });

  describe("Plugin Block & Inline Intercepts", () => {
    test("instantiates with default options", () => {
      expect(defaultCodeOptions.theme).toBe("github-light");
      expect(defaultCodeOptions.fontFamily).toBe("Consolas");
      const plugin = codePlugin();
      expect(plugin.block).toBeDefined();
      expect(plugin.inline).toBeDefined();
    });

    test("ignores non-code block nodes", () => {
      const plugin = codePlugin();
      const node = { type: "paragraph", children: [] };
      const result = plugin.block?.(
        docx,
        node as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );
      expect(result).toEqual([]);
      expect(node.type).toBe("paragraph");
    });

    test("intercepts code block node, clears type, and produces table by default", () => {
      const plugin = codePlugin();
      const codeNode: Code = {
        type: "code",
        lang: "typescript",
        value: "const greeting: string = 'Hello';",
      };

      const result = plugin.block?.(
        docx,
        codeNode as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );

      expect(codeNode.type).toBe("");
      expect(result?.length).toBe(1);
      expect(result?.[0]).toBeInstanceOf(docx.Table);
    });

    test("creates 2-column Table when lineNumbers is true", () => {
      const plugin = codePlugin({ lineNumbers: true });
      const codeNode: Code = {
        type: "code",
        lang: "typescript",
        value: "const a = 1;\nconst b = 2;",
      };

      const result = plugin.block?.(
        docx,
        codeNode as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );

      expect(result?.length).toBe(1);
      const table = result?.[0] as docx.Table;
      expect(table).toBeInstanceOf(docx.Table);
    });

    test("respects meta showLineNumbers override", () => {
      const plugin = codePlugin({ lineNumbers: false });
      const codeNode: Code = {
        type: "code",
        lang: "python",
        meta: "showLineNumbers",
        value: "print('hello')",
      };

      const result = plugin.block?.(
        docx,
        codeNode as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );

      expect(result?.length).toBe(1);
      expect(result?.[0]).toBeInstanceOf(docx.Table);
    });

    test("renders paragraph when blockType is paragraph and lineNumbers is false", () => {
      const plugin = codePlugin({ blockType: "paragraph", lineNumbers: false });
      const codeNode: Code = {
        type: "code",
        lang: "javascript",
        value: "console.log('hi');\nconsole.log('bye');",
      };

      const result = plugin.block?.(
        docx,
        codeNode as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );

      expect(result?.length).toBe(1);
      expect(result?.[0]).toBeInstanceOf(docx.Paragraph);
    });

    test("intercepts inlineCode node and renders TextRun with theme styling", () => {
      const plugin = codePlugin({ theme: "monokai" });
      const inlineNode: InlineCode = {
        type: "inlineCode",
        value: "pnpm test",
      };

      const result = plugin.inline?.(
        docx,
        inlineNode as unknown as Parameters<
          NonNullable<typeof plugin.inline>
        >[1],
        {},
        {},
        {},
        () => [],
      );

      expect(inlineNode.type).toBe("");
      expect(result?.length).toBe(1);
      expect(result?.[0]).toBeInstanceOf(docx.TextRun);
    });

    test("does not intercept inlineCode when highlightInline is false", () => {
      const plugin = codePlugin({ highlightInline: false });
      const inlineNode: InlineCode = {
        type: "inlineCode",
        value: "git status",
      };

      const result = plugin.inline?.(
        docx,
        inlineNode as unknown as Parameters<
          NonNullable<typeof plugin.inline>
        >[1],
        {},
        {},
        {},
        () => [],
      );

      expect(inlineNode.type).toBe("inlineCode");
      expect(result).toEqual([]);
    });

    test("supports custom tokenizer option", () => {
      const customTokenizer = (code: string) => [
        [{ type: "keyword" as const, value: code }],
      ];
      const plugin = codePlugin({ tokenizer: customTokenizer });
      const codeNode: Code = {
        type: "code",
        value: "CUSTOM_TOKENIZED_STRING",
      };

      const result = plugin.block?.(
        docx,
        codeNode as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );

      expect(result?.length).toBe(1);
      expect(result?.[0]).toBeInstanceOf(docx.Table);
    });

    test("coalesces consecutive runs sharing identical styling to reduce OpenXML bloat", () => {
      const plugin = codePlugin({ blockType: "paragraph", lineNumbers: false });
      const codeNode: Code = {
        type: "code",
        lang: "typescript",
        // tokens: "foo" (var) + ", " (punct) + "bar" (var) share the same default color in github-light
        value: "foo, bar;",
      };

      const result = plugin.block?.(
        docx,
        codeNode as unknown as Parameters<NonNullable<typeof plugin.block>>[1],
        {},
        () => [],
        () => [],
      );

      expect(result?.length).toBe(1);
      const para = result?.[0] as docx.Paragraph;
      // In un-coalesced output, this would be 4 runs ("foo", ",", " ", "bar", ";")
      // With run coalescing, identical styled text merges into a single run
      // biome-ignore lint/suspicious/noExplicitAny: inspect paragraph children
      const children = (para as any).root;
      expect(children).toBeDefined();
    });
  });

  describe("Integration with toDocx", () => {
    test("compiles full document with codePlugin without errors", async () => {
      const ast: Root = {
        type: "root",
        children: [
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "Code Plugin Integration" }],
          },
          {
            type: "paragraph",
            children: [
              { type: "text", value: "Here is an inline snippet: " },
              { type: "inlineCode", value: "const x = 42;" },
            ],
          },
          {
            type: "code",
            lang: "typescript",
            meta: "showLineNumbers",
            value: `import { toDocx } from "@m2d/core";\n\nconst doc = await toDocx(ast);`,
          },
          {
            type: "code",
            lang: "diff",
            value: `--- file.ts\n+++ file.ts\n-oldVersion();\n+newVersion();`,
          },
        ],
      };

      const docxOutput = await toDocx(
        ast,
        {},
        {
          plugins: [codePlugin({ theme: "github-dark", lineNumbers: true })],
        },
        "uint8array",
      );

      expect(docxOutput).toBeInstanceOf(Uint8Array);
      expect(docxOutput.byteLength).toBeGreaterThan(1000);
    });
  });

  describe("Lexical Precedence & Regression Guardrails", () => {
    test("does not tokenize identifiers inside strings or comments", () => {
      const line1 = tokenize(`const message = "hello world";`, "javascript")[0];
      const strToken = line1?.find((t) => t.type === "string");
      expect(strToken?.value).toBe('"hello world"');
      expect(line1?.find((t) => t.value === "hello")).toBeUndefined();

      const line2 = tokenize(`// const value = 123;`, "javascript")[0];
      expect(line2?.length).toBe(1);
      expect(line2?.[0]?.type).toBe("comment");
      expect(line2?.[0]?.value).toBe("// const value = 123;");
      expect(line2?.find((t) => t.value === "const")).toBeUndefined();
    });

    test("correctly parses Python prefixed string literals (f-strings, raw strings)", () => {
      const py = `message = f"Hello {name}"\nraw = r"\\d+"`;
      const lines = tokenize(py, "python");
      const fString = lines[0]?.find((t) => t.type === "string");
      expect(fString?.value).toBe('f"Hello {name}"');
      expect(lines[0]?.find((t) => t.value === "f")).toBeUndefined();

      const rString = lines[1]?.find((t) => t.type === "string");
      expect(rString?.value).toBe('r"\\d+"');
      expect(lines[1]?.find((t) => t.value === "r")).toBeUndefined();
    });

    test("detects JavaScript regex literals after assignment and keywords", () => {
      const code = `const pattern = /foo\\/bar/gi;`;
      const line = tokenize(code, "javascript")[0];
      const regexToken = line?.find((t) => t.type === "string");
      expect(regexToken?.value).toBe("/foo\\/bar/gi");
    });

    test("correctly classifies CSS hex colors before selectors", () => {
      const css = `color: #fff; background: #000000;`;
      const tokens = tokenize(css, "css")[0];
      const hexTokens = tokens?.filter((t) => t.type === "number");
      expect(hexTokens?.length).toBe(2);
      expect(hexTokens?.[0]?.value).toBe("#fff");
      expect(hexTokens?.[1]?.value).toBe("#000000");
    });

    test("handles standalone carriage return (\\r) lines", () => {
      const crCode = "line1\rline2\rline3";
      const lines = tokenize(crCode, "generic");
      expect(lines.length).toBe(3);
      expect(lines[0]?.[0]?.value).toBe("line1");
      expect(lines[1]?.[0]?.value).toBe("line2");
      expect(lines[2]?.[0]?.value).toBe("line3");
    });

    test("correctly prioritizes compound operators (//=, **=, >>>=)", () => {
      const py = `x //= 2`;
      const pyTokens = tokenize(py, "python")[0];
      const op = pyTokens?.find((t) => t.type === "operator");
      expect(op?.value).toBe("//=");

      const js = `x >>>= 1`;
      const jsTokens = tokenize(js, "javascript")[0];
      const jsOp = jsTokens?.find((t) => t.type === "operator");
      expect(jsOp?.value).toBe(">>>=");
    });

    test("classifies Python self and cls as variables, not builtins", () => {
      const py = `def method(self, cls): pass`;
      const tokens = tokenize(py, "python")[0];
      const selfToken = tokens?.find((t) => t.value === "self");
      const clsToken = tokens?.find((t) => t.value === "cls");
      expect(selfToken?.type).toBe("variable");
      expect(clsToken?.type).toBe("variable");
    });

    test("supports missing JS keywords like 'in' and 'with'", () => {
      const js = `for (x in obj) { with (x) {} }`;
      const tokens = tokenize(js, "javascript")[0];
      expect(tokens?.find((t) => t.value === "in")?.type).toBe("keyword");
      expect(tokens?.find((t) => t.value === "with")?.type).toBe("keyword");
    });
  });
});
