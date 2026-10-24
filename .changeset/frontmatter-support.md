---

"@m2d/core": minor
"@m2d/frontmatter": minor
---

- Add native front-matter metadata extraction to map Markdown YAML metadata directly to Word document properties (`title`, `creator`, `description`, `subject`, `keywords`).
- Add dedicated `@m2d/frontmatter` plugin with YAML/TOML support and custom transform options.
- Deprecate `IPlugin.root`: Use `IPlugin.preprocess(tree, definitions, docxProps)` instead to inspect the AST and configure document-level properties.
