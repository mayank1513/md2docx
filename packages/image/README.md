# @m2d/image <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/image" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/image" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/image" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/image" />
  </a>
  <a href="https://npmjs.com/package/@m2d/image" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/image" />
  </a>
  <a href="https://npmjs.com/package/@m2d/image" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/image" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/image" />
</p>

> @m2d/image: Client-side image and SVG rasterization plugin for `@m2d/core`. Converts Markdown `![alt](url)`, HTML `<img>`, and diagram SVGs into DOCX-compatible `ImageRun` elements in browser environments.

---

## ✨ Features

- 🖼️ **Universal Image Resolution**: Resolves Markdown `![alt](url)`, HTML `<img>`, Base64 data URIs, and SVG elements into OpenXML DrawingML pictures.
- 🎨 **Client-Side Canvas Rasterization**: High-fidelity in-browser SVG-to-raster conversion via HTML5 Canvas.
- 🛡️ **Configurable Error Policies**: Supports `"warn"`, `"silent"`, `"throw"`, and `"placeholder"` modes on image load or network failures.
- 📊 **Diagram Code Fallbacks**: Automatically transforms failed Mermaid diagrams and raw SVGs into authentic Word code blocks with borders and Consolas styling.
- 📂 **Collapsible Headings in Word**: Injects collapsible `H6` headings (Word `Heading 5`) above fallback code blocks without cluttering standard 1–3 level Tables of Contents.
- 💾 **IndexedDB & Memory Caching**: Lock-free multi-tier caching prevents duplicate image fetches and canvas conversions.

> 💡 **Looking for server-side (Node.js) image resolution?** Use [`@m2d/image-node`](https://npmjs.com/package/@m2d/image-node) powered by `sharp`.

---

## 📦 Installation

```bash
$ pnpm add @m2d/image @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/image @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/image @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { imagePlugin } from "@m2d/image";
import { mermaidPlugin } from "@m2d/mermaid";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Document With Images

![Architecture Diagram](https://example.com/arch.png)

\`\`\`mermaid
graph TD
  A[Start] --> B[Finish]
\`\`\`
`;

const mdast = unified().use(remarkParse).parse(markdown);

const docxBlob = await toDocx(mdast, {}, {
  plugins: [
    mermaidPlugin(), // Generates SVG nodes
    imagePlugin(),   // Converts images and diagram SVGs to DOCX ImageRuns
  ],
});
```

> ⚠️ **Plugin Ordering**: When combining with diagram plugins like `@m2d/mermaid` or HTML plugins like `@m2d/html`, place `imagePlugin()` **after** them in the `plugins` array.

---

## ⚙️ Plugin Options

```typescript
export interface IImagePluginOptions {
  /** Maximum image width in inches (default: 6) */
  maxW?: number;

  /** Maximum image height in inches (default: 8) */
  maxH?: number;

  /** Resolution scaling factor for base64 images (default: 3) */
  scale?: number;

  /** Quality factor (0-1) for lossy image formats (default: 0.92) */
  quality?: number;

  /** Fallback image format to convert unsupported types (default: "png") */
  fallbackImageType?: "png" | "jpg";

  /** Custom placeholder image source (path, URL, or data URL) */
  placeholder?: string;

  /**
   * General image error behavior:
   * - "warn": Emits a styled muted text badge with alt text (default).
   * - "silent": Drops the image node completely.
   * - "throw": Rejects toDocx conversion promise with the underlying Error.
   * - "placeholder": Inserts options.placeholder image.
   */
  errorMode?: "warn" | "silent" | "throw" | "placeholder";

  /**
   * Fallback strategy for failed Mermaid diagrams:
   * - "code": Renders the raw Mermaid code in a formatted Word code block (default).
   * - "warn": Emits a warning badge [Mermaid Diagram Error: ...].
   * - "silent": Drops the node completely.
   */
  mermaidFallback?: "code" | "warn" | "silent";

  /**
   * Fallback strategy for failed non-Mermaid SVGs:
   * - "warn": Emits styled muted text badge (default).
   * - "code": Renders raw SVG XML in a Word code block (`lang: "xml"`).
   * - "silent": Drops the node completely.
   */
  svgFallback?: "warn" | "code" | "silent";

  /**
   * Optional heading added above fallback code blocks (H6 level, maps to Word Heading 5).
   * - true: Injects '###### ⚠️ Diagram Source (Render Fallback)' (default).
   * - false: Omits the heading.
   * - string: Injects custom heading text.
   */
  collapsibleHeading?: boolean | string;

  /** Custom image resolver function */
  imageResolver?: ImageResolver;

  /** Cache configuration or sharing across instances */
  cache?: Record<string, Promise<unknown>>;
  maxAgeMinutes?: number; // default: 10080 (7 days)
}
```

---

## 📚 Deep Dive Guides

Explore our detailed documentation guides:

- 🛡️ **[Error Handling & Fallbacks Guide](./docs/error-handling-and-fallbacks.mdx)**: Comprehensive guide on error modes, collapsible headings, and Word TOC safety.
- 🔌 **[Custom Resolvers & Caching Guide](./docs/custom-resolvers-and-caching.mdx)**: Authenticated image fetching, custom headers, and multi-tier IndexedDB cache configuration.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
