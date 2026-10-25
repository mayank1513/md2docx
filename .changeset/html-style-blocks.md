---
"@m2d/html": minor
"@m2d/html-node": minor
---

- Support HTML `<style>` blocks in Markdown and HTML fragments, extracting CSS rules and stripping raw style elements from document flow
- Cascade CSS rules across document AST nodes: `table`, `th`, `td`, `tr`, `h1`–`h6`, `p`, `blockquote`, `code`, `hr`, and lists
- Support `background-color` extraction into docx shading fills and cell margins/padding
- Full compatibility across browser DOM and server-side LinkeDOM (`@m2d/html-node`)
- Deduplicate four-sided border mapping and rule style merging logic
