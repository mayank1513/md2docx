# @m2d/remark-docx

## 1.5.1

### Patch Changes

- Updated dependencies [[`657e9e3`](https://github.com/md2docx/md2docx/commit/657e9e319a2dcd72abb35ed99ec8e539ff93372f), [`7ed174f`](https://github.com/md2docx/md2docx/commit/7ed174fad69db7458b7bd59f2a926432146e7433)]:
  - @m2d/html@1.3.0
  - @m2d/table@0.2.0
  - @m2d/image@1.6.1

## 1.5.0

### Minor Changes

- [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0) Thanks [@mayank1513](https://github.com/mayank1513)! - - Add native front-matter metadata extraction to map Markdown YAML/TOML metadata directly to Word document properties (`title`, `creator`, `description`, `subject`, `keywords`).
  - Add dedicated zero-dependency `@m2d/frontmatter` plugin with quote-aware YAML and basic TOML parsing, prototype safety, and pluggable parser hooks.
  - Wire `@m2d/frontmatter` into `@m2d/remark-docx`, `@m2d/remark-docx-node`, and `mdast2docx/plugins`.
  - Deprecate `IPlugin.root`: Use `IPlugin.preprocess(tree, definitions, docxProps)` instead to inspect the AST and configure document-level properties.

- [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8) Thanks [@mayank1513](https://github.com/mayank1513)! - - Support section-level `headerAst` and `footerAst` in `@m2d/core` compiled recursively into native Word `Header` and `Footer` instances using `toSection`.
  - Support `headerMarkdown` and `footerMarkdown` in `@m2d/remark-docx` and `@m2d/remark-docx-node` compiling Markdown headers/footers into MDAST for native Word section headers and footers.

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`696b379`](https://github.com/md2docx/md2docx/commit/696b3791a4dd9fc21ae6cb9ba1d40d18f0a0a7c7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0
  - @m2d/frontmatter@0.1.0
  - @m2d/html@1.2.1
  - @m2d/image@1.6.1
  - @m2d/list@0.0.12
  - @m2d/math@0.1.2
  - @m2d/mermaid@1.3.2
  - @m2d/table@0.1.4

## 1.4.0

### Minor Changes

- [`327f0e9`](https://github.com/md2docx/md2docx/commit/327f0e940566bd04fcd9035a7b3d2673729c6e77) Thanks [@mayank1513](https://github.com/mayank1513)! - Decouple `@m2d/remark-docx` and `@m2d/remark-docx-node` from `mdast2docx` to eliminate transitive native/Node dependencies (`sharp`, `linkedom`) in browser environments. Move Node-side plugins in `mdast2docx` to optional `peerDependencies`. Add FAQ and diagram limitations for `@m2d/mermaid-node`.

### Patch Changes

- Updated dependencies [[`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7), [`3c13b5c`](https://github.com/md2docx/md2docx/commit/3c13b5c081d49989d229afdc762e924c77c2101c)]:
  - @m2d/html@1.2.0
  - @m2d/image@1.6.0
  - @m2d/table@0.1.3

## 1.3.0

### Minor Changes

- [`a8966a0`](https://github.com/md2docx/md2docx/commit/a8966a02d2e7afb9900e12c7c03ae528667391e9) Thanks [@mayank1513](https://github.com/mayank1513)! - Add `@m2d/remark-docx/node` export wiring native server-side image resolution (`@m2d/image-node`) and Mermaid diagram rendering (`@m2d/mermaid-node`).

### Patch Changes

- [`d33226e`](https://github.com/md2docx/md2docx/commit/d33226ef580341accbd98277b6c5a84aebff5c51) Thanks [@mayank1513](https://github.com/mayank1513)! - Create dedicated `@m2d/remark-docx-node` package for Node.js environments and add warning in `@m2d/remark-docx` when client plugin is run on Node.
- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f)]:
  - mdast2docx@1.6.3

## 1.2.3

### Patch Changes

- [`d2954cd`](https://github.com/md2docx/md2docx/commit/d2954cda0cf0a86cbbf466124cf038ebdd385d93) Thanks [@mayank1513](https://github.com/mayank1513)! - Import default plugins from the clean subpath export `mdast2docx/plugins` instead of internal `mdast2docx/dist/plugins`.
- Updated dependencies [[`8456f9d`](https://github.com/md2docx/md2docx/commit/8456f9d12d822c457030c0c009cb9c45168460fc), [`f84b3eb`](https://github.com/md2docx/md2docx/commit/f84b3eb912c6d162ab3fd8775fb64be21a86edf5)]:
  - mdast2docx@1.6.2

## 1.2.2

### Patch Changes

- 6f99c68: Fix typescript types

## 1.2.1

### Patch Changes

- 999ae78: Export Mdast2DocxPluginProps and use DEFAULT_SECTION_PROPS from deps

## 1.2.0

### Minor Changes

- 0f25ee5: Support configuring default plugins

## 1.1.0

### Minor Changes

- The following dependencies were upgraded:

  ### mdast2docx: 1.4.1 → 1.6.1

  **Minor Changes**
  - The following @m2d/\* dependencies were upgraded:
  - ✨ Added `quality` option for image conversion.
  - Defaults to **0.92**.
  - Used only when conversion is required **and** the output format is lossy (e.g., JPEG).
  - Improve SVG → image conversion by preferring **OffscreenCanvas** over `<canvas>` when available.
  - OffscreenCanvas advantages:
  - Runs in worker contexts → avoids blocking the main thread during rasterization.
  - Provides more consistent and reliable Blob generation compared to `HTMLCanvasElement.toBlob`.
  - Better performance for large or complex SVGs.
  - Fallback to `<canvas>` remains for browsers without OffscreenCanvas support (e.g., Safari).
  - The following @m2d/\* dependencies were upgraded:
  - Add footnoteProps to ISectionProps for custom footnote styling
  - Add blockquote styling with left indent and border.
  - Indent: left `720`, hanging `360`
  - Border: inset left border (`size: 20`, `space: 14`, `color: aaaaaa`)
  - Produces visually distinct blockquotes with proper formatting
  - Fix stableSerialize to properly pass ignoreKeys parameter to getSerializableKeys function. Possibly leading to minor performance enhancement
  - Fixes issue parsing markdown with multiple footnotes
  - Remove `bmp` and `gif` fallback formats. These formats are not well supported on canvas, causing issues with our Canvas-based fallback conversion.
  - Enhanced cell styling API with full docx.js integration and comprehensive formatting options
  - Added `IFirstRowCellProps` and `ICellProps` interfaces with complete docx.js styling support
  - Introduced `data` property providing full access to docx.js `IParagraphOptions` and `IRunOptions`
  - Support for comprehensive text formatting: fonts, colors, sizes, bold, italics, underline, etc.
  - Advanced paragraph styling: alignment, spacing, indentation, numbering, bullets
  - Code block support with `pre` property for monospace formatting
  - Deprecated direct `alignment` property in favor of `data.alignment`
  - Enhanced documentation with detailed styling examples and docx.js integration guide
  - Maintained backward compatibility with existing configurations
  - Remove deprecated alignment property from default firstRowCellProps
  - fix: prevent variable reuse in table cell traversal
  - Fixes [#14](https://github.com/md2docx/core/issues/14)
  - Root cause: typo + missing `const` in `for (...)` loop caused accidental reuse of function arg (`node`).
  - Fix: added `const` keyword and renamed the inner loop variable to avoid scope collision.

  **Patch Changes**
  - The following @m2d/\* dependencies were upgraded:
  - Fix potential crash when footnote definition is undefined
  - Prevent hard failure when parsing content with invalid html tags
  - fix(list): restart ordered lists at `1.` instead of continuing numbering across lists
  - Fix exports
  - The following @m2d/\* dependencies were upgraded:
  - fix text alignment
  - Fix: fix an edge case where build might fail if the mermaid or similar plugin comes before htmlPlugin

## 1.0.0

### Major Changes

- The following dependencies were upgraded:

  ### mdast2docx: 0.4.1 → 1.4.1

  **Minor Changes**
  - The following @m2d/\* dependencies were upgraded:
  - feat: add trimInnerSpaces option to section processing for whitespace normalization
  - Attempt to keep entire code block on same page.
  - feat/utils: add mergeOptions function for deep merging user and default options
  - Support block elements inside table cell, e.g., table inside table
  - refactor: enhance table plugin options merging and alignment handling - headers can now be aligned independent of rest of table
  - Update types
  - The following @m2d/\* dependencies were upgraded:
  - Refactored `createPersistentCache` to accept a `config` object for optional settings.
  - **In-memory cache sharing**: Pass a shared cache object to coordinate between modules or tabs.
  - **Configurable cache strategies**:
  - `cacheTarget`: choose where data is stored — RAM, IndexedDB, or both.
  - `parallel`: race compute and read to optimize latency.
  - Update types to ensure sufficient data for converting to jsx
  - refactor plugin interface to update postprocess hook. Since there is very limited scope for utilizing the document object once creted, we are moving the postprocess hook to be called just before creating the document object. It gets list of sections which can be finished up just before converting to docx.
  - Better type safety and minor rename cacheTarget to cacheMode
  - fix: Bring back the Extended Node support and default to EmptyNode
  - Simplify types.
  - fix: Update types for supporting HTML and advanced tables
  - fix tag types in node data
  - Support block node inside table cells. Add tag to data for easy JSX creation
  - fix advanced table handling
  - fix: empty HTML table cells
  - Added support for optimized in-memory caching of resolved image data.
  - Introduced `cacheConfig.cache` option to share or inject a memory cache instance across multiple plugin invocations.
  - Consumers can now fine-tune cache behavior using `cacheConfig.parallel` (to avoid redundant parallel resolutions) and `cacheConfig.cacheMode` (choose between `"memory"`, `"idb"`, or `"both"`).
  - Enhances image resolution performance in multi-page or repeated image scenarios, especially when used across sessions or documents.
  - provide cache field to avoid entire cacheConfig option for simple cache sharing optimizations.
  - Store type in \_type for conversion to JSX
  - Ensure enough data is available on node after processing to convert to JSX.
  - Added support for optimized in-memory caching of resolved mermaid data.
  - Introduced `cacheConfig.cache` option to share or inject a memory cache instance across multiple plugin invocations.
  - Consumers can now fine-tune cache behavior using `cacheConfig.parallel` (to avoid redundant parallel resolutions) and `cacheConfig.cacheMode` (choose between `"memory"`, `"idb"`, or `"both"`).
  - Enhances mermaid resolution performance in multi-page or repeated mermaid scenarios, especially when used across sessions or documents.
  - fix: handle edgecase when cache is deleberately set to null.
  - provide cache field to avoid entire cacheConfig option for simple cache sharing optimizations.
  - Update types to be competible with the rest of the ecosystem.
  - The following @m2d/\* dependencies were upgraded:
  - Add configurable SVG rendering fixes to improve diagram rendering, particularly for Mermaid pie charts. Extract SVG fixes into a separate exportable function that can be customized through plugin options.
  - fix: Mermaid title alignment in pie chart
  - Add caching to indexeddb

  **Major Changes**
  - Upgrade to V1 - @see - https://github.com/md2docx/mdast2docx/discussions/15

  **Patch Changes**
  - The following @m2d/\* dependencies were upgraded:
  - Fix HTML parsing issues in case of empty tags.
  - The following @m2d/\* dependencies were upgraded:
  - Keep enough metadata for JSX creation.
  - Upgrade core package to v1
  - The following @m2d/\* dependencies were upgraded:
  - fix: td or th tags should be lowercase
  - The following @m2d/\* dependencies were upgraded:
  - Fix tags
  - The following @m2d/\* dependencies were upgraded:
  - fix: INPUT element style parsing
  - fix: Extract styles in createFragmentWithParentNodes as well to avoid misleading data.
  - The following @m2d/\* dependencies were upgraded:
  - Expand data type to handle more of HTML Input element data.
  - fix: Improve HTML Input element handling
  - Update types
  - Update image plugin
  - Do cache cleanup in postprocess hook
  - Update types and add image placeholder option
  - Enhance: Allow to provide placeholder image when not able to fetch image or some error.

## 0.1.0

### Minor Changes

- 8868e3a: Add support for mermaid, improve image handling,...
