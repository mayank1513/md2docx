---
"@m2d/remark-docx": minor
"@m2d/remark-docx-node": minor
"@m2d/md2docx": minor
---

- Wire `@m2d/code` syntax highlighting plugin by default into `remark-docx` and `remark-docx-node`
- Support passing `false` in `pluginProps` (e.g. `code: false`, `mermaid: false`, `table: false`) to cleanly disable any default plugin
- Support seamless custom plugin substitution by passing `pluginProps: { [pluginName]: false }` alongside `sectionProps: { plugins: [...] }`
- Remove legacy `undefined` argument when invoking `frontmatterPlugin` and align `Mdast2DocxPluginProps['frontmatter']` type to `Parameters<typeof frontmatterPlugin>[0]`
- Simplify default plugin instantiation into a declarative iteration loop
