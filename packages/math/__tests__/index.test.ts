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
});
