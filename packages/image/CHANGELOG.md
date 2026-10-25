# @m2d/image

## 1.6.1

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0

## 1.6.0

### Minor Changes

- [`3c13b5c`](https://github.com/md2docx/md2docx/commit/3c13b5c081d49989d229afdc762e924c77c2101c) Thanks [@mayank1513](https://github.com/mayank1513)! - Export `@m2d/image/utils` subpath and share fallback run generation across `@m2d/image` and `@m2d/image-node`.

## 1.5.1

### Patch Changes

- [`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f) Thanks [@mayank1513](https://github.com/mayank1513)! - Extract persistent caching engine into `@m2d/cache` and re-export from `@m2d/core/cache` with deprecation notice for non-breaking backward compatibility.

- [`26e9209`](https://github.com/md2docx/md2docx/commit/26e9209d72fcb6ad24ddaaed64808ba17533add9) Thanks [@mayank1513](https://github.com/mayank1513)! - Ensure `altText.name` fallback defaults to empty string instead of undefined to satisfy `docx.DocPropertiesOptions` type requirements.
- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73)]:
  - @m2d/cache@0.1.0
  - @m2d/core@1.8.1

## 1.5.0

### Minor Changes

- [`3440941`](https://github.com/md2docx/md2docx/commit/34409418fb76ce9d9e74daf82356489f3d62fe78) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: add configurable error modes (`warn`, `silent`, `throw`, `placeholder`) and mermaid diagram code fallbacks

- [`041e825`](https://github.com/md2docx/md2docx/commit/041e825d170832d27dfdeddc816b4d791533f8db) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: add `svgFallback` and `collapsibleHeading` options with AST preprocess block replacement for failed diagrams and SVGs

### Patch Changes

- [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03) Thanks [@mayank1513](https://github.com/mayank1513)! - Add `shouldCache` predicate to `createPersistentCache` to allow consumers to prevent caching invalid, empty, or placeholder results.

- [`9318c34`](https://github.com/md2docx/md2docx/commit/9318c34ee45a974c09390ef103607b9204aa6b61) Thanks [@mayank1513](https://github.com/mayank1513)! - Escape `{alt || "SVG unavailable"}` in JSDoc comments to prevent MDX parser ReferenceErrors during documentation builds.

- [`8456f9d`](https://github.com/md2docx/md2docx/commit/8456f9d12d822c457030c0c009cb9c45168460fc) Thanks [@mayank1513](https://github.com/mayank1513)! - Use valid 1x1 transparent GIF buffer for placeholder images instead of empty string to prevent DOCX corruption in Microsoft Word, and gracefully fallback to raw SVG if `tightlyCropSvg` encounters parsing errors.
- Updated dependencies [[`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187), [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80), [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03), [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7), [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb), [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a)]:
  - @m2d/core@1.8.0

## 1.4.0

### Minor Changes

- 27a9793: ✨ Added `quality` option for image conversion.
  - Defaults to **0.92**.
  - Used only when conversion is required **and** the output format is lossy (e.g., JPEG).

### Patch Changes

- c57114b: Improve SVG → image conversion by preferring **OffscreenCanvas** over `<canvas>` when available.
  - OffscreenCanvas advantages:
    - Runs in worker contexts → avoids blocking the main thread during rasterization.
    - Provides more consistent and reliable Blob generation compared to `HTMLCanvasElement.toBlob`.
    - Better performance for large or complex SVGs.

  - Fallback to `<canvas>` remains for browsers without OffscreenCanvas support (e.g., Safari).

## 1.3.2

### Patch Changes

- 59b1107: Remove `bmp` and `gif` fallback formats. These formats are not well supported on canvas, causing issues with our Canvas-based fallback conversion.

## 1.3.1

### Patch Changes

- 6c56799: provide cache field to avoid entire cacheConfig option for simple cache sharing optimizations.

## 1.3.0

### Minor Changes

- c2945bc: Added support for optimized in-memory caching of resolved image data.
  - Introduced `cacheConfig.cache` option to share or inject a memory cache instance across multiple plugin invocations.
  - Consumers can now fine-tune cache behavior using `cacheConfig.parallel` (to avoid redundant parallel resolutions) and `cacheConfig.cacheMode` (choose between `"memory"`, `"idb"`, or `"both"`).
  - Enhances image resolution performance in multi-page or repeated image scenarios, especially when used across sessions or documents.

## 1.2.1

### Patch Changes

- 4764975: Store type in \_type for conversion to JSX

## 1.2.0

### Minor Changes

- c0f8772: Add configurable SVG rendering fixes to improve diagram rendering, particularly for Mermaid pie charts. Extract SVG fixes into a separate exportable function that can be customized through plugin options.

## 1.1.3

### Patch Changes

- d02c5b4: fix: Mermaid title alignment in pie chart

## 1.1.2

### Patch Changes

- cb672c4: Update readme

## 1.1.1

### Patch Changes

- d260e28: Update mermaid plugin to use the diagramType infered by the mermaid library itself.
- 0998cd8: refactor: simplify URL handling in image resolver and update TypeScript target to ES2021
- acef6ad: fix the placeholder typo
- 42c9527: Use shared caching mechanism from @m2d/core

## 1.1.0

### Minor Changes

- c0ccdda: Rewrite image resolver to handle svg as well - prelude for cutom caching
- 3c2a0d7: Add IndexedDB image caching
  - Implement persistent image caching using IndexedDB
  - Add idb dependency for IndexedDB operations
  - Create cache get/set/clear operations
  - Integrate with image resolution pipeline
  - Improve performance for repeated image rendering

- 47c16c5: Enhanced image caching system with improved performance and reliability:
  - Replaced basic IndexedDB utilities with comprehensive caching system
  - Added deterministic hash-based cache keys using xxhash-wasm
  - Implemented in-memory cache to deduplicate parallel requests
  - Added salt option for cache key differentiation
  - Improved documentation with JSDoc comments
- a31621c: Make IndexedDB caching truly optional:
  - Only apply caching wrapper when idb option is enabled
  - Set default idb value to true for backward compatibility

### Patch Changes

- 3add133: Remove idb dependency and implement native IndexedDB API:
  - Replace idb library with native IndexedDB API to reduce bundle size
  - Fix SSR compatibility issues with Next.js
  - Improve object store configuration with keyPath for better data structure

## 1.0.1

### Patch Changes

- ecc0afa: fix image data types

## 1.0.0

### Major Changes

- 553a654: Changing the plugin signature in accordace with this discussion - https://github.com/md2docx/mdast2docx/discussions/15

### Minor Changes

- 9d1f896: Use caching

## 0.2.4

### Patch Changes

- a9f8cb3: limit scaling Gantt chart to avoid painting issues

## 0.2.3

### Patch Changes

- 5c0e37c: Fix: Improve error handling

## 0.2.2

### Patch Changes

- 43aeaf2: Fix placeholder image.

## 0.2.1

### Patch Changes

- c75c66d: fix: Update Readme

## 0.2.0

### Minor Changes

- d6d07b7: Add option to provide placeholder image

## 0.1.2

### Patch Changes

- dfddd4d: Add placeholder image option

## 0.1.1

### Patch Changes

- 25bf5f0: fix: avoid enlargement in tightlyCropSvg to avoid issues with gantt charts, etc.
- 6ee90b2: enhance: scale images appropreately to avoid extra enlargement after cropping.
- a0d6990: Do not tight crop Gantt charts.

## 0.1.0

### Minor Changes

- 299306f: Support svg node, handle urls returning svg and more...

### Patch Changes

- dd80547: refactor: prep for handling svg
- d8383f3: Apply data props, i.e., support html styling.
- 173f22c: Fix missing svg images

## 0.0.4

### Patch Changes

- 4dc7964: Do not use svg/fallback. Instead always convert to PNG as svg rendering in docx is inconsistent, e.g., image with data url within svg is ignored.
