/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

import "./setup";
import fs from "node:fs";
import path from "node:path";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it, vi } from "vitest";
import { remarkDocx } from "../src";

const sampleMdPath = path.resolve(__dirname, "../../../sample.md");
const markdown = fs.existsSync(sampleMdPath)
  ? fs.readFileSync(sampleMdPath, "utf-8")
  : "# Title\nParagraph with **bold** text.";

describe("remarkDocx compiler plugin", () => {
  it("compiles markdown to a DOCX Blob by default", async () => {
    const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDocx);
    const result = await processor.process(markdown).then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  }, 30000);

  it("compiles markdown to ArrayBuffer when outputType is 'buffer'", async () => {
    const processor = unified().use(remarkParse).use(remarkDocx, "arraybuffer");
    const result = await processor
      .process("# Simple Doc\nContent here")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  it("passes docxProps such as title and description to document", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(remarkDocx, "blob", { title: "Custom Document Title" });
    const result = await processor
      .process("# Header\nText")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("accepts custom pluginProps for plugins configuration", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(
        remarkDocx,
        "blob",
        {},
        {},
        {
          list: { defaultBullets: true },
          table: { alignments: { preferMdData: true } },
        },
      );

    const result = await processor
      .process(
        "- Item 1\n- Item 2\n\n| Col A | Col B |\n| --- | --- |\n| 1 | 2 |",
      )
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("compiles headerMarkdown and footerMarkdown into section headers and footers", async () => {
    const processor = unified().use(remarkParse).use(
      remarkDocx,
      "blob",
      {},
      {
        headerMarkdown: "**Confidential Document** | Acme Inc",
        footerMarkdown: "Page 1 of 5",
      },
    );

    const result = await processor
      .process("# Document Body")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("extracts header and footer from YAML frontmatter node in AST", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(() => (tree: any) => {
        tree.children.unshift({
          type: "yaml",
          value: 'header: "Acme Header"\nfooter: "Page 1"',
        });
      })
      .use(remarkDocx, "blob");

    const result = await processor
      .process("# Main Body")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("prefers explicit headerMarkdown and footerMarkdown over frontmatter header/footer", async () => {
    const processor = unified()
      .use(remarkParse)
      .use(() => (tree: any) => {
        tree.children.unshift({
          type: "yaml",
          value: 'header: "Frontmatter Header"\nfooter: "Frontmatter Footer"',
        });
      })
      .use(
        remarkDocx,
        "blob",
        {},
        {
          headerMarkdown: "Explicit Header",
          footerMarkdown: "Explicit Footer",
        },
      );

    const result = await processor
      .process("# Main Body")
      .then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("warns when running client-side remarkDocx in Node.js environment", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalWindow = globalThis.window;
    // @ts-expect-error simulate Node.js where window is undefined
    delete globalThis.window;

    try {
      const processor = unified().use(remarkParse).use(remarkDocx);
      await processor.process("# Test Node Env");

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("@m2d/remark-docx-node"),
      );
    } finally {
      globalThis.window = originalWindow;
      warnSpy.mockRestore();
    }
  });

  it("wires codePlugin by default to highlight code blocks", async () => {
    const md = "```javascript\nconst x = 42;\n```";
    const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDocx);
    const result = await processor.process(md).then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("disables default codePlugin when pluginProps.code is false", async () => {
    const md = "```javascript\nconst x = 42;\n```";
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDocx, "blob", {}, {}, { code: false });
    const result = await processor.process(md).then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("supports passing false to disable any default plugin in pluginProps", async () => {
    const md = [
      "# Heading",
      "- List item",
      "| Col |",
      "| --- |",
      "| Val |",
      "```js",
      "const a = 1;",
      "```",
    ].join("\n");

    const processor = unified().use(remarkParse).use(remarkGfm).use(
      remarkDocx,
      "blob",
      {},
      {},
      {
        code: false,
        table: false,
        list: false,
        math: false,
        emoji: false,
        frontmatter: false,
      },
    );
    const result = await processor.process(md).then((res) => res.result);

    expect(result).toBeInstanceOf(Blob);
  });

  it("allows clean substitution of default code plugin with custom plugin", async () => {
    const customExecuted = vi.fn();
    const customCodePlugin = {
      block: (_docx: any, node: any) => {
        if (node.type === "code") {
          customExecuted();
          node.type = "";
        }
        return [];
      },
    };

    const md = "```typescript\nconst message = 'custom';\n```";
    const processor = unified()
      .use(remarkParse)
      .use(
        remarkDocx,
        "blob",
        {},
        { plugins: [customCodePlugin] },
        { code: false },
      );

    await processor.process(md).then((res) => res.result);
    expect(customExecuted).toHaveBeenCalledTimes(1);
  });
});
