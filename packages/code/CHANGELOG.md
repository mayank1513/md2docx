# @m2d/code

## 0.1.0

### Minor Changes

- [#25](https://github.com/md2docx/md2docx/pull/25) [`6a895fe`](https://github.com/md2docx/md2docx/commit/6a895fe59cec069d45e1fe13776a3817cb9e47fd) Thanks [@mayank1513](https://github.com/mayank1513)! - - `@m2d/code`: Add zero-dependency lexical tokenizer, syntax themes (`github-light`, `github-dark`, `monokai`, `executive-print`), 2-column gutter line numbering, git diff highlighting, and ReDoS-safe linear scanners
  - `@m2d/code-lowlight`: Add `lowlight` (highlight.js) syntax highlighting plugin with automatic language detection
  - `@m2d/code-shiki`: Add `shiki` syntax highlighting plugin with TextMate grammar tokenization and AST lifecycle pre-warming

### Patch Changes

- [#25](https://github.com/md2docx/md2docx/pull/25) [`9947530`](https://github.com/md2docx/md2docx/commit/9947530c1c279e90bfb3f64b59bab2ef119795e8) Thanks [@mayank1513](https://github.com/mayank1513)! - Simplify code block rendering to native core paragraph border styling and colored syntax runs without table or background shading bloat.
