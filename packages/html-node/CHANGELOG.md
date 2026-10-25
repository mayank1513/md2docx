# @m2d/html-node

## 0.2.0

### Minor Changes

- [`657e9e3`](https://github.com/md2docx/md2docx/commit/657e9e319a2dcd72abb35ed99ec8e539ff93372f) Thanks [@mayank1513](https://github.com/mayank1513)! - - Support HTML `<style>` blocks in Markdown and HTML fragments, extracting CSS rules and stripping raw style elements from document flow
  - Cascade CSS rules across document AST nodes: `table`, `th`, `td`, `tr`, `h1`–`h6`, `p`, `blockquote`, `code`, `hr`, and lists
  - Support `background-color` extraction into docx shading fills and cell margins/padding
  - Full compatibility across browser DOM and server-side LinkeDOM (`@m2d/html-node`)
  - Deduplicate four-sided border mapping and rule style merging logic

### Patch Changes

- Updated dependencies [[`657e9e3`](https://github.com/md2docx/md2docx/commit/657e9e319a2dcd72abb35ed99ec8e539ff93372f)]:
  - @m2d/html@1.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0
  - @m2d/html@1.2.1

## 0.1.0

### Minor Changes

- [`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7) Thanks [@mayank1513](https://github.com/mayank1513)! - Implement `@m2d/html-node` with linkedom for server-side HTML-in-Markdown conversion, extract `createHtmlPlugin` in `@m2d/html`, and wire `nodeHtmlPlugin` into `@m2d/remark-docx-node`.

### Patch Changes

- Updated dependencies [[`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7)]:
  - @m2d/html@1.2.0
