/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

import { toDocx } from "@m2d/core";
import { describe, expect, test } from "vitest";
import {
  extractFrontmatterNode,
  frontmatterPlugin,
  parseFrontmatter,
} from "./frontmatter";

describe("parseFrontmatter", () => {
  test("should parse YAML with lists, strings, and numbers", () => {
    const raw = `
title: "Modern Architecture"
author: "Mayank Chaudhari"
revision: 3
published: true
tags:
  - docx
  - markdown
  - typescript
`;
    const res = parseFrontmatter(raw);
    expect(res.title).toBe("Modern Architecture");
    expect(res.author).toBe("Mayank Chaudhari");
    expect(res.revision).toBe(3);
    expect(res.published).toBe(true);
    expect(res.tags).toEqual(["docx", "markdown", "typescript"]);
  });

  test("should preserve '#' in quotes and URLs without comment truncation", () => {
    const raw = `
title: "C# Guide"
url: "https://example.com/#section"
commented: Value # this is actual comment
`;
    const res = parseFrontmatter(raw);
    expect(res.title).toBe("C# Guide");
    expect(res.url).toBe("https://example.com/#section");
    expect(res.commented).toBe("Value");
  });

  test("should handle escaped double quotes and doubled single quotes", () => {
    const raw = `
doubleQuoted: "The \\"#1\\" Guide" # comment
singleQuoted: 'The ''Best'' Guide' # another comment
pathWithBackslash: "Path ending in backslash\\\\" # comment
`;
    const res = parseFrontmatter(raw);
    expect(res.doubleQuoted).toBe('The "#1" Guide');
    expect(res.singleQuoted).toBe("The 'Best' Guide");
    expect(res.pathWithBackslash).toBe("Path ending in backslash\\");
  });

  test("should parse inline bracketed arrays with typed values and quoted commas", () => {
    const raw = `keywords: ["React, Next.js", true, 42]`;
    const res = parseFrontmatter(raw);
    expect(res.keywords).toEqual(["React, Next.js", true, 42]);
  });

  test("should parse null and tilde as null values", () => {
    const raw = `
title: null
desc: ~
`;
    const res = parseFrontmatter(raw);
    expect(res.title).toBeNull();
    expect(res.desc).toBeNull();
  });

  test("should parse basic TOML front-matter using '=' separator and ignore tables/array-of-tables", () => {
    const raw = `
title = "Basic TOML Guide"
author = "Alice"
version = 2
enabled = true

[metadata]
category = "Docs"

[[authors]]
name = "Bob"
`;
    const res = parseFrontmatter(raw, "toml");
    expect(res.title).toBe("Basic TOML Guide");
    expect(res.author).toBe("Alice");
    expect(res.version).toBe(2);
    expect(res.enabled).toBe(true);
    expect((res as any)["[metadata]"]).toBeUndefined();
    expect((res as any)["[[authors]]"]).toBeUndefined();
  });

  test("should parse advanced TOML or YAML when custom parser is provided", () => {
    const raw = `
[package]
title = "Advanced TOML"
`;
    const plugin = frontmatterPlugin(undefined, {
      parser: (input, type) => {
        if (type === "toml") {
          return { title: "Custom Parsed TOML" };
        }
        return parseFrontmatter(input, type);
      },
    });

    const docxProps: any = {};
    const ast: any = {
      type: "root",
      children: [{ type: "toml", value: raw }],
    };

    plugin.preprocess?.(ast, {}, docxProps);
    expect(docxProps.title).toBe("Custom Parsed TOML");
  });
});

describe("extractFrontmatterNode", () => {
  test("should find yaml or toml node in AST", () => {
    const ast: any = {
      type: "root",
      children: [{ type: "yaml", value: "title: Test" }],
    };
    const node = extractFrontmatterNode(ast);
    expect(node?.value).toBe("title: Test");
  });
});

describe("frontmatterPlugin metadata normalization", () => {
  test("should populate document properties from AST during preprocess", () => {
    const plugin = frontmatterPlugin();
    const props: any = {};
    const ast: any = {
      type: "root",
      children: [
        {
          type: "yaml",
          value: `
title: "Plugin Title"
author: "Plugin Author"
tags: ["Docx, OpenXML", Markdown]
department: "Engineering"
`,
        },
      ],
    };

    plugin.preprocess?.(ast, {}, props);

    expect(props.title).toBe("Plugin Title");
    expect(props.creator).toBe("Plugin Author");
    expect(props.keywords).toBe("Docx, OpenXML, Markdown");
    expect(props.customProperties).toContainEqual({
      name: "department",
      value: "Engineering",
    });
  });

  test("should skip null, undefined, objects, and forbidden prototype keys", () => {
    const plugin = frontmatterPlugin(undefined, {
      parser: () => ({
        title: "Valid",
        __proto__: "evil",
        nested: { child: true },
        emptyVal: null,
        undefVal: undefined,
      }),
    });
    const props: any = {};
    const ast: any = {
      type: "root",
      children: [
        {
          type: "yaml",
          value: "title: Valid",
        },
      ],
    };

    plugin.preprocess?.(ast, {}, props);

    expect(props.title).toBe("Valid");
    expect(Object.getPrototypeOf(props)).not.toBe("evil");
    expect(
      props.customProperties?.some((p: any) => p.name === "__proto__"),
    ).toBeFalsy();
    expect(
      props.customProperties?.some((p: any) => p.name === "nested"),
    ).toBeFalsy();
    expect(
      props.customProperties?.some((p: any) => p.name === "emptyVal"),
    ).toBeFalsy();
  });

  test("should support custom transform function", () => {
    const plugin = frontmatterPlugin(undefined, {
      transform: (data, props) => {
        props.title = `Transformed: ${data.title}`;
      },
    });

    const props: any = {};
    const ast: any = {
      type: "root",
      children: [{ type: "yaml", value: "title: Custom" }],
    };

    plugin.preprocess?.(ast, {}, props);
    expect(props.title).toBe("Transformed: Custom");
  });

  describe("Cover Page generation", () => {
    test("should synthesize a cover page and remove matching duplicate body heading", () => {
      const plugin = frontmatterPlugin(undefined, {
        coverPage: true,
      });

      const props: any = {};
      const ast: any = {
        type: "root",
        children: [
          {
            type: "yaml",
            value: `
title: "Technical Specification"
description: "Architecture overview for v2"
author: "Engineering Lead"
date: "2026-10-25"
version: "2.0.0"
`,
          },
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "Technical Specification" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", value: "This is body content." }],
          },
        ],
      };

      plugin.preprocess?.(ast, {}, props);

      // Total children should now have: yaml, cover Title H1, Subtitle, ThematicBreak, Author, Date, Version, PageBreak, and Body Paragraph (duplicate H1 removed)
      const nonYaml = ast.children.filter((c: any) => c.type !== "yaml");
      expect(nonYaml[0].type).toBe("heading");
      expect(nonYaml[0].children[0].value).toBe("Technical Specification");

      expect(nonYaml[1].type).toBe("paragraph");
      expect(nonYaml[1].children[0].type).toBe("emphasis");
      expect(nonYaml[1].children[0].children[0].value).toBe(
        "Architecture overview for v2",
      );

      expect(nonYaml[2].type).toBe("thematicBreak");

      // Check author line
      expect(nonYaml[3].children[1].value).toBe("Engineering Lead");
      // Check date line
      expect(nonYaml[4].children[1].value).toBe("2026-10-25");
      // Check version line
      expect(nonYaml[5].children[1].value).toBe("2.0.0");

      // Check page break paragraph
      expect(nonYaml[6].data?.pageBreakBefore).toBe(true);

      // Body paragraph
      expect(nonYaml[7].children[0].value).toBe("This is body content.");
    });

    test("should retain duplicate heading when removeMatchingHeading is false", () => {
      const plugin = frontmatterPlugin(undefined, {
        coverPage: {
          removeMatchingHeading: false,
          organization: "OpenSource Org",
        },
      });

      const props: any = {};
      const ast: any = {
        type: "root",
        children: [
          {
            type: "yaml",
            value: `title: "Guide"\nauthor: "Dev"`,
          },
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "Guide" }],
          },
        ],
      };

      plugin.preprocess?.(ast, {}, props);

      const headings = ast.children.filter((c: any) => c.type === "heading");
      expect(headings.length).toBe(2); // Cover title + body title
      const orgLine = ast.children.find(
        (c: any) => c.children?.[1]?.value === "OpenSource Org",
      );
      expect(orgLine).toBeDefined();
    });
  });

  describe("Metadata Info-Box generation", () => {
    test("should insert blockquote info-box after first H1 heading", () => {
      const plugin = frontmatterPlugin(undefined, {
        infoBox: {
          header: "Document Metadata",
        },
      });

      const props: any = {};
      const ast: any = {
        type: "root",
        children: [
          {
            type: "yaml",
            value: `
title: "API Reference"
author: "Doc Writer"
date: "2026-10-25"
status: "Draft"
`,
          },
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "API Reference" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", value: "First body paragraph." }],
          },
        ],
      };

      plugin.preprocess?.(ast, {}, props);

      // Info-box should be placed at index 2 (right after heading at index 1)
      const infoBox = ast.children[2];
      expect(infoBox.type).toBe("blockquote");
      expect(infoBox.children[0].children[0].children[0].value).toBe(
        "Document Metadata",
      );
      expect(infoBox.children[1].children[1].value).toBe("Doc Writer");
      expect(infoBox.children[2].children[1].value).toBe("2026-10-25");
      expect(infoBox.children[3].children[1].value).toBe("Draft");
    });

    test("should insert info-box as table when format is table", () => {
      const plugin = frontmatterPlugin(undefined, {
        infoBox: {
          format: "table",
          position: "top",
        },
      });

      const props: any = {};
      const ast: any = {
        type: "root",
        children: [
          {
            type: "yaml",
            value: `author: "Scientist"\ncategory: "Research"`,
          },
          {
            type: "paragraph",
            children: [{ type: "text", value: "Paper content." }],
          },
        ],
      };

      plugin.preprocess?.(ast, {}, props);

      const tableNode = ast.children[1];
      expect(tableNode.type).toBe("table");
      expect(tableNode.children[0].type).toBe("tableRow"); // header
      expect(tableNode.children[1].children[1].children[0].value).toBe(
        "Scientist",
      );
    });

    test("should generate distinct DOCX sections for coverPage only vs coverPage + infoBox", async () => {
      const yamlContent = `
title: "md2docx Feature Showcase"
author: "Mayank Chaudhari"
description: "A complete demonstration of Markdown to native DOCX conversion"
keywords: "docx, markdown, openxml, remark"
`;
      const createAst = () => ({
        type: "root",
        children: [
          { type: "yaml", value: yamlContent },
          {
            type: "heading",
            depth: 1,
            children: [{ type: "text", value: "md2docx Feature Showcase" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", value: "Body paragraph content." }],
          },
        ],
      });

      const p1 = frontmatterPlugin(undefined, {
        coverPage: true,
        infoBox: false,
      });
      const p2 = frontmatterPlugin(undefined, {
        coverPage: true,
        infoBox: true,
      });

      const ast1: any = createAst();
      const ast2: any = createAst();

      p1.preprocess?.(ast1, {}, {});
      p2.preprocess?.(ast2, {}, {});

      // Cover page only produces 6 children; Cover page + infobox produces 7 (including blockquote)
      expect(ast2.children.length).toBeGreaterThan(ast1.children.length);
      expect(
        ast2.children.some((c: { type: string }) => c.type === "blockquote"),
      ).toBe(true);

      const blob1 = (await toDocx(ast1, {}, { plugins: [p1] })) as Blob;
      const blob2 = (await toDocx(ast2, {}, { plugins: [p2] })) as Blob;

      expect(blob1).toBeInstanceOf(Blob);
      expect(blob2).toBeInstanceOf(Blob);
      expect(blob2.size).toBeGreaterThan(blob1.size);
    });
  });
});
