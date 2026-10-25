---
"@m2d/react-markdown": patch
---

- Deduplicate recursive JSX element traversal and `astRef` cursor sizing logic across client `Md` and server `Mdx` components
- Extract reusable `createMarkdownRecursive` and `renderRecursiveMarkdown` helpers in `@m2d/react-markdown` utils
