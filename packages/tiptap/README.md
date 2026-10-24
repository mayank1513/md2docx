# @m2d/tiptap <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/tiptap" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=tiptap" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/tiptap" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/tiptap" />
  </a>
  <a href="https://npmjs.com/package/@m2d/tiptap" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/tiptap" />
  </a>
  <a href="https://npmjs.com/package/@m2d/tiptap" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/tiptap" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/tiptap" />
</p>

> **@m2d/tiptap**: Tiptap extension to export rich-text editor content directly to Word (`.docx`) documents entirely on the client or server.

---

## ✨ Features

- 📄 **Direct DOCX Export**: Convert Tiptap rich-text content to Microsoft Word `.docx` documents.
- ⚡ **Zero Cloud Dependencies**: Client-side conversion using `@m2d/md2docx` without paid subscriptions or external microservices.
- 🛠️ **Seamless Commands**: Adds `editor.commands.downloadDocx()` and `editor.commands.getDocxBlob()` directly to the Tiptap editor instance.
- 🎨 **Full Document Styling**: Configure metadata, headers, footers, margins, page orientation, and embedded plugins (Mermaid diagrams, LaTeX math, rich tables).

---

## 📦 Installation

```bash
$ pnpm add @m2d/tiptap
```

**_or_**

```bash
$ npm install @m2d/tiptap
```

**_or_**

```bash
$ yarn add @m2d/tiptap
```

---

## 🚀 Usage

### 1. Register Extension

```typescript
import { DocxExtension } from "@m2d/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const editor = useEditor({
  extensions: [
    StarterKit,
    DocxExtension.configure({
      defaultFilename: "my-document.docx",
    }),
  ],
  content: "<h1>Hello World</h1><p>Export me to DOCX!</p>",
});
```

### 2. Export / Download DOCX

```typescript
// Trigger instant browser download:
editor.commands.downloadDocx("custom-name.docx");

// Or obtain raw Blob for custom handling:
const blob = await editor.commands.getDocxBlob({
  docxProps: {
    title: "Quarterly Report",
    creator: "Acme Corp",
  },
});
```

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
