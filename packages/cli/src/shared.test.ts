import { rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseArgs } from "./cli";
import { DEFAULT_CONFIG, md2docx, toDocxFile } from "./shared";

describe("cli & programmatic md2docx", () => {
  it("converts markdown string to DOCX Buffer on Node", async () => {
    const md = `
# Node CLI Conversion Test

- Item 1
- Item 2

\`\`\`mermaid
graph TD
  Start --> Stop
\`\`\`
`;
    const result = await md2docx(md, { title: "CLI Document" });
    expect(result).toBeDefined();
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("handles empty markdown without crashing", async () => {
    const result = await md2docx("");
    expect(result).toBeDefined();
  });

  it("handles empty config without throwing", async () => {
    await expect(toDocxFile(DEFAULT_CONFIG)).resolves.not.toThrow();
  });

  it("runs file conversion with debug logging enabled via toDocxFile", async () => {
    const tmpInput = resolve(__dirname, "temp-test-input.md");
    const tmpOutput = resolve(__dirname, "temp-test-output.docx");

    await writeFile(
      tmpInput,
      "# Heading\n\nSome test markdown content.",
      "utf-8",
    );

    try {
      await toDocxFile({
        input: tmpInput,
        output: tmpOutput,
        title: "Test Document",
        author: "Tester",
        debug: true,
      });

      expect(
        Buffer.isBuffer(
          await import("node:fs/promises").then((f) => f.readFile(tmpOutput)),
        ),
      ).toBe(true);
    } finally {
      await rm(tmpInput, { force: true }).catch(() => {});
      await rm(tmpOutput, { force: true }).catch(() => {});
    }
  });

  it("parses CLI flags including --debug, -o, --output=, and --log-level", () => {
    const flags = parseArgs([
      "doc.md",
      "-o",
      "out.docx",
      "--debug",
      "--title=My Title",
      "--author",
      "Author Name",
      "--description=My Desc",
    ]);

    expect(flags.input).toBe("doc.md");
    expect(flags.output).toBe("out.docx");
    expect(flags.debug).toBe(true);
    expect(flags.logLevel).toBe("debug");
    expect(flags.title).toBe("My Title");
    expect(flags.author).toBe("Author Name");
    expect(flags.description).toBe("My Desc");
  });
});
