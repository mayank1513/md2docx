# @m2d/mermaid <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/mermaid" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/mermaid" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/mermaid" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/mermaid" />
  </a>
  <a href="https://npmjs.com/package/@m2d/mermaid" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/mermaid" />
  </a>
  <a href="https://npmjs.com/package/@m2d/mermaid" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/mermaid" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/mermaid" />
</p>

> @m2d/mermaid: Client-side Mermaid diagram plugin for `@m2d/core`. Transforms `mermaid`, `mmd`, and `mindmap` code blocks into responsive inline SVGs with auto-repair and caching.

---

## ✨ Features

- 📊 **Comprehensive Diagram Support**: Supports all standard Mermaid diagram types (flowcharts, sequence, class, state, ER, Gantt, pie, gitGraph, mindmaps, quadrant charts).
- 🛠️ **Built-In Self-Healing (`defaultMermaidFixer`)**: Automatically repairs common syntax errors such as unquoted colons, slashes, or special characters in node labels.
- 🎨 **Full Theme Customization**: Compatible with all official Mermaid themes (`default`, `neutral`, `forest`, `dark`, `base`) and custom theme variables.
- 💾 **IndexedDB & Memory Caching**: Eliminates expensive repeated diagram compilation across page reloads.
- 🛡️ **Graceful Fallbacks**: Preserves diagram source so downstream rasterizers (`@m2d/image`) can cleanly render collapsible code blocks if rendering fails.

> 💡 **Looking for server-side (Node.js) Mermaid rendering?** Use [`@m2d/mermaid-node`](https://npmjs.com/package/@m2d/mermaid-node) powered by `beautiful-mermaid` (zero DOM / browser dependencies).

---

## 📦 Installation

```bash
$ pnpm add @m2d/mermaid @m2d/image @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/mermaid @m2d/image @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { mermaidPlugin } from "@m2d/mermaid";
import { imagePlugin } from "@m2d/image";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Architecture Overview

\`\`\`mermaid
graph TD
  Client[Web Client] --> Gateway[API Gateway]
  Gateway --> Service[Core Service]
\`\`\`
`;

const mdast = unified().use(remarkParse).parse(markdown);

const docxBlob = await toDocx(
  mdast,
  {},
  {
    plugins: [
      mermaidPlugin(), // 1. Converts mermaid code blocks into SVG nodes
      imagePlugin(), // 2. Rasterizes SVGs into OpenXML DrawingML runs
    ],
  },
);
```

> ⚠️ **Plugin Ordering**: Place `mermaidPlugin()` **before** `imagePlugin()` in the `plugins` array. `mermaidPlugin` generates the SVG nodes that `imagePlugin` subsequently compiles into Word images.

---

## ⚙️ Plugin Options

```typescript
export interface IMermaidPluginOptions {
  /** Mermaid configuration object passed to mermaid.initialize() */
  mermaidConfig?: MermaidConfig;

  /**
   * Optional custom fixer function called when initial rendering fails.
   * If omitted, uses the built-in defaultMermaidFixer.
   */
  fixMermaid?: (code: string, error: Error) => string;

  /** In-memory cache object for sharing across instances */
  cache?: Record<string, Promise<unknown>>;

  /** Duration in minutes before cached records expire (default: 30 days) */
  maxAgeMinutes?: number;
}
```

---

## 📚 Deep Dive Guides

- 📊 **[Diagram Syntax & Theming Guide](./docs/diagram-syntax-and-theming.mdx)**: Comprehensive list of supported diagram types and custom theme configurations.
- 🛠️ **[Auto-Fixing & Diagram Fallbacks Guide](./docs/auto-fixing-and-fallbacks.mdx)**: Built-in syntax healing and graceful Word code block fallbacks.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
