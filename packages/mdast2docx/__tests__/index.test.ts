import fs from "node:fs";
import path from "node:path";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { toDocx } from "../src";

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

describe("toDocx", () => {
  it("should convert a basic Markdown string to a DOCX Blob", async () => {
    const mdast = unified().use(remarkParse).parse(markdown);

    const docxBlob = await toDocx(
      mdast,
      { title: "Test Document" },
      { useTitle: false },
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });
});
