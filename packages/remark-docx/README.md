# @m2d/remark-docx <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/remark-docx" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/remark-docx" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/remark-docx" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/remark-docx" />
  </a>
  <a href="https://npmjs.com/package/@m2d/remark-docx" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/remark-docx" />
  </a>
  <a href="https://npmjs.com/package/@m2d/remark-docx" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/remark-docx" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/remark-docx" />
</p>

> @m2d/remark-docx: Unified & Remark compiler plugin that transforms Markdown directly into Microsoft Word (`.docx`) documents.

---

## ✨ Features

- 🔌 **Unified & Remark Compiler**: Plugs directly into `unified().use(remarkDocx)` to compile MDAST syntax trees into Word OpenXML.
- 📦 **Auto-Injected Plugins**: Automatically configures tables, math, lists, images, emojis, and HTML plugins when none are specified.
- 🌐 **Isomorphic Execution**: Runs in both browser (generating client-side `Blob`s) and Node.js (generating `Buffer`s for file writing).
- ⚙️ **Configurable Outputs**: Supports `"blob"`, `"buffer"`, `"base64"`, and `"uint8array"` formats.
- ⚡ **Dual Execution APIs**: Compatible with both async `.process()` and synchronous `.processSync()` pipelines.

---

## 📦 Installation

```bash
$ pnpm add @m2d/remark-docx docx unified remark-parse remark-gfm
```

**_or_**

```bash
$ npm install @m2d/remark-docx docx unified remark-parse remark-gfm
```

**_or_**

```bash
$ yarn add @m2d/remark-docx docx unified remark-parse remark-gfm
```

---

## 🚀 Quick Start

### Browser (Download as DOCX)

```typescript
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { remarkDocx } from "@m2d/remark-docx";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDocx, "blob");

const file = await processor.process("# Hello World\n\nExported directly to Word!");
const blob = (await file.result) as Blob;

// Trigger browser download
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "document.docx";
link.click();
URL.revokeObjectURL(url);
```

### Node.js (with Native Images & Mermaid Support)

For Node.js environments, use [`@m2d/remark-docx-node`](../remark-docx-node) to automatically wire native server-side image resolution (`@m2d/image-node`) and diagram rendering (`@m2d/mermaid-node`):

```typescript
import fs from "node:fs/promises";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { remarkDocx } from "@m2d/remark-docx-node";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDocx, "buffer");

const file = await processor.process("# Server Report\n\nWritten via Node.js with native image and Mermaid rasterization.");
const buffer = (await file.result) as Buffer;

await fs.writeFile("report.docx", buffer);
```

---

## ⚙️ Plugin Signature

```typescript
import { OutputType } from "docx";
import { IDocxProps, ISectionProps } from "mdast2docx";

remarkDocx(
  outputType?: "blob" | "buffer" | "base64" | "uint8array", // Default: "blob"
  docxProps?: IDocxProps,                                  // Global Word document options
  sectionProps?: ISectionProps,                            // Section margins, headers, and plugins
  pluginProps?: {                                          // Options passed to auto-injected plugins
    table?: TablePluginOptions;
    list?: ListPluginOptions;
    mermaid?: MermaidPluginOptions;
    image?: ImagePluginOptions;
    emoji?: EmojiPluginOptions;
  }
);
```

---

## 📚 Deep Dive Guides

- 🔌 **[Unified Pipeline Integration Guide](./docs/unified-pipeline-integration.mdx)**: Architecture, plugin auto-injection, and manual plugin overrides.
- 💾 **[Output Formats & Environments Guide](./docs/output-formats-and-environments.mdx)**: Browser downloads, server writing, sync execution, and binary output types.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
