# @m2d/remark-docx-node

## 0.2.0

### Minor Changes

- [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0) Thanks [@mayank1513](https://github.com/mayank1513)! - - Add native front-matter metadata extraction to map Markdown YAML/TOML metadata directly to Word document properties (`title`, `creator`, `description`, `subject`, `keywords`).
  - Add dedicated zero-dependency `@m2d/frontmatter` plugin with quote-aware YAML and basic TOML parsing, prototype safety, and pluggable parser hooks.
  - Wire `@m2d/frontmatter` into `@m2d/remark-docx`, `@m2d/remark-docx-node`, and `mdast2docx/plugins`.
  - Deprecate `IPlugin.root`: Use `IPlugin.preprocess(tree, definitions, docxProps)` instead to inspect the AST and configure document-level properties.

- [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8) Thanks [@mayank1513](https://github.com/mayank1513)! - - Support section-level `headerAst` and `footerAst` in `@m2d/core` compiled recursively into native Word `Header` and `Footer` instances using `toSection`.
  - Support `headerMarkdown` and `footerMarkdown` in `@m2d/remark-docx` and `@m2d/remark-docx-node` compiling Markdown headers/footers into MDAST for native Word section headers and footers.

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`696b379`](https://github.com/md2docx/md2docx/commit/696b3791a4dd9fc21ae6cb9ba1d40d18f0a0a7c7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0
  - @m2d/frontmatter@0.1.0
  - @m2d/html-node@0.1.1
  - @m2d/image-node@0.1.3
  - @m2d/list@0.0.12
  - @m2d/math@0.1.2
  - @m2d/mermaid-node@0.1.3
  - @m2d/table@0.1.4

## 0.1.1

### Patch Changes

- [`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7) Thanks [@mayank1513](https://github.com/mayank1513)! - Implement `@m2d/html-node` with linkedom for server-side HTML-in-Markdown conversion, extract `createHtmlPlugin` in `@m2d/html`, and wire `nodeHtmlPlugin` into `@m2d/remark-docx-node`.

- [`327f0e9`](https://github.com/md2docx/md2docx/commit/327f0e940566bd04fcd9035a7b3d2673729c6e77) Thanks [@mayank1513](https://github.com/mayank1513)! - Decouple `@m2d/remark-docx` and `@m2d/remark-docx-node` from `mdast2docx` to eliminate transitive native/Node dependencies (`sharp`, `linkedom`) in browser environments. Move Node-side plugins in `mdast2docx` to optional `peerDependencies`. Add FAQ and diagram limitations for `@m2d/mermaid-node`.
- Updated dependencies [[`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7), [`327f0e9`](https://github.com/md2docx/md2docx/commit/327f0e940566bd04fcd9035a7b3d2673729c6e77), [`3c13b5c`](https://github.com/md2docx/md2docx/commit/3c13b5c081d49989d229afdc762e924c77c2101c)]:
  - @m2d/html-node@0.1.0
  - @m2d/mermaid-node@0.1.2
  - @m2d/image-node@0.1.2
  - @m2d/table@0.1.3

## 0.1.0

### Minor Changes

- [`d33226e`](https://github.com/md2docx/md2docx/commit/d33226ef580341accbd98277b6c5a84aebff5c51) Thanks [@mayank1513](https://github.com/mayank1513)! - Create dedicated `@m2d/remark-docx-node` package for Node.js environments and add warning in `@m2d/remark-docx` when client plugin is run on Node.

### Patch Changes

- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f)]:
  - mdast2docx@1.6.3
