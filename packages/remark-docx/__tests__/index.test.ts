import "./setup";
import fs from "node:fs";
import path from "node:path";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it, vi } from "vitest";
import { remarkDocx } from "../src";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

describe("toDocx", () => {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkDocx);
  it("should handle remark-docxs", async ({ expect }) => {
    const docxBlob = await processor
      .process(markdown)
      .then((res) => res.result);
    expect(docxBlob).toBeInstanceOf(Blob);
  }, 30000);

  it("should not have any console.log", async ({ expect }) => {
    const consoleSpy = vi.spyOn(console, "log");
    await processor.process(markdown).then((res) => res.result);
    expect(consoleSpy).not.toHaveBeenCalled();
  }, 30000);
});
