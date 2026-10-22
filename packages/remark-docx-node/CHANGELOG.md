# @m2d/remark-docx-node

## 0.1.1

### Patch Changes

- [`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7) Thanks [@mayank1513](https://github.com/mayank1513)! - Implement `@m2d/html-node` with linkedom for server-side HTML-in-Markdown conversion, extract `createHtmlPlugin` in `@m2d/html`, and wire `nodeHtmlPlugin` into `@m2d/remark-docx-node`.

- [`327f0e9`](https://github.com/md2docx/md2docx/commit/327f0e940566bd04fcd9035a7b3d2673729c6e77) Thanks [@mayank1513](https://github.com/mayank1513)! - Decouple `@m2d/remark-docx` and `@m2d/remark-docx-node` from `mdast2docx` to eliminate transitive native/Node dependencies (`sharp`, `linkedom`) in browser environments. Move Node-side plugins in `mdast2docx` to optional `peerDependencies`. Add FAQ and diagram limitations for `@m2d/mermaid-node`.
- Updated dependencies [[`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7), [`327f0e9`](https://github.com/md2docx/md2docx/commit/327f0e940566bd04fcd9035a7b3d2673729c6e77), [`3c13b5c`](https://github.com/md2docx/md2docx/commit/3c13b5c081d49989d229afdc762e924c77c2101c)]:
  - @m2d/html-node@0.1.0
  - @m2d/mermaid-node@0.1.2
  - @m2d/image-node@0.1.2
  - @m2d/table@0.1.3

## 0.1.0

### Minor Changes

- [`d33226e`](https://github.com/md2docx/md2docx/commit/d33226ef580341accbd98277b6c5a84aebff5c51) Thanks [@mayank1513](https://github.com/mayank1513)! - Create dedicated `@m2d/remark-docx-node` package for Node.js environments and add warning in `@m2d/remark-docx` when client plugin is run on Node.

### Patch Changes

- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f)]:
  - mdast2docx@1.6.3
