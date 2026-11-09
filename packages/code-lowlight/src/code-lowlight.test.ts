import { toDocx } from "@m2d/core";
import * as docx from "docx";
import type { Code, Root } from "mdast";
import { describe, expect, test } from "vitest";
import {
  codeLowlight,
  codeLowlightPlugin,
  createLowlightTokenizer,
  defaultLowlight,
  hastToTokens,
  resolveTokenType,
} from "./index";

describe("@m2d/code-lowlight", () => {
  describe("Class & HAST Mapping", () => {
    test("resolveTokenType maps highlight.js classes to md2docx TokenTypes", () => {
      expect(resolveTokenType(["hljs-keyword"])).toBe("keyword");
      expect(resolveTokenType(["hljs-built_in"])).toBe("builtin");
      expect(resolveTokenType(["hljs-number"])).toBe("number");
      expect(resolveTokenType(["hljs-string"])).toBe("string");
      expect(resolveTokenType(["hljs-comment"])).toBe("comment");
      expect(resolveTokenType(["hljs-title", "hljs-function"])).toBe(
        "function",
      );
      expect(resolveTokenType(["hljs-variable"])).toBe("variable");
      expect(resolveTokenType(["hljs-operator"])).toBe("operator");
      expect(resolveTokenType(["hljs-punctuation"])).toBe("punctuation");
      expect(resolveTokenType(["hljs-addition"])).toBe("diffAdd");
      expect(resolveTokenType(["hljs-deletion"])).toBe("diffDelete");
      expect(resolveTokenType(["unknown-class"])).toBeUndefined();
      expect(resolveTokenType(undefined)).toBeUndefined();
    });

    test("hastToTokens recursively extracts tokens preserving text and structure", () => {
      const hast = defaultLowlight.highlight("js", "const answer = 42;");
      const tokens = hastToTokens(hast);
      expect(tokens.length).toBeGreaterThan(0);
      expect(tokens.find((t) => t.value === "const")?.type).toBe("keyword");
      expect(tokens.find((t) => t.value === "42")?.type).toBe("number");
    });
  });

  describe("Lowlight Tokenizer", () => {
    test("tokenizes TypeScript code into lines", () => {
      const tokenizer = createLowlightTokenizer();
      const code = `import { foo } from "bar";\nconst val: number = 100;`;
      const lines = tokenizer(code, "typescript");

      expect(lines.length).toBe(2);
      expect(lines[0]?.find((t) => t.value === "import")?.type).toBe("keyword");
      expect(lines[0]?.find((t) => t.type === "string")).toBeDefined();
      expect(lines[1]?.find((t) => t.value === "const")?.type).toBe("keyword");
      expect(lines[1]?.find((t) => t.value === "100")?.type).toBe("number");
    });

    test("tokenizes Python code with functions and docstrings", () => {
      const tokenizer = createLowlightTokenizer();
      const code = `def calculate(n):\n    """Compute something"""\n    return n * 2`;
      const lines = tokenizer(code, "python");

      expect(lines.length).toBe(3);
      expect(lines[0]?.find((t) => t.value === "def")?.type).toBe("keyword");
      expect(lines[1]?.find((t) => t.type === "string")).toBeDefined();
      expect(lines[2]?.find((t) => t.value === "return")?.type).toBe("keyword");
    });

    test("falls back gracefully for unknown languages using highlightAuto", () => {
      const tokenizer = createLowlightTokenizer(defaultLowlight, true);
      const code = `echo "Hello shell"`;
      const lines = tokenizer(code, "unknown-custom-lang");

      expect(lines.length).toBe(1);
      expect(lines[0]?.length).toBeGreaterThan(0);
    });

    test("falls back to plain text when language is unknown and highlightAuto is false", () => {
      const tokenizer = createLowlightTokenizer(defaultLowlight, false);
      const code = `some arbitrary text\nline 2`;
      const lines = tokenizer(code, "unknown-lang");

      expect(lines.length).toBe(2);
      expect(lines[0]?.[0]?.value).toBe("some arbitrary text");
      expect(lines[0]?.[0]?.type).toBe("text");
    });
  });

  describe("Plugin Block Intercept & OpenXML Generation", () => {
    test("codeLowlightPlugin instantiates and is aliased to codeLowlight", () => {
      expect(codeLowlightPlugin).toBe(codeLowlight);
      const plugin = codeLowlightPlugin({ theme: "github-dark" });
      expect(plugin.block).toBeDefined();
    });

    test("intercepts code block node and renders table with lowlight tokens", () => {
      const plugin = codeLowlightPlugin({
        lineNumbers: true,
        theme: "monokai",
      });
      const codeNode: Code = {
        type: "code",
        lang: "js",
        value: "const greeting = 'Hello World!';",
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
  });

  describe("Integration with toDocx", () => {
    test("generates DOCX binary with @m2d/code-lowlight", async () => {
      const ast: Root = {
        type: "root",
        children: [
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "Lowlight Highlighting Test" }],
          },
          {
            type: "code",
            lang: "javascript",
            meta: "showLineNumbers",
            value: `function hello() {\n  console.log("Hello from lowlight!");\n  return true;\n}`,
          },
          {
            type: "code",
            lang: "python",
            value: `def greet(name: str) -> None:\n    print(f"Welcome, {name}!")`,
          },
        ],
      };

      const buffer = await toDocx(
        ast,
        {},
        {
          plugins: [
            codeLowlightPlugin({ theme: "executive-print", lineNumbers: true }),
          ],
        },
        "uint8array",
      );

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect((buffer as Uint8Array).byteLength).toBeGreaterThan(1000);
    });
  });
});
