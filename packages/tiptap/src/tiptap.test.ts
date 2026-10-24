/** biome-ignore-all lint/suspicious/noExplicitAny: Use of any is ok for test files */

import { describe, expect, it, vi } from "vitest";
import {
  Docx,
  DocxExtension,
  downloadDocx,
  getDocxBlob,
  getEditorContent,
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
  });
});
