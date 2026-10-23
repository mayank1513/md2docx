# @m2d/mermaid

## 1.3.1

### Patch Changes

- [`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f) Thanks [@mayank1513](https://github.com/mayank1513)! - Extract persistent caching engine into `@m2d/cache` and re-export from `@m2d/core/cache` with deprecation notice for non-breaking backward compatibility.
- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73)]:
  - @m2d/cache@0.1.0
  - @m2d/core@1.8.1

## 1.3.0

### Minor Changes

- [`1dab971`](https://github.com/md2docx/md2docx/commit/1dab971b8f05d71ef87de9f8a93f89af9b7f2a37) Thanks [@mayank1513](https://github.com/mayank1513)! - Add built-in best-effort `defaultMermaidFixer` and `autoFix` option to automatically repair unquoted flowchart syntax and special characters.

### Patch Changes

- [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03) Thanks [@mayank1513](https://github.com/mayank1513)! - Add `shouldCache` predicate to `createPersistentCache` to allow consumers to prevent caching invalid, empty, or placeholder results.

- [`8456f9d`](https://github.com/md2docx/md2docx/commit/8456f9d12d822c457030c0c009cb9c45168460fc) Thanks [@mayank1513](https://github.com/mayank1513)! - Disable `htmlLabels` in global and flowchart Mermaid configuration to generate native SVG `<text>` elements instead of HTML `<foreignObject>` tags, resolving unrenderable images in Microsoft Word ("the picture can't be displayed").

- [`c145283`](https://github.com/md2docx/md2docx/commit/c1452834d617640a36915cb32087c7dfd70b5918) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: preserve AST node data and raw diagram source for diagram error fallbacks
- Updated dependencies [[`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187), [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80), [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03), [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7), [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb), [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a)]:
  - @m2d/core@1.8.0

## 1.2.2

### Patch Changes

- fdf4851: fix: handle edgecase when cache is deleberately set to null.

## 1.2.1

### Patch Changes

- 07ab8ba: provide cache field to avoid entire cacheConfig option for simple cache sharing optimizations.

## 1.2.0

### Minor Changes

- 439b541: Added support for optimized in-memory caching of resolved mermaid data.
  - Introduced `cacheConfig.cache` option to share or inject a memory cache instance across multiple plugin invocations.
  - Consumers can now fine-tune cache behavior using `cacheConfig.parallel` (to avoid redundant parallel resolutions) and `cacheConfig.cacheMode` (choose between `"memory"`, `"idb"`, or `"both"`).
  - Enhances mermaid resolution performance in multi-page or repeated mermaid scenarios, especially when used across sessions or documents.

## 1.1.5

### Patch Changes

- 165b4b1: Update types to be competible with the rest of the ecosystem.

## 1.1.4

### Patch Changes

- 84bc24b: Optimize cache cleanup by moving it to postprocess hook
  - Move cache cleanup from initialization to postprocess hook
  - Only run cleanup once per session with cleanupDone flag
  - Prevent unnecessary cleanups on multiple renders

- 8d0c585: Update Readme

## 1.1.3

### Patch Changes

- 55c8df9: fix: make idb optional parameter

## 1.1.2

### Patch Changes

- 39d2fb7: Move clean up function to initializer to avoid blocking the mermaid or image processing. Update core package to race promises to get the generated or cached data whichever is faster.

## 1.1.1

### Patch Changes

- 13df583: fix: account for mermaid config in the cache-key
  - moving low cost mermaid clean up outside cache, avoiding duplicate data caching to IndexedDB

## 1.1.0

### Minor Changes

- 90dd5a0: Implement caching using indexdb

## 1.0.1

### Patch Changes

- 028630d: feat: trim mermaid code lines only for diagram types where it is not critical.
- be458aa: fix: Do not trim mermaid charts

## 1.0.0

### Major Changes

- bb6c7fe: Plugin signature is upgraded as described here - https://github.com/md2docx/mdast2docx/discussions/15

### Patch Changes

- d135082: Add caching
- 01c9a9f: Use svg promises for optimization

## 0.0.3

### Patch Changes

- 0d972bf: suppressErrorRendering true by default

## 0.0.2

### Patch Changes

- 89ea8b4: Update Readme
- 16adc1f: Update metadata

## 0.0.1

### Patch Changes

- 98da0fb: Create only svg nodes. The actual rendering will be handled by the image plugin.
