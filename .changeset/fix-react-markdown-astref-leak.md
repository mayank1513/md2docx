---
"@m2d/react-markdown": patch
---

- Fix memory leak and stale AST in `astRef` across re-renders by tracking deterministic chunk indices
- Prevent unbounded array accumulation across re-renders in `<Md>` and `<Mdx>`
- Export `AstRef`, `AstArrayElement`, `MdProps`, `MdxProps`, and `ComponentProps` types from client and server entry points
