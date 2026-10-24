import type { Root } from "mdast";
import { describe, expect, it } from "vitest";
import { toDocx } from "../src/index";
import { toSection } from "../src/section";

describe("headers and footers via toSection and toDocx", () => {
  const sampleHeaderAst: Root = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Confidential Document" }],
      },
    ],
  };

  const sampleFooterAst: Root = {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", value: "Page 1" }],
      },
    ],
  };

  it("generates default header and footer from AST nodes", async () => {
    const rootNode: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "Body paragraph content" }],
        },
      ],
    };

    const section = await toSection(
      rootNode,
      {},
      {},
      {
        headerAst: sampleHeaderAst,
        footerAst: sampleFooterAst,
      },
    );

    expect(section.headers?.default).toBeDefined();
    expect(section.footers?.default).toBeDefined();
  });

  it("handles multi-target headers via AST (default, first, even)", async () => {
    const rootNode: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "Page content" }],
        },
      ],
    };

    const section = await toSection(
      rootNode,
      {},
      {},
      {
        headerAst: {
          default: sampleHeaderAst,
          first: sampleHeaderAst,
          even: sampleHeaderAst,
        },
      },
    );

    expect(section.headers?.default).toBeDefined();
    expect(section.headers?.first).toBeDefined();
    expect(section.headers?.even).toBeDefined();
  });

  it("compiles full document with header and footer AST via toDocx", async () => {
    const rootNode: Root = {
      type: "root",
      children: [
        {
          type: "heading",
          depth: 1,
          children: [{ type: "text", value: "Quarterly Overview" }],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Executive report summary text." }],
        },
      ],
    };

    const blob = await toDocx(
      rootNode,
      { title: "Quarterly Report" },
      {
        headerAst: sampleHeaderAst,
        footerAst: sampleFooterAst,
      },
      "blob",
    );

    expect(blob).toBeDefined();
    expect(blob instanceof Blob).toBe(true);
    expect((blob as Blob).size).toBeGreaterThan(0);
  });
});
