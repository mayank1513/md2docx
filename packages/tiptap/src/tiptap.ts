import type { IDocxProps, ISectionProps } from "@m2d/core";
import { type Mdast2DocxPluginProps, md2docx } from "@m2d/md2docx";
import type { CommandProps } from "@tiptap/core";
import { Extension } from "@tiptap/core";

export const FRONTMATTER_REGEX =
  /^(---\r?\n[\s\S]*?\r?\n---|^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+)\r?\n?/;

/**
 * Repairs unclosed frontmatter where a ProseMirror/Tiptap serializer stripped the closing delimiter.
 */
export const repairFrontmatter = (content: string): string => {
  if (typeof content !== "string" || !content) return "";
  if (FRONTMATTER_REGEX.test(content)) return content;

  const isYaml = content.startsWith("---\n") || content.startsWith("---\r\n");
  const isToml = content.startsWith("+++\n") || content.startsWith("+++\r\n");
  if (!isYaml && !isToml) return content;

  const delimiter = isYaml ? "---" : "+++";
  const lines = content.split(/\r?\n/);
  let closingIndex = -1;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === delimiter) {
      return content;
    }
    const trimmed = line.trim();
    if (
      trimmed.startsWith("# ") ||
      trimmed.startsWith("## ") ||
      trimmed.startsWith("### ") ||
      trimmed.startsWith("> ") ||
      trimmed.startsWith("```")
    ) {
      closingIndex = i;
      break;
    }
    if (trimmed === "" && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (
        nextLine.startsWith("#") ||
        nextLine.startsWith(">") ||
        nextLine.startsWith("```") ||
        (!nextLine.includes(":") && nextLine !== "")
      ) {
        closingIndex = i;
        break;
      }
    }
  }

  if (closingIndex > 0) {
    const repairedLines = [
      ...lines.slice(0, closingIndex),
      delimiter,
      ...lines.slice(closingIndex),
    ];
    return repairedLines.join("\n");
  }

  return content;
};

/**
 * Splits markdown content into frontmatter header and body text.
 */
export const splitFrontmatter = (content: string) => {
  if (typeof content !== "string") return { frontmatter: "", body: "" };
  const repaired = repairFrontmatter(content);
  const match = repaired.match(FRONTMATTER_REGEX);
  if (!match) return { frontmatter: "", body: content };
  const frontmatter = match[0];
  const body = repaired.slice(frontmatter.length);
  return { frontmatter, body };
};

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

  /**
   * Automatically preserve YAML/TOML frontmatter delimiters outside ProseMirror canvas.
   * @default true
   */
  preserveFrontmatter?: boolean;
}

export interface DocxStorage {
  /**
   * Preserved YAML or TOML frontmatter string (including delimiters).
   */
  frontmatter: string;
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

      /**
       * Set markdown content with automatic frontmatter extraction and preservation.
       */
      setDocxContent: (
        content: string,
        options?: { emitUpdate?: boolean },
      ) => (props: CommandProps) => boolean;

      /**
       * Retrieve full markdown content, recombining preserved frontmatter with body markdown.
       */
      getDocxMarkdown: () => (props: CommandProps) => string;

      /**
       * Get current preserved frontmatter string.
       */
      getFrontmatter: () => (props: CommandProps) => string;

      /**
       * Set or update preserved frontmatter string.
       */
      setFrontmatter: (frontmatter: string) => (props: CommandProps) => boolean;
    };
  }

  interface Storage {
    docx: DocxStorage;
  }
}

/**
 * Extracts Markdown or HTML content from a Tiptap editor instance,
 * automatically preserving or repairing frontmatter delimiters.
 */
export const getEditorContent = (editor: unknown): string => {
  const ed = editor as {
    storage?: {
      docx?: DocxStorage;
      markdown?: { getMarkdown?: () => string };
    };
    getMarkdown?: () => string;
    getHTML?: () => string;
  };

  let body = "";
  if (typeof ed?.storage?.markdown?.getMarkdown === "function") {
    body = ed.storage.markdown.getMarkdown();
  } else if (typeof ed?.getMarkdown === "function") {
    body = ed.getMarkdown();
  } else if (typeof ed?.getHTML === "function") {
    body = ed.getHTML();
  }

  // 1. If DocxExtension stored frontmatter, reattach it to the markdown
  const preservedFrontmatter = ed?.storage?.docx?.frontmatter;
  if (preservedFrontmatter) {
    const match = body.match(FRONTMATTER_REGEX);
    if (!match) {
      return `${preservedFrontmatter.trimEnd()}\n\n${body.trimStart()}`;
    }
  }

  // 2. If editor stripped the bottom delimiter from frontmatter, automatically repair it
  return repairFrontmatter(body);
};

export const getDocxMarkdown = getEditorContent;

/**
 * Sets editor content with automatic frontmatter extraction and preservation.
 */
export const setDocxContent = (
  editor: unknown,
  content: string,
  options?: { emitUpdate?: boolean },
): boolean => {
  const ed = editor as {
    extensionManager?: {
      extensions: Array<{
        name: string;
        options?: DocxExtensionOptions;
        storage?: DocxStorage;
      }>;
    };
    commands?: {
      setContent?: (
        content: string,
        options?: { contentType?: string; emitUpdate?: boolean },
      ) => boolean;
    };
  };

  if (!ed?.commands?.setContent) return false;

  const ext = ed.extensionManager?.extensions?.find((e) => e.name === "docx");
  let body = content;

  if (
    ext?.options?.preserveFrontmatter !== false &&
    typeof content === "string"
  ) {
    const { frontmatter, body: extractedBody } = splitFrontmatter(content);
    if (ext?.storage) {
      ext.storage.frontmatter = frontmatter;
    }
    if ((ed as { storage?: { docx?: DocxStorage } }).storage?.docx) {
      (ed as { storage: { docx: DocxStorage } }).storage.docx.frontmatter =
        frontmatter;
    }
    body = extractedBody;
  }

  return ed.commands.setContent(body, {
    contentType: "markdown",
    emitUpdate: options?.emitUpdate ?? true,
  });
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
 * Tiptap extension to export rich-text editor content directly to Word (.docx) documents,
 * with native frontmatter delimiter preservation and recovery.
 */
export const DocxExtension = Extension.create<
  DocxExtensionOptions,
  DocxStorage
>({
  name: "docx",
  priority: 1000,

  addOptions: () => ({
    defaultFilename: "document.docx",
    preserveFrontmatter: true,
  }),

  addStorage: () => ({
    frontmatter: "",
  }),

  onBeforeCreate() {
    if (
      this.options.preserveFrontmatter &&
      typeof this.editor.options.content === "string"
    ) {
      const { frontmatter, body } = splitFrontmatter(
        this.editor.options.content,
      );
      if (frontmatter) {
        this.storage.frontmatter = frontmatter;
        this.editor.options.content = body;
      }
    }
  },

  addCommands: () => ({
    getDocxBlob:
      (options?: DocxExportOptions) =>
      ({ editor }: CommandProps) =>
        getDocxBlob(editor, options, getDocxOptions(editor)),

    downloadDocx:
      (filename?: string, options?: DocxExportOptions) =>
      ({ editor }: CommandProps) =>
        downloadDocx(editor, filename, options, getDocxOptions(editor)),

    setDocxContent:
      (content: string, options?: { emitUpdate?: boolean }) =>
      ({ editor, tr }: CommandProps) => {
        tr.setMeta("preventDispatch", true);
        return setDocxContent(editor, content, options);
      },

    getDocxMarkdown:
      () =>
      ({ editor }: CommandProps) =>
        getEditorContent(editor),

    getFrontmatter:
      () =>
      ({ editor }: CommandProps) => {
        const ext = editor.extensionManager.extensions.find(
          (e) => e.name === "docx",
        ) as { storage?: DocxStorage } | undefined;
        return ext?.storage?.frontmatter ?? "";
      },

    setFrontmatter:
      (frontmatter: string) =>
      ({ editor }: CommandProps) => {
        const ext = editor.extensionManager.extensions.find(
          (e) => e.name === "docx",
        ) as { storage?: DocxStorage } | undefined;
        let updated = false;
        if (ext?.storage) {
          ext.storage.frontmatter = frontmatter;
          updated = true;
        }
        if ((editor.storage as { docx?: DocxStorage })?.docx) {
          (editor.storage as { docx: DocxStorage }).docx.frontmatter =
            frontmatter;
          updated = true;
        }
        return updated;
      },
  }),
});

export const Docx = DocxExtension;
