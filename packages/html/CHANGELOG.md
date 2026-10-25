# @m2d/html

## 1.3.0

### Minor Changes

- [`657e9e3`](https://github.com/md2docx/md2docx/commit/657e9e319a2dcd72abb35ed99ec8e539ff93372f) Thanks [@mayank1513](https://github.com/mayank1513)! - - Support HTML `<style>` blocks in Markdown and HTML fragments, extracting CSS rules and stripping raw style elements from document flow
  - Cascade CSS rules across document AST nodes: `table`, `th`, `td`, `tr`, `h1`–`h6`, `p`, `blockquote`, `code`, `hr`, and lists
  - Support `background-color` extraction into docx shading fills and cell margins/padding
  - Full compatibility across browser DOM and server-side LinkeDOM (`@m2d/html-node`)
  - Deduplicate four-sided border mapping and rule style merging logic

## 1.2.1

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0

## 1.2.0

### Minor Changes

- [`692eb67`](https://github.com/md2docx/md2docx/commit/692eb67792c9af1b2e86c25e4df73ba04b8b5ab7) Thanks [@mayank1513](https://github.com/mayank1513)! - Implement `@m2d/html-node` with linkedom for server-side HTML-in-Markdown conversion, extract `createHtmlPlugin` in `@m2d/html`, and wire `nodeHtmlPlugin` into `@m2d/remark-docx-node`.

## 1.1.13

### Patch Changes

- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73)]:
  - @m2d/core@1.8.1

## 1.1.12

### Patch Changes

- [`c58d49e`](https://github.com/md2docx/md2docx/commit/c58d49e284c1b87c4dbb78921d52ec20fb248f39) Thanks [@mayank1513](https://github.com/mayank1513)! - Fix CSS border width parsing radix to base 10 (`parseInt(width, 10)` instead of binary base 2).
- Updated dependencies [[`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187), [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80), [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03), [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7), [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb), [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a)]:
  - @m2d/core@1.8.0

## 1.1.11

### Patch Changes

- 32cb0bd: Prevent hard failure when parsing content with invalid html tags

## 1.1.10

### Patch Changes

- 08eefc3: fix text alignment

## 1.1.9

### Patch Changes

- 518385c: Fix: fix an edge case where build might fail if the mermaid or similar plugin comes before htmlPlugin

## 1.1.8

### Patch Changes

- 4a811aa: Fix HTML parsing issues in case of empty tags.

## 1.1.7

### Patch Changes

- dcd39bd: fix: td or th tags should be lowercase

## 1.1.6

### Patch Changes

- 30ad346: Fix tags

## 1.1.5

### Patch Changes

- f6be10c: fix: INPUT element style parsing

## 1.1.4

### Patch Changes

- bfbe9e0: fix: Extract styles in createFragmentWithParentNodes as well to avoid misleading data.

## 1.1.3

### Patch Changes

- bb24517: fix: Improve HTML Input element handling
- 735f6d1: Update types

## 1.1.2

### Patch Changes

- 24e6e16: fix advanced table handling

## 1.1.1

### Patch Changes

- 54e4c92: fix: empty HTML table cells

## 1.1.0

### Minor Changes

- b656cd7: Support block node inside table cells. Add tag to data for easy JSX creation

## 1.0.3

### Patch Changes

- 951e9a8: chore: update core package

## 1.0.2

### Patch Changes

- 97bb9d1: Upgrade core package to v1

## 1.0.1

### Patch Changes

- 114454a: fix: Fix inline tag extraction logic
- 2cc7d49: fix: Improve inline tag list. 2. Remove extra spacings.
- 5964742: Fix: fix form styles
- 0d71109: fix: Fix nested inline html tags
- 06a4f14: Fix: handle block and inline nodes in preprocess.

## 1.0.0

### Major Changes

- 8d05567: Export svg node in place of image node. The raw svg will be processed by the imagePlugin.

### Patch Changes

- 6dff43a: Update dependencies

## 0.0.4

### Patch Changes

- 0fa47b9: remove extra console.log and add unit test to assert no residual console.log
