/** biome-ignore-all lint/suspicious/noExplicitAny: required for testing */
import fs from "node:fs";
import path from "node:path";
import { htmlPlugin } from "@m2d/html";
import { listPlugin } from "@m2d/list";
import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it, vi } from "vitest";
import { toDocx } from "../src"; // Adjust path based on your setup
import { warnOnce } from "../src/utils";

let lastDocumentOptions: any = null;
let lastDocumentInstance: any = null;

vi.mock("docx", async (importOriginal) => {
  const actual = await importOriginal<typeof import("docx")>();
  return {
    ...actual,
    Document: class MockDocument extends actual.Document {
      constructor(options: any) {
        super(options);
        lastDocumentOptions = options;
        lastDocumentInstance = this;
      }
    },
  };
});

const markdown = fs.readFileSync(
  path.resolve(__dirname, "../../../sample.md"),
  "utf-8",
);

const findHyperlinkUrl = (paragraphs: any[]): string | undefined => {
  for (const p of paragraphs || []) {
    if (Array.isArray(p.root)) {
      for (const child of p.root) {
        if (child.rootKey === "w:hyperlink" && child.linkId) {
          const rels =
            lastDocumentInstance?.documentWrapper?.Relationships?.root || [];
          for (const rel of rels) {
            const attr = rel.root?.[0]?.root;
            if (attr?.id?.value === `rId${child.linkId}`) {
              return attr?.target?.value;
            }
          }
        }
      }
    }
  }
  return undefined;
};

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

  it("should return a buffer if outputType is 'buffer'", async () => {
    const mdast = unified().use(remarkParse).parse(markdown);

    const docxBuffer = await toDocx(mdast, {}, {}, "arraybuffer");

    expect(docxBuffer).toBeInstanceOf(ArrayBuffer);
  });

  it("should include a title in the document properties", async () => {
    const mdast = unified().use(remarkParse).parse(markdown);

    const docxBlob = await toDocx(
      mdast,
      { title: "Custom Title" },
      { plugins: [htmlPlugin(), listPlugin()] },
    );

    expect(docxBlob).toBeDefined(); // Ensure output exists
  });

  it("should handle multiple MDAST inputs", async () => {
    const md1 = unified().use(remarkParse).parse("# First Section");
    const md2 = unified().use(remarkParse).parse("## Second Section");

    const docxBlob = await toDocx(
      [{ ast: md1 }, { ast: md2 }],
      { title: "Multi-section Doc" },
      {},
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("should fail gracefully when given an invalid MDAST input", async () => {
    try {
      // Passing an invalid AST
      // skipcq: JS-0323
      await toDocx(null as any, {}, {});
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should show warning for unknown node", async ({ expect }) => {
    const docxBlob = await toDocx(
      // @ts-expect-error -- testing unknown type
      { type: "root", children: [{ type: "unknown" }] },
      { title: "Test Document" },
      { plugins: [{ inline: () => [], block: () => [] }] },
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("should handle footnotes", async ({ expect }) => {
    const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

    const docxBlob = await toDocx(
      mdast,
      { title: "Test Document" },
      { plugins: [{ inline: () => [], block: () => [] }] },
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("should not mutate defaultSectionProps.plugins array in place", async ({
    expect,
  }) => {
    const defaultPlugins: any[] = [];
    const defaultSectionProps = { plugins: defaultPlugins };
    const sectionPlugins = [{ inline: () => [] }];

    const mdast = { type: "root", children: [] } as any;
    await toDocx(
      [{ ast: mdast, props: { plugins: sectionPlugins } }],
      {},
      defaultSectionProps,
    );

    expect(defaultPlugins).toHaveLength(0);
  });

  it("warnOnce emits a warning only once per unique key", () => {
    warnOnce.reset();
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    warnOnce("test-key", "Test warning 1");
    warnOnce("test-key", "Test warning 2");
    warnOnce("another-key", "Another warning");

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith("[m2d] Test warning 1");
    expect(spy).toHaveBeenCalledWith("[m2d] Another warning");

    spy.mockRestore();
  });

  it("warns only once for repeated unsupported node types during toDocx", async () => {
    warnOnce.reset();
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    await toDocx(
      {
        type: "root",
        // @ts-expect-error -- testing repeated unknown types
        children: [{ type: "customNode" }, { type: "customNode" }],
      },
      {},
      { plugins: [] },
    );

    const customNodeWarnings = spy.mock.calls.filter((call) =>
      call[0]?.includes("customNode"),
    );
    expect(customNodeWarnings).toHaveLength(1);

    spy.mockRestore();
  });
});

describe("definitions and footnotes across sections", () => {
  it("prevents footnote ID collision and overwriting across multiple sections", async () => {
    lastDocumentOptions = null;

    const s1: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Section 1 text " },
            { type: "footnoteReference", identifier: "fn1", label: "fn1" },
            { type: "text", value: " and " },
            { type: "footnoteReference", identifier: "fn2", label: "fn2" },
          ],
        },
        {
          type: "footnoteDefinition",
          identifier: "fn1",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "Section 1 Note A" }],
            },
          ],
        },
        {
          type: "footnoteDefinition",
          identifier: "fn2",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "Section 1 Note B" }],
            },
          ],
        },
      ],
    };

    const s2: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Section 2 text " },
            { type: "footnoteReference", identifier: "fn3", label: "fn3" },
          ],
        },
        {
          type: "footnoteDefinition",
          identifier: "fn3",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "Section 2 Note X" }],
            },
          ],
        },
      ],
    };

    await toDocx([{ ast: s1 }, { ast: s2 }]);

    const passedFootnotes = lastDocumentOptions?.footnotes as Record<
      number,
      any
    >;

    // Expect all 3 unique footnotes to exist rather than Section 2 overwriting ID 1
    expect(Object.keys(passedFootnotes).length).toBe(3);
  });

  it("resolves cross-section link references under shared scope and isolates under section scope", async () => {
    lastDocumentOptions = null;

    const s1: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "linkReference",
              identifier: "docs",
              label: "docs",
              referenceType: "shortcut",
              children: [{ type: "text", value: "Documentation" }],
            },
          ],
        },
      ],
    };

    const s2: Root = {
      type: "root",
      children: [
        {
          type: "definition",
          identifier: "docs",
          url: "https://docs.example.com",
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "Section 2 body" }],
        },
      ],
    };

    // 1. Shared scope should resolve link in Section 1
    await toDocx([{ ast: s1 }, { ast: s2 }]);
    const sharedSections = lastDocumentOptions?.sections as any[];
    expect(findHyperlinkUrl(sharedSections[0].children)).toBe(
      "https://docs.example.com",
    );

    // 2. Section isolated scope should keep link unresolved
    await toDocx([{ ast: s1 }, { ast: s2 }], { definitionsScope: "section" });
    const isolatedSections = lastDocumentOptions?.sections as any[];
    expect(findHyperlinkUrl(isolatedSections[0].children)).toBeUndefined();
  });

  it("preserves local section definition overrides over shared definitions on collision", async () => {
    lastDocumentOptions = null;

    const s1: Root = {
      type: "root",
      children: [
        {
          type: "definition",
          identifier: "target",
          url: "https://local-s1.example.com",
        },
        {
          type: "paragraph",
          children: [
            {
              type: "linkReference",
              identifier: "target",
              referenceType: "shortcut",
              children: [{ type: "text", value: "Target S1" }],
            },
          ],
        },
      ],
    };

    const s2: Root = {
      type: "root",
      children: [
        {
          type: "definition",
          identifier: "target",
          url: "https://local-s2.example.com",
        },
        {
          type: "paragraph",
          children: [
            {
              type: "linkReference",
              identifier: "target",
              referenceType: "shortcut",
              children: [{ type: "text", value: "Target S2" }],
            },
          ],
        },
      ],
    };

    await toDocx([{ ast: s1 }, { ast: s2 }]);
    const sections = lastDocumentOptions?.sections as any[];

    expect(findHyperlinkUrl(sections[0].children)).toBe(
      "https://local-s1.example.com",
    );
    expect(findHyperlinkUrl(sections[1].children)).toBe(
      "https://local-s2.example.com",
    );
  });

  it("matches footnote and link definitions case-insensitively per spec", async () => {
    lastDocumentOptions = null;

    const ast: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "linkReference",
              identifier: "mYlInK",
              label: "mYlInK",
              referenceType: "shortcut",
              children: [{ type: "text", value: "Case Test" }],
            },
            {
              type: "footnoteReference",
              identifier: "cAsEnOtE",
              label: "cAsEnOtE",
            },
          ],
        },
        {
          type: "definition",
          identifier: "mylink",
          url: "https://case-insensitive.example.com",
        },
        {
          type: "footnoteDefinition",
          identifier: "casenote",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "Case Note Text" }],
            },
          ],
        },
      ],
    };

    await toDocx(ast);
    const sections = lastDocumentOptions?.sections as any[];
    const footnotes = lastDocumentOptions?.footnotes as Record<number, any>;

    expect(findHyperlinkUrl(sections[0].children)).toBe(
      "https://case-insensitive.example.com",
    );
    expect(Object.keys(footnotes).length).toBe(1);
  });

  it("gracefully handles missing footnote references without crashing", async () => {
    lastDocumentOptions = null;

    const ast: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Text referencing missing footnote " },
            {
              type: "footnoteReference",
              identifier: "nonexistent_fn",
              label: "nonexistent_fn",
            },
          ],
        },
      ],
    };

    await expect(toDocx(ast)).resolves.toBeDefined();
  });

  it("gracefully handles missing linkReference definitions without crashing", async () => {
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "linkReference",
              identifier: "nonexistent",
              label: "nonexistent",
              referenceType: "shortcut",
              children: [{ type: "text", value: "Unresolved Link" }],
            },
          ],
        },
      ],
    };

    await expect(toDocx(ast)).resolves.toBeDefined();
  });

  it("maps duplicate footnote references in the same section to the same footnote ID", async () => {
    lastDocumentOptions = null;

    const ast: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            { type: "text", value: "First reference: " },
            {
              type: "footnoteReference",
              identifier: "shared_fn",
              label: "shared_fn",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", value: "Second reference: " },
            {
              type: "footnoteReference",
              identifier: "shared_fn",
              label: "shared_fn",
            },
          ],
        },
        {
          type: "footnoteDefinition",
          identifier: "shared_fn",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "Shared Note" }],
            },
          ],
        },
      ],
    };

    await toDocx(ast);
    const footnotes = lastDocumentOptions?.footnotes as Record<number, any>;

    // Only one unique footnote definition created in the registry
    expect(Object.keys(footnotes).length).toBe(1);
  });
});
