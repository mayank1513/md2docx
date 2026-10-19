# @m2d/image-node <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://npmjs.com/package/@m2d/image-node" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/image-node" />
  </a>
  <a href="https://npmjs.com/package/@m2d/image-node" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/image-node" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/image-node" />
</p>

> Server-side Node.js image and SVG rasterization plugin for `@m2d/core` using `sharp`.

---

## ✨ Features

- **Native Sharp Rasterization**: Converts base64 data URLs, remote web images, local file paths, and SVG AST nodes into Word-compatible raster images.
- **Aspect-Ratio Preserving Scaling**: Automatically scales images down to fit page width (`maxW`) and height (`maxH`) according to document DPI.
- **Headless Node.js Friendly**: Runs in backend environments (Express, Next.js API routes, CLI tools, AWS Lambda) without requiring browser DOM or Canvas polyfills.
- **Safe Fallbacks**: Gracefully handles network failures, missing local files, or corrupt images by providing safe fallback placeholders rather than corrupting the Word document.

---

## 📦 Installation

```bash
$ pnpm add @m2d/image-node @m2d/core docx
```

**_or_**

```bash
$ npm install @m2d/image-node @m2d/core docx
```

---

## 🚀 Usage

```typescript
import { toDocx } from "@m2d/core";
import { nodeImagePlugin } from "@m2d/image-node";
import remarkParse from "remark-parse";
import { unified } from "unified";

const markdown = `
# Server Generated Document

![Local Image](./assets/diagram.png)
![Remote Image](https://example.com/logo.png)
`;

const mdast = unified().use(remarkParse).parse(markdown);

const docxBuffer = await toDocx(
  mdast,
  { title: "Server Document" },
  {
    plugins: [
      nodeImagePlugin({
        pathPrefix: "./public",
        fallbackImageType: "png",
        maxW: 6.5,
        maxH: 9,
      }),
    ],
  },
  "arraybuffer",
);
```

---

## ⚙️ Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pathPrefix` | `string` | `""` | Directory prefix for resolving relative local file paths |
| `fallbackImageType` | `"png" \| "jpg" \| "gif"` | `"png"` | Target format when converting SVGs or unsupported image formats |
| `maxW` | `number` | `6` | Maximum image width in inches |
| `maxH` | `number` | `8` | Maximum image height in inches |
| `dpi` | `number` | `96` | Target DPI for physical dimension calculation |
| `imageResolver` | `NodeImageResolver` | *built-in* | Custom resolver function to override default fetch/sharp pipeline |

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
