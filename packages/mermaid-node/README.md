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

> Server-side Node.js Mermaid diagram plugin for `@m2d/core` using `beautiful-mermaid` with zero DOM dependencies.

---

## ✨ Why @m2d/mermaid-node?

- **Zero DOM Dependencies**: Powered by `beautiful-mermaid`, rendering rich SVGs without Puppeteer, jsdom, or browser windows.
- **Built-in Beautiful Themes**: Supports 15+ modern themes (`zinc-light`, `github-light`, `tokyo-night`, `dracula`, `nord`, etc.).
- **Headless Node.js Friendly**: Designed for server API routes, CLI scripts, backend jobs, and serverless runtimes.
- **Persistent Caching**: Caches rendered diagrams using `@m2d/core/cache` to eliminate redundant rendering overhead.
- **Full Diagram Support**: Handles flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, mindmaps, and XY charts.

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

## 🚀 Usage

Combine `mermaidNodePlugin` with `nodeImagePlugin` (which rasterizes the generated SVGs into DOCX ImageRuns via `sharp`):

```typescript
import { toDocx } from "@m2d/core";
import { nodeImagePlugin } from "@m2d/image-node";
import { mermaidNodePlugin } from "@m2d/mermaid-node";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# System Architecture

\`\`\`mermaid
graph TD
  Client[Web Browser] --> API[Node.js Server]
  API --> Cache[(Redis Cache)]
  API --> DB[(PostgreSQL)]
\`\`\`
`;

const processor = unified().use(remarkParse).use(remarkGfm);
const mdast = processor.parse(markdown);

const docxBuffer = await toDocx(
  mdast,
  { title: "Architecture Report" },
  {
    plugins: [
      mermaidNodePlugin({ theme: "github-light" }),
      nodeImagePlugin(),
    ],
  },
  "buffer",
);
```

---

## ⚙️ Options

| Option | Type | Default | Description |
|---|---|---|---|
| `theme` | `MermaidTheme` | `"zinc-light"` | Built-in theme name or custom theme object |
| `renderOptions` | `Record<string, unknown>` | `undefined` | Additional options forwarded to `beautiful-mermaid` |
| `fixMermaid` | `(code, err) => string` | `undefined` | Custom hook to repair diagram code if parsing fails |
| `cache` | `Record<string, Promise>` | `undefined` | Optional shared in-memory cache |
| `cacheConfig` | `CacheConfigType` | `{ cacheMode: "both" }` | Persistent cache configuration |

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
