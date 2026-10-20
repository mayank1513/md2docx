import path from "node:path";
import type {
  Image as AstImage,
  EmptyNode,
  ImageReference,
  IPlugin,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
  SVG,
} from "@m2d/core";
import type { Definitions } from "@m2d/core/utils";
import {
  createFallbackRuns,
  type ImageErrorMode,
  type MermaidFallbackMode,
} from "./fallback";

export type { ImageErrorMode, MermaidFallbackMode };

import type { IImageOptions } from "docx";
import sharp from "sharp";

/** Supported raster image MIME types for DOCX */
export const SUPPORTED_IMAGE_TYPES = ["jpg", "png", "gif", "bmp"] as const;
export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

/** Maps DOCX image types to Sharp format identifiers */
const toSharpFormat = (
  format: "jpg" | "png" | "gif",
): "jpeg" | "png" | "gif" => (format === "jpg" ? "jpeg" : format);

export interface NodeImageErrorData {
  isError: true;
  error?: Error;
  errorReason?: string;
  data: Buffer;
  type: "png";
  transformation: { width: number; height: number };
}

/**
 * Resolves an image source URL or buffer into docx IImageOptions.
 */
export type NodeImageResolver = (
  src: string,
  options?: INodeImagePluginOptions,
  node?: AstImage | SVG,
) => Promise<IImageOptions | NodeImageErrorData>;

export interface INodeImagePluginOptions {
  /** Optional directory prefix for resolving relative local file paths */
  pathPrefix?: string;
  /** Fallback image format if original format is unsupported. @default "png" */
  fallbackImageType?: "png" | "jpg" | "gif";
  /** Max image width in inches (default: 6) */
  maxW?: number;
  /** Max image height in inches (default: 8) */
  maxH?: number;
  /** Resolution in DPI for computing physical dimensions (default: 96) */
  dpi?: number;
  /** Optional custom resolver */
  imageResolver?: NodeImageResolver;
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
 * Normalizes dimension constraints respecting aspect ratio and maxW/maxH.
 */
const calculateDimensions = (
  width: number,
  height: number,
  options?: INodeImagePluginOptions,
): { width: number; height: number } => {
  const maxW = options?.maxW ?? 6;
  const maxH = options?.maxH ?? 8;
  const dpi = options?.dpi ?? 96;

  const maxPixelW = maxW * dpi;
  const maxPixelH = maxH * dpi;

  const scale = Math.min(maxPixelW / width, maxPixelH / height, 1);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

/**
 * Extracts binary buffer and format from a Data URL (base64 or URL-encoded).
 */
const parseDataUrl = (
  dataUrl: string,
): { buffer: Buffer; mimeType: string } => {
  const matches = dataUrl.match(
    /^data:([^;,]+)?(?:;(charset=[^;,]+))?(;base64)?,(.*)$/s,
  );
  if (!matches) {
    throw new Error("Invalid Data URL");
  }
  const mimeType = matches[1] || "image/png";
  const isBase64 = Boolean(matches[3]);
  const rawData = matches[4];

  const buffer = isBase64
    ? Buffer.from(rawData, "base64")
    : Buffer.from(decodeURIComponent(rawData), "utf8");

  return { buffer, mimeType };
};

/**
 * Processes an image Buffer using sharp, determining dimensions and converting
 * unsupported formats to the fallback raster format.
 */
const processSharpBuffer = async (
  buffer: Buffer,
  options?: INodeImagePluginOptions,
  mimeTypeHint?: string,
): Promise<IImageOptions> => {
  const sharpImg = sharp(buffer);
  const metadata = await sharpImg.metadata();
  const rawW = metadata.width || 200;
  const rawH = metadata.height || 200;
  const transformation = calculateDimensions(rawW, rawH, options);

  const fallback = options?.fallbackImageType ?? "png";
  const rawFormat = (
    metadata.format ??
    mimeTypeHint?.split("/")[1] ??
    fallback
  ).toLowerCase();
  const docxType = (
    rawFormat === "jpeg" ? "jpg" : rawFormat
  ) as SupportedImageType;

  if (SUPPORTED_IMAGE_TYPES.includes(docxType)) {
    return {
      type: docxType,
      data: buffer,
      transformation,
    };
  }

  // Convert SVG or unsupported formats (webp, avif, tiff) to raster PNG/JPEG
  const convertedBuffer = await sharpImg
    .toFormat(toSharpFormat(fallback))
    .toBuffer();
  return {
    type: fallback,
    data: convertedBuffer,
    transformation,
  };
};

/**
 * Processes base64 or encoded data URLs via sharp.
 */
const handleDataUrls: NodeImageResolver = async (
  src: string,
  options?: INodeImagePluginOptions,
) => {
  const { buffer, mimeType } = parseDataUrl(src);
  return processSharpBuffer(buffer, options, mimeType);
};

/**
 * Fetches an external URL or reads a local file path via sharp.
 */
const handleNonDataUrls: NodeImageResolver = async (
  src: string,
  options?: INodeImagePluginOptions,
) => {
  let buffer: Buffer;

  if (/^https?:\/\//i.test(src)) {
    const response = await fetch(src);
    if (!response.ok) {
      throw new Error(`Failed to fetch image ${src}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    const prefix = options?.pathPrefix ?? "";
    const filePath = prefix ? path.resolve(prefix, src) : path.resolve(src);
    const fs = await import("node:fs/promises");
    buffer = await fs.readFile(filePath);
  }

  return processSharpBuffer(buffer, options);
};

/**
 * Processes SVG nodes (e.g. from Mermaid) in Node.js by rendering SVG string via sharp.
 */
const handleSvgNode = async (
  node: SVG,
  options?: INodeImagePluginOptions,
): Promise<IImageOptions> => {
  let svgString: string;
  if (typeof node.value === "string") {
    svgString = node.value;
  } else {
    const rendered = await node.value;
    svgString = rendered ? rendered.svg : "";
  }

  if (!svgString) {
    throw new Error("Empty SVG string encountered");
  }

  const buffer = Buffer.from(svgString, "utf8");
  const sharpImg = sharp(buffer);
  const metadata = await sharpImg.metadata();
  const rawW = metadata.width || 400;
  const rawH = metadata.height || 300;
  const transformation = calculateDimensions(rawW, rawH, options);

  const fallback = options?.fallbackImageType ?? "png";
  const convertedBuffer = await sharpImg
    .toFormat(toSharpFormat(fallback))
    .toBuffer();

  return {
    type: fallback,
    data: convertedBuffer,
    transformation,
  };
};

/**
 * Default Node image resolver that handles data URLs, remote URLs, local paths, and SVGs.
 */
export const defaultNodeImageResolver: NodeImageResolver = async (
  src: string,
  options?: INodeImagePluginOptions,
  node?: AstImage | SVG,
) => {
  try {
    if (node?.type === "svg") {
      return await handleSvgNode(node as SVG, options);
    }
    if (src.startsWith("data:")) {
      return await handleDataUrls(src, options);
    }
    return await handleNonDataUrls(src, options);
  } catch (error) {
    if (options?.errorMode === "throw") {
      throw error;
    }

    const isMermaid = Boolean(
      (node as { data?: { mermaid?: string } })?.data?.mermaid,
    );

    if (options?.errorMode === "placeholder" && !isMermaid) {
      if (options?.placeholder) {
        try {
          if (options.placeholder.startsWith("data:")) {
            return await handleDataUrls(options.placeholder, options);
          }
          return await handleNonDataUrls(options.placeholder, options);
        } catch (placeholderErr) {
          console.warn(
            `[m2d/image-node] Failed to load placeholder ${options.placeholder}:`,
            placeholderErr,
          );
        }
      } else {
        console.warn(
          "[m2d/image-node] errorMode is 'placeholder' but options.placeholder is not provided.",
        );
        const errorData: NodeImageErrorData = {
          isError: true,
          errorReason: "placeholder-not-configured",
          error: error as Error,
          data: Buffer.alloc(0),
          type: "png",
          transformation: { width: 1, height: 1 },
        };
        return errorData;
      }
    }

    console.error(`[m2d/image-node] Error resolving image: ${src}`, error);
    const errorData: NodeImageErrorData = {
      isError: true,
      error: error as Error,
      data: Buffer.alloc(0),
      type: "png",
      transformation: { width: 1, height: 1 },
    };
    return errorData;
  }
};

/**
 * Recursively traverses the AST to resolve all image and SVG nodes.
 */
const collectImagePromises = (
  node: Root | RootContent | PhrasingContent,
  promises: Promise<void>[],
  definitions: Definitions,
  resolver: NodeImageResolver,
  options?: INodeImagePluginOptions,
): void => {
  (node as Parent).children?.forEach((child) => {
    collectImagePromises(child, promises, definitions, resolver, options);
  });
  if (/^(image|svg)/.test(node.type)) {
    promises.push(
      (async () => {
        const url =
          (node as AstImage).url ??
          definitions[(node as ImageReference).identifier?.toUpperCase()] ??
          "";
        const alt =
          (node as AstImage).alt ??
          (url.startsWith("data:") ? "" : url.split("/").pop());

        const existingData = (node as AstImage).data;
        const resolved = await resolver(url, options, node as AstImage | SVG);
        node.data = {
          ...existingData,
          ...resolved,
          altText: existingData?.altText ?? {
            description: alt,
            name: alt,
            title: alt,
          },
        };
      })(),
    );
  }
};

/**
 * Node.js image plugin for @m2d/core.
 * Processes image and SVG nodes on the server using sharp.
 */
export const nodeImagePlugin: (options?: INodeImagePluginOptions) => IPlugin = (
  options,
) => {
  const resolver = options?.imageResolver ?? defaultNodeImageResolver;

  const preprocess = async (root: Root, definitions: Definitions) => {
    const promises: Promise<void>[] = [];
    collectImagePromises(root, promises, definitions, resolver, options);
    await Promise.all(promises);
  };

  return {
    preprocess,
    inline: (docx, node, runProps) => {
      if (/^(image|svg)/.test(node.type)) {
        (node as EmptyNode)._type = node.type;
        node.type = "";
        const data = (node as AstImage).data as
          | (Record<string, unknown> & Partial<IImageOptions>)
          | undefined;
        if (data && "isError" in data && data.isError) {
          return createFallbackRuns(docx, data, options, runProps);
        }
        return [new docx.ImageRun({ ...(data as IImageOptions), ...runProps })];
      }
      return [];
    },
  };
};

/** Alias for nodeImagePlugin */
export const imageNodePlugin = nodeImagePlugin;
