# @m2d/core

## 1.8.1

### Patch Changes

- [`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f) Thanks [@mayank1513](https://github.com/mayank1513)! - Extract persistent caching engine into `@m2d/cache` and re-export from `@m2d/core/cache` with deprecation notice for non-breaking backward compatibility.

- [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7) Thanks [@mayank1513](https://github.com/mayank1513)! - Export runtime values alongside types in `@m2d/core/cache` compatibility bridge.

- [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd) Thanks [@mayank1513](https://github.com/mayank1513)! - Standardize package.json export conditions to nested `import.types` (`.d.mts`) and `require.types` (`.d.ts`) for NodeNext and Bundler module resolution.

- [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73) Thanks [@mayank1513](https://github.com/mayank1513)! - Clean up obsolete `M2dRoot` type alias and casting in `@m2d/core`, and remove unused `hast.ts` file in `@m2d/mdast`.
- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73), [`ae692af`](https://github.com/md2docx/md2docx/commit/ae692afdbf6fff1efdd6f60e1a76b09209973336)]:
  - @m2d/cache@0.1.0
  - @m2d/mdast@0.2.5

## 1.8.0

### Minor Changes

- [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80) Thanks [@mayank1513](https://github.com/mayank1513)! - Include `namespace` in `generateCacheKey` and `createPersistentCache` to ensure cross-plugin cache key isolation in shared persistent storage.

- [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03) Thanks [@mayank1513](https://github.com/mayank1513)! - Add `shouldCache` predicate to `createPersistentCache` to allow consumers to prevent caching invalid, empty, or placeholder results.

### Patch Changes

- [`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: add `warnOnce` utility to deduplicate unsupported AST node type warnings

- [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7) Thanks [@mayank1513](https://github.com/mayank1513)! - Preserve array element ordering in `stableSerialize` during cache key generation instead of sorting.

- [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb) Thanks [@mayank1513](https://github.com/mayank1513)! - Prevent in-place mutation of `defaultSectionProps.plugins` array when merging section plugins.

- [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a) Thanks [@mayank1513](https://github.com/mayank1513)! - Reuse singleton `xxhash-wasm` instance to avoid redundant WebAssembly re-initialization during cache key generation.

## 1.7.1

### Patch Changes

- b186089: Fix potential crash when footnote definition is undefined

## 1.7.0

### Minor Changes

- 9302c0f: Add footnoteProps to ISectionProps for custom footnote styling

  Added `footnoteProps` property to `ISectionProps` interface that allows configuring paragraph and run styling options specifically for footnote content rendering. This enables fine-grained control over footnote appearance in generated DOCX documents.

### Patch Changes

- 5340741: Fix stableSerialize to properly pass ignoreKeys parameter to getSerializableKeys function. Possibly leading to minor performance enhancement

## 1.6.0

### Minor Changes

- c250ec4: Add blockquote styling with left indent and border.
  - Indent: left `720`, hanging `360`
  - Border: inset left border (`size: 20`, `space: 14`, `color: aaaaaa`)
  - Produces visually distinct blockquotes with proper formatting

### Patch Changes

- ab89cfb: Fixes issue parsing markdown with multiple footnotes

## 1.5.0

### Minor Changes

- fc9452c: feat: add trimInnerSpaces option to section processing for whitespace normalization

## 1.4.3

### Patch Changes

- 26199b2: Attempt to keep entire code block on same page.
- 4fbac23: feat/utils: add mergeOptions function for deep merging user and default options

## 1.4.2

### Patch Changes

- 45be2da: Expand data type to handle more of HTML Input element data.

## 1.4.1

### Patch Changes

- 502fd3e: Better type safety and minor rename cacheTarget to cacheMode

## 1.4.0

### Minor Changes

- 0a4b4b6: Refactored `createPersistentCache` to accept a `config` object for optional settings.

  **Before:**

  ```ts
  createPersistentCache(generator, namespace, ignoreKeys?, useIdb?)
  ```

  **Now:**

  ```ts
  createPersistentCache(generator, namespace, {
    ignoreKeys,
    cache, // optional in-memory cache object for cross-plugin sharing
    cacheTarget, // "memory" | "idb" | "both" (default: "both")
    parallel, // compute + read race (default: true)
  });
  ```

  - **In-memory cache sharing**: Pass a shared cache object to coordinate between modules or tabs.
  - **Configurable cache strategies**:
    - `cacheTarget`: choose where data is stored — RAM, IndexedDB, or both.
    - `parallel`: race compute and read to optimize latency.

  This is a **breaking change** for plugins that use caching due to the updated function signature.
  No changes for other users.

## 1.3.4

### Patch Changes

- 7bd97ca: fix: Bring back the Extended Node support and default to EmptyNode

## 1.3.3

### Patch Changes

- f091bdd: Simplify types.

## 1.3.2

### Patch Changes

- 56f6b67: fix: Update types for supporting HTML and advanced tables

## 1.3.1

### Patch Changes

- 2b67af0: fix tag types in node data

## 1.3.0

### Minor Changes

- 8d34bf3: Update types to ensure sufficient data for converting to jsx
- 8f9703a: refactor plugin interface to update postprocess hook. Since there is very limited scope for utilizing the document object once creted, we are moving the postprocess hook to be called just before creating the document object. It gets list of sections which can be finished up just before converting to docx.

## 1.2.0

### Minor Changes

- 8857587: Export docx object for advanced users
- bc0e116: Add postprocess hook to the plugins

## 1.1.6

### Patch Changes

- 96d0580: Use Promise.any to load the results as fast as possible either from cache or from directly generating using the generator function

## 1.1.5

### Patch Changes

- 500717b: fix: recursive serialization for objects

## 1.1.4

### Patch Changes

- 3731ab8: fix: handle case when generator return undefined or null

## 1.1.3

### Patch Changes

- 84d9dbd: fix SVG node value types

## 1.1.2

### Patch Changes

- 7dd01ca: Remove non-serializable fields from the generator result before caching

## 1.1.1

### Patch Changes

- f9dc971: fix: ignore promises in stableSerialize

## 1.1.0

### Minor Changes

- 56a8c29: Restructure utils and enhance caching system:
  - Move utils.ts to utils/index.ts for better organization
  - Replace cache-utils.ts with improved utils/cache.ts implementation
  - Add namespace support to cache entries for better management
  - Implement stale cache cleanup functionality
  - Enhance serialization with better handling of arrays and primitives
  - Update package.json exports to reflect new file structure
- 839e2e7: feat: add persistent caching utilities with IndexedDB support

  Implement a centralized caching mechanism that:

  - Provides both in-memory and persistent IndexedDB caching
  - Includes deterministic cache key generation with xxhash
  - Supports automatic timestamp tracking for cache entries
  - Prevents duplicate parallel processing with runtime cache
  - Adds xxhash-wasm dependency for efficient hashing

  This utility will improve performance by avoiding redundant
  expensive operations across the application.

## 1.0.2

### Patch Changes

- af4168a: fix image data types

## 1.0.1

### Patch Changes

- 6f7d1cb: Fix: fix type utils and update Plugin types to include definitions for preprocess.

## 1.0.1

### Patch Changes

- b0098bd: Update preprocess in plugin to include the definitions - required for rendering images.

## 1.0.0

### Major Changes

- a6643fe: Optimize plugin system by focusing promises only where needed. The `preprocess` method in the `IPlugin` interface now returns `void | Promise<void>` to allow plugins to perform asynchronous operations during the preprocessing phase, while removing promises from block and inline processors to improve performance. This change enables more flexible plugin implementations that can handle async tasks like fetching remote resources during preprocessing, while ensuring efficient synchronous rendering during the document generation phase. This change was announced here - https://github.com/md2docx/mdast2docx/discussions/15

### Minor Changes

- 194f266: Add Required types util

## 0.0.5

### Patch Changes

- aca557c: Update extended mdast types

## 0.0.4

### Patch Changes

- 075bdac: Update types to include svg
