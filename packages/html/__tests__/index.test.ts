import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it, vi } from "vitest";
import { htmlPlugin, parseCssRules } from "../src";

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

  it("should parse <style> blocks and apply styles to tables and headings", async ({
    expect,
  }) => {
    const styledMd = `
<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid black;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  h1 {
    color: #003366;
  }
</style>

# Heading With Custom Color

| Header 1 | Header 2 |
| :--- | :--- |
| Val 1 | Val 2 |
`;

    interface AstTestNode {
      type: string;
      value?: string;
      depth?: number;
      data?: Record<string, unknown>;
      children?: AstTestNode[];
    }

    const ast = unified().use(remarkParse).use(remarkGfm).parse(styledMd);
    const plugin = htmlPlugin();
    plugin.preprocess?.(ast, {});

    const children = ast.children as unknown as AstTestNode[];

    // Verify <style> block was stripped from root children
    const hasStyleNode = children.some(
      (n) => n.type === "html" && n.value?.includes("<style>"),
    );
    expect(hasStyleNode).toBe(false);

    // Verify table cell styling was applied
    const tableNode = children.find((n) => n.type === "table");
    expect(tableNode).toBeDefined();

    // Row 0 cells (th) should have background-color #f2f2f2
    const thCell = tableNode?.children?.[0]?.children?.[0];
    const thShading = thCell?.data?.shading as { fill?: string } | undefined;
    expect(thShading?.fill).toBe("f2f2f2");
    expect(thCell?.data?.border).toBeDefined();

    // Heading 1 should have color #003366
    const h1Node = children.find((n) => n.type === "heading");
    expect(h1Node?.data?.color).toBe("003366");

    // Full docx generation
    const docxBlob = await toDocx(ast, {}, { plugins: [plugin] });
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("should parse CSS rules with parseCssRules utility", ({ expect }) => {
    const css = `
      table { border: 2px solid red; }
      th, td { text-align: right; background-color: #ffffff; padding: 8px 12px; }
      h2 { color: blue; }
    `;
    const rules = parseCssRules(
      css,
      typeof document !== "undefined" ? document : undefined,
    );
    expect(rules.length).toBe(3);
    expect(rules[0].selectors).toEqual(["table"]);
    expect(rules[1].selectors).toEqual(["th", "td"]);
    expect(rules[1].data.alignment).toBe("right");
    expect(rules[1].shading?.fill).toBe("ffffff");
    expect(rules[1].margins).toEqual({
      top: 120,
      bottom: 120,
      left: 180,
      right: 180,
    });
    expect(rules[2].selectors).toEqual(["h2"]);
    expect(rules[2].data.color).toBe("0000ff");
  });
});
