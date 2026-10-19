import type { IImageOptions } from "docx";
import type { IDefaultImagePluginOptions } from ".";

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
const TRANSPARENT_1X1_GIF = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
  0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0x21, 0xf9, 0x04, 0x01, 0x00, 0x00, 0x00,
  0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
  0x44, 0x01, 0x00, 0x3b,
]);

/**
 * Generates and returns a placeholder image.
 * If a placeholder source is defined, attempts to resolve it; otherwise returns a valid 1x1 transparent GIF fallback.
 *
 * @param options - Image plugin configuration.
 * @returns Image options for the placeholder.
 */
export const getPlaceHolderImage = async (
  options: IDefaultImagePluginOptions,
) => {
  if (!placeholderImg && options.placeholder && !shouldEmitEmptyPlaceholder) {
    shouldEmitEmptyPlaceholder = true;
    // skipcq: JS-0357
    placeholderImg = await options.imageResolver(options.placeholder, options);
  } else {
    placeholderImg = {
      type: "gif",
      data: TRANSPARENT_1X1_GIF.buffer,
      transformation: {
        width: 200,
        height: 200,
      },
    };
  }
  return placeholderImg;
};
