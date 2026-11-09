# @m2d/code <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/code" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/code" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/code" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/code" />
  </a>
  <a href="https://npmjs.com/package/@m2d/code" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/code" />
  </a>
  <a href="https://npmjs.com/package/@m2d/code" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/code" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/code" />
</p>

> @m2d/code: Token-level syntax highlighting and code block formatting plugin for md2docx with gutter line numbering, themes, and git diff support.

---

## ✨ Features

- 🎨 **Token-Level Syntax Highlighting**: Lightweight, zero-external-dependency built-in tokenizer supporting JavaScript, TypeScript, Python, JSON, Bash/Shell, HTML, CSS, SQL, Diff, and Markdown.
- 📐 **Gutter & Line Numbering**: Render clean 2-column Word OpenXML tables with right-aligned muted line numbers and tokenized code columns.
- 🎭 **Curated Theme Catalog**: Built-in `github-light`, `github-dark`, `monokai`, and `executive-print` (optimized for monochrome executive printing).
- 🔀 **Git Diff Support**: Highlight additions (`+`) and deletions (`-`) with full row/cell background tints and matching typography.
- 🔤 **Inline Code Formatting**: Intercepts `inlineCode` spans with active theme font, typography, and background shading.
- ⚙️ **Customizable Architecture**: Custom themes, tab sizes, font families, and custom tokenizer callbacks.

---

## 📦 Installation

```bash
$ pnpm add @m2d/code @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/code @m2d/core docx
```

**_or_**

```bash
$ yarn add @m2d/code @m2d/core docx
```

---

## 🚀 Quick Start

```typescript
import { toDocx } from "@m2d/core";
import { codePlugin } from "@m2d/code";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Developer Documentation

Here is an inline snippet: \`const answer = 42;\`

\`\`\`typescript showLineNumbers
import { toDocx } from "@m2d/core";

async function generate() {
  const doc = await toDocx(ast);
  return doc;
}
\`\`\`
`;

const ast = unified().use(remarkParse).parse(markdown);

const docxBlob = await toDocx(
  ast,
  {},
  {
    plugins: [
      codePlugin({
        theme: "github-light",
        lineNumbers: true,
        fontFamily: "Consolas",
      }),
    ],
  },
  "blob",
);
```

---

## 🎨 Preset Themes

| Theme                      | Background | Text Color | Use Case                                    |
| :------------------------- | :--------- | :--------- | :------------------------------------------ |
| `github-light` _(default)_ | `#f6f8fa`  | `#24292e`  | Technical articles, reports, white papers   |
| `github-dark`              | `#0d1117`  | `#c9d1d9`  | Modern engineering specs & dark templates   |
| `monokai`                  | `#272822`  | `#f8f8f2`  | Code-heavy developer tutorials              |
| `executive-print`          | `#f8fafc`  | `#1e293b`  | Formal executive printing & monochrome PDFs |

### Custom Theme Example

```typescript
import { codePlugin } from "@m2d/code";

const plugin = codePlugin({
  theme: {
    background: "#181824",
    text: "#e4e4e7",
    keyword: "#c084fc",
    string: "#4ade80",
    comment: "#71717a",
    number: "#fb923c",
    function: "#38bdf8",
    operator: "#f472b6",
    punctuation: "#a1a1aa",
    boolean: "#f43f5e",
    builtin: "#e879f9",
    variable: "#e4e4e7",
    gutterText: "#52525b",
    gutterBackground: "#12121a",
    diffAddBackground: "#14532d",
    diffAddText: "#86efac",
    diffDeleteBackground: "#7f1d1d",
    diffDeleteText: "#fca5a5",
    border: "#27273a",
  },
});
```

---

## 🔀 Git Diff Support

Syntax-highlight git patches and inline diff additions/deletions:

````markdown
```diff
--- a/config.ts
+++ b/config.ts
@@ -1,3 +1,3 @@
-const port = 3000;
+const port = 8080;
```
````

Lines starting with `+` receive a green tint (`diffAddBackground`), while lines starting with `-` receive a red tint (`diffDeleteBackground`).

---

## ⚙️ Plugin Options

| Option               | Type                                  | Default          | Description                                     |
| :------------------- | :------------------------------------ | :--------------- | :---------------------------------------------- |
| `theme`              | `PresetThemeName \| ICodeTheme`       | `"github-light"` | Active theme name or custom theme object        |
| `customThemes`       | `Record<string, Partial<ICodeTheme>>` | `undefined`      | Named custom theme dictionary                   |
| `lineNumbers`        | `boolean`                             | `false`          | Enable 2-column gutter with line numbers        |
| `gutterStart`        | `number`                              | `1`              | Starting line number in the gutter              |
| `gutterWidthPercent` | `number`                              | auto             | Gutter column width percentage (auto 6-15%)     |
| `fontFamily`         | `string`                              | `"Consolas"`     | Monospace font family for code blocks and runs  |
| `fontSize`           | `number`                              | `19`             | Font size in half-points (19 = ~9.5pt)          |
| `blockType`          | `"table" \| "paragraph"`              | `"table"`        | Block presentation when lineNumbers is false    |
| `highlightInline`    | `boolean`                             | `true`           | Intercept and style inlineCode nodes            |
| `diffHighlight`      | `boolean`                             | `true`           | Enable git diff row and line tinting            |
| `tabSize`            | `number`                              | `2`              | Number of spaces to replace tab characters with |
| `tokenizer`          | `(code, lang) => Token[][]`           | built-in         | Custom tokenizer callback                       |

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
