import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import * as docx from "docx";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it } from "vitest";
import { mathPlugin, parseLatex } from "../src";

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
});
