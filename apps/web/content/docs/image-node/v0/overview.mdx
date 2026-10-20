# @m2d/image-node <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://npmjs.com/package/@m2d/image-node" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/image-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/image-node" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/image-node" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/image-node" />
</p>

> Server-side Node.js image and SVG rasterization plugin for `@m2d/core` using `sharp`. Converts local file paths, remote URLs, data URIs, and diagram SVGs into Word-compatible DrawingML pictures.

---

## ✨ Features

- 🚀 **Native Sharp Rasterization**: High-speed, multi-threaded image processing in Node.js via `sharp` and `librsvg`.
- 📁 **Filesystem & Remote Resolution**: Resolves local server paths (`./assets/img.png`) with configurable `pathPrefix`, as well as remote HTTPS URLs and Base64 data URIs.
- 📐 **Proportional Dimension Scaling**: Scales images down to fit page width (`maxW`) and height (`maxH`) according to document DPI.
- 🛡️ **Resilient Error Policies**: Configurable `errorMode` (`"warn"`, `"silent"`, `"throw"`, `"placeholder"`) prevents pipeline crashes on missing files or broken URLs.
- 📊 **Diagram Code Block Fallbacks**: Automatically converts failed Mermaid diagrams or raw SVGs into authentic Word code blocks with collapsible `H6` headings.
- ⚡ **Zero Browser Dependencies**: Pure headless Node.js operation without requiring puppeteer, headless Chrome, or DOM/canvas polyfills.

> 💡 **Looking for browser / client-side image resolution?** Use [`@m2d/image`](https://npmjs.com/package/@m2d/image) powered by HTML5 Canvas.

---

## 📦 Installation

```bash
$ pnpm add @m2d/image-node @m2d/core docx sharp
```

**_or_**

```bash
$ npm install @m2d/image-node @m2d/core docx sharp
```

---

## 🚀 Usage

```typescript
import { toDocx } from "@m2d/core";
import { nodeImagePlugin } from "@m2d/image-node";
import { mermaidNodePlugin } from "@m2d/mermaid-node";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Server Generated Document

![Local Image](./images/architecture.png)
![Remote Logo](https://example.com/logo.png)

\`\`\`mermaid
graph TD
  Start[Start Process] --> Finish[Complete]
\`\`\`
`;

const mdast = unified().use(remarkParse).parse(markdown);

const docxBuffer = await toDocx(
  mdast,
  { title: "Server Document" },
  {
    plugins: [
      mermaidNodePlugin(), // Generates SVG AST nodes
      nodeImagePlugin({    // Rasterizes SVGs and resolves local/remote images
        pathPrefix: "./public",
        fallbackImageType: "png",
        maxW: 6.5,
        maxH: 9,
      }),
    ],
  },
  "buffer",
);
```

> ⚠️ **Plugin Ordering**: When combining with diagram plugins like `@m2d/mermaid-node`, place `nodeImagePlugin()` **after** them in the `plugins` array.

---

## ⚙️ Options Reference

```typescript
export interface INodeImagePluginOptions {
  /** Directory prefix for resolving relative local file paths (default: "") */
  pathPrefix?: string;

  /** Fallback format for SVGs or unsupported image types (default: "png") */
  fallbackImageType?: "png" | "jpg" | "gif";

  /** Maximum image width in inches (default: 6) */
  maxW?: number;

  /** Maximum image height in inches (default: 8) */
  maxH?: number;

  /** Target DPI for physical dimension calculation (default: 96) */
  dpi?: number;

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
   * - "code": Renders raw Mermaid code in a formatted Word code block (default).
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

  /** Custom resolver function overriding the default fetch/sharp pipeline */
  imageResolver?: NodeImageResolver;
}
```

---

## 📚 Deep Dive Guides

- 🚀 **[Server-Side Resolution Guide](./docs/server-resolution.mdx)**: Headless sharp configuration, local path resolution, and SVG rasterization without a DOM.
- 🛡️ **[Fallbacks & Error Policies Guide](./docs/fallbacks-and-error-modes.mdx)**: Configurable error modes, diagram code block fallbacks, and collapsible headings.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
