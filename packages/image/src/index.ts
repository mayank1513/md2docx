/** biome-ignore-all lint/style/noNonNullAssertion: done responsibly */

import {
  type CacheConfigType,
  createPersistentCache,
  simpleCleanup,
} from "@m2d/cache";
import type {
  Image,
  ImageReference,
  IPlugin,
  Optional,
  Parent,
  PhrasingContent,
  Root,
  RootContent,
  SVG,
} from "@m2d/core";
import type { Definitions } from "@m2d/core/utils";
import type { IImageOptions } from "docx";
import { fixGeneratedSvg, handleSvg } from "./svg-utils";
import {
  createImageInlineHook,
  getImageMimeType,
  handleImageErrorFallback,
  type ImageErrorMode,
  type MermaidFallbackMode,
  type SvgFallbackMode,
} from "./utils";

export type { ImageErrorMode, MermaidFallbackMode, SvgFallbackMode };

/**
 * List of supported image MIME types that can be embedded directly in DOCX.
 * SVG is intentionally excluded due to its special handling.
 */
const SUPPORTED_IMAGE_TYPES = ["jpeg", "jpg", "bmp", "gif", "png"] as const;

/** namespace used for cleaning up the idb cache */
const NAMESPACE = "img";

export interface ImageErrorData {
  isError: true;
  error?: Error;
  errorReason?: string;
  data: ArrayBuffer;
  type: "png";
  transformation: { width: number; height: number };
}

/**
 * A resolver function that transforms an image `src` into
 * a `docx`-compatible `IImageOptions` object.
 *
 * @param src - Base64 or URL image source.
 * @param options - Current plugin options.
 * @param node - Image or SVG node in the Markdown AST.
 */
export type ImageResolver = (
  src: string,
  options: IDefaultImagePluginOptions,
  node?: Image | SVG,
) => Promise<IImageOptions | ImageErrorData>;

/**
 * Full configuration for the image plugin including defaulted and required options.
 */
export interface IDefaultImagePluginOptions {
  /** Scale factor for base64 (data URL) images. @default 3 */
  scale: number;

  /** Fallback format to convert unsupported image types. @default "png" */
  fallbackImageType: "png" | "jpg";

  /** Quality factor (0–1). Applies only to lossy formats (`jpeg`/`webp`/`avif`). Default: `0.92`. */
  quality: number;

  /** Image resolution function used to convert URL/base64/SVG to image options */
  imageResolver: ImageResolver;

  /** Max image width (in inches) for inserted image */
  maxW: number;

  /** Max image height (in inches) for inserted image */
  maxH: number;

  /** Optional placeholder image (base64 or URL) used on errors */
  placeholder?: string;

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

  /**
   * In-memory cache object, useful for cache sharing across plugins/tabs.
   */
  cache?: Record<string, Promise<unknown>>;

  /** Configure caching */
  cacheConfig?: CacheConfigType<IImageOptions>;

  /**
   * Optional salt string used to differentiate cache keys for similar images (e.g., dark/light theme).
   */
  salt?: string;

  /** Target resolution in DPI for calculating physical dimensions */
  dpi: number;

  /** Duration in minutes after which cached records are removed as stale. Default: 7 days (10080 minutes). */
  maxAgeMinutes: number;

  /**
   * Applies generic fixes to known SVG rendering issues (e.g., Mermaid pie chart title alignment).
   * Designed to be overridden to handle tool-specific quirks in generated SVGs.
   *
   * @param svg - Raw SVG string to transform.
   * @param metadata - Optional metadata such as diagram type or render info.
   * @returns Modified SVG string.
   */

  // biome-ignore lint/suspicious/noExplicitAny: ok - coming from mermaid
  fixGeneratedSvg: (svg: string, metadata: any) => string;
}

/**
 * External plugin options accepted by consumers, omitting internal-only values.
 */
export type IImagePluginOptions = Optional<
  Omit<IDefaultImagePluginOptions, "dpi">
>;

/**
 * Handles base64 data URL images. Returns image options suitable for DOCX.
 * Converts unsupported types to canvas-based fallback.
 */
const handleDataUrls = async (
  src: string,
  options: IDefaultImagePluginOptions,
): Promise<IImageOptions> => {
  const scaleFactor = options.scale;
  const imgType = src.split(";")[0].split("/")[1];

  const img = new Image();
  img.src = src;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const width = img.width * scaleFactor;
  const height = img.height * scaleFactor;

  // skipcq: JS-0323
  // biome-ignore lint/suspicious/noExplicitAny: ok
  if (SUPPORTED_IMAGE_TYPES.includes(imgType as any)) {
    return {
      data: src,
      // @ts-expect-error -- imgType is known to be supported
      type: imgType,
      transformation: {
        width: width / scaleFactor,
        height: height / scaleFactor,
      },
    };
  }

  /* v8 ignore start */
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas context not available");

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  const fallbackImageType = options.fallbackImageType ?? "png";

  return {
    data: canvas.toDataURL(
      `image/${fallbackImageType === "jpg" ? "jpeg" : fallbackImageType}`,
    ),
    type: fallbackImageType,
    transformation: {
      width: width / scaleFactor,
      height: height / scaleFactor,
    },
  };
  /* v8 ignore stop */
};

/**
 * Fetches and processes external image URLs.
 * Automatically detects SVGs and delegates them to SVG handler.
 */
const handleNonDataUrls = async (
  url: string,
  options: IDefaultImagePluginOptions,
): Promise<IImageOptions> => {
  const response = await fetch(url);

  if (
    /(svg|xml)/.test(response.headers.get("content-type") ?? "") ||
    url.endsWith(".svg")
  ) {
    const svgText = await response.text();
    return handleSvg({ type: "svg", value: svgText }, options);
  }

  const arrayBuffer = await response.arrayBuffer();
  const mimeType = getImageMimeType(arrayBuffer) || "png";

  const imageBitmap = await createImageBitmap(
    new Blob([arrayBuffer], { type: mimeType }),
  );

  if (!SUPPORTED_IMAGE_TYPES.includes(mimeType)) {
    /* v8 ignore next 3 */
    console.warn(`${mimeType} not supported by docx. Using fallback.`);
    return handleDataUrls(url, options);
  }

  return {
    type: mimeType,
    data: arrayBuffer,
    transformation: {
      width: imageBitmap.width,
      height: imageBitmap.height,
    },
  };
};

/**
 * The default image resolver.
 * Detects source type and invokes the correct handler (SVG, base64, remote).
 * Computes final dimensions while respecting maxW/maxH and DPI.
 */
const defaultImageResolver: ImageResolver = async (src, options, node) => {
  try {
    const imgOptions = await (node?.type === "svg"
      ? handleSvg(node, options)
      : src.startsWith("data:")
        ? handleDataUrls(src, options)
        : handleNonDataUrls(src, options));

    const { width: origW, height: origH } = imgOptions.transformation;
    let { width, height } = (node as Image)?.data ?? {};

    /* v8 ignore start */
    // Fill in missing dimensions using aspect ratio
    if (width && !height) {
      height = (origH * width) / origW;
    } else if (!width && height) {
      width = (origW * height) / origH;
    } else if (!width && !height) {
      width = origW;
      height = origH;
    }
    /* v8 ignore end */

    // Enforce maxW/maxH constraints using DPI
    const scale = Math.min(
      // skipcq: JS-0339
      (options.maxW * options.dpi) / width!,
      // skipcq: JS-0339
      (options.maxH * options.dpi) / height!,
      1,
    );

    // @ts-expect-error -- mutating transformation
    imgOptions.transformation = {
      width: width! * scale,
      height: height! * scale,
    };
    return imgOptions;
  } catch (error) {
    if (options.errorMode === "throw") {
      throw error;
    }

    const isMermaid = Boolean(
      (node as { data?: { mermaid?: string } })?.data?.mermaid,
    );

    if (options.errorMode === "placeholder" && !isMermaid) {
      if (options.placeholder) {
        try {
          return await (options.placeholder.startsWith("data:")
            ? handleDataUrls(options.placeholder, options)
            : handleNonDataUrls(options.placeholder, options));
        } catch (placeholderErr) {
          console.warn(
            `[m2d/image] Failed to load placeholder ${options.placeholder}:`,
            placeholderErr,
          );
        }
      } else {
        console.warn(
          "[m2d/image] errorMode is 'placeholder' but options.placeholder is not provided.",
        );
        const errorData: ImageErrorData = {
          isError: true,
          errorReason: "placeholder-not-configured",
          error: error as Error,
          data: new ArrayBuffer(0),
          type: "png",
          transformation: { width: 1, height: 1 },
        };
        return errorData;
      }
    }

    console.error(`[m2d/image] Error resolving image: ${src}`, error);
    const errorData: ImageErrorData = {
      isError: true,
      error: error as Error,
      data: new ArrayBuffer(0),
      type: "png",
      transformation: { width: 1, height: 1 },
    };
    return errorData;
  }
};

/**
 * Default fallback plugin configuration.
 * `imageResolver` is wrapped in a persistent cache to avoid redundant work.
 */
const defaultOptions: IDefaultImagePluginOptions = {
  scale: 3,
  fallbackImageType: "png",
  quality: 0.92,
  imageResolver: defaultImageResolver,
  maxW: 6.3,
  maxH: 9.7,
  dpi: 96,
  errorMode: "warn",
  mermaidFallback: "code",
  svgFallback: "warn",
  collapsibleHeading: true,
  cacheConfig: {
    cacheMode: "both",
    ignoreKeys: ["dpi", "cacheConfig", "type", "alt"],
    parallel: true,
  },
  maxAgeMinutes: 7 * 24 * 60,
  fixGeneratedSvg,
};
/**
 * Predicate to determine whether an image result should be cached.
 * Prevents caching of placeholder fallbacks and empty image data.
 *
 * @param imgOpts - Resolved image options to validate.
 * @returns True if the image is valid and should be cached.
 */
const shouldCacheImage = (imgOpts: IImageOptions | ImageErrorData) => {
  if (!imgOpts) return false;
  if ("isPlaceholder" in imgOpts && imgOpts.isPlaceholder) return false;
  if ("isError" in imgOpts && imgOpts.isError) return false;
  if (!imgOpts.data) return false;
  if (typeof imgOpts.data === "string" && imgOpts.data.length === 0)
    return false;
  if (imgOpts.data instanceof ArrayBuffer && imgOpts.data.byteLength === 0)
    return false;
  if (ArrayBuffer.isView(imgOpts.data) && imgOpts.data.byteLength === 0)
    return false;
  return true;
};

/**
 * Image plugin for `@m2d/core`.
 * Resolves all inline images (base64, SVG, URL) for DOCX generation.
 */
export const imagePlugin: (options?: IImagePluginOptions) => IPlugin = (
  options_,
) => {
  const options = { ...defaultOptions, ...options_ };

  const cacheConfig = {
    cache: options.cache ?? undefined,
    ...defaultOptions.cacheConfig,
    ...options.cacheConfig,
    ignoreKeys: [
      ...(defaultOptions.cacheConfig?.ignoreKeys ?? []),
      ...(options.cacheConfig?.ignoreKeys ?? []),
    ],
  } as CacheConfigType<IImageOptions>;

  options.imageResolver = createPersistentCache(
    options.imageResolver,
    NAMESPACE,
    {
      ...cacheConfig,
      shouldCache: shouldCacheImage,
    },
  );

  /** Preprocess step: resolves all image references in the MDAST. */
  const preprocess = async (root: Root, definitions: Definitions) => {
    const promises: Promise<void>[] = [];

    const preprocessInternal = (
      node: Root | RootContent | PhrasingContent,
      parent?: Parent,
      grandparent?: Parent,
    ) => {
      (node as Parent).children?.forEach((child) => {
        preprocessInternal(child, node as Parent, parent);
      });

      if (/^(image|svg)/.test(node.type)) {
        promises.push(
          (async () => {
            const src =
              (node as Image).url ??
              definitions[(node as ImageReference).identifier?.toUpperCase()];

            const alt =
              (node as Image).alt ??
              (src?.startsWith("data:") ? "" : (src?.split("/")?.pop() ?? ""));

            const existingData = (node as Image | SVG).data;
            const existingAltText = (
              existingData as
                | {
                    altText?: {
                      name?: string;
                      description?: string;
                      title?: string;
                    };
                  }
                | undefined
            )?.altText;
            const resolved = await options.imageResolver(
              src,
              options,
              node as Image | SVG,
            );

            node.data = {
              ...existingData,
              ...resolved,
              altText: existingAltText ?? {
                description: alt ?? undefined,
                name: alt ?? "",
                title: alt ?? undefined,
              },
            };

            handleImageErrorFallback(
              node as Image | SVG,
              parent,
              grandparent,
              options,
              resolved,
              existingData,
            );
          })(),
        );
      }
    };

    preprocessInternal(root);
    await Promise.all(promises);
  };

  let cleanupDone = false;
  return {
    preprocess,

    /** Renderer step: injects resolved image data into the final DOCX AST */
    inline: createImageInlineHook(options),
    /** clean up IndexedDB once the document is packed */
    postprocess: () => {
      if (
        (options?.cacheConfig?.cacheMode
          ? options?.cacheConfig?.cacheMode !== "memory"
          : true) &&
        !cleanupDone
      ) {
        cleanupDone = true;
        simpleCleanup(options.maxAgeMinutes, NAMESPACE);
      }
    },
  };
};
