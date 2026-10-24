# @m2d/frontmatter <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/frontmatter" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/frontmatter" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/frontmatter" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/frontmatter" />
  </a>
  <a href="https://npmjs.com/package/@m2d/frontmatter" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/frontmatter" />
  </a>
  <a href="https://npmjs.com/package/@m2d/frontmatter" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/frontmatter" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/frontmatter" />
</p>

> Front-matter plugin for md2docx to map Markdown YAML/TOML metadata to native DOCX document properties.

---

## ✨ Features

- **Automatic Metadata Mapping:** Maps standard Markdown front-matter fields (`title`, `author`/`creator`, `description`, `subject`, `tags`/`keywords`, `revision`) directly to Word OpenXML document properties (`IPropertiesOptions`).
- **Custom Properties Support:** Extra front-matter attributes (e.g. `department`, `status`, `date`) are preserved as Word custom document properties.
- **YAML & TOML Support:** Parses both YAML (`--- ... ---`) and TOML (`+++ ... +++`) front-matter blocks.
- **Custom Transformers:** Full control via custom parser and transform callbacks.

---

## 📦 Installation

```bash
pnpm add @m2d/frontmatter
```

---

## 🚀 Usage

### Basic Example

```typescript
import { toDocx } from "@m2d/core";
import { frontmatterPlugin } from "@m2d/frontmatter";

const docxBlob = await toDocx(
  mdast,
  {},
  {
    plugins: [frontmatterPlugin()],
  },
);
```

### Custom Transform Example

```typescript
import { frontmatterPlugin } from "@m2d/frontmatter";

const plugin = frontmatterPlugin(undefined, {
  transform: (data, docxProps) => {
    docxProps.title = `[Confidential] ${data.title}`;
    docxProps.subject = String(data.category ?? "General");
  },
});
```

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
