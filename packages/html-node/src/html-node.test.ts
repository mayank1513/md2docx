// @vitest-environment node

import { toDocx } from "@m2d/core";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { htmlNodePlugin, nodeHtmlPlugin } from "./html-node";

describe("html-node", () => {
  it("should run in pure node without browser globals", () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");
  });

  it("should process HTML in markdown on Node.js", async () => {
    const markdown =
      '<div style="border: 2px solid red; color: blue;">Content with <span style="font-weight: bold;">bold text</span></div>';
    const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

    const docxBlob = (await toDocx(
      ast,
      {},
      { plugins: [nodeHtmlPlugin()] },
      "uint8array",
    )) as Uint8Array;
    expect(docxBlob).toBeInstanceOf(Uint8Array);
    expect(docxBlob.length).toBeGreaterThan(0);
  });

  it("should parse HTML tables on Node.js", async () => {
    const markdown =
      '<table style="border: 1px solid black;"><tr><td>Cell A</td><td>Cell B</td></tr></table>';
    const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

    const docxBlob = (await toDocx(
      ast,
      {},
      { plugins: [htmlNodePlugin()] },
      "uint8array",
    )) as Uint8Array;
    expect(docxBlob).toBeInstanceOf(Uint8Array);
    expect(docxBlob.length).toBeGreaterThan(0);
  });

  it("should support custom document injection", () => {
    const customPlugin = nodeHtmlPlugin({ document: undefined });
    expect(customPlugin.preprocess).toBeDefined();
  });

  interface AstTestNode {
    type: string;
    value?: string;
    depth?: number;
    data?: Record<string, unknown>;
    children?: AstTestNode[];
  }

  it("should parse <style> blocks and apply styles in Node.js", async () => {
    const markdown = `
<style>
  table { border: 1px solid black; }
  th { background-color: #f2f2f2; }
  h2 { color: #1e3a8a; }
</style>

## Section Heading

| Col A | Col B |
| :--- | :--- |
| Val 1 | Val 2 |
`;
    const ast = unified().use(remarkParse).use(remarkGfm).parse(markdown);
    const plugin = htmlNodePlugin();
    plugin.preprocess?.(ast, {});

    const children = ast.children as unknown as AstTestNode[];

    // Verify <style> was stripped
    const styleNode = children.find(
      (n) => n.type === "html" && n.value?.includes("<style>"),
    );
    expect(styleNode).toBeUndefined();

    // Verify h2 color
    const h2Node = children.find((n) => n.type === "heading");
    expect(h2Node?.data?.color).toBe("1e3a8a");

    // Verify table cell shading
    const table = children.find((n) => n.type === "table");
    const cellShading = table?.children?.[0]?.children?.[0]?.data?.shading as
      | { fill?: string }
      | undefined;
    expect(cellShading?.fill).toBe("f2f2f2");

    const docxBlob = (await toDocx(
      ast,
      {},
      { plugins: [plugin] },
      "uint8array",
    )) as Uint8Array;
    expect(docxBlob).toBeInstanceOf(Uint8Array);
    expect(docxBlob.length).toBeGreaterThan(0);
  });
});
