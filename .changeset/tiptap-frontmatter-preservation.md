---
"@m2d/tiptap": minor
---

- Add automated YAML/TOML frontmatter delimiter preservation and recovery to `DocxExtension`
- Configure `DocxExtension` at `priority: 1000` to intercept and isolate frontmatter before ProseMirror or Markdown parsers
- Split and preserve frontmatter during editor initialization (`onBeforeCreate`) and via `setDocxContent`
- Add `repairFrontmatter` and `splitFrontmatter` utilities to recover unclosed frontmatter
- Add `getDocxMarkdown`, `getFrontmatter`, and `setFrontmatter` commands and helpers
- Automatically reattach preserved frontmatter during DOCX generation (`getDocxBlob`, `downloadDocx`)
