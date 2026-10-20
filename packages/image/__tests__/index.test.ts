/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */
import "./setup";
import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import { htmlPlugin } from "@m2d/html";
import { mermaidPlugin } from "@m2d/mermaid";
import * as docx from "docx";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it, vi } from "vitest";
import { imagePlugin } from "../src";
import { getImageMimeType, getPlaceHolderImage } from "../src/utils";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

const toArrayBuffer = (buf: Buffer): ArrayBuffer =>
  // @ts-expect-error -- ok
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

describe.concurrent("toDocx", () => {
  const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  it("should handle images", async ({ expect }) => {
    const docxBlob = await toDocx(
      mdast,
      {},
      { plugins: [htmlPlugin(), mermaidPlugin(), imagePlugin()] },
    );
    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("should not have any console.log", async ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "log");
    await toDocx(mdast, {}, { plugins: [imagePlugin()] });
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("detects known image formats from Buffer and ArrayBuffer", ({
    expect,
  }) => {
    const cases = [
      { bytes: [0x42, 0x4d, 0x00, 0x00], expected: "bmp" }, // BMP
      { bytes: [0x89, 0x50, 0x4e, 0x47], expected: "png" }, // PNG
      { bytes: [0x47, 0x49, 0x46, 0x38], expected: "gif" }, // GIF
      { bytes: [0xff, 0xd8, 0xff, 0xe0], expected: "jpg" }, // JPG
    ] as const;

    for (const { bytes, expected } of cases) {
      const buffer = Buffer.from(bytes);
      const arrayBuffer = toArrayBuffer(buffer);
      expect(getImageMimeType(buffer)).toBe(expected);
      expect(getImageMimeType(arrayBuffer)).toBe(expected);
    }
  });

  it("returns undefined for unknown or too short buffers", ({ expect }) => {
    const unknown = Buffer.from([0x00, 0x11, 0x22, 0x33]);
    const short = Buffer.from([0x42]); // too short

    expect(getImageMimeType(unknown)).toBeUndefined();
    expect(getImageMimeType(toArrayBuffer(unknown))).toBeUndefined();
    expect(getImageMimeType(short)).toBeUndefined();
    expect(getImageMimeType(toArrayBuffer(short))).toBeUndefined();
  });

  it("should handle placeholder", async ({ expect }) => {
    const options = {
      // @ts-expect-error -- ok
      imageResolver: () => getPlaceHolderImage(options),
      placeholder: "some-url",
    };
    // @ts-expect-error -- ok
    const placeholderImg = await getPlaceHolderImage(options);
    expect(placeholderImg.data).toBeInstanceOf(ArrayBuffer);
    expect((placeholderImg.data as ArrayBuffer).byteLength).toBe(43);
    expect(placeholderImg.type).toBe("gif");
  });

  it("drops the node completely in silent errorMode", async ({ expect }) => {
    const plugin = imagePlugin({ errorMode: "silent" });
    const failedNode: any = {
      type: "image",
      data: { isError: true, altText: { name: "Missing" } },
    };
    const runs = (plugin.inline as any)(docx, failedNode, {});
    expect(runs).toEqual([]);
  });

  it("renders a muted text run in warn errorMode", async ({ expect }) => {
    const plugin = imagePlugin({ errorMode: "warn" });
    const failedNode: any = {
      type: "image",
      data: { isError: true, altText: { name: "Broken Banner" } },
    };
    const runs = (plugin.inline as any)(docx, failedNode, {});
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(docx.TextRun);
  });

  it("handles placeholder errorMode without placeholder option", async ({
    expect,
  }) => {
    const plugin = imagePlugin({ errorMode: "placeholder" });
    const missingPlaceholderNode: any = {
      type: "image",
      data: {
        isError: true,
        errorReason: "placeholder-not-configured",
        altText: { name: "Hero" },
      },
    };
    const runs = (plugin.inline as any)(docx, missingPlaceholderNode, {});
    expect(runs).toHaveLength(1);
    expect(runs[0]).toBeInstanceOf(docx.TextRun);
  });

  it("handles Mermaid diagram fallback modes", async ({ expect }) => {
    const createMermaidNode = () => ({
      type: "svg",
      data: {
        isError: true,
        mermaid: "graph TD\n  A --> B",
        error: new Error("Syntax error"),
      },
    });

    const pluginCode = imagePlugin();
    const codeRuns = (pluginCode.inline as any)(docx, createMermaidNode(), {});
    expect(codeRuns).toHaveLength(2);
    expect(codeRuns[0]).toBeInstanceOf(docx.TextRun);

    const pluginWarn = imagePlugin({ mermaidFallback: "warn" });
    const warnRuns = (pluginWarn.inline as any)(docx, createMermaidNode(), {});
    expect(warnRuns).toHaveLength(1);
    expect(warnRuns[0]).toBeInstanceOf(docx.TextRun);

    const pluginSilent = imagePlugin({ mermaidFallback: "silent" });
    const silentRuns = (pluginSilent.inline as any)(
      docx,
      createMermaidNode(),
      {},
    );
    expect(silentRuns).toEqual([]);
  });
});
