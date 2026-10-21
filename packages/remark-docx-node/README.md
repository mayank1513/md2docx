# @m2d/remark-docx-node <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/remark-docx-node" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/remark-docx-node" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/remark-docx-node" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/remark-docx-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/remark-docx-node" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/remark-docx-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/remark-docx-node" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/remark-docx-node" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/remark-docx-node" />
</p>

> **@m2d/remark-docx-node**: Unified & Remark compiler plugin that converts Markdown AST trees to Microsoft Word (`.docx`) on Node.js with native image rasterization and Mermaid diagram rendering.

---

## ✨ Why @m2d/remark-docx-node?

- 🚀 **Server-Side Native Rendering**: Uses `@m2d/image-node` (powered by `sharp`) and `@m2d/mermaid-node` (powered by `beautiful-mermaid`) for high-performance server generation.
- 🖼️ **Local & Remote Images**: Automatically loads images from disk, HTTPS URLs, and data URIs without headless browser overhead.
- 📊 **Mermaid Diagrams**: Compiles flowcharts, sequence diagrams, and architecture charts directly into Word DrawingML images.
- 📦 **Zero DOM Requirement**: Runs purely on Node.js without requiring JSDOM, Puppeteer, or Canvas polyfills.

> 💡 **Looking for browser / client-side compilation?** Use [`@m2d/remark-docx`](https://npmjs.com/package/@m2d/remark-docx).

---

## 📦 Installation

```bash
# with pnpm
$ pnpm add @m2d/remark-docx-node docx unified remark-parse remark-gfm
```

**_or_**

```bash
# with npm
$ npm install @m2d/remark-docx-node docx unified remark-parse remark-gfm
```

**_or_**

```bash
# with yarn
$ yarn add @m2d/remark-docx-node docx unified remark-parse remark-gfm
```

---

## 🚀 Quick Start

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

const markdown = `
# Server Report 🚀

Here is a diagram:

\`\`\`mermaid
graph TD
  Client --> API
  API --> Database
\`\`\`
`;

const file = await processor.process(markdown);
const buffer = (await file.result) as Buffer;

await fs.writeFile("report.docx", buffer);
```

---

## ⚙️ Options & Plugin Configuration

```typescript
import { remarkDocx } from "@m2d/remark-docx-node";

const processor = unified().use(
  remarkDocx,
  "buffer", // outputType
  { title: "My Document" }, // docxProps
  {}, // sectionProps
  {
    // Node-specific plugin configurations
    image: { pathPrefix: "./assets", maxW: 600 },
    mermaid: { transparent: true },
    list: { defaultBullets: true },
    table: {},
    emoji: {},
  },
);
```

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
