# @m2d/frontmatter

## 1.0.0

### Major Changes

- [#25](https://github.com/md2docx/md2docx/pull/25) [`2d33aa4`](https://github.com/md2docx/md2docx/commit/2d33aa4570638ec573597e4110b5832c1670a069) Thanks [@mayank1513](https://github.com/mayank1513)! - **BREAKING CHANGE:** Fix `frontmatterPlugin` signature by removing the unused `_docx` first parameter.
  
  We apologize for the design mistake in earlier versions where `_docx` was accepted as a dummy first parameter `frontmatterPlugin(_docx, options)`.
  
  `frontmatterPlugin` now directly accepts options as its first argument: `frontmatterPlugin(options?: FrontmatterPluginOptions)`.
  
  ### Migration Guide
  Before:
  ```ts
  frontmatterPlugin(undefined, { coverPage: true });
  ```
  After:
  ```ts
  frontmatterPlugin({ coverPage: true });
  ```

## 0.1.1

### Patch Changes

- Updated dependencies [[`127b9fc`](https://github.com/md2docx/md2docx/commit/127b9fc651a381e4edbfb1a5a188cec5beb305c0)]:
  - @m2d/core@1.10.0

## 0.1.0

### Minor Changes

- [`696b379`](https://github.com/md2docx/md2docx/commit/696b3791a4dd9fc21ae6cb9ba1d40d18f0a0a7c7) Thanks [@mayank1513](https://github.com/mayank1513)! - - Add automated Cover Page generation via `coverPage: true | CoverPageOptions` with title, subtitle, divider, metadata lines, and page break.
  - Add automated Metadata Info-Box callout / table banner via `infoBox: true | InfoBoxOptions`.
  - Export `CoverPageOptions` and `InfoBoxOptions` interfaces.

- [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0) Thanks [@mayank1513](https://github.com/mayank1513)! - - Add native front-matter metadata extraction to map Markdown YAML/TOML metadata directly to Word document properties (`title`, `creator`, `description`, `subject`, `keywords`).
  - Add dedicated zero-dependency `@m2d/frontmatter` plugin with quote-aware YAML and basic TOML parsing, prototype safety, and pluggable parser hooks.
  - Wire `@m2d/frontmatter` into `@m2d/remark-docx`, `@m2d/remark-docx-node`, and `mdast2docx/plugins`.
  - Deprecate `IPlugin.root`: Use `IPlugin.preprocess(tree, definitions, docxProps)` instead to inspect the AST and configure document-level properties.

### Patch Changes

- [`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8) Thanks [@mayank1513](https://github.com/mayank1513)! - - Share `DOCX_METADATA_MAP` between `@m2d/core` and `@m2d/frontmatter`.
  - Unify wrapper rendering in `@m2d/react-markdown` via `renderWithWrapper`.
  - Eliminate duplicate command options resolution in `@m2d/tiptap`.
- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0
