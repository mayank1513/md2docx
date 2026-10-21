import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it, vi } from "vitest";
import { defaultMermaidFixer, mermaidPlugin } from "../src";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

describe.concurrent("defaultMermaidFixer", () => {
  it("should quote unquoted flowchart node labels containing special characters", ({
    expect,
  }) => {
    const raw = `graph TD
  A[@m2d/core Converter] --> B(API: /api/docx)
  B --> C([Process (async)])
  C --> D[(Postgres DB)]
  D --> E{Check: Status == OK}
  E -->|yes: proceed| F[[Subroutine]]`;

    const fixed = defaultMermaidFixer(raw);
    expect(fixed).toContain('A["@m2d/core Converter"]');
    expect(fixed).toContain('B("API: /api/docx")');
    expect(fixed).toContain('C(["Process (async)"])');
    expect(fixed).toContain('D[("Postgres DB")]');
    expect(fixed).toContain('E{"Check: Status == OK"}');
    expect(fixed).toContain('|"yes: proceed"|');
  });

  it("should preserve already double-quoted labels", ({ expect }) => {
    const raw = `graph LR
  A["Already Quoted Label"] --> B["Another One"]`;

    const fixed = defaultMermaidFixer(raw);
    expect(fixed).toBe(raw);
  });
});

/**
 * concurrently run unit tests.
 */
describe.concurrent("toDocx", () => {
  const mdast = unified().use(remarkParse).parse(markdown);

  it("should not have any console.log", async ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "log");
    await toDocx(mdast, {}, { plugins: [mermaidPlugin()] });
    expect(consoleSpy).not.toHaveBeenCalled();
  }, 30000);

  it("should auto-repair unquoted flowchart syntax and compile successfully", async ({
    expect,
  }) => {
    const brokenMermaidMd = `
# Auto-Repair Test
\`\`\`mermaid
graph TD
  A[@m2d/core Converter] --> B[docx Output (.docx)]
\`\`\`
`;
    const ast = unified().use(remarkParse).parse(brokenMermaidMd);
    const docxBlob = await toDocx(ast, {}, { plugins: [mermaidPlugin()] });
    expect(docxBlob).toBeDefined();
  }, 30000);

  it("should accept theme and custom mermaidConfig options", async ({
    expect,
  }) => {
    const mermaidMd = `
\`\`\`mermaid
flowchart LR
  A[Start] --> B[End]
\`\`\`
`;
    const ast = unified().use(remarkParse).parse(mermaidMd);
    const docxBlob = await toDocx(
      ast,
      {},
      {
        plugins: [
          mermaidPlugin({
            mermaidConfig: {
              theme: "dark",
              darkMode: true,
              fontFamily: "monospace",
            },
          }),
        ],
      },
    );
    expect(docxBlob).toBeDefined();
  }, 30000);
});
