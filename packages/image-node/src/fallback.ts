import type * as docx from "docx";

export type ImageErrorMode = "warn" | "silent" | "throw" | "placeholder";
export type MermaidFallbackMode = "code" | "warn" | "silent";

export interface INodeImageErrorOptions {
  /**
   * General image error behavior.
   * - "warn": Emits a styled, muted text run with alt text.
   * - "silent": Drops the node completely (0 relationships, 0 XML overhead).
   * - "throw": Rejects the toDocx conversion promise with the underlying Error.
   * - "placeholder": Uses custom options.placeholder image. If placeholder is omitted, emits a warning badge.
   * @default "warn"
   */
  errorMode?: ImageErrorMode;
  /**
   * Fallback strategy specifically for failed Mermaid diagrams (when data.mermaid is present).
   * - "code": Renders the raw Mermaid diagram definition as a formatted monospace code block.
   * - "warn": Emits a warning badge [Mermaid Diagram Error: ...].
   * - "silent": Drops the node completely.
   * @default "code" (or inherits "silent" if errorMode is "silent")
   */
  mermaidFallback?: MermaidFallbackMode;
  /** Custom placeholder image source (path, URL, or data URL) */
  placeholder?: string;
}

/**
 * Generates fallback docx runs for failed image or diagram resolution in Node.js.
 */
export const createFallbackRuns = (
  docxModule: typeof docx,
  data: Record<string, unknown>,
  options?: INodeImageErrorOptions,
  runProps?: Record<string, unknown>,
): docx.TextRun[] => {
  const errorMode = options?.errorMode ?? "warn";
  const mermaidFallback =
    options?.mermaidFallback ?? (errorMode === "silent" ? "silent" : "code");

  if (data?.mermaid) {
    if (mermaidFallback === "silent") {
      return [];
    }
    if (mermaidFallback === "code") {
      const lines = String(data.mermaid).split("\n");
      const runs: docx.TextRun[] = [];
      lines.forEach((line: string, index: number) => {
        runs.push(
          new docxModule.TextRun({
            text: line,
            font: "Consolas",
            size: 19,
            color: "24292F",
            ...runProps,
            break: index > 0 ? 1 : 0,
          }),
        );
      });
      return runs;
    }
    const errorObj = data.error as Error | undefined;
    const msg = errorObj?.message ?? "render failed";
    return [
      new docxModule.TextRun({
        text: `⚠️ [Mermaid Diagram Error: ${msg}]`,
        italics: true,
        color: "C00000",
        ...runProps,
      }),
    ];
  }

  if (errorMode === "silent") {
    return [];
  }

  if (data?.errorReason === "placeholder-not-configured") {
    const altText = data.altText as { name?: string } | undefined;
    const label = altText?.name || "Image";
    return [
      new docxModule.TextRun({
        text: `⚠️ [${label} Error: placeholder not configured]`,
        italics: true,
        color: "C00000",
        ...runProps,
      }),
    ];
  }

  const altText = data.altText as { name?: string } | undefined;
  const alt = altText?.name;
  return [
    new docxModule.TextRun({
      text: alt ? `[Image: ${alt}]` : "[Image unavailable]",
      italics: true,
      color: "71717A",
      ...runProps,
    }),
  ];
};
