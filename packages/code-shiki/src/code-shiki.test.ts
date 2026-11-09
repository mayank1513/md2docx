import { toDocx } from "@m2d/core";
import * as docx from "docx";
import type { Code, Root } from "mdast";
import { createHighlighter } from "shiki";
import { describe, expect, test } from "vitest";
import {
  codeShiki,
  codeShikiPlugin,
  collectCodeLanguages,
  createCodeShiki,
  createCodeShikiPlugin,
  createShikiTokenizer,
  getSharedHighlighter,
  resolveTokenType,
  shikiLinesToTokens,
} from "./index";

describe("@m2d/code-shiki", () => {
  describe("Scope & Token Mapping", () => {
    test("resolveTokenType maps TextMate scopes to md2docx TokenTypes", () => {
      expect(
        resolveTokenType(["source.ts", "comment.line.double-slash.ts"]),
      ).toBe("comment");
      expect(resolveTokenType(["source.ts", "string.quoted.double.ts"])).toBe(
        "string",
      );
      expect(
        resolveTokenType(["source.ts", "constant.numeric.decimal.ts"]),
      ).toBe("number");
      expect(
        resolveTokenType(["source.ts", "constant.language.boolean.true.ts"]),
      ).toBe("boolean");
      expect(
        resolveTokenType(["source.ts", "keyword.operator.assignment.ts"]),
      ).toBe("operator");
      expect(resolveTokenType(["source.ts", "keyword.control.flow.ts"])).toBe(
        "keyword",
      );
      expect(resolveTokenType(["source.ts", "storage.type.ts"])).toBe(
        "keyword",
      );
      expect(resolveTokenType(["source.ts", "entity.name.function.ts"])).toBe(
        "function",
      );
      expect(resolveTokenType(["source.ts", "support.type.primitive.ts"])).toBe(
        "builtin",
      );
      expect(resolveTokenType(["source.diff", "markup.inserted.diff"])).toBe(
        "diffAdd",
      );
      expect(resolveTokenType(["source.diff", "markup.deleted.diff"])).toBe(
        "diffDelete",
      );
      expect(
        resolveTokenType(["source.diff", "meta.diff.header.from-file"]),
      ).toBe("diffHeader");
      expect(
        resolveTokenType(["source.ts", "variable.other.readwrite.ts"]),
      ).toBe("variable");
      expect(
        resolveTokenType(["source.ts", "punctuation.terminator.statement.ts"]),
      ).toBe("punctuation");
      expect(resolveTokenType(["unknown.scope.here"])).toBeUndefined();
      expect(resolveTokenType([])).toBeUndefined();
      expect(resolveTokenType(undefined)).toBeUndefined();
    });

    test("shikiLinesToTokens converts ThemedToken lines to md2docx tokens", () => {
      const mockLines = [
        [
          {
            content: "const",
            explanation: [
              {
                scopes: [
                  { scopeName: "source.ts" },
                  { scopeName: "storage.type.ts" },
                ],
              },
            ],
          },
          {
            content: " ",
            explanation: [{ scopes: [{ scopeName: "source.ts" }] }],
          },
          {
            content: "x",
            explanation: [
              {
                scopes: [
                  { scopeName: "source.ts" },
                  { scopeName: "variable.other.ts" },
                ],
              },
            ],
          },
        ],
      ];

      const tokens = shikiLinesToTokens(mockLines);
      expect(tokens.length).toBe(1);
      expect(tokens[0]?.[0]?.type).toBe("keyword");
      expect(tokens[0]?.[0]?.value).toBe("const");
      expect(tokens[0]?.[2]?.type).toBe("variable");
      expect(tokens[0]?.[2]?.value).toBe("x");
    });

    test("collectCodeLanguages extracts unique languages from MDAST tree", () => {
      const ast = {
        type: "root",
        children: [
          { type: "code", lang: "typescript", value: "const a = 1;" },
          { type: "paragraph", children: [{ type: "text", value: "hello" }] },
          { type: "code", lang: "Python", value: "print(1)" },
          { type: "code", lang: "  TYPESCRIPT  ", value: "const b = 2;" },
          { type: "code", value: "plain" },
        ],
      };

      const langs = collectCodeLanguages(ast);
      expect(langs).toContain("typescript");
      expect(langs).toContain("python");
      expect(langs.length).toBe(2);
    });
  });

  describe("Shiki Tokenizer", () => {
    test("tokenizes TypeScript code into lines", async () => {
      const highlighter = await createHighlighter({
        themes: ["github-light"],
        langs: ["typescript"],
      });

      const tokenizer = createShikiTokenizer(highlighter, "github-light");
      const code = `import { foo } from "bar";\nconst val: number = 100;`;
      const lines = tokenizer(code, "typescript");

      expect(lines.length).toBe(2);
      expect(lines[0]?.find((t) => t.value === "import")?.type).toBe("keyword");
      expect(lines[0]?.find((t) => t.type === "string")).toBeDefined();
      expect(lines[1]?.find((t) => t.value === "const")?.type).toBe("keyword");
      expect(lines[1]?.find((t) => t.value === "100")?.type).toBe("number");
    });

    test("tokenizes Python code with functions and numbers", async () => {
      const highlighter = await createHighlighter({
        themes: ["github-light"],
        langs: ["python"],
      });

      const tokenizer = createShikiTokenizer(highlighter, "github-light");
      const code = `def calculate(n):\n    return n * 2`;
      const lines = tokenizer(code, "python");

      expect(lines.length).toBe(2);
      expect(lines[0]?.find((t) => t.value === "def")?.type).toBe("keyword");
      expect(lines[1]?.find((t) => t.value === "return")?.type).toBe("keyword");
    });

    test("falls back gracefully for unknown languages", async () => {
      const highlighter = await createHighlighter({
        themes: ["github-light"],
        langs: ["javascript"],
      });

      const tokenizer = createShikiTokenizer(highlighter, "github-light");
      const code = `echo "unknown language"`;
      const lines = tokenizer(code, "unknown-custom-lang");

      expect(lines.length).toBe(1);
      expect(lines[0]?.[0]?.value).toBe(`echo "unknown language"`);
      expect(lines[0]?.[0]?.type).toBe("text");
    });
  });

  describe("Plugin Factory & OpenXML Generation", () => {
    test("codeShikiPlugin aliases to codeShiki", () => {
      expect(codeShikiPlugin).toBe(codeShiki);
      expect(createCodeShikiPlugin).toBe(createCodeShiki);
    });

    test("intercepts code block node and renders table with Shiki tokens", async () => {
      const plugin = await createCodeShiki({
        lineNumbers: true,
        theme: "monokai",
        langs: ["javascript"],
      });

      const codeNode: Code = {
        type: "code",
        lang: "js",
        value: "const greeting = 'Hello Shiki!';",
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
    test("generates DOCX binary with pre-configured createCodeShiki", async () => {
      const plugin = await createCodeShiki({
        theme: "executive-print",
        lineNumbers: true,
        langs: ["javascript", "python"],
      });

      const ast: Root = {
        type: "root",
        children: [
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "Shiki Highlighting Test" }],
          },
          {
            type: "code",
            lang: "javascript",
            meta: "showLineNumbers",
            value: `function hello() {\n  console.log("Hello from Shiki!");\n  return true;\n}`,
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
          plugins: [plugin],
        },
        "uint8array",
      );

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect((buffer as Uint8Array).byteLength).toBeGreaterThan(1000);
    });

    test("generates DOCX binary with auto-warming codeShikiPlugin through preprocess", async () => {
      const ast: Root = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "javascript",
            value: `const message = "Automated warmup via preprocess";`,
          },
        ],
      };

      const buffer = await toDocx(
        ast,
        {},
        {
          plugins: [codeShikiPlugin({ theme: "github-dark" })],
        },
        "uint8array",
      );

      expect(buffer).toBeInstanceOf(Uint8Array);
      expect((buffer as Uint8Array).byteLength).toBeGreaterThan(1000);
    });

    test("dynamically loads additional languages via getSharedHighlighter when already initialized", async () => {
      const h1 = await getSharedHighlighter();
      expect(h1).toBeDefined();

      const h2 = await getSharedHighlighter(["rust", "ruby"]);
      expect(h2.getLoadedLanguages()).toContain("rust");
      expect(h2.getLoadedLanguages()).toContain("ruby");
      expect(h1).toBe(h2);
    });

    test("dynamically loads missing AST languages when user passes custom highlighter", async () => {
      const customHighlighter = await createHighlighter({
        themes: ["github-light"],
        langs: ["javascript"],
      });

      const plugin = codeShikiPlugin({
        highlighter: customHighlighter,
        theme: "github-light",
      });

      const ast: Root = {
        type: "root",
        children: [
          {
            type: "code",
            lang: "json",
            value: `{"loaded": true}`,
          },
        ],
      };

      await plugin.preprocess?.(
        ast,
        {},
        {} as unknown as Parameters<NonNullable<typeof plugin.preprocess>>[2],
      );
      expect(customHighlighter.getLoadedLanguages()).toContain("json");
    });

    test("handles inline code interception with Shiki", () => {
      const plugin = codeShikiPlugin({ theme: "github-light" });
      const inlineNode = {
        type: "inlineCode",
        value: "const x = 1;",
      };

      const runs = plugin.inline?.(
        docx,
        inlineNode as unknown as Parameters<
          NonNullable<typeof plugin.inline>
        >[1],
        {},
        {},
        {},
        () => [],
      );

      expect(runs).toBeDefined();
    });
  });
});
