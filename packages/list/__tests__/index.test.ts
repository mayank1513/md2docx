import fs from "node:fs";
import path from "node:path";
import { toDocx } from "@m2d/core";
import { AlignmentType, convertInchesToTwip, LevelFormat } from "docx";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it, vi } from "vitest";
import { createLevels, listPlugin } from "../src";

const sampleMdPath = path.resolve(__dirname, "../../../sample.md");
const sampleMarkdown = fs.existsSync(sampleMdPath)
  ? fs.readFileSync(sampleMdPath, "utf-8")
  : "# Sample\n- Item 1\n- Item 2";

describe("createLevels", () => {
  it("generates hierarchical numbering for decimal format", () => {
    const formats = [
      LevelFormat.DECIMAL,
      LevelFormat.DECIMAL,
      LevelFormat.DECIMAL,
    ];
    const levels = createLevels(formats, 0.5, 0.25);

    expect(levels).toHaveLength(3);
    expect(levels[0].level).toBe(0);
    expect(levels[0].format).toBe(LevelFormat.DECIMAL);
    expect(levels[0].text).toBe("%1.");
    expect(levels[0].alignment).toBe(AlignmentType.START);
    expect(levels[0].style?.paragraph?.indent).toEqual({
      left: convertInchesToTwip(0.5),
    });

    expect(levels[1].level).toBe(1);
    expect(levels[1].text).toBe("%1.%2.");
    expect(levels[1].style?.paragraph?.indent).toEqual({
      left: convertInchesToTwip(0.75),
    });

    expect(levels[2].level).toBe(2);
    expect(levels[2].text).toBe("%1.%2.%3.");
    expect(levels[2].style?.paragraph?.indent).toEqual({
      left: convertInchesToTwip(1.0),
    });
  });

  it("handles non-decimal formats without hierarchical prefix", () => {
    const formats = [LevelFormat.UPPER_LETTER, LevelFormat.LOWER_ROMAN];
    const levels = createLevels(formats, 0.4, 0.2);

    expect(levels[0].text).toBe("%1.");
    expect(levels[0].format).toBe(LevelFormat.UPPER_LETTER);

    expect(levels[1].text).toBe("%2.");
    expect(levels[1].format).toBe(LevelFormat.LOWER_ROMAN);
  });
});

describe("listPlugin unit tests", () => {
  it("ignores non-list block nodes", () => {
    const plugin = listPlugin();
    const nonListNode = { type: "paragraph", children: [] };
    const processor = vi.fn();

    // @ts-expect-error -- testing non-list block node
    const result = plugin.block?.({} as any, nonListNode as any, {}, processor);

    expect(result).toEqual([]);
    expect(processor).not.toHaveBeenCalled();
  });

  it("processes ordered lists with 'ol' tag and numbering reference", () => {
    const plugin = listPlugin();
    const listNode = {
      type: "list",
      ordered: true,
      children: [{ type: "listItem", children: [] }],
    };
    const processor = vi.fn().mockReturnValue(["mock-paragraph"]);

    // @ts-expect-error -- testing block hook
    const result = plugin.block?.({} as any, listNode as any, {}, processor);

    expect(result).toEqual(["mock-paragraph"]);
    expect(processor).toHaveBeenCalledTimes(1);

    const passedProps = processor.mock.calls[0][1];
    expect(passedProps.tag).toBe("ol");
    expect(passedProps.numbering).toBeDefined();
    expect(passedProps.numbering.level).toBe(0);
    expect(passedProps.numbering.reference).toMatch(/^numbering-/);
    expect(passedProps.bullet).toEqual({ level: 0 });
  });

  it("processes unordered lists with 'ul' tag and bullet reference", () => {
    const plugin = listPlugin();
    const listNode = {
      type: "list",
      ordered: false,
      children: [{ type: "listItem", children: [] }],
    };
    const processor = vi.fn().mockReturnValue(["mock-bullet"]);

    // @ts-expect-error -- testing block hook
    const result = plugin.block?.({} as any, listNode as any, {}, processor);

    expect(result).toEqual(["mock-bullet"]);
    const passedProps = processor.mock.calls[0][1];
    expect(passedProps.tag).toBe("ul");
    expect(passedProps.numbering).toBeDefined();
    expect(passedProps.numbering.reference).toMatch(/^bullet-/);
    expect(passedProps.bullet).toEqual({ level: 0 });
  });

  it("increments level for nested lists", () => {
    const plugin = listPlugin();
    const parentProps = { bullet: { level: 1 } };
    const listNode = {
      type: "list",
      ordered: false,
      children: [],
    };
    const processor = vi.fn().mockReturnValue([]);

    // @ts-expect-error -- testing nested block hook
    plugin.block?.({} as any, listNode as any, parentProps as any, processor);

    const passedProps = processor.mock.calls[0][1];
    expect(passedProps.bullet).toEqual({ level: 2 });
    expect(passedProps.numbering.level).toBe(2);
  });

  it("sets numbering to undefined when defaultBullets is true", () => {
    const plugin = listPlugin({ defaultBullets: true });
    const listNode = {
      type: "list",
      ordered: false,
      children: [],
    };
    const processor = vi.fn().mockReturnValue([]);

    // @ts-expect-error -- testing block hook with defaultBullets
    plugin.block?.({} as any, listNode as any, {}, processor);

    const passedProps = processor.mock.calls[0][1];
    expect(passedProps.numbering).toBeUndefined();
    expect(passedProps.bullet).toEqual({ level: 0 });
  });

  it("configures numbering and bullet styles in root hook", () => {
    const plugin = listPlugin({
      bullets: ["*", "-", "+"],
    });
    const docProps: any = {
      numbering: { config: [{ reference: "existing" }] },
    };

    plugin.root?.(docProps);

    expect(docProps.numbering.config).toHaveLength(3);
    expect(docProps.numbering.config[0].reference).toBe("existing");

    const numConfig = docProps.numbering.config[1];
    expect(numConfig.reference).toMatch(/^numbering-/);
    expect(numConfig.levels.length).toBeGreaterThan(0);

    const bulletConfig = docProps.numbering.config[2];
    expect(bulletConfig.reference).toMatch(/^bullet-/);
    expect(bulletConfig.levels[0].text).toBe("*");
    expect(bulletConfig.levels[1].text).toBe("-");
    expect(bulletConfig.levels[2].text).toBe("+");
  });

  it("uses custom bulletLevels when provided in options", () => {
    const customBulletLevels = [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: "»",
        alignment: AlignmentType.START,
      },
    ];
    const plugin = listPlugin({ bulletLevels: customBulletLevels });
    const docProps: any = {};

    plugin.root?.(docProps);

    expect(docProps.numbering.config).toHaveLength(2);
    expect(docProps.numbering.config[1].levels).toBe(customBulletLevels);
  });
});

describe("toDocx integration with listPlugin", () => {
  it("should handle full markdown document lists", async () => {
    const mdast = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .parse(sampleMarkdown);

    const docxBlob = await toDocx(mdast, {}, { plugins: [listPlugin()] });

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("handles ordered lists, unordered lists, and deeply nested lists", async () => {
    const md = `
# Lists Test

## Unordered List
- First item
- Second item
  - Nested subitem A
  - Nested subitem B
    - Deeply nested subitem 1
- Third item

## Ordered List
1. Step 1
2. Step 2
   1. Substep 2.1
   2. Substep 2.2
3. Step 3
`;
    const mdast = unified().use(remarkParse).use(remarkGfm).parse(md);
    const docxBlob = await toDocx(mdast, {}, { plugins: [listPlugin()] });

    expect(docxBlob).toBeInstanceOf(Blob);
  });

  it("handles lists with defaultBullets option", async () => {
    const md = `
- Bullet item 1
- Bullet item 2
`;
    const mdast = unified().use(remarkParse).parse(md);
    const docxBlob = await toDocx(
      mdast,
      {},
      { plugins: [listPlugin({ defaultBullets: true })] },
    );

    expect(docxBlob).toBeInstanceOf(Blob);
  });
});
