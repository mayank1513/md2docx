/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

import { describe, expect, it, vi } from "vitest";
import {
  Docx,
  DocxExtension,
  downloadDocx,
  getDocxBlob,
  getDocxMarkdown,
  getEditorContent,
  repairFrontmatter,
  splitFrontmatter,
} from "./index";

vi.mock("@m2d/md2docx", () => ({
  md2docx: vi.fn(
    async () =>
      new Blob(["docx-content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
  ),
}));

describe("@m2d/tiptap", () => {
  it("extracts markdown from editor.storage.markdown", () => {
    const mockEditor = {
      storage: {
        markdown: {
          getMarkdown: () => "# Hello from storage markdown",
        },
      },
    };
    expect(getEditorContent(mockEditor)).toBe("# Hello from storage markdown");
  });

  it("extracts markdown from editor.getMarkdown()", () => {
    const mockEditor = {
      getMarkdown: () => "# Hello from getMarkdown",
    };
    expect(getEditorContent(mockEditor)).toBe("# Hello from getMarkdown");
  });

  it("falls back to editor.getHTML() if markdown is unavailable", () => {
    const mockEditor = {
      getHTML: () => "<p>Hello HTML</p>",
    };
    expect(getEditorContent(mockEditor)).toBe("<p>Hello HTML</p>");
  });

  it("returns empty string if editor provides no content methods", () => {
    expect(getEditorContent({})).toBe("");
  });

  it("generates a docx Blob from editor content via getDocxBlob", async () => {
    const mockEditor = {
      getMarkdown: () => "## Document Heading\n\nParagraph text.",
    };

    const blob = await getDocxBlob(mockEditor, {
      docxProps: { title: "Test Doc" },
    });

    expect(blob).toBeDefined();
    expect(blob instanceof Blob).toBe(true);
  });

  it("triggers browser download in downloadDocx", async () => {
    const mockEditor = {
      getMarkdown: () => "# Download Test",
    };

    const createObjectURLMock = vi.fn(() => "blob:http://localhost/mock-uuid");
    const revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const element = document.createElementNS(
        "http://www.w3.org/1999/xhtml",
        tag,
      );
      if (tag === "a") {
        element.click = clickMock;
      }
      return element;
    });

    await downloadDocx(mockEditor, "custom-export.docx");

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });

  it("registers extension name, alias, and commands correctly", () => {
    expect(DocxExtension.name).toBe("docx");
    expect(Docx).toBe(DocxExtension);

    const addCommands = DocxExtension.config.addCommands as (
      this: any,
    ) => Record<string, any>;
    const commands = addCommands?.call({});
    expect(commands).toBeDefined();
    expect(typeof commands.getDocxBlob).toBe("function");
    expect(typeof commands.downloadDocx).toBe("function");
    expect(typeof commands.setDocxContent).toBe("function");
    expect(typeof commands.getDocxMarkdown).toBe("function");
    expect(typeof commands.getFrontmatter).toBe("function");
    expect(typeof commands.setFrontmatter).toBe("function");
  });

  it("splits frontmatter correctly from markdown", () => {
    const raw = "---\ntitle: Hello\nauthor: John\n---\n# Content";
    const { frontmatter, body } = splitFrontmatter(raw);
    expect(frontmatter).toBe("---\ntitle: Hello\nauthor: John\n---\n");
    expect(body).toBe("# Content");
  });

  it("repairs frontmatter missing closing delimiter", () => {
    const broken =
      "---\ntitle: Broken Delimiter\nauthor: Antigravity\n\n# Body Heading";
    const repaired = repairFrontmatter(broken);
    expect(repaired).toContain(
      "---\ntitle: Broken Delimiter\nauthor: Antigravity\n---\n\n# Body Heading",
    );
  });

  it("getEditorContent reattaches preserved frontmatter from storage.docx", () => {
    const mockEditor = {
      storage: {
        docx: {
          frontmatter: "---\ntitle: Preserved in Storage\n---\n",
        },
        markdown: {
          getMarkdown: () => "# Body Content",
        },
      },
    };
    const content = getEditorContent(mockEditor);
    expect(content).toBe(
      "---\ntitle: Preserved in Storage\n---\n\n# Body Content",
    );
  });

  it("getEditorContent repairs unclosed frontmatter in markdown output", () => {
    const mockEditor = {
      getMarkdown: () => "---\ntitle: Unclosed\nauthor: Mayank\n\n# Main Title",
    };
    const content = getEditorContent(mockEditor);
    expect(content).toContain(
      "---\ntitle: Unclosed\nauthor: Mayank\n---\n\n# Main Title",
    );
  });

  it("handles new Editor instance with DocxExtension", () => {
    const { Editor } = require("@tiptap/core");
    const Document =
      require("@tiptap/extension-document").default ||
      require("@tiptap/extension-document");
    const Paragraph =
      require("@tiptap/extension-paragraph").default ||
      require("@tiptap/extension-paragraph");
    const Text =
      require("@tiptap/extension-text").default ||
      require("@tiptap/extension-text");

    const editor = new Editor({
      extensions: [Document, Paragraph, Text, DocxExtension],
      content: "---\ntitle: Real Editor\n---\n<p>Body</p>",
    });
    expect(editor.storage.docx.frontmatter).toBe(
      "---\ntitle: Real Editor\n---\n",
    );
    expect(editor.getHTML()).toContain("<p>Body</p>");

    editor.commands.setDocxContent("---\ntitle: Updated\n---\n<p>New Body</p>");
    expect(editor.storage.docx.frontmatter).toBe("---\ntitle: Updated\n---\n");
    expect(editor.getHTML()).toContain("<p>New Body</p>");
  });

  it("getDocxMarkdown returns the combined content with preserved frontmatter", () => {
    const mockEditor = {
      storage: {
        docx: {
          frontmatter: "---\ntitle: Test\n---\n",
        },
        markdown: {
          getMarkdown: () => "# Hello World",
        },
      },
    };
    expect(getDocxMarkdown(mockEditor)).toBe(
      "---\ntitle: Test\n---\n\n# Hello World",
    );
  });
});
