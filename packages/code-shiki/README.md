# @m2d/code-shiki <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/code-shiki" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/code-shiki" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/code-shiki" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/code-shiki" />
  </a>
  <a href="https://npmjs.com/package/@m2d/code-shiki" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/code-shiki" />
  </a>
  <a href="https://npmjs.com/package/@m2d/code-shiki" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/code-shiki" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/code-shiki" />
</p>

> **@m2d/code-shiki**: VS Code-grade syntax highlighting plugin for `md2docx` powered by `shiki`. Delivers precision TextMate grammar tokenization, lifecycle pre-warming via AST scanning, preset Word themes, gutter line numbers, and Run Coalescing into clean OpenXML.

---

## ✨ Features

- ⚡ **Powered by Shiki & TextMate**: Real TextMate grammar tokenization matching the exact highlighting fidelity of VS Code.
- 🔄 **AST Lifecycle Pre-warming**: Automatically inspects MDAST document trees during `preprocess` to load language grammars on demand.
- 🎨 **Authentic Word Themes**: Includes `github-light`, `github-dark`, `monokai`, and `executive-print` with native OpenXML background shading (`<w:shd w:fill="HEX">`).
- 🔢 **Gutter Line Numbering**: Render code blocks as 2-column Word tables with right-aligned, muted line number columns.
- ⚡ **OpenXML Run Coalescing**: Automatically combines adjacent tokens with matching styles to cut `<w:r>` XML node bloat by 30%–50%.
- 🛡️ **Git Diff Highlighting**: Supports diff additions (`+`) and deletions (`-`) with green and red run/background tints.
- 🔌 **Flexible Initialization**: Supports direct synchronous instantiation with a pre-configured `highlighter`, async pre-warming via `createCodeShiki`, or zero-config automatic AST warmup.

---

## 📦 Installation

```bash
$ pnpm add @m2d/code-shiki @m2d/core docx shiki
```

**_or_**

```bash
$ npm install @m2d/code-shiki @m2d/core docx shiki
```

**_or_**

```bash
$ yarn add @m2d/code-shiki @m2d/core docx shiki
```

---

## 🚀 Quick Start

### Zero-Config Auto Warmup

```typescript
import { toDocx } from "@m2d/core";
import { codeShikiPlugin } from "@m2d/code-shiki";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Architecture Spec

\`\`\`typescript showLineNumbers
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "healthy" }));
});

server.listen(8080);
\`\`\`
`;

const ast = unified().use(remarkParse).parse(markdown);

const docxBlob = await toDocx(
  ast,
  {},
  {
    plugins: [
      codeShikiPlugin({
        theme: "github-dark",
        lineNumbers: true,
      }),
    ],
  },
  "blob",
);
```

### Pre-Warmed Factory

```typescript
import { toDocx } from "@m2d/core";
import { createCodeShiki } from "@m2d/code-shiki";

const shikiPlugin = await createCodeShiki({
  theme: "executive-print",
  lineNumbers: true,
  langs: ["typescript", "python", "rust"],
});

const docxBlob = await toDocx(ast, {}, { plugins: [shikiPlugin] }, "blob");
```

---

## ⚙️ Plugin Options

| Option          | Type                                             | Default          | Description                                                                                          |
| :-------------- | :----------------------------------------------- | :--------------- | :--------------------------------------------------------------------------------------------------- |
| `theme`         | `PresetThemeName \| (string & {}) \| ICodeTheme` | `"github-light"` | Active theme (`"github-light"`, `"github-dark"`, `"monokai"`, `"executive-print"`, or custom theme). |
| `highlighter`   | `ShikiHighlighter`                               | `undefined`      | Optional pre-configured Shiki highlighter instance.                                                  |
| `shikiTheme`    | `string`                                         | `"github-light"` | Shiki theme identifier to use during tokenization.                                                   |
| `lineNumbers`   | `boolean`                                        | `false`          | When true, renders multi-line code blocks as 2-column tables with line numbers.                      |
| `fontFamily`    | `string`                                         | `"Consolas"`     | Monospace font family for Word code runs.                                                            |
| `fontSize`      | `number`                                         | `19`             | Half-points font size (19 = 9.5pt).                                                                  |
| `diffHighlight` | `boolean`                                        | `true`           | Highlights unified diff additions (`+`) and deletions (`-`).                                         |

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
