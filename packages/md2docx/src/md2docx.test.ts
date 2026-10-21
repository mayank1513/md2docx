import { describe, expect, it, vi } from "vitest";
import { md2docx } from "./md2docx";

// Mock unified processor
vi.mock("unified", () => ({
  unified: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    process: vi.fn().mockResolvedValue({ result: new Blob() }),
  })),
}));

// Mock remark plugins
vi.mock("remark-parse", () => ({ default: vi.fn() }));
vi.mock("remark-gfm", () => ({ default: vi.fn() }));
vi.mock("remark-math", () => ({ default: vi.fn() }));
vi.mock("remark-frontmatter", () => ({ default: vi.fn() }));
vi.mock("@m2d/remark-docx", () => ({ remarkDocx: vi.fn() }));

describe("md2docx", () => {
  it("should convert basic markdown to docx", async () => {
    const markdown = "# Hello World";
    const result = await md2docx(markdown);
    expect(result).toBeInstanceOf(Blob);
  });

  it("should handle empty markdown", async () => {
    const result = await md2docx("");
    expect(result).toBeInstanceOf(Blob);
  });

  it("should accept custom docx properties", async () => {
    const docxProps = { title: "Test Doc", author: "Test Author" };
    const result = await md2docx("# Test", docxProps);
    expect(result).toBeInstanceOf(Blob);
  });

  it("should accept custom section properties", async () => {
    const sectionProps = { plugins: [] };
    const result = await md2docx("# Test", {}, sectionProps);
    expect(result).toBeInstanceOf(Blob);
  });

  it("should support different output types", async () => {
    const result = await md2docx("# Test", {}, undefined, "arraybuffer");
    expect(result).toBeInstanceOf(Blob);
  });

  it("should accept plugin properties", async () => {
    const pluginProps = {
      mermaid: { mermaidConfig: { theme: "dark" as const } },
      list: { defaultBullets: true },
      table: {},
      emoji: { emojis: { smile: "😊" } },
      image: { maxW: 500 },
    };
    const result = await md2docx("# Test", {}, undefined, "blob", pluginProps);
    expect(result).toBeInstanceOf(Blob);
  });

  it("should handle complex markdown with multiple features", async () => {
    const markdown = `
# Title

## Subtitle

- List item 1
- List item 2

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

**Bold text** and *italic text*

Math: $E = mc^2$

:smile: emoji
    `;
    const result = await md2docx(markdown);
    expect(result).toBeInstanceOf(Blob);
  });
});
