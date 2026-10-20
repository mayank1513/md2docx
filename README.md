# Md2Docx <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/mdast2docx" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=mdast2docx" />
  </a> 
  <a href="https://npmjs.com/package/mdast2docx" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/mdast2docx" />
  </a>
  <a href="https://npmjs.com/package/mdast2docx" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/mdast2docx" />
  </a>
  <a href="https://npmjs.com/package/mdast2docx" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/mdast2docx" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/mdast2docx" />
</p>

> **Md2Docx**: A powerful, modular, and extensible Markdown to Microsoft Word (`.docx`) document engine for Node.js and browsers.

---

## ✨ Why Md2Docx?

Modern applications, technical platforms, and **Generative AI** tools produce structured output in **Markdown**. `Md2Docx` transforms Markdown Abstract Syntax Trees (MDAST) into professionally formatted Word documents with native tables, vector diagrams, editable equations, and custom section layouts.

- 📐 **Authentic Word Elements**: Converts Markdown directly into native Microsoft Word OpenXML elements (`docx.Table`, `docx.Math`, `docx.ImageRun`, outline numbering).
- 🧩 **Modular Plugin Ecosystem**: Use the all-in-one `mdast2docx` umbrella or cherry-pick lightweight `@m2d/*` plugins.
- 🌐 **Isomorphic Runtimes**: Zero-server client-side generation (`Blob`) in browsers, or high-throughput batch generation (`Buffer`) in Node.js.
- 🛡️ **Resilient by Default**: Graceful fallbacks for failed diagrams, self-healing syntax auto-repair, and protection against runaway markdown syntax.

---

## 📦 Monorepo Packages

| Package | Version | Description |
| :--- | :--- | :--- |
| [`mdast2docx`](./packages/mdast2docx) | [![npm](https://img.shields.io/npm/v/mdast2docx)](https://npmjs.com/package/mdast2docx) | **Umbrella bundle** containing `@m2d/core` and all official plugins. |
| [`@m2d/core`](./packages/core) | [![npm](https://img.shields.io/npm/v/@m2d/core)](https://npmjs.com/package/@m2d/core) | Core conversion engine, plugin pipeline, and caching layer. |
| [`@m2d/table`](./packages/table) | [![npm](https://img.shields.io/npm/v/@m2d/table)](https://npmjs.com/package/@m2d/table) | Rich tables with borders, cell fills, alignments, and repeating headers. |
| [`@m2d/list`](./packages/list) | [![npm](https://img.shields.io/npm/v/@m2d/list)](https://npmjs.com/package/@m2d/list) | Multi-level outline numbering (`1.1.1`) and nested bullet glyphs. |
| [`@m2d/math`](./packages/math) | [![npm](https://img.shields.io/npm/v/@m2d/math)](https://npmjs.com/package/@m2d/math) | LaTeX math formulas rendered as native editable Word MathML equations. |
| [`@m2d/mermaid`](./packages/mermaid) | [![npm](https://img.shields.io/npm/v/@m2d/mermaid)](https://npmjs.com/package/@m2d/mermaid) | Browser Mermaid diagrams with auto-healing syntax repair. |
| [`@m2d/mermaid-node`](./packages/mermaid-node) | [![npm](https://img.shields.io/npm/v/@m2d/mermaid-node)](https://npmjs.com/package/@m2d/mermaid-node) | Server-side Mermaid rendering with zero browser/DOM dependencies. |
| [`@m2d/image`](./packages/image) | [![npm](https://img.shields.io/npm/v/@m2d/image)](https://npmjs.com/package/@m2d/image) | Browser image and SVG rasterization with persistent caching. |
| [`@m2d/image-node`](./packages/image-node) | [![npm](https://img.shields.io/npm/v/@m2d/image-node)](https://npmjs.com/package/@m2d/image-node) | Server-side image and SVG rasterizer powered by `sharp`. |
| [`@m2d/html`](./packages/html) | [![npm](https://img.shields.io/npm/v/@m2d/html)](https://npmjs.com/package/@m2d/html) | Embedded HTML tag parsing and inline CSS styling to MDAST. |
| [`@m2d/mdast`](./packages/mdast) | [![npm](https://img.shields.io/npm/v/@m2d/mdast)](https://npmjs.com/package/@m2d/mdast) | Extended MDAST and HAST TypeScript type definitions. |
| [`@m2d/remark-docx`](./packages/remark-docx) | [![npm](https://img.shields.io/npm/v/@m2d/remark-docx)](https://npmjs.com/package/@m2d/remark-docx) | Official Unified / Remark compiler plugin for direct DOCX output. |
| [`@m2d/react-markdown`](./packages/react-markdown) | [![npm](https://img.shields.io/npm/v/@m2d/react-markdown)](https://npmjs.com/package/@m2d/react-markdown) | SSR-friendly React renderer with AST retention for instant DOCX export. |

---

## 🚀 Quick Start

```bash
$ pnpm add mdast2docx docx unified remark-parse remark-gfm remark-math
```

```typescript
import { toDocx } from "mdast2docx";
import {
  htmlPlugin,
  imagePlugin,
  listPlugin,
  mathPlugin,
  mermaidPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Project Report

Executive summary with **bold** text and [links](https://github.com/md2docx/md2docx).

## System Flow

\`\`\`mermaid
graph LR
  Client --> Gateway --> Database
\`\`\`

Formula: $E = mc^2$
`;

// 1. Parse markdown
const mdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .parse(markdown);

// 2. Generate Word DOCX Blob
const docxBlob = await toDocx(mdast, {}, {
  plugins: [
    htmlPlugin(),
    mermaidPlugin(),
    imagePlugin(),
    tablePlugin(),
    listPlugin(),
    mathPlugin(),
  ],
});
```

---

## 📖 Documentation

Visit the official documentation site: [https://md2docx.js.org](https://md2docx.js.org)

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
