import type { IDocxProps, ISectionProps } from "@m2d/core";
import { type Mdast2DocxPluginProps, md2docx } from "@m2d/md2docx";
import type { CommandProps } from "@tiptap/core";
import { Extension } from "@tiptap/core";

export interface DocxExportOptions {
  /**
   * Filename to use when downloading the document.
   * @default "document.docx"
   */
  filename?: string;

  /**
   * Document metadata properties (e.g., title, creator, description, keywords).
   */
  docxProps?: IDocxProps;

  /**
   * Section properties (e.g., margins, page orientation, headerAst, footerAst).
   */
  sectionProps?: ISectionProps;

  /**
   * Sub-plugin options (mermaid, math, table, emoji, image, frontmatter).
   */
  pluginProps?: Mdast2DocxPluginProps;
}

export interface DocxExtensionOptions extends DocxExportOptions {
  /**
   * Default filename for downloaded docx files.
   * @default "document.docx"
   */
  defaultFilename?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    docx: {
      /**
       * Compile current editor content to a Word DOCX Blob.
       */
      getDocxBlob: (
        options?: DocxExportOptions,
      ) => (props: CommandProps) => Promise<Blob>;

      /**
       * Compile current editor content and trigger a browser download.
       */
      downloadDocx: (
        filename?: string,
        options?: DocxExportOptions,
      ) => (props: CommandProps) => Promise<void>;
    };
  }
}

/**
 * Extracts Markdown or HTML content from a Tiptap editor instance.
 */
export const getEditorContent = (editor: unknown): string => {
  const ed = editor as {
    storage?: { markdown?: { getMarkdown?: () => string } };
    getMarkdown?: () => string;
    getHTML?: () => string;
  };

  if (typeof ed?.storage?.markdown?.getMarkdown === "function") {
    return ed.storage.markdown.getMarkdown();
  }
  if (typeof ed?.getMarkdown === "function") {
    return ed.getMarkdown();
  }
  if (typeof ed?.getHTML === "function") {
    return ed.getHTML();
  }
  return "";
};

/**
 * Compiles Tiptap editor content into a native Microsoft Word (.docx) Blob.
 */
export const getDocxBlob = async (
  editor: unknown,
  options?: DocxExportOptions,
  defaultOptions?: DocxExtensionOptions,
): Promise<Blob> => {
  const content = getEditorContent(editor);
  const docxProps = { ...defaultOptions?.docxProps, ...options?.docxProps };
  const sectionProps = {
    ...defaultOptions?.sectionProps,
    ...options?.sectionProps,
  };
  const pluginProps = {
    ...defaultOptions?.pluginProps,
    ...options?.pluginProps,
  };

  const result = await md2docx(
    content,
    docxProps,
    sectionProps,
    "blob",
    pluginProps,
  );

  return result as Blob;
};

/**
 * Compiles Tiptap editor content and immediately triggers a client-side download.
 */
export const downloadDocx = async (
  editor: unknown,
  filename?: string,
  options?: DocxExportOptions,
  defaultOptions?: DocxExtensionOptions,
): Promise<void> => {
  const blob = await getDocxBlob(editor, options, defaultOptions);
  const targetFilename =
    filename ||
    options?.filename ||
    defaultOptions?.defaultFilename ||
    "document.docx";

  const finalName = targetFilename.endsWith(".docx")
    ? targetFilename
    : `${targetFilename}.docx`;

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const getDocxOptions = (
  editor: CommandProps["editor"],
): DocxExtensionOptions | undefined =>
  (
    editor.extensionManager.extensions.find((ext) => ext.name === "docx") as
      | { options?: DocxExtensionOptions }
      | undefined
  )?.options;

/**
 * Tiptap extension to export rich-text editor content directly to Word (.docx) documents.
 */
export const DocxExtension = Extension.create<DocxExtensionOptions>({
  name: "docx",

  addOptions: () => ({
    defaultFilename: "document.docx",
  }),

  addCommands: () => ({
    getDocxBlob:
      (options?: DocxExportOptions) =>
      ({ editor }: CommandProps) =>
        getDocxBlob(editor, options, getDocxOptions(editor)),

    downloadDocx:
      (filename?: string, options?: DocxExportOptions) =>
      ({ editor }: CommandProps) =>
        downloadDocx(editor, filename, options, getDocxOptions(editor)),
  }),
});

export const Docx = DocxExtension;
