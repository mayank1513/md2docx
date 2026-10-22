# @m2d/mermaid-node

## 0.1.2

### Patch Changes

- [`327f0e9`](https://github.com/md2docx/md2docx/commit/327f0e940566bd04fcd9035a7b3d2673729c6e77) Thanks [@mayank1513](https://github.com/mayank1513)! - Decouple `@m2d/remark-docx` and `@m2d/remark-docx-node` from `mdast2docx` to eliminate transitive native/Node dependencies (`sharp`, `linkedom`) in browser environments. Move Node-side plugins in `mdast2docx` to optional `peerDependencies`. Add FAQ and diagram limitations for `@m2d/mermaid-node`.

## 0.1.1

### Patch Changes

- [`e7c0905`](https://github.com/md2docx/md2docx/commit/e7c090588695e8a58b6ed3a44599de50662395c6) Thanks [@mayank1513](https://github.com/mayank1513)! - Fix Mermaid state diagram start/end circles visibility on dark backgrounds with dual-contrast halos, fix dark mode node background fills, and support transparent and renderOptions configuration.
- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73)]:
  - @m2d/core@1.8.1

## 0.1.0

### Minor Changes

- [`f84b3eb`](https://github.com/md2docx/md2docx/commit/f84b3eb912c6d162ab3fd8775fb64be21a86edf5) Thanks [@mayank1513](https://github.com/mayank1513)! - Add `@m2d/mermaid-node` package using `beautiful-mermaid` for server-side Mermaid diagram rendering with zero DOM dependencies.

### Patch Changes

- [`ca6042c`](https://github.com/md2docx/md2docx/commit/ca6042cdf028029bf886e47874c664c41f250b9a) Thanks [@mayank1513](https://github.com/mayank1513)! - fix: inline CSS variables for librsvg/sharp color rendering, support transparent background, and normalize sequence diagram actor names

- [`c9acf5a`](https://github.com/md2docx/md2docx/commit/c9acf5adcb174184bc08be400eac424057ed109f) Thanks [@mayank1513](https://github.com/mayank1513)! - fix: wrap mermaid diagrams in centered paragraph AST node to match browser mermaid structure

- [`c145283`](https://github.com/md2docx/md2docx/commit/c1452834d617640a36915cb32087c7dfd70b5918) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: preserve AST node data and raw diagram source for diagram error fallbacks
- Updated dependencies [[`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187), [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80), [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03), [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7), [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb), [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a)]:
  - @m2d/core@1.8.0
