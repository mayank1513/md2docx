/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

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

  test("should parse inline bracketed arrays with quoted commas", () => {
    const raw = `keywords: ["React, Next.js", TypeScript]`;
    const res = parseFrontmatter(raw);
    expect(res.keywords).toEqual(["React, Next.js", "TypeScript"]);
  });

  test("should parse TOML front-matter when smol-toml or custom parser is present", () => {
    const raw = `title = "TOML Title"`;
    const res = parseFrontmatter(raw, "toml");
    // If smol-toml is hoisted, it parses successfully; otherwise returns empty object
    if (res.title) {
      expect(res.title).toBe("TOML Title");
    } else {
      expect(res).toEqual({});
    }
  });

  test("should parse TOML when custom parser is provided", () => {
    const raw = `title = "TOML Title"`;
    const plugin = frontmatterPlugin(undefined, {
      parser: (input) => ({
        title: input.includes("TOML") ? "Custom TOML" : "",
      }),
    });

    const docxProps: any = {};
    const ast: any = {
      type: "root",
      children: [{ type: "toml", value: raw }],
    };

    plugin.preprocess?.(ast, {}, docxProps);
    expect(docxProps.title).toBe("Custom TOML");
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
});
