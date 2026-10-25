# @m2d/image-node

## 0.1.3

### Patch Changes

- Updated dependencies [[`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8), [`47ac4c7`](https://github.com/md2docx/md2docx/commit/47ac4c770343ff292107d37acc9b491ab0d381a7), [`909cd94`](https://github.com/md2docx/md2docx/commit/909cd944fccf6f7befd3960049d22adf9e8a60c0), [`e4c3545`](https://github.com/md2docx/md2docx/commit/e4c3545460a04ff33fc78c37a64edf4052f1cdd8)]:
  - @m2d/core@1.9.0
  - @m2d/image@1.6.1

## 0.1.2

### Patch Changes

- [`3c13b5c`](https://github.com/md2docx/md2docx/commit/3c13b5c081d49989d229afdc762e924c77c2101c) Thanks [@mayank1513](https://github.com/mayank1513)! - Export `@m2d/image/utils` subpath and share fallback run generation across `@m2d/image` and `@m2d/image-node`.
- Updated dependencies [[`3c13b5c`](https://github.com/md2docx/md2docx/commit/3c13b5c081d49989d229afdc762e924c77c2101c)]:
  - @m2d/image@1.6.0

## 0.1.1

### Patch Changes

- [`26e9209`](https://github.com/md2docx/md2docx/commit/26e9209d72fcb6ad24ddaaed64808ba17533add9) Thanks [@mayank1513](https://github.com/mayank1513)! - Ensure `altText.name` fallback defaults to empty string instead of undefined to satisfy `docx.DocPropertiesOptions` type requirements.
- Updated dependencies [[`ba608e8`](https://github.com/md2docx/md2docx/commit/ba608e8b1c9dcd51a3a332ba60e7d5c84735106f), [`0dcccbf`](https://github.com/md2docx/md2docx/commit/0dcccbf511b31f717f694a38666c62a8aeb69db7), [`c1d2a1f`](https://github.com/md2docx/md2docx/commit/c1d2a1fb4713a7f29b6fbf099daf1fe2e94cf9bd), [`d4468e2`](https://github.com/md2docx/md2docx/commit/d4468e252b27042551924197d7a9286d94ad1e73)]:
  - @m2d/core@1.8.1

## 0.1.0

### Minor Changes

- [`8456f9d`](https://github.com/md2docx/md2docx/commit/8456f9d12d822c457030c0c009cb9c45168460fc) Thanks [@mayank1513](https://github.com/mayank1513)! - Add `@m2d/image-node` as a dedicated server-side image rasterization plugin using `sharp` for fast local/remote image and SVG rendering, and re-export `nodeImagePlugin` from `mdast2docx`.

- [`3440941`](https://github.com/md2docx/md2docx/commit/34409418fb76ce9d9e74daf82356489f3d62fe78) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: add configurable error modes (`warn`, `silent`, `throw`, `placeholder`) and mermaid diagram code fallbacks

- [`041e825`](https://github.com/md2docx/md2docx/commit/041e825d170832d27dfdeddc816b4d791533f8db) Thanks [@mayank1513](https://github.com/mayank1513)! - feat: add `svgFallback` and `collapsibleHeading` options with AST preprocess block replacement for failed diagrams and SVGs

### Patch Changes

- [`9318c34`](https://github.com/md2docx/md2docx/commit/9318c34ee45a974c09390ef103607b9204aa6b61) Thanks [@mayank1513](https://github.com/mayank1513)! - Escape `{alt || "SVG unavailable"}` in JSDoc comments to prevent MDX parser ReferenceErrors during documentation builds.

- [`aee6baf`](https://github.com/md2docx/md2docx/commit/aee6baf3da46e1dc4b5428e5c4469719d90b51cf) Thanks [@mayank1513](https://github.com/mayank1513)! - Deduplicate sharp buffer processing between data URLs and external/file URLs, and un-nest AST image node resolution into module scope.
- Updated dependencies [[`98b766d`](https://github.com/md2docx/md2docx/commit/98b766de14a9150bdd4524c0bd18c3b849347187), [`c0a19a9`](https://github.com/md2docx/md2docx/commit/c0a19a95bff499fbfd9275df0d3f9efac99abf80), [`eafade1`](https://github.com/md2docx/md2docx/commit/eafade19075419aeb9a01a9d95d636e800a77e03), [`e5858a2`](https://github.com/md2docx/md2docx/commit/e5858a235b61ffc8e5b9d3b375115373633cf3e7), [`325ee92`](https://github.com/md2docx/md2docx/commit/325ee92ee600c29340898b52a70bb78a3b08a3cb), [`bcac5c4`](https://github.com/md2docx/md2docx/commit/bcac5c463cb3b44116cbf4a553162dd08197ad5a)]:
  - @m2d/core@1.8.0
