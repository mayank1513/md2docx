---
"@m2d/core": patch
"@m2d/frontmatter": patch
"@m2d/react-markdown": patch
---

- Share `DOCX_METADATA_MAP` between `@m2d/core` and `@m2d/frontmatter`.
- Unify wrapper rendering in `@m2d/react-markdown` via `renderWithWrapper`.
- Eliminate duplicate command options resolution in `@m2d/tiptap`.
