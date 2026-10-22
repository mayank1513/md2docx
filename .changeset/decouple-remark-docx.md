---
"@m2d/remark-docx": minor
"@m2d/remark-docx-node": patch
"mdast2docx": patch
"@m2d/mermaid-node": patch
---

Decouple `@m2d/remark-docx` and `@m2d/remark-docx-node` from `mdast2docx` to eliminate transitive native/Node dependencies (`sharp`, `linkedom`) in browser environments. Move Node-side plugins in `mdast2docx` to optional `peerDependencies`. Add FAQ and diagram limitations for `@m2d/mermaid-node`.
