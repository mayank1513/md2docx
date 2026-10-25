# @m2d/list <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/list" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/list" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/list" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/list" />
  </a>
  <a href="https://npmjs.com/package/@m2d/list" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/list" />
  </a>
  <a href="https://npmjs.com/package/@m2d/list" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/list" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/list" />
</p>

> @m2d/list: Markdown List & Numbering conversion plugin for `@m2d/core`. Transforms ordered and bullet lists into native Word OpenXML numbering schemes.

---

## ✨ Features

- 🔢 **Hierarchical Decimal Numbering**: Generates clear, multi-level outline numbering (`1.`, `1.1.`, `1.1.1.`, `A.`, `a.`, `i.`) that avoids resetting arbitrarily at sub-levels.
- 🔲 **Multi-Tier Bullet Glyphs**: Automatically assigns distinct bullet characters (`●`, `○`, `■`, `◆`, `▶`, etc.) across nested list levels.
- 📄 **Native Word OpenXML Numbering**: Registers genuine Word abstract numbering schemes in `numbering.xml`, ensuring list items update dynamically in Word.
- ⚙️ **Fully Customizable Levels**: Use the exported `createLevels` utility to define custom indentation steps, start depths, and format sequences.
- 🏢 **Word Preset Support**: Toggle `defaultBullets: true` to seamlessly match standard Word template bullet configurations.

---

## 📦 Installation

```bash
$ pnpm add @m2d/list @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/list @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/list @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { listPlugin } from "@m2d/list";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Project Plan

1. Inception Phase
   1. Requirements Gathering
   2. Stakeholder Review
2. Implementation Phase
   1. Core Engine Development
      - Microservices architecture
      - Message queues
   2. Quality Assurance
`;

const mdast = unified().use(remarkParse).parse(markdown);

const docxBlob = await toDocx(
  mdast,
  {},
  {
    plugins: [listPlugin()],
  },
);
```

---

## ⚙️ Plugin Options

```typescript
import { ILevelsOptions } from "docx";

export interface IListPluginOptions {
  /** Defines custom numbering styles for ordered lists */
  levels?: ILevelsOptions[];

  /** Defines custom numbering styles for bullet lists */
  bulletLevels?: ILevelsOptions[];

  /** Bullet characters used for unordered lists (default: ["●", "○", "■", "◆", ...]) */
  bullets?: string[];

  /** If true, uses Word's default bullet styles instead of custom ones (default: false) */
  defaultBullets?: boolean;
}
```

---

## 📚 Deep Dive Guides

- 🔢 **[Ordered Lists & Hierarchical Numbering Guide](./docs/ordered-lists-and-numbering.mdx)**: Multi-level decimal numbering schemas, outline sequences, and the `createLevels` helper.
- 🔲 **[Bullet Styles & Nesting Guide](./docs/bullet-styles-and-nesting.mdx)**: Bullet glyph hierarchies, custom characters, and Word native preset modes.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
