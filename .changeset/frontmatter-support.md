---
"@m2d/core": minor
"@m2d/frontmatter": minor
"@m2d/remark-docx": minor
"@m2d/remark-docx-node": minor
"mdast2docx": minor
---

- Add native front-matter metadata extraction to map Markdown YAML/TOML metadata directly to Word document properties (`title`, `creator`, `description`, `subject`, `keywords`).
- Add dedicated zero-dependency `@m2d/frontmatter` plugin with quote-aware YAML and basic TOML parsing, prototype safety, and pluggable parser hooks.
- Wire `@m2d/frontmatter` into `@m2d/remark-docx`, `@m2d/remark-docx-node`, and `mdast2docx/plugins`.
- Deprecate `IPlugin.root`: Use `IPlugin.preprocess(tree, definitions, docxProps)` instead to inspect the AST and configure document-level properties.
