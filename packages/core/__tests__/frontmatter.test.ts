/** biome-ignore-all lint/suspicious/noExplicitAny: required for testing */
import { describe, expect, it } from "vitest";
import { toDocx } from "../src";

describe("toDocx with frontmatter", () => {
  it("should capture basic frontmatter metadata into doc properties", async () => {
    let capturedProps: any = null;
    const testPlugin = {
      postprocess: () => {
        // Postprocess can inspect sections
      },
      root: (props: any) => {
        capturedProps = props;
      },
    };

    const ast = {
      type: "root" as const,
      children: [
        {
          type: "yaml" as const,
          value: `
title: "Automated Title"
author: "Test Author"
description: "Doc Description"
`,
        },
        {
          type: "paragraph" as const,
          children: [{ type: "text" as const, value: "Hello world" }],
        },
      ],
    };

    const blob = await toDocx(ast as any, {}, { plugins: [testPlugin] });

    expect(blob).toBeInstanceOf(Blob);
    expect(capturedProps?.title).toBe("Automated Title");
    expect(capturedProps?.creator).toBe("Test Author");
    expect(capturedProps?.description).toBe("Doc Description");
  });

  it("should allow explicit docxProps to override frontmatter metadata", async () => {
    let capturedProps: any = null;
    const testPlugin = {
      root: (props: any) => {
        capturedProps = props;
      },
    };

    const ast = {
      type: "root" as const,
      children: [
        {
          type: "yaml" as const,
          value: `title: "Original Title"`,
        },
      ],
    };

    await toDocx(
      ast as any,
      { title: "Explicit Override" },
      { plugins: [testPlugin] },
    );

    expect(capturedProps?.title).toBe("Explicit Override");
  });
});
