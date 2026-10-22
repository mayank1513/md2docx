import type {
  EmptyNode,
  Image,
  IPlugin,
  Parent,
  RootContent,
  SVG,
} from "@m2d/core";
import type * as docx from "docx";
import type { IImageOptions } from "docx";

export type ImageErrorMode = "warn" | "silent" | "throw" | "placeholder";
export type MermaidFallbackMode = "code" | "warn" | "silent";
export type SvgFallbackMode = "warn" | "code" | "silent";

export interface IImageErrorOptions {
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
  /**
   * Fallback strategy for failed non-Mermaid SVGs.
   * - "warn": Emits styled muted text badge `[Image: <alt or 'SVG unavailable'>]`.
   * - "code": Renders the raw SVG XML markup in a standard DOCX code block (`lang: "xml"`).
   * - "silent": Drops the node completely.
   * @default "warn"
   */
  svgFallback?: SvgFallbackMode;
  /**
   * Optional heading added above fallback code blocks (H6 level, maps to Heading 5 in Word).
   * - `false`: No heading is inserted (only the code block).
   * - `true`: Inserts an H6 heading (`###### ⚠️ Diagram Source (Render Fallback)`).
   * - `string`: Inserts custom heading text at H6 level.
   * @default true
   */
  collapsibleHeading?: boolean | string;
  /** Custom placeholder image source (path, URL, or data URL) */
  placeholder?: string;
}

export type INodeImageErrorOptions = IImageErrorOptions;

/**
 * Determines the MIME type of an image buffer using file signature detection.
 *
 * @param buffer - Binary image data as a Buffer or ArrayBuffer.
 * @returns Detected MIME type, or `undefined` if unknown.
 */
export const getImageMimeType = (
  buffer: Buffer | ArrayBuffer,
): "bmp" | "png" | "jpg" | "gif" | undefined => {
  const signatureArray = new Uint8Array(buffer).slice(0, 4);

  if (signatureArray[0] === 66 && signatureArray[1] === 77) return "bmp";

  const signature = signatureArray
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "")
    .toUpperCase();

  switch (signature) {
    case "89504E47":
      return "png";
    case "47494638":
      return "gif";
    case "FFD8FFE0":
    case "FFD8FFE1":
    case "FFD8FFE2":
    case "FFD8FFE3":
    case "FFD8FFE8":
      return "jpg";
  }
};

let placeholderImg: IImageOptions | null = null;
let shouldEmitEmptyPlaceholder = false;

/**
 * Minimal 1x1 transparent GIF binary data (43 bytes).
 * Used as a fallback image so DOCX never contains 0-byte corrupt media files.
 */
export const TRANSPARENT_1X1_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

export interface IPlaceholderResolverOptions {
  placeholder?: string;
  imageResolver: (
    src: string,
    options?: unknown,
  ) => Promise<IImageOptions | { isError?: boolean; [key: string]: unknown }>;
}

/**
 * Generates and returns a placeholder image.
 * If a placeholder source is defined, attempts to resolve it; otherwise returns a valid 1x1 transparent GIF fallback.
 *
 * @param options - Image plugin configuration.
 * @returns Image options for the placeholder.
 */
export const getPlaceHolderImage = async (
  options: IPlaceholderResolverOptions,
): Promise<IImageOptions> => {
  if (!placeholderImg && options.placeholder && !shouldEmitEmptyPlaceholder) {
    shouldEmitEmptyPlaceholder = true;
    // skipcq: JS-0357
    placeholderImg = (await options.imageResolver(
      options.placeholder,
      options,
    )) as IImageOptions;
  } else if (!placeholderImg) {
    placeholderImg = {
      type: "gif",
      data: TRANSPARENT_1X1_GIF.buffer,
      transformation: {
        width: 200,
        height: 200,
      },
      // @ts-expect-error -- internal marker to prevent cache poisoning
      isPlaceholder: true,
    };
  }
  return placeholderImg as IImageOptions;
};

/**
 * Generates fallback docx runs for failed image or diagram resolution.
 */
export const createFallbackRuns = (
  docxModule: typeof docx,
  data: Record<string, unknown>,
  options?: IImageErrorOptions,
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

  const altText = data?.altText as { name?: string } | undefined;
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

/**
 * Replaces a failed image/diagram AST node with its configured fallback markup (code block or heading).
 */
export const handleImageErrorFallback = (
  node: Image | SVG,
  parent: Parent | undefined,
  grandparent: Parent | undefined,
  options: IImageErrorOptions | undefined,
  resolved: unknown,
  existingData?: unknown,
): void => {
  const isError = Boolean((resolved as { isError?: boolean })?.isError);
  if (!isError || !parent || !grandparent?.children) return;

  const isMermaid = Boolean(
    (existingData as { mermaid?: string } | undefined)?.mermaid ||
      (node as SVG).data?.mermaid,
  );
  const mermaidFallback =
    options?.mermaidFallback ??
    (options?.errorMode === "silent" ? "silent" : "code");
  const svgFallback = options?.svgFallback ?? "warn";
  const isSoloParagraph =
    parent.type === "paragraph" && parent.children?.length === 1;

  if (isMermaid && isSoloParagraph) {
    const mermaidCode = String(
      (existingData as { mermaid?: string } | undefined)?.mermaid ??
        (node as SVG).data?.mermaid ??
        "",
    );
    if (mermaidFallback === "code") {
      const replacement: RootContent[] = [];
      if (options?.collapsibleHeading !== false) {
        const headingText =
          typeof options?.collapsibleHeading === "string"
            ? options.collapsibleHeading
            : "⚠️ Mermaid Diagram Source (Render Fallback)";
        replacement.push({
          type: "heading",
          depth: 6,
          children: [{ type: "text", value: headingText }],
        });
      }
      replacement.push({
        type: "code",
        lang: "mermaid",
        value: mermaidCode,
      });
      const idx = grandparent.children.indexOf(parent as RootContent);
      if (idx !== -1) {
        grandparent.children.splice(idx, 1, ...replacement);
      }
    } else if (mermaidFallback === "silent") {
      const idx = grandparent.children.indexOf(parent as RootContent);
      if (idx !== -1) {
        grandparent.children.splice(idx, 1);
      }
    }
  } else if (node.type === "svg" && !isMermaid && isSoloParagraph) {
    if (svgFallback === "code") {
      const svgVal =
        typeof (node as SVG).value === "string"
          ? (node as SVG).value
          : (existingData as { svg?: string } | undefined)?.svg;
      const replacement: RootContent[] = [];
      if (options?.collapsibleHeading !== false) {
        const headingText =
          typeof options?.collapsibleHeading === "string"
            ? options.collapsibleHeading
            : "⚠️ SVG Markup (Render Fallback)";
        replacement.push({
          type: "heading",
          depth: 6,
          children: [{ type: "text", value: headingText }],
        });
      }
      replacement.push({
        type: "code",
        lang: "xml",
        value: svgVal as string,
      });
      const idx = grandparent.children.indexOf(parent as RootContent);
      if (idx !== -1) {
        grandparent.children.splice(idx, 1, ...replacement);
      }
    } else if (svgFallback === "silent") {
      const idx = grandparent.children.indexOf(parent as RootContent);
      if (idx !== -1) {
        grandparent.children.splice(idx, 1);
      }
    }
  } else if (options?.errorMode === "silent" && isSoloParagraph) {
    const idx = grandparent.children.indexOf(parent as RootContent);
    if (idx !== -1) {
      grandparent.children.splice(idx, 1);
    }
  }
};

/**
 * Standard inline DOCX run generation hook for images and SVGs.
 */
export const createImageInlineHook = (
  options?: IImageErrorOptions,
): IPlugin["inline"] => {
  return (docx, node, runProps) => {
    if (/^(image|svg)/.test(node.type)) {
      (node as EmptyNode)._type = node.type;
      node.type = "";
      const data = (node as Image).data as
        | (Record<string, unknown> & Partial<IImageOptions>)
        | undefined;
      if (data && "isError" in data && data.isError) {
        return createFallbackRuns(docx, data, options, runProps);
      }
      return [new docx.ImageRun({ ...(data as IImageOptions), ...runProps })];
    }
    return [];
  };
};
