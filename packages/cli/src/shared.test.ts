import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, md2docx, shared } from "./shared";

describe("shared & programmatic md2docx", () => {
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
    // In Node.js environment, result is a Buffer / Uint8Array
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("handles empty markdown without crashing", async () => {
    const result = await md2docx("");
    expect(result).toBeDefined();
  });

  it("handles empty config without throwing", async () => {
    await expect(shared(DEFAULT_CONFIG)).resolves.not.toThrow();
  });
});
