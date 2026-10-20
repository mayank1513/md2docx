/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

import type { Root } from "@m2d/core";
import { toDocx } from "@m2d/core";
import { nodeImagePlugin } from "@m2d/image-node";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { mermaidNodePlugin } from "./mermaid-node";

const processor = unified().use(remarkParse).use(remarkGfm);

describe("mermaidNodePlugin", () => {
  it("converts mermaid code block to an SVG node during preprocess", async () => {
    const md = "```mermaid\ngraph TD\nA-->B\n```";
    const tree = processor.parse(md);

    const plugin = mermaidNodePlugin();
    await plugin.preprocess?.(tree as unknown as Root, {});

    const svgNode = (tree.children as any)[0];
    expect(svgNode.type).toBe("svg");
    const result = await svgNode.value;
    expect(result).toBeDefined();
    expect(result.svg).toContain("<svg");
  });

  it("supports custom theme selection", async () => {
    const md = "```mermaid\ngraph TD\nX-->Y\n```";
    const tree = processor.parse(md);

    const plugin = mermaidNodePlugin({ theme: "github-light" });
    await plugin.preprocess?.(tree as unknown as Root, {});

    const svgNode = (tree.children as any)[0];
    const result = await svgNode.value;
    expect(result.svg).toContain("<svg");
  });

  it("handles mindmap code blocks with prefix addition", async () => {
    const md = "```mindmap\nroot((Root))\n  Child1\n```";
    const tree = processor.parse(md);

    const plugin = mermaidNodePlugin();
    await plugin.preprocess?.(tree as unknown as Root, {});

    const svgNode = (tree.children as any)[0];
    expect(svgNode.type).toBe("svg");
  });

  it("recovers via fixMermaid when initial render fails", async () => {
    const md = "```mermaid\nbroken-syntax-code\n```";
    const tree = processor.parse(md);

    const plugin = mermaidNodePlugin({
      fixMermaid: (_code, _err) => "graph TD\nFixed-->Works",
    });
    await plugin.preprocess?.(tree as unknown as Root, {});

    const svgNode = (tree.children as any)[0];
    const result = await svgNode.value;
    expect(result?.svg).toContain("<svg");
  });

  it("integrates end-to-end with toDocx and nodeImagePlugin", async () => {
    const md = `# Document With Diagram

\`\`\`mermaid
graph TD
  Start[Start Process] --> End[Finish]
\`\`\`
`;

    const tree = processor.parse(md);

    const docxBlob = (await toDocx(
      tree as any,
      {},
      {
        plugins: [mermaidNodePlugin(), nodeImagePlugin()],
      },
      "blob",
    )) as Blob;

    expect(docxBlob).toBeInstanceOf(Blob);
    expect(docxBlob.size).toBeGreaterThan(1000);
  });
});
