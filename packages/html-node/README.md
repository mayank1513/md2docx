# @m2d/html-node <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/html-node" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/html-node" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/html-node" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/html-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/html-node" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/html-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/html-node" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/html-node" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/html-node" />
</p>

> Server-side HTML to MDAST plugin for md2docx using linkedom. Converts embedded HTML in Markdown into structured DOCX-compatible MDAST nodes on Node.js.

---

## ✨ Why @m2d/html-node?

- ⚡ **Lightweight Server DOM**: Uses [`linkedom`](https://github.com/WebReflection/linkedom) (~150KB) for fast, low-memory DOM parsing on Node.js without heavyweight JSDOM dependencies.
- 🎨 **Rich HTML & Inline CSS**: Supports `<div style="...">`, `<span style="...">`, `<p>`, `<strong>`, `<em>`, `<h1>`-`<h6>`, `<br>`, `<img>`, `<table>`, and inline styles (colors, borders, alignments, text transforms).
- 🧩 **Pluggable & Universal**: Seamlessly integrates into `unified`, `remark`, `mdast2docx`, and `@m2d/remark-docx-node`.

---

## 📦 Installation

```bash
pnpm add @m2d/html-node
```

**_or_**

```bash
npm install @m2d/html-node
```

**_or_**

```bash
yarn add @m2d/html-node
```

---

## 🚀 Usage

```typescript
import { nodeHtmlPlugin } from "@m2d/html-node";
import { toDocx } from "mdast2docx";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
<div style="border: 2px solid #0052cc; color: #172b4d;">
  <p>Rendered with <strong>native server-side HTML parsing</strong>!</p>
</div>
`;

const mdast = unified().use(remarkParse).parse(markdown);
const docxBuffer = await toDocx(mdast, {}, { plugins: [nodeHtmlPlugin()] }, "nodebuffer");
```

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
