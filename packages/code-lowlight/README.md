# @m2d/code-lowlight <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/code-lowlight" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/code-lowlight" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/code-lowlight" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/code-lowlight" />
  </a>
  <a href="https://npmjs.com/package/@m2d/code-lowlight" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/code-lowlight" />
  </a>
  <a href="https://npmjs.com/package/@m2d/code-lowlight" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/code-lowlight" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/code-lowlight" />
</p>

> **@m2d/code-lowlight**: Battle-tested syntax highlighting plugin for `md2docx` powered by `lowlight` (highlight.js). Delivers 100+ language grammars, automatic language detection, preset Word themes, gutter line numbers, and Run Coalescing into clean OpenXML.

---

## ✨ Features

- 🌟 **Powered by Lowlight (highlight.js)**: Battle-tested grammar parsers covering 100+ programming languages and dialects.
- 🔍 **Auto Language Detection**: Automatically analyzes code snippets and detects programming languages when no language tag is provided.
- 🎨 **Authentic Word Themes**: Includes `github-light`, `github-dark`, `monokai`, and `executive-print` with OpenXML background shading (`<w:shd w:fill="HEX">`).
- 🔢 **Gutter Line Numbering**: Render code blocks as 2-column Word tables with right-aligned, muted line number columns.
- ⚡ **OpenXML Run Coalescing**: Automatically combines adjacent tokens with matching styles to cut `<w:r>` XML node bloat by 30%–50%.
- 🛡️ **Git Diff Highlighting**: Supports diff additions (`+`) and deletions (`-`) with green and red run/background tints.

---

## 📦 Installation

```bash
$ pnpm add @m2d/code-lowlight @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/code-lowlight @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/code-lowlight @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { codeLowlightPlugin } from "@m2d/code-lowlight";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# System Architecture

\`\`\`typescript showLineNumbers
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok" }));
});

server.listen(3000);
\`\`\`
`;

const ast = unified().use(remarkParse).parse(markdown);

const docxBlob = await toDocx(
  ast,
  {},
  {
    plugins: [
      codeLowlightPlugin({
        theme: "github-dark",
        lineNumbers: true,
      }),
    ],
  },
  "blob",
);
```

---

## ⚙️ Plugin Options

| Option          | Type                            | Default                  | Description                                                                                          |
| :-------------- | :------------------------------ | :----------------------- | :--------------------------------------------------------------------------------------------------- |
| `theme`         | `PresetThemeName \| ICodeTheme` | `"github-light"`         | Active theme (`"github-light"`, `"github-dark"`, `"monokai"`, `"executive-print"`, or custom theme). |
| `lineNumbers`   | `boolean`                       | `false`                  | When true, renders multi-line code blocks as 2-column tables with line numbers.                      |
| `lowlight`      | `LowlightInstance`              | `createLowlight(common)` | Custom lowlight instance with registered grammars.                                                   |
| `highlightAuto` | `boolean`                       | `true`                   | Fallback to automatic language detection when the language tag is unregistered.                      |
| `fontFamily`    | `string`                        | `"Consolas"`             | Monospace font family for Word code runs.                                                            |
| `fontSize`      | `number`                        | `19`                     | Half-points font size (19 = 9.5pt).                                                                  |
| `diffHighlight` | `boolean`                       | `true`                   | Highlights unified diff additions (`+`) and deletions (`-`).                                         |

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
