# @m2d/cli <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/cli" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/cli" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/cli" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/cli" />
  </a>
  <a href="https://npmjs.com/package/@m2d/cli" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/cli" />
  </a>
  <a href="https://npmjs.com/package/@m2d/cli" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/cli" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/cli" />
</p>

> **@m2d/cli** (alias: `@m2d/md2docx-node`): Command-line tool and programmatic Node.js engine for Markdown to DOCX conversion with native image and Mermaid diagram rasterization.

---

## ✨ Features

- 💻 **CLI Tool**: Convert Markdown files to styled `.docx` documents directly from your terminal or CI/CD pipelines.
- 🚀 **Programmatic Node.js API**: Exported `md2docx` function pre-wired with `@m2d/remark-docx-node` for server rendering.
- 🖼️ **Native Image Resolution**: Automatically resolves local file paths, HTTPS URLs, and Base64 data URIs via `sharp`.
- 📊 **Headless Mermaid Diagrams**: Compiles flowcharts, sequence diagrams, and architecture diagrams into Word DrawingML pictures.

> 💡 **Looking for client-side / browser compilation?** Use [`@m2d/md2docx`](https://npmjs.com/package/@m2d/md2docx) or [`@m2d/remark-docx`](https://npmjs.com/package/@m2d/remark-docx).

---

## 📦 Installation

### Global CLI

```bash
# with pnpm
$ pnpm add -g @m2d/cli

# or npm
$ npm install -g @m2d/cli
```

### Local Project Dependency

```bash
$ pnpm add @m2d/cli
```

---

## 🚀 CLI Usage

Convert a Markdown file to Word:

```bash
# Using npx
$ npx @m2d/cli README.md -o document.docx

# Using alias binary
$ md2docx README.md -o document.docx
$ md2docx-node README.md -o document.docx
```

### Options

```text
Usage:
  $ md2docx <input.md> [options]

Arguments:
  <input.md>               Path to Markdown file to convert

Options:
  -o, --output <file>      Output DOCX file path (default: <input>.docx)
  -t, --title <title>      Document title
  -a, --author <author>    Document author
  -d, --description <desc> Document description
  -c, --config <file>      Use custom configuration file
  -i, --init [file]        Create default config file
  -h, --help               Show this help message
  -v, --version            Show version number
```

---

## ⚡ Programmatic Node.js Usage

```typescript
import { md2docx } from "@m2d/cli";
import fs from "node:fs/promises";

const markdown = `
# Backend Document 🚀

- Automatically resolves images
- Automatically renders Mermaid charts

\`\`\`mermaid
graph TD
  A[Input Markdown] --> B[DOCX Buffer]
\`\`\`
`;

const buffer = await md2docx(markdown, { title: "Automated Report" });
await fs.writeFile("report.docx", buffer);
```

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
