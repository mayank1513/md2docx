# @m2d/mermaid

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
