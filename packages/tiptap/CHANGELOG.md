# @m2d/tiptap

## 0.2.0

### Minor Changes

- [`4772ff7`](https://github.com/md2docx/md2docx/commit/4772ff79116aa815cb43c739f995ff9f565406f4) Thanks [@mayank1513](https://github.com/mayank1513)! - - Add automated YAML/TOML frontmatter delimiter preservation and recovery to `DocxExtension`
  - Configure `DocxExtension` at `priority: 1000` to intercept and isolate frontmatter before ProseMirror or Markdown parsers
  - Split and preserve frontmatter during editor initialization (`onBeforeCreate`) and via `setDocxContent`
  - Add `repairFrontmatter` and `splitFrontmatter` utilities to recover unclosed frontmatter
  - Add `getDocxMarkdown`, `getFrontmatter`, and `setFrontmatter` commands and helpers
  - Automatically reattach preserved frontmatter during DOCX generation (`getDocxBlob`, `downloadDocx`)

### Patch Changes

- Updated dependencies []:
  - @m2d/md2docx@0.1.3

## 0.1.0

### Minor Changes

- [`8ff8579`](https://github.com/md2docx/md2docx/commit/8ff857969fa9ab98e5f1bf2e5c7f6a62a5938058) Thanks [@mayank1513](https://github.com/mayank1513)! - - Implement `@m2d/tiptap` Tiptap extension to export rich-text editor content directly to Word (`.docx`) documents on client and server.
  - Add `editor.commands.getDocxBlob()` and `editor.commands.downloadDocx()` commands.

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0
  - @m2d/md2docx@0.1.2
