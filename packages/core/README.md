# @m2d/core <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/core" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/core" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/core" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/core" />
  </a>
  <a href="https://npmjs.com/package/@m2d/core" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/core" />
  </a>
  <a href="https://npmjs.com/package/@m2d/core" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/core" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/core" />
</p>

> @m2d/core: Core engine to convert extended MDAST to DOCX. Supports plugins for footnotes, images, lists, tables, and more. Designed for seamless Markdown-to-DOCX conversion.

---

## ✨ Features

- ⚡ **Lightweight & Fast**: Direct conversion from Markdown Abstract Syntax Trees (MDAST) into native OpenXML Word structures.
- 🌐 **Dual-Runtime Compatibility**: Runs 100% in-browser (`Blob`, zero server required) and on server runtimes (`Buffer`, `Uint8Array` in Node.js, Next.js, Cloudflare Workers).
- 📑 **Section & Layout Control**: Multi-section documents with individual page sizes, orientation (Portrait/Landscape), margins, headers, and footers.
- 🔌 **Extensible Plugin Pipeline**: Rich lifecycle hooks (`preprocess`, `inline`, `block`, `postprocess`) for images, diagrams, math equations, and HTML.
- 🛡️ **Defensive & Resilient**: Built-in warning deduplication (`warnOnce`), safe error fallbacks, and non-mutating option handling.
- 💾 **Persistent Caching Engine**: Multi-tiered cache (`@m2d/core/cache`) using IndexedDB and in-memory caches with timestamped TTL and lock-free concurrency.

---

## 📦 Installation

```bash
$ pnpm add @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/core docx
```

---

## 🚀 Quick Start

Convert a Markdown string to a Word `.docx` file in just a few lines:

```typescript
import { toDocx } from "@m2d/core";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { unified } from "unified";

// 1. Parse Markdown into an MDAST tree
const markdown = "# Project Overview\n\nGenerated with **@m2d/core**.";
const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

// 2. Convert MDAST to a DOCX Blob (or 'buffer' on server)
const docxBlob = await toDocx(mdast, {
  title: "Project Overview",
  creator: "md2docx",
});

// 3. In the browser, trigger download or save
const url = URL.createObjectURL(docxBlob as Blob);
const a = document.createElement("a");
a.href = url;
a.download = "document.docx";
a.click();
```

---

## 🔌 Official Plugins Ecosystem

`@m2d/core` stays lean by delegating domain-specific nodes to modular plugins. Install only what you need:

| Plugin             | Package                                                                | Environment      | Purpose                                                              |
| :----------------- | :--------------------------------------------------------------------- | :--------------- | :------------------------------------------------------------------- |
| **HTML**           | [`@m2d/html`](https://www.npmjs.com/package/@m2d/html)                 | Browser / Node   | Parses inline HTML styling, `<kbd>`, `<mark>`, badges, and embeds    |
| **Image**          | [`@m2d/image`](https://www.npmjs.com/package/@m2d/image)               | Browser          | In-browser canvas rasterization for SVGs, URLs, and Base64 images    |
| **Image (Node)**   | [`@m2d/image-node`](https://www.npmjs.com/package/@m2d/image-node)     | Server (Node.js) | Server-side image and SVG rasterization via `sharp`                  |
| **Mermaid**        | [`@m2d/mermaid`](https://www.npmjs.com/package/@m2d/mermaid)           | Browser          | Renders client-side Mermaid diagrams into SVG/PNG with auto-fixer    |
| **Mermaid (Node)** | [`@m2d/mermaid-node`](https://www.npmjs.com/package/@m2d/mermaid-node) | Server (Node.js) | Server-side DOM-less Mermaid diagrams via `beautiful-mermaid`        |
| **Math**           | [`@m2d/math`](https://www.npmjs.com/package/@m2d/math)                 | Browser / Node   | Compiles LaTeX math formulas into native Word `<m:oMath>` equations  |
| **Table**          | [`@m2d/table`](https://www.npmjs.com/package/@m2d/table)               | Browser / Node   | Renders GFM tables with column alignments, borders, and header fills |
| **List**           | [`@m2d/list`](https://www.npmjs.com/package/@m2d/list)                 | Browser / Node   | Formats ordered, unordered, and nested hierarchical lists            |
| **MDAST Types**    | [`@m2d/mdast`](https://www.npmjs.com/package/@m2d/mdast)               | Browser / Node   | TypeScript types for extended MDAST AST nodes                        |

### Using Plugins

```typescript
import { toDocx } from "@m2d/core";
import { tablePlugin } from "@m2d/table";
import { imagePlugin } from "@m2d/image";

const docxBlob = await toDocx(
  mdast,
  {},
  {
    plugins: [tablePlugin(), imagePlugin()],
  },
);
```

---

## 📜 API Reference

### `toDocx(astInputs, docxProps?, defaultSectionProps?, outputType?)`

```typescript
function toDocx(
  astInputs: Root | { ast: Root; props?: ISectionProps }[],
  docxProps?: IDocxProps,
  defaultSectionProps?: IDefaultSectionOptions,
  outputType?: "blob" | "buffer" | "arraybuffer",
): Promise<Blob | Buffer | ArrayBuffer | Uint8Array>;
```

#### Parameters

- **`astInputs`**: An MDAST `Root` node, or an array of section descriptors `{ ast: Root, props?: ISectionProps }[]` for multi-section documents.
  > ⚠️ **Deprecation Notice (Next Major Release)**: Passing an array of multiple AST inputs (`{ ast: Root, props?: ISectionProps }[]`) is deprecated and scheduled for removal in the next major version. Future multi-section support will be authored natively via markdown section directives within a single AST.
- **`docxProps`** _(optional)_: Global document properties passed to `docx.Document`:
  - `title`, `creator`, `description`, `subject`, `keywords`, `styles`, etc.
  - `definitionsScope` _(`"shared" | "section"`, default: `"shared"`)_: Controls the visibility and resolution scope of Markdown reference link definitions (`[ref]: url`) and footnotes across multiple sections:
    - `"shared"`: Aggregates link definitions and footnotes across all sections. Links defined anywhere in the document resolve globally. Footnote ID numbering uses deterministic section offsets so footnotes across sections never collide or overwrite one another. Local section definitions take precedence on key collisions.
    - `"section"`: Strictly isolates link definitions and footnotes within the section where they are declared.
- **`defaultSectionProps`** _(optional)_: Layout and conversion configuration applied to sections:
  - `useTitle` _(boolean, default: `true`)_: Maps top-level `# Heading` to Word's `Title` style and demotes nested headings proportionally.
  - `plugins` _(IPlugin[])_: Array of conversion plugins.
  - `trimInnerSpaces` _(boolean, default: `true`)_: Normalizes repeated whitespace in text runs.
  - Plus standard `docx` `ISectionOptions` (margins, paper size, orientation, headers, footers).
- **`outputType`** _(optional, default: `'blob'`)_: Target binary format (`"blob"`, `"buffer"`, or `"arraybuffer"`).

---

## 📑 Multi-Section Documents & Definitions Scope

> ⚠️ **Deprecation Notice (Next Major Release)**: Passing an array of multiple AST inputs (`{ ast: Root, props?: ISectionProps }[]`) to `toDocx` is deprecated and will be removed in the next major version. Next-generation multi-section authoring will be handled seamlessly within a single Markdown AST via section break syntax.

`@m2d/core` natively compiles multi-section Word documents where individual chapters or appendices have independent layouts (such as switching from **Portrait** for body text to **Landscape** for wide architecture tables):

```typescript
import { toDocx } from "@m2d/core";
import { PageOrientation } from "docx";
import { tablePlugin } from "@m2d/table";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const parser = unified().use(remarkParse).use(remarkGfm);

// 1. Chapter 1: Standard Portrait Executive Summary
const chapter1Ast = parser.parse(`
# Executive Summary
Cross-section reference link to [Technical Architecture][arch-ref].
Footnote reference in chapter 1[^fn1].

[^fn1]: Executive overview footnote.
`);

// 2. Chapter 2: Landscape Data Matrix (Wide Table)
const chapter2Ast = parser.parse(`
# Benchmark Data Matrix
| Metric | Throughput | Latency | Status |
| :--- | :---: | :---: | :--- |
| Core Pipeline | 14,200 ops/s | 1.2 ms | Verified |

Footnote reference in chapter 2[^fn2].

[^fn2]: Benchmark performance telemetry.
`);

// 3. Chapter 3: Appendix with Shared Reference Definitions
const chapter3Ast = parser.parse(`
# Appendix & Reference Index
Additional notes and global resources.

[arch-ref]: https://md2docx.com/docs/architecture "Technical Architecture Reference"
`);

// 4. Compile into a single unified Word document
const docxBlob = await toDocx(
  [
    {
      ast: chapter1Ast,
      props: {
        properties: {
          page: { size: { orientation: PageOrientation.PORTRAIT } },
        },
      },
    },
    {
      ast: chapter2Ast,
      props: {
        properties: {
          page: { size: { orientation: PageOrientation.LANDSCAPE } },
        },
      },
    },
    {
      ast: chapter3Ast,
      props: {
        properties: {
          page: { size: { orientation: PageOrientation.PORTRAIT } },
        },
      },
    },
  ],
  {
    title: "System Evaluation",
    definitionsScope: "shared", // default: resolves [arch-ref] and offsets [^fn1], [^fn2]
  },
  {
    plugins: [tablePlugin()],
  },
);
```

### Definitions & Footnotes Guarantees

1. **Collision-Free Footnote Offsets**: Multi-section documents automatically calculate sequential footnote ID offsets (`footnoteOffsets[sectionIndex]`). Section 2 footnotes will never overwrite Section 1 footnotes in the global Word document package.
2. **Deterministic Precedence**: If Section 1 declares `[target]: https://local.com` and Section 3 declares `[target]: https://global.com`, Section 1 preserves its local definition while Section 2 inherits the global definition.
3. **CommonMark Case-Insensitivity**: Both footnote identifiers (`[^MyNote]`) and link labels (`[MyLink][mylink]`) are matched case-insensitively in compliance with the CommonMark and GFM specifications.
4. **Defensive Reference Handling**: Dangling footnote references (`[^missing]`) and undefined reference links (`[missing][undef]`) render cleanly as text without throwing unhandled runtime exceptions.

---

## 📚 Deep Dive Guides & Architecture

Explore our dedicated documentation guides for advanced configurations and internal know-how:

- ⚡ **[Caching Architecture Guide](./docs/caching.mdx)**: Multi-tiered cache design, why TTL avoids write-amplification, lock-free IndexedDB concurrency, and `shouldCache` validation.
- 🔌 **[Plugin Authoring Guide](./docs/plugin-authoring.mdx)**: How to create custom plugins, hook into `preprocess`, `block`, `inline`, and `postprocess` lifecycles, and handle errors.
- 📑 **[Sections & Layout Guide](./docs/sections-and-layout.mdx)**: Crafting multi-section documents, landscape pages, custom margins, and heading hierarchy.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
