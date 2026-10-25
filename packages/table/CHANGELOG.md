# @m2d/table

## 0.1.4

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0

## 0.1.3

### Patch Changes

- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73)]:
  - @m2d/core@1.8.1

## 0.1.2

### Patch Changes

- Updated dependencies [[`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187), [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80), [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03), [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7), [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb), [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a)]:
  - @m2d/core@1.8.0

## 0.1.1

### Patch Changes

- f24a849: Remove deprecated alignment property from default firstRowCellProps

  Replaced the deprecated `alignment` property with proper `data` object structure in default options. Header cells now correctly use `data.alignment` and `data.bold` as documented in README.

- ae744b5: fix: prevent variable reuse in table cell traversal
  - Fixes [#14](https://github.com/md2docx/core/issues/14)
  - Root cause: typo + missing `const` in `for (...)` loop caused accidental reuse of function arg (`node`).
  - Fix: added `const` keyword and renamed the inner loop variable to avoid scope collision.

## 0.1.0

### Minor Changes

- 0d38935: Enhanced cell styling API with full docx.js integration and comprehensive formatting options
  - Added `IFirstRowCellProps` and `ICellProps` interfaces with complete docx.js styling support
  - Introduced `data` property providing full access to docx.js `IParagraphOptions` and `IRunOptions`
  - Support for comprehensive text formatting: fonts, colors, sizes, bold, italics, underline, etc.
  - Advanced paragraph styling: alignment, spacing, indentation, numbering, bullets
  - Code block support with `pre` property for monospace formatting
  - Deprecated direct `alignment` property in favor of `data.alignment`
  - Enhanced documentation with detailed styling examples and docx.js integration guide
  - Maintained backward compatibility with existing configurations

## 0.0.7

### Patch Changes

- c153a02: refactor: enhance table plugin options merging and alignment handling - headers can now be aligned independent of rest of table

### Patch Changes

- 9232aef: Update types

### Minor Changes

- 5f0f362: Support block elements inside table cell, e.g., table inside table

## 0.0.6

### Patch Changes

- 851747f: chore: update core package

## 0.0.5

### Patch Changes

- 1d2470c: Update core package to v1

## 0.0.4

### Patch Changes

- 0b5fd9d: Update types from @m2d/core
