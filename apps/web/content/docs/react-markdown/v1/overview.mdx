# @m2d/react-markdown <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/react-markdown" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/react-markdown" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/react-markdown" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/react-markdown" />
  </a>
  <a href="https://npmjs.com/package/@m2d/react-markdown" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/react-markdown" />
  </a>
  <a href="https://npmjs.com/package/@m2d/react-markdown" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/react-markdown" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/react-markdown" />
</p>

> @m2d/react-markdown: A modern, SSR-compatible React Markdown renderer that preserves syntax trees for instant Word DOCX export.

---

## ✨ Features

- ⚛️ **React Server Components (RSC) Ready**: Zero-hook server imports (`@m2d/react-markdown`) safe for Next.js App Router and server rendering.
- 🔁 **Client-Side Reactivity & Memoization**: Dedicated `@m2d/react-markdown/client` entry for interactive editors with AST caching.
- 🌳 **Direct AST Capture (`astRef`)**: Retains parsed MDAST/HAST representations so you can trigger instant Word (`.docx`) exports without re-parsing.
- 🧱 **Arbitrary JSX Support (`<Mdx>`)**: Renders embedded Markdown strings nested within arbitrary React JSX structures.
- 🎨 **Component Overrides & Helpers**: Seamless tag replacements and built-in utilities like `Unwrap` and `Omit`.

---

## 📦 Installation

```bash
$ pnpm add @m2d/react-markdown
```

**_or_**

```bash
$ npm install @m2d/react-markdown
```

**_or_**

```bash
$ yarn add @m2d/react-markdown
```

---

## 🚀 Quick Start

### Basic Server Component Rendering

```tsx
import { Md } from "@m2d/react-markdown";

export default function Article() {
  return (
    <article className="prose">
      <Md>
        {"# Hello World\n\nRendered on the server with zero client hooks!"}
      </Md>
    </article>
  );
}
```

### Interactive Client Export to DOCX

```tsx
"use client";

import { useRef } from "react";
import { Md } from "@m2d/react-markdown/client";
import { toDocx } from "mdast2docx";

export function DocumentationViewer({ markdown }: { markdown: string }) {
  const astRef = useRef<{ mdast: any; hast: any }[]>([]);

  const handleExport = async () => {
    if (!astRef.current[0]?.mdast) return;
    const blob = await toDocx(astRef.current[0].mdast);
    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <button onClick={handleExport}>Export to Word</button>
      <Md astRef={astRef}>{markdown}</Md>
    </div>
  );
}
```

---

## 📚 Deep Dive Guides

- ⚛️ **[Server & Client Rendering Guide](./docs/server-and-client-rendering.mdx)**: React Server Components, client memoization, JSX parsing with `<Mdx>`, and component overrides.
- 💾 **[AST Capture & DOCX Export Guide](./docs/ast-capture-and-docx-export.mdx)**: Preserving ASTs with `astRef` and coupling with `mdast2docx`.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
