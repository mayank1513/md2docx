# @m2d/table <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/table" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/table" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/table" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/table" />
  </a>
  <a href="https://npmjs.com/package/@m2d/table" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/table" />
  </a>
  <a href="https://npmjs.com/package/@m2d/table" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/table" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/table" />
</p>

> @m2d/table: Markdown Table formatting plugin for `@m2d/core`. Renders rich, customizable Word tables with column alignment, borders, cell shading, and repeating headers.

---

## ✨ Features

- 📊 **Native Word Tables**: Converts Markdown GFM tables into clean `docx.Table` elements with authentic Word OpenXML borders and paddings.
- 🎯 **Automatic Column Alignment**: Honors Markdown column alignments (`left`, `center`, `right`) with fallback defaults.
- 🎨 **Rich Cell Styling**: Style headers and data cells with background fills (`shading`), custom typography (fonts, sizes, colors), and paragraph spacing via the `data` option.
- 🖌️ **Dynamic AST & CSS Styling**: Automatically respects cell-level and table-level `shading`, `borders`, `margins` (cell padding), and `alignment` metadata passed via `cell.data` and `node.data` (e.g. from embedded `<style>` blocks or raw HTML attributes processed by `@m2d/html`).
- 📄 **Multi-Page Header Repetition**: Automatically repeats header rows across page breaks (`tableHeader: true`).
- 🧱 **Block Content in Cells**: Seamlessly accommodates nested paragraphs, lists, code snippets, and blockquotes inside table cells (ideal when paired with `@m2d/html`).

---

## 📦 Installation

```bash
$ pnpm add @m2d/table @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/table @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/table @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { tablePlugin } from "@m2d/table";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Quarterly Summary

| Quarter | Revenue | Growth | Status |
| :------ | :-----: | -----: | :----: |
| Q1      | $1.2M   | +12%   | Active |
| Q2      | $1.5M   | +25%   | Active |
| Q3      | $1.8M   | +20%   | Active |
`;

const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

const docxBlob = await toDocx(
  mdast,
  {},
  {
    plugins: [tablePlugin()],
  },
);
```

---

## ⚙️ Plugin Options

```typescript
import { AlignmentType, ShadingType, VerticalAlignTable } from "docx";

tablePlugin({
  // Table level properties (width, margins, borders)
  tableProps: { ... },

  // General row properties
  rowProps: { cantSplit: true },

  // First row (header) properties
  firstRowProps: { tableHeader: true },

  // Header cell styling
  firstRowCellProps: {
    shading: { type: ShadingType.SOLID, fill: "1E293B" },
    data: { bold: true, color: "FFFFFF", alignment: AlignmentType.CENTER },
  },

  // Body cell styling
  cellProps: {
    data: { size: 20, font: "Segoe UI" },
  },

  // Alignment configuration
  alignments: {
    preferMdData: true,
    defaultHorizontalAlign: AlignmentType.LEFT,
    defaultVerticalAlign: VerticalAlignTable.CENTER,
  },
});
```

---

## 📚 Deep Dive Guides

- 🎨 **[Table Styling & Layout Guide](./docs/table-styling-and-layout.mdx)**: Margins, border styles, widths, and repeating multi-page headers.
- 🔠 **[Cell Formatting & Alignment Guide](./docs/cell-formatting-and-alignment.mdx)**: Markdown alignment hierarchy, typography, cell shading, and block content in cells.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
