import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import type * as latex from "@unified-latex/unified-latex-types";
import * as docx from "docx";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it } from "vitest";
import {
  hasUnparsedScript,
  mathPlugin,
  parseLatex,
  printRawNode,
  printRawNodes,
  resolveScriptArg,
} from "../src/math";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

describe("toDocx", () => {
  it("should handle maths", async ({ expect }) => {
    const mdast = unified().use(remarkParse).use(remarkMath).parse(markdown);

    const docxBlob = await toDocx(mdast, {}, { plugins: [mathPlugin()] });

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("handles runaway block math with markdown block markers safely", async ({
    expect,
  }) => {
    const md = `
$$
x = 1
# Heading Swallowed
Some text
$$
`;
    const mdast = unified().use(remarkParse).use(remarkMath).parse(md);

    // Should not throw or crash
    const docxBlob = await toDocx(mdast, {}, { plugins: [mathPlugin()] });
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("handles runaway inline math exceeding maxInlineLength", async ({
    expect,
  }) => {
    const runawayText = "a".repeat(150);
    const md = `Equation: $${runawayText}$`;
    const mdast = unified().use(remarkParse).use(remarkMath).parse(md);

    const docxBlob = await toDocx(
      mdast,
      {},
      {
        plugins: [mathPlugin({ maxInlineLength: 100 })],
      },
    );
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("renders raw formula when errorMode is 'raw'", async ({ expect }) => {
    const md = `
$$
\\broken{macro
$$
`;
    const mdast = unified().use(remarkParse).use(remarkMath).parse(md);

    const docxBlob = await toDocx(
      mdast,
      {},
      {
        plugins: [mathPlugin({ errorMode: "raw" })],
      },
    );
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("throws error when errorMode is 'throw' and syntax is broken", async ({
    expect,
  }) => {
    const md = `
$$
x = 1
# Swallowed
$$
`;
    const mdast = unified().use(remarkParse).use(remarkMath).parse(md);

    await expect(
      toDocx(
        mdast,
        {},
        {
          plugins: [mathPlugin({ errorMode: "throw" })],
        },
      ),
    ).rejects.toThrow();
  });

  it("resolves nested superscripts and subscripts inside braces (issue #21)", async ({
    expect,
  }) => {
    // Test e^{-x^2}
    const expResult = parseLatex(docx, "e^{-x^2}");
    expect(expResult[0][0]).toBeInstanceOf(docx.MathSuperScript);
    const expSup = (expResult[0][0] as { sup?: docx.MathRun[] }).sup;
    expect(expSup).toHaveLength(2);
    expect(expSup?.[0]).toBeInstanceOf(docx.MathRun);
    expect(expSup?.[1]).toBeInstanceOf(docx.MathSuperScript);

    // Test a^{b^2}
    const supResult = parseLatex(docx, "a^{b^2}");
    expect(supResult[0][0]).toBeInstanceOf(docx.MathSuperScript);
    const supInner = (supResult[0][0] as { sup?: docx.MathRun[] }).sup;
    expect(supInner?.[0]).toBeInstanceOf(docx.MathSuperScript);

    // Test x_{i_j}
    const subResult = parseLatex(docx, "x_{i_j}");
    expect(subResult[0][0]).toBeInstanceOf(docx.MathSubScript);
    const subInner = (subResult[0][0] as { sub?: docx.MathRun[] }).sub;
    expect(subInner?.[0]).toBeInstanceOf(docx.MathSubScript);

    // End-to-end toDocx conversion
    const md = "A: $e^{-x^2}$\n\nB: $a^{b^2}$\n\nC: $x_{i_j}$\n";
    const mdast = unified().use(remarkParse).use(remarkMath).parse(md);
    const docxBlob = await toDocx(mdast, {}, { plugins: [mathPlugin()] });
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("handles simultaneous nested sub-superscripts (x_{i_j}^{a^b})", ({
    expect,
  }) => {
    const result = parseLatex(docx, "x_{i_j}^{a^b}");
    expect(result[0][0]).toBeInstanceOf(docx.MathSubSuperScript);
    const json = JSON.stringify(result[0][0]);
    // Verifies that nested m:sSub and m:sSup were generated inside sub and sup
    expect(json).toContain('"m:sSub"');
    expect(json).toContain('"m:sSup"');
  });

  it("handles summation with nested script expressions", ({ expect }) => {
    const result = parseLatex(docx, "\\sum_{i=1}^{n^2}");
    expect(result[0][0]).toBeInstanceOf(docx.MathSum);
    const sumNode = result[0][0] as {
      sub?: docx.MathRun[];
      sup?: docx.MathRun[];
    };
    expect(sumNode.sup?.[0]).toBeInstanceOf(docx.MathSuperScript);
  });

  it("handles fractions and radicals containing nested scripts", ({
    expect,
  }) => {
    const fracResult = parseLatex(docx, "\\frac{e^{-x^2}}{\\sqrt{y^3}}");
    expect(fracResult[0][0]).toBeInstanceOf(docx.MathFraction);

    const radResult = parseLatex(docx, "\\sqrt[3]{a^{b^2}}");
    expect(radResult[0][0]).toBeInstanceOf(docx.MathRadical);
  });

  it("handles formatting macros: text, textcolor, accents, and mathbf", ({
    expect,
  }) => {
    const textRes = parseLatex(docx, "\\text{regular} + \\mathbf{bold}");
    expect(textRes[0].length).toBeGreaterThan(0);

    const colorRes = parseLatex(docx, "\\textcolor{red}{x}");
    expect(colorRes[0].length).toBeGreaterThan(0);

    const accentRes = parseLatex(docx, "\\hat{x} + \\widehat{y}");
    expect(accentRes[0].length).toBeGreaterThan(0);
  });

  it("handles line breaks in math expressions", ({ expect }) => {
    const result = parseLatex(docx, "a = 1 \\\\ b = 2 \\newline c = 3");
    expect(result.length).toBe(3);
  });

  it("handles inline math errors under 'warn' and 'raw' modes", async ({
    expect,
  }) => {
    const runawayInline = `Equation: $${"x".repeat(120)}$`;
    const mdastWarn = unified()
      .use(remarkParse)
      .use(remarkMath)
      .parse(runawayInline);
    const blobWarn = await toDocx(
      mdastWarn,
      {},
      { plugins: [mathPlugin({ maxInlineLength: 50, errorMode: "warn" })] },
    );
    expect(blobWarn).toBeInstanceOf(Blob);

    const mdastRaw = unified()
      .use(remarkParse)
      .use(remarkMath)
      .parse(runawayInline);
    const blobRaw = await toDocx(
      mdastRaw,
      {},
      { plugins: [mathPlugin({ maxInlineLength: 50, errorMode: "raw" })] },
    );
    expect(blobRaw).toBeInstanceOf(Blob);

    // Block math error under warn mode
    const badBlockMd = "$$\nx = 1\n# Markdown marker in equation\n$$";
    const mdastBadBlock = unified()
      .use(remarkParse)
      .use(remarkMath)
      .parse(badBlockMd);
    const blobBadBlock = await toDocx(
      mdastBadBlock,
      {},
      { plugins: [mathPlugin({ errorMode: "warn" })] },
    );
    expect(blobBadBlock).toBeInstanceOf(Blob);
  });

  it("ignores non-math nodes in plugin hooks", ({ expect }) => {
    const plugin = mathPlugin();
    const fakeTextNode = { type: "text", value: "hello" } as unknown as {
      type: "" | "math" | "inlineMath";
      value?: string;
    };
    expect(plugin.inline?.(docx, fakeTextNode, {}, {}, {}, () => [])).toEqual(
      [],
    );
    expect(
      plugin.block?.(
        docx,
        fakeTextNode,
        {},
        () => [],
        () => [],
      ),
    ).toEqual([]);
  });

  describe("printRawNode & AST re-serialization", () => {
    it("serializes all AST node types correctly", ({ expect }) => {
      expect(printRawNode(null)).toBe("");
      expect(printRawNode(undefined)).toBe("");
      expect(printRawNode({ type: "whitespace" })).toBe(" ");
      expect(
        printRawNode({
          type: "group",
          content: [{ type: "string", content: "x" }],
        }),
      ).toBe("{x}");
      expect(
        printRawNode({
          type: "argument",
          openMark: "[",
          closeMark: "]",
          content: [{ type: "string", content: "arg" }],
        }),
      ).toBe("[arg]");
      expect(
        printRawNode({
          type: "argument",
          openMark: "",
          closeMark: "",
          content: [],
        }),
      ).toBe("");
      expect(printRawNode({ type: "macro", content: "alpha" })).toBe("\\alpha");
      expect(
        printRawNode({
          type: "macro",
          content: "^",
          escapeToken: "",
          args: [
            {
              type: "argument",
              openMark: "{",
              closeMark: "}",
              content: [{ type: "string", content: "2" }],
            },
          ],
        }),
      ).toBe("^{2}");
      expect(
        printRawNode({
          type: "inlinemath",
          content: [{ type: "string", content: "a" }],
        }),
      ).toBe("$a$");
      expect(
        printRawNode({
          type: "displaymath",
          content: [{ type: "string", content: "b" }],
        }),
      ).toBe("\\[b\\]");
      expect(
        printRawNode({
          type: "environment",
          env: "matrix",
          content: [{ type: "string", content: "1" }],
        }),
      ).toBe("\\begin{matrix}1\\end{matrix}");
      expect(
        printRawNode({
          type: "mathenv",
          env: "align",
          content: [{ type: "string", content: "y" }],
        }),
      ).toBe("\\begin{align}y\\end{align}");
      expect(printRawNode({ type: "comment", content: "a comment" })).toBe(
        "%a comment\n",
      );
      expect(printRawNode({ type: "parbreak" })).toBe("\n\n");
      // Fallback object branches
      expect(
        printRawNode({
          type: "custom",
          content: [{ type: "string", content: "nested" }],
        } as unknown as latex.Node),
      ).toBe("nested");
      expect(
        printRawNode({
          type: "custom",
          content: "literal",
        } as unknown as latex.Node),
      ).toBe("literal");
      expect(printRawNode({ type: "custom" } as unknown as latex.Node)).toBe(
        "",
      );

      // printRawNodes array
      expect(
        printRawNodes([
          { type: "string", content: "a" },
          { type: "string", content: "b" },
        ]),
      ).toBe("ab");
    });
  });

  describe("hasUnparsedScript & resolveScriptArg", () => {
    it("inspects trees and detects unparsed script operators", ({ expect }) => {
      expect(hasUnparsedScript([])).toBe(false);
      expect(hasUnparsedScript([{ type: "string", content: "regular" }])).toBe(
        false,
      );
      expect(
        hasUnparsedScript([
          {
            type: "group",
            content: [{ type: "string", content: "no-script" }],
          },
        ]),
      ).toBe(false);
      expect(
        hasUnparsedScript([
          {
            type: "group",
            content: [{ type: "string", content: "has_sub" }],
          },
        ]),
      ).toBe(true);
      expect(hasUnparsedScript([{ type: "string", content: "x^2" }])).toBe(
        true,
      );
    });

    it("returns original nodes when no scripts exist or when parsing fails", ({
      expect,
    }) => {
      const normalNodes: latex.Node[] = [{ type: "string", content: "abc" }];
      expect(resolveScriptArg(normalNodes)).toBe(normalNodes);

      // Graceful error fallback when parser throws
      const scriptNodes: latex.Node[] = [{ type: "string", content: "x^2" }];
      const failingParser = () => {
        throw new Error("Syntax error");
      };
      expect(resolveScriptArg(scriptNodes, failingParser)).toBe(scriptNodes);
    });
  });

  describe("math AST node mappings", () => {
    it("handles sub-then-super (x_1^2)", ({ expect }) => {
      const result = parseLatex(docx, "x_1^2");
      expect(result[0][0]).toBeInstanceOf(docx.MathSubSuperScript);
    });

    it("handles radicals without degree (\\sqrt{x})", ({ expect }) => {
      const result = parseLatex(docx, "\\sqrt{x}");
      expect(result[0][0]).toBeInstanceOf(docx.MathRadical);
    });

    it("handles left and right delimiters", ({ expect }) => {
      const result = parseLatex(docx, "\\left( x \\right)");
      expect(result[0].length).toBeGreaterThan(0);
    });

    it("handles summation followed by non-macro and macro", ({ expect }) => {
      const resNonMacro = parseLatex(docx, "\\sum x");
      expect(resNonMacro[0][0]).toBeInstanceOf(docx.MathSum);

      const resMacro = parseLatex(docx, "\\sum \\alpha");
      expect(resMacro[0][0]).toBeInstanceOf(docx.MathSum);
    });

    it("throws error for inline math when errorMode is 'throw'", async ({
      expect,
    }) => {
      const runawayInline = `Equation: $${"x".repeat(120)}$`;
      const mdast = unified()
        .use(remarkParse)
        .use(remarkMath)
        .parse(runawayInline);
      await expect(
        toDocx(
          mdast,
          {},
          {
            plugins: [mathPlugin({ maxInlineLength: 50, errorMode: "throw" })],
          },
        ),
      ).rejects.toThrow();
    });
  });
});
