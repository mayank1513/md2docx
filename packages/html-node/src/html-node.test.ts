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
});
