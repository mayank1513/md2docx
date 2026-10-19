/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */
import { toDocx } from "@m2d/core";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { defaultNodeImageResolver, nodeImagePlugin } from "./image-node";

// 10x10 base64 PNG sample
const SAMPLE_BASE64_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAYElEQVQYV2NkgIL//xmCgcxMIHaGCu0F0tMZGRnWgviMIAKoqANIlcM0odGtQMU1jEBFPkCJzTgUwYS9QAoPAHn2BBQeBCn8AFTET0DhR5IUEm21J9DabQQ9Q3TwEBvgACT3J/F3uWU/AAAAAElFTkSuQmCC";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>`;

describe("nodeImagePlugin", () => {
  it("resolves base64 data URLs accurately", async () => {
    const res = await defaultNodeImageResolver(SAMPLE_BASE64_PNG);
    expect(res.type).toBe("png");
    expect(res.transformation.width).toBe(10);
    expect(res.transformation.height).toBe(10);
    expect(Buffer.isBuffer(res.data)).toBe(true);
  });

  it("resolves SVG nodes into raster buffers", async () => {
    const node: any = { type: "svg", value: SAMPLE_SVG };
    const res = await defaultNodeImageResolver("", {}, node);
    expect(res.type).toBe("png");
    expect(res.transformation.width).toBeGreaterThan(0);
    expect(Buffer.isBuffer(res.data)).toBe(true);
  });

  it("handles invalid image sources with safe fallback", async () => {
    const res = await defaultNodeImageResolver("invalid-broken-source");
    expect(res.type).toBe("gif");
    expect(res.transformation.width).toBe(1);
    expect(res.transformation.height).toBe(1);
  });

  it("converts markdown document with images into DOCX Blob", async () => {
    const markdown = `# Document with Image\n\n![Sample Image](${SAMPLE_BASE64_PNG})\n`;
    const mdast = unified().use(remarkParse).parse(markdown);

    const docxBlob = (await toDocx(
      mdast,
      {},
      { plugins: [nodeImagePlugin()] },
      "blob",
    )) as Blob;

    expect(docxBlob).toBeInstanceOf(Blob);
    expect(docxBlob.size).toBeGreaterThan(1000);
  });
});
