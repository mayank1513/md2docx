/** biome-ignore-all lint/suspicious/noExplicitAny: typecasting necessary */
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
import type { IImageOptions } from "docx";
import sharp from "sharp";

/** Supported raster image MIME types for DOCX */
export const SUPPORTED_IMAGE_TYPES = ["jpg", "png", "gif", "bmp"] as const;
export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

/** Maps DOCX image types to Sharp format identifiers */
const toSharpFormat = (
  format: "jpg" | "png" | "gif",
): "jpeg" | "png" | "gif" => (format === "jpg" ? "jpeg" : format);

/** Minimal 1x1 transparent GIF binary data fallback */
const TRANSPARENT_1X1_GIF = Buffer.from([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

/**
 * Resolves an image source URL or buffer into docx IImageOptions.
 */
export type NodeImageResolver = (
  src: string,
  options?: INodeImagePluginOptions,
  node?: AstImage | SVG,
) => Promise<IImageOptions>;

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
 * Processes base64 or encoded data URLs via sharp.
 */
const handleDataUrls: NodeImageResolver = async (
  src: string,
  options?: INodeImagePluginOptions,
) => {
  const { buffer, mimeType } = parseDataUrl(src);
  const sharpImg = sharp(buffer);
  const metadata = await sharpImg.metadata();
  const rawW = metadata.width || 200;
  const rawH = metadata.height || 200;
  const transformation = calculateDimensions(rawW, rawH, options);

  const fallback = options?.fallbackImageType ?? "png";
  const rawFormat = (
    metadata.format ??
    mimeType.split("/")[1] ??
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

  const sharpImg = sharp(buffer);
  const metadata = await sharpImg.metadata();
  const rawW = metadata.width || 200;
  const rawH = metadata.height || 200;
  const transformation = calculateDimensions(rawW, rawH, options);

  const fallback = options?.fallbackImageType ?? "png";
  const rawFormat = (metadata.format ?? fallback).toLowerCase();
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
    return {
      type: "gif",
      data: TRANSPARENT_1X1_GIF,
      transformation: { width: 1, height: 1 },
    };
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
    console.error(`[m2d/image-node] Error resolving image: ${src}`, error);
    return {
      type: "gif",
      data: TRANSPARENT_1X1_GIF,
      transformation: { width: 1, height: 1 },
      isPlaceholder: true,
    };
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

    const preprocessInternal = (node: Root | RootContent | PhrasingContent) => {
      (node as Parent).children?.forEach(preprocessInternal);
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

            node.data = {
              ...(await resolver(url, options, node as AstImage | SVG)),
              altText: { description: alt, name: alt, title: alt },
              ...(node as AstImage).data,
            };
          })(),
        );
      }
    };

    preprocessInternal(root);
    await Promise.all(promises);
  };

  return {
    preprocess,
    inline: (docx, node, runProps) => {
      if (/^(image|svg)/.test(node.type)) {
        (node as EmptyNode)._type = node.type;
        node.type = "";
        // @ts-expect-error -- extra props used for docx ImageRun
        return [new docx.ImageRun({ ...(node as AstImage).data, ...runProps })];
      }
      return [];
    },
  };
};

/** Alias for nodeImagePlugin */
export const imageNodePlugin = nodeImagePlugin;
