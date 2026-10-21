/** biome-ignore-all lint/suspicious/noExplicitAny: required for testing */
import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import { htmlPlugin } from "@m2d/html";
import * as docx from "docx";
import { AlignmentType, ShadingType, Table, WidthType } from "docx";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it, vi } from "vitest";
import { defaultTableOptions, tablePlugin } from "../src";

const sampleMdPath = path.resolve(__dirname, "../../../sample.md");
const sampleMarkdown = fs.existsSync(sampleMdPath)
  ? fs.readFileSync(sampleMdPath, "utf-8")
  : "| A | B |\n|---|---|\n| 1 | 2 |";

describe("defaultTableOptions", () => {
  it("provides sensible default table width, margins, and borders", () => {
    expect(defaultTableOptions.tableProps.width).toEqual({
      size: 100,
      type: WidthType.PERCENTAGE,
    });
    expect(defaultTableOptions.alignments.preferMdData).toBe(true);
    expect(defaultTableOptions.firstRowProps.tableHeader).toBe(true);
    expect(defaultTableOptions.firstRowCellProps.shading).toBeDefined();
  });
});

describe("tablePlugin unit tests", () => {
  it("ignores non-table block nodes", () => {
    const plugin = tablePlugin();
    const nonTableNode = { type: "paragraph", children: [] };
    const processor = vi.fn();

    // @ts-expect-error -- testing non-table node
    const result = plugin.block?.(
      {} as any,
      nonTableNode as any,
      {},
      processor,
    );

    expect(result).toEqual([]);
    expect(processor).not.toHaveBeenCalled();
  });

  it("creates a docx Table instance for a valid table AST node", () => {
    const plugin = tablePlugin();
    const tableNode = {
      type: "table",
      align: ["left", "right"],
      children: [
        {
          type: "tableRow",
          children: [
            {
              type: "tableCell",
              children: [{ type: "text", value: "Header 1" }],
            },
            {
              type: "tableCell",
              children: [{ type: "text", value: "Header 2" }],
            },
          ],
        },
        {
          type: "tableRow",
          children: [
            {
              type: "tableCell",
              children: [{ type: "text", value: "Cell 1" }],
            },
            {
              type: "tableCell",
              children: [{ type: "text", value: "Cell 2" }],
            },
          ],
        },
      ],
    };

    const blockChildrenProcessor = vi
      .fn()
      .mockImplementation((cellNode) => [cellNode]);

    // @ts-expect-error -- testing block hook
    const result = plugin.block?.(
      docx as any,
      tableNode as any,
      {},
      blockChildrenProcessor,
    );

    expect(result).toHaveLength(1);
    expect(result?.[0]).toBeInstanceOf(Table);
    expect(blockChildrenProcessor).toHaveBeenCalledTimes(4);
  });
});

describe("toDocx integration with tablePlugin", () => {
  it("should handle sample markdown tables", async () => {
    const mdast = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .parse(sampleMarkdown);

    const docxBlob = await toDocx(
      mdast,
      {},
      { plugins: [htmlPlugin(), tablePlugin()] },
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("handles tables with column alignments and inline formatting", async () => {
    const md = `
| Item | Description | Price |
| :--- | :---: | ---: |
| Apple | **Fresh** *red* fruit | $1.50 |
| Banana | \`Yellow\` organic | $0.75 |
| Orange | Citrus fruit | $1.20 |
| Empty Cell | | $0.00 |
`;
    const mdast = unified().use(remarkParse).use(remarkGfm).parse(md);
    const docxBlob = await toDocx(mdast, {}, { plugins: [tablePlugin()] });

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("supports custom table plugin options (alignments, headers, shading)", async () => {
    const md = `
| Name | Role |
| --- | --- |
| Alice | Admin |
| Bob | User |
`;
    const mdast = unified().use(remarkParse).use(remarkGfm).parse(md);

    const docxBlob = await toDocx(
      mdast,
      {},
      {
        plugins: [
          tablePlugin({
            alignments: {
              preferMdData: false,
              defaultHorizontalAlign: AlignmentType.CENTER,
            },
            firstRowCellProps: {
              shading: {
                fill: "003366",
                type: ShadingType.CLEAR,
                color: "auto",
              },
            },
          }),
        ],
      },
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });
});
