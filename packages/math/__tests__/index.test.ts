import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it } from "vitest";
import { mathPlugin } from "../src";

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
});
