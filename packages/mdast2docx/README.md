# mdast2docx <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

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

> mdast2docx: The complete, all-in-one Markdown Abstract Syntax Tree (MDAST) to Microsoft Word DOCX compiler bundle.

---

## ✨ Features

- 📦 **All-in-One Distribution**: Includes `@m2d/core` and the complete official plugin ecosystem (`table`, `list`, `image`, `math`, `mermaid`, `html`, `emoji`).
- 🤖 **Optimized for Generative AI**: Perfect bridge for converting LLM-generated Markdown into professionally styled Word documents.
- 📐 **Native Word Structures**: Renders genuine OpenXML tables, native editable equations (`docx.Math`), multi-tier outline numbering, and vector diagrams.
- 🌐 **Isomorphic Runtimes**: Works identically on both the client (browser downloads via `Blob`) and server (high-throughput Node.js batch generation via `Buffer`).
- ⚡ **Streamlined Subpaths**: Clean access via `mdast2docx`, `mdast2docx/plugins`, `mdast2docx/section`, and `mdast2docx/utils`.

---

## 📦 Installation

```bash
$ pnpm add mdast2docx docx
```

**_or_**

```bash
$ npm install mdast2docx docx
```

**_or_**

```bash
$ yarn add mdast2docx docx
```

---

## 🚀 Quick Start

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
# Executive Summary

This document was generated automatically from **Markdown**.

## Key Metrics

| Metric | Target | Actual |
| :----- | :----: | -----: |
| Latency | < 50ms |   28ms |
| Uptime  | 99.9%  | 99.99% |

## System Flowchart

\`\`\`mermaid
graph LR
  Ingest --> Process --> Storage
\`\`\`

Inline formula: $E = mc^2$
`;

// 1. Parse markdown with unified
const mdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .parse(markdown);

// 2. Compile to Word DOCX with bundled plugins
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

## 🔌 Bundled Plugins

The `mdast2docx/plugins` subpath provides instant access to all official plugins:

| Plugin | Source Package | Capability |
| :--- | :--- | :--- |
| `tablePlugin` | [`@m2d/table`](https://npmjs.com/package/@m2d/table) | Rich borders, repeating headers, cell fills, and column alignment |
| `listPlugin` | [`@m2d/list`](https://npmjs.com/package/@m2d/list) | Hierarchical decimal numbering (`1.1.1`) and multi-tier bullet glyphs |
| `imagePlugin` | [`@m2d/image`](https://npmjs.com/package/@m2d/image) | SVG and URL image resolution, rasterization, and dimensions |
| `mermaidPlugin` | [`@m2d/mermaid`](https://npmjs.com/package/@m2d/mermaid) | Client-side Mermaid diagrams with auto-healing syntax |
| `mathPlugin` | [`@m2d/math`](https://npmjs.com/package/@m2d/math) | LaTeX math translated to native editable Word MathML equations |
| `htmlPlugin` | [`@m2d/html`](https://npmjs.com/package/@m2d/html) | Embedded HTML tag parsing and inline CSS styles |
| `emojiPlugin` | [`@m2d/emoji`](https://npmjs.com/package/@m2d/emoji) | GitHub emoji shortcodes to Unicode characters |

---

## 📚 Deep Dive Guides

- 📦 **[Umbrella Architecture & Package Structure Guide](./docs/umbrella-architecture.mdx)**: Subpath exports, ecosystem structure, and choosing between umbrella vs scoped packages.
- 🚀 **[Production Best Practices & Migration Guide](./docs/migration-and-best-practices.mdx)**: AI pipelines, server vs browser deployment, table layouts, and v1.x migration.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
