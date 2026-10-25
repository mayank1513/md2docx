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

> Zero-dependency front-matter plugin for md2docx to map Markdown YAML and TOML metadata to native DOCX document properties.

---

## ✨ Features

- **Zero External Dependencies:** Built-in quote-aware parser for YAML (`:`) and basic TOML (`=`).
- **Automatic Metadata Mapping:** Maps standard fields (`title`, `author`/`creator`, `description`, `subject`, `tags`/`keywords`, `revision`) directly to Word OpenXML document properties (`IPropertiesOptions`).
- **Automated Cover Page:** Generates a standalone styled title page with title, subtitle, metadata, and page break (`coverPage: true`).
- **Metadata Info-Box / Banner:** Automatically generates a styled callout blockquote or table banner (`infoBox: true`).
- **Quote & Escape Resilient:** Correctly preserves `#` inside strings and URLs, decodes escaped double quotes (`\"`), and decodes doubled single quotes (`''`).
- **Typed Inline Arrays:** Parses numbers, booleans, and quoted strings inside bracketed arrays (`[item1, true, 42]`).
- **Pluggable Parsers:** Seamlessly inject dedicated parsers (e.g. `smol-toml` or `yaml`) for complex nested tables, multi-line strings, or full specifications.

---

## 📦 Installation

```bash
pnpm add @m2d/frontmatter
```

---

## 🚀 Usage

### Basic Example (Zero Configuration)

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

### Advanced TOML Support (via Custom Parser)

For complex TOML documents containing tables (`[metadata]`), dates, or multi-line strings, install a dedicated parser like `smol-toml` and inject it into the plugin:

```bash
pnpm add smol-toml
```

```typescript
import { parse as parseToml } from "smol-toml";
import { frontmatterPlugin, parseFrontmatter } from "@m2d/frontmatter";

const plugin = frontmatterPlugin(undefined, {
  parser: (raw, type) =>
    type === "toml" ? parseToml(raw) : parseFrontmatter(raw, type),
});
```

### Advanced YAML Support (via `yaml`)

Similarly, if you need full YAML 1.2 spec features (anchors `&`, aliases `*`, or complex folded blocks):

```bash
pnpm add yaml
```

```typescript
import { parse as parseYaml } from "yaml";
import { frontmatterPlugin } from "@m2d/frontmatter";

const plugin = frontmatterPlugin(undefined, {
  parser: (raw) => parseYaml(raw),
});
```

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
