import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, it, vi } from "vitest";
import { mermaidPlugin } from "../src";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

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
});
