/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */
import { toDocx } from "@m2d/core";
import * as docx from "docx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { defaultNodeImageResolver, nodeImagePlugin } from "./image-node";

// 10x10 base64 PNG sample
const SAMPLE_BASE64_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAYElEQVQYV2NkgIL//xmCgcxMIHaGCu0F0tMZGRnWgviMIAKoqANIlcM0odGtQMU1jEBFPkCJzTgUwYS9QAoPAHn2BBQeBCn8AFTET0DhR5IUEm21J9DabQQ9Q3TwEBvgACT3J/F3uWU/AAAAAElFTkSuQmCC";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40" fill="red" /></svg>`;

const callInline = (plugin: any, node: any) =>
  plugin.inline(docx, node, {}, {}, {}, () => []);

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

  it("marks isError: true on invalid image sources", async () => {
    const res = (await defaultNodeImageResolver(
      "invalid-broken-source",
    )) as any;
    expect(res.isError).toBe(true);
    expect(res.error).toBeInstanceOf(Error);
  });

  it("throws on error when errorMode is 'throw'", async () => {
    await expect(
      defaultNodeImageResolver("invalid-broken-source", { errorMode: "throw" }),
    ).rejects.toThrow();

    const emptySvgNode: any = { type: "svg", value: "" };
    await expect(
      defaultNodeImageResolver("", { errorMode: "throw" }, emptySvgNode),
    ).rejects.toThrow("Empty SVG string encountered");
  });

  it("drops the node completely in silent errorMode", async () => {
    const plugin = nodeImagePlugin({ errorMode: "silent" });
    const failedNode: any = {
      type: "image",
      data: { isError: true, altText: { name: "Missing" } },
    };
    const runs = callInline(plugin, failedNode);
    expect(runs).toEqual([]);
  });

  it("renders a muted text run in warn errorMode", async () => {
    const plugin = nodeImagePlugin({ errorMode: "warn" });
    const failedNode: any = {
      type: "image",
      data: { isError: true, altText: { name: "Missing Image" } },
    };
    const runs = callInline(plugin, failedNode);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(docx.TextRun);
  });

  it("handles placeholder errorMode with and without placeholder option", async () => {
    // With configured placeholder
    const resWithPlaceholder = await defaultNodeImageResolver(
      "invalid-source",
      {
        errorMode: "placeholder",
        placeholder: SAMPLE_BASE64_PNG,
      },
    );
    expect(resWithPlaceholder.type).toBe("png");
    expect(resWithPlaceholder.transformation.width).toBe(10);

    // Without configured placeholder
    const plugin = nodeImagePlugin({ errorMode: "placeholder" });
    const missingPlaceholderNode: any = {
      type: "image",
      data: {
        isError: true,
        errorReason: "placeholder-not-configured",
        altText: { name: "Banner" },
      },
    };
    const runs = callInline(plugin, missingPlaceholderNode);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(docx.TextRun);
  });

  it("handles Mermaid diagram fallback correctly", async () => {
    const createMermaidNode = () => ({
      type: "svg",
      data: {
        isError: true,
        mermaid: "graph TD\n  A --> B",
        error: new Error("Syntax error"),
      },
    });

    // Default fallback: "code"
    const pluginCode = nodeImagePlugin();
    const codeRuns = callInline(pluginCode, createMermaidNode());
    expect(codeRuns).toHaveLength(2);
    expect(codeRuns[0]).toBeInstanceOf(docx.TextRun);

    // Fallback: "warn"
    const pluginWarn = nodeImagePlugin({ mermaidFallback: "warn" });
    const warnRuns = callInline(pluginWarn, createMermaidNode());
    expect(warnRuns).toHaveLength(1);
    expect(warnRuns[0]).toBeInstanceOf(docx.TextRun);

    // Fallback: "silent"
    const pluginSilent = nodeImagePlugin({ mermaidFallback: "silent" });
    const silentRuns = callInline(pluginSilent, createMermaidNode());
    expect(silentRuns).toEqual([]);
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
