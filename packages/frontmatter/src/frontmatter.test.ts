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
});
