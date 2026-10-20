# @m2d/math <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/math" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/math" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/math" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/math" />
  </a>
  <a href="https://npmjs.com/package/@m2d/math" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/math" />
  </a>
  <a href="https://npmjs.com/package/@m2d/math" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/math" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/math" />
</p>

> @m2d/math: LaTeX Math to Word DOCX plugin for `@m2d/core`. Transforms inline and block math into native editable Word OpenXML equations.

---

## ✨ Features

- 📐 **Native Word Equations**: Converts LaTeX math into native `docx.Math` structures (`MathRun`, `MathFraction`, `MathRadical`, `MathSuperScript`, `MathSubScript`) — completely editable in Microsoft Word with crisp vector rendering.
- 🔣 **Rich Mathematical Macros**: Comprehensive support for fractions (`\frac`), roots (`\sqrt`), superscripts (`^`), subscripts (`_`), summations (`\sum`), integrals (`\int`), products (`\prod`), Greek letters, and standard mathematical relations.
- 🛡️ **Delimiter Boundary Guards**: Protects against runaway parsing caused by unescaped currency symbols or unclosed delimiters by checking for structural markdown markers.
- ⚙️ **Flexible Error Modes**: Choose between styled inline/block warning badges (`warn`), raw monospace code fallbacks (`raw`), or strict pipeline errors (`throw`).
- ⚡ **Lightweight & Fast**: Zero browser or heavy rendering engine overhead — converts LaTeX AST to Word OpenXML in pure TypeScript.

---

## 📦 Installation

```bash
$ pnpm add @m2d/math remark-math @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/math remark-math @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/math remark-math @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { mathPlugin } from "@m2d/math";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Physics Notes

Einstein's mass-energy equivalence is expressed as $E = mc^2$.

A quadratic formula:

$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$
`;

// 1. Parse markdown with remark-math to generate math AST nodes
const mdast = unified().use(remarkParse).use(remarkMath).parse(markdown);

// 2. Convert to DOCX with the math plugin
const docxBlob = await toDocx(mdast, {}, {
  plugins: [mathPlugin()],
});
```

---

## ⚙️ Plugin Options

```typescript
export interface IMathPluginOptions {
  /**
   * Error handling strategy when LaTeX parsing fails or runaway syntax is detected.
   * - "warn": Emits a styled warning text badge: `⚠️ [Math Syntax Error: ...]`
   * - "raw": Emits the raw formula string as monospace code text
   * - "throw": Re-throws the underlying parse error
   * @default "warn"
   */
  errorMode?: "warn" | "raw" | "throw";

  /**
   * Maximum character length allowed for inline equations.
   * Prevents runaway AST nodes when unclosed dollar signs occur.
   * @default 1000
   */
  maxInlineLength?: number;
}
```

---

## 📚 Deep Dive Guides

- 🔣 **[LaTeX Syntax & Symbols Guide](./docs/latex-syntax-and-symbols.mdx)**: Detailed documentation of supported operators, fractions, radicals, and Greek symbols.
- 🛡️ **[Resiliency & Error Modes Guide](./docs/resiliency-and-error-modes.mdx)**: Error handling strategies, delimiter boundary protection, and runaway length guards.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
