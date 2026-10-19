import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it, vi } from "vitest";
import { htmlPlugin } from "../src";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

describe.concurrent("toDocx", () => {
  const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  it("should handle html", async ({ expect }) => {
    const docxBlob = await toDocx(mdast, {}, { plugins: [htmlPlugin()] });
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  /**
   * Check if all the console.log are removed
   */
  it("should not have any console.log", async ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "log");
    await toDocx(mdast, {}, { plugins: [htmlPlugin()] });
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should parse CSS border widths using base 10", async ({ expect }) => {
    const htmlMd = '<div style="border: 5px solid red">Border content</div>';
    const ast = unified().use(remarkParse).parse(htmlMd);
    const docxBlob = await toDocx(ast, {}, { plugins: [htmlPlugin()] });
    expect(docxBlob).toBeInstanceOf(Blob);
  });
});
