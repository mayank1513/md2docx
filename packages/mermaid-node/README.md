# @m2d/mermaid-node <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/mermaid-node" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/mermaid-node" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/mermaid-node" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/mermaid-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/mermaid-node" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/mermaid-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/mermaid-node" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/mermaid-node" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/mermaid-node" />
</p>

> @m2d/mermaid-node: Server-side Node.js Mermaid diagram plugin for `@m2d/core` using `beautiful-mermaid` with zero DOM dependencies.

---

## ✨ Features

- ⚡ **Zero DOM / Headless Browser Dependencies**: Powered by `beautiful-mermaid` and ELK.js—renders vector SVGs in milliseconds without Chromium, Puppeteer, or JSDOM.
- 🎨 **Sharp & librsvg Color Inlining**: Automatically resolves CSS variables and `color-mix()` in sRGB to explicit hex colors, ensuring diagrams render in full theme colors rather than solid black in `sharp`.
- 🪟 **Transparent Canvas Background**: Defaults to `transparent: true` matching client-side output for seamless blending onto document pages.
- 📝 **Sequence Diagram Auto-Normalization**: Automatically fixes multi-word actor names in sequence diagrams to ensure they render reliably.
- 🌈 **15+ Built-In Themes**: Includes `zinc-light`, `github-light`, `tokyo-night`, `dracula`, `nord`, and custom two-color/enriched palettes.
- 💾 **Persistent Caching**: Caches diagram SVGs using `@m2d/core/cache` to eliminate repeated computation across requests.

> 💡 **Looking for browser / client-side Mermaid rendering?** Use [`@m2d/mermaid`](https://npmjs.com/package/@m2d/mermaid) powered by official `mermaid.js`.

---

## 📦 Installation

```bash
$ pnpm add @m2d/mermaid-node @m2d/image-node @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/mermaid-node @m2d/image-node @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { mermaidNodePlugin } from "@m2d/mermaid-node";
import { nodeImagePlugin } from "@m2d/image-node";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Backend Architecture

\`\`\`mermaid
graph TD
  Client[Client Request] --> API[Node.js API]
  API --> Database[(PostgreSQL)]
\`\`\`
`;

const mdast = unified().use(remarkParse).parse(markdown);

const docxBuffer = await toDocx(
  mdast,
  { title: "Architecture Report" },
  {
    plugins: [
      mermaidNodePlugin({ theme: "github-light" }), // 1. Generates SVG AST nodes
      nodeImagePlugin(),                             // 2. Rasterizes SVGs into DOCX images
    ],
  },
  "buffer",
);
```

> ⚠️ **Plugin Ordering**: Place `mermaidNodePlugin()` **before** `nodeImagePlugin()` in the `plugins` array.

---

## ⚙️ Plugin Options

```typescript
export interface IMermaidNodePluginOptions {
  /**
   * Built-in theme name (e.g. 'zinc-light', 'github-light', 'dracula') or custom theme object.
   * @default 'zinc-light'
   */
  theme?: MermaidTheme;

  /** Additional render options forwarded to beautiful-mermaid */
  renderOptions?: Record<string, unknown>;

  /** Optional custom fixer function to repair invalid Mermaid code */
  fixMermaid?: (code: string, error: Error) => string;

  /** In-memory cache object for sharing across instances */
  cache?: Record<string, Promise<unknown>>;

  /** Persistent cache configuration */
  cacheConfig?: CacheConfigType;
}
```

---

## ❓ FAQ & Limitations

### Why not use a headless browser (Puppeteer / Chromium) in Node?
If you're already spinning up and managing a 300MB headless browser process on your server, **why not run the entire conversion in the browser engine directly?** With [`@m2d/mermaid`](https://npmjs.com/package/@m2d/mermaid) in a browser context, you get 100% diagram support and native DOM/canvas rendering. `@m2d/mermaid-node` exists specifically to provide an ultra-lightweight, edge-compatible alternative (&lt;10ms rendering, zero browser binaries, pure TypeScript).

### What diagram types does `beautiful-mermaid` support?
- **Supported (6 Core Types)**: Flowcharts (`graph TD`, `flowchart LR`), Sequence Diagrams (`sequenceDiagram`), Class Diagrams (`classDiagram`), State Diagrams (`stateDiagram-v2`), Entity Relationship Diagrams (`erDiagram`), and XY Charts (`xychart-beta`).
- **Unsupported Types**: Gantt, Pie, Git Graph, Mindmap, and Timeline diagrams.
- **Graceful Fallback**: Unsupported diagrams trigger `@m2d/image-node`'s fallback mechanism, embedding the source as a formatted Word code block.

---

## 📚 Deep Dive Guides

- ⚡ **[Headless Node.js Rendering Guide](./docs/headless-rendering.mdx)**: Zero-DOM architecture, sharp color inlining, transparent backgrounds, and sequence diagram normalizer.
- 🎨 **[Themes & Custom Palettes Guide](./docs/themes-and-theming.mdx)**: Using the 15 built-in themes and creating custom two-color or enriched palettes.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
