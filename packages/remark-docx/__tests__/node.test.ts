import "./setup";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { remarkDocx, remarkDocxNode } from "../src/node";

describe("remarkDocx Node compiler plugin", () => {
  it("exports remarkDocx and remarkDocxNode identically", () => {
    expect(remarkDocx).toBe(remarkDocxNode);
  });

  it("compiles markdown to a DOCX Blob with nodeImage and nodeMermaid plugins wired", async () => {
    const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDocx);
    const md = [
      "# Node Docx Test",
      "",
      "Here is a list:",
      "- Item 1",
      "- Item 2",
      "",
      "```mermaid",
      "graph TD",
      "  A-->B",
      "```",
    ].join("\n");
    const result = await processor.process(md).then((res) => res.result);
    expect(result).toBeInstanceOf(Blob);
  });

  it("compiles markdown to ArrayBuffer when outputType is 'buffer'", async () => {
    const processor = unified().use(remarkParse).use(remarkDocx, "arraybuffer");
    const result = await processor
      .process("# Simple Doc\nContent here")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it("passes docxProps to document", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkDocx, "blob", { title: "Node Document Title" });
    const result = await processor
      .process("# Header\nText")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("accepts custom node pluginProps configuration", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(
        remarkDocx,
        "blob",
        {},
        {},
        {
          mermaid: { transparent: true },
          list: { defaultBullets: true },
          table: {},
          emoji: {},
          image: { maxW: 400 },
        },
      );
    const result = await processor
      .process("# Test\n- item")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });
});
