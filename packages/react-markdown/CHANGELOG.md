# @m2d/react-markdown

## 1.0.3

### Patch Changes

- [`c0002b1`](https://github.com/md2docx/md2docx/commit/c0002b1df041ddbfb1f7189d3a5742398037d273) Thanks [@mayank1513](https://github.com/mayank1513)! - - Deduplicate recursive JSX element traversal and `astRef` cursor sizing logic across client `Md` and server `Mdx` components
  - Extract reusable `createMarkdownRecursive` and `renderRecursiveMarkdown` helpers in `@m2d/react-markdown` utils

## 1.0.2

### Patch Changes

- [`688a94d`](https://github.com/md2docx/md2docx/commit/688a94d7f6ae5a5ff093235845c66a85bf9a87d8) Thanks [@mayank1513](https://github.com/mayank1513)! - - Share `DOCX_METADATA_MAP` between `@m2d/core` and `@m2d/frontmatter`.
  - Unify wrapper rendering in `@m2d/react-markdown` via `renderWithWrapper`.
  - Eliminate duplicate command options resolution in `@m2d/tiptap`.

- [`f026e1b`](https://github.com/md2docx/md2docx/commit/f026e1b965235011c5b4afa1a376af0decf9aaa5) Thanks [@mayank1513](https://github.com/mayank1513)! - - Fix memory leak and stale AST in `astRef` across re-renders by tracking deterministic chunk indices
  - Prevent unbounded array accumulation across re-renders in `<Md>` and `<Mdx>`
  - Export `AstRef`, `AstArrayElement`, `MdProps`, `MdxProps`, and `ComponentProps` types from client and server entry points

## 1.0.1

### Patch Changes

- [`10c1162`](https://github.com/md2docx/md2docx/commit/10c116297325b654110ad0f8d743600456b3c0f5) Thanks [@mayank1513](https://github.com/mayank1513)! - Fix type definitions in `@m2d/react-markdown`: support `ReactNode` children in client `Md`, widen `handleAriaAndDataProps` input to `Record<string, unknown>`, remove unused `emptyHtmlTags`, and fix HAST `src` property assignment.

## 1.0.0

### Major Changes

- 344c4d2: Default Md now accepts only string children. For Mdx we are exposing another component from server/mdx.

## 0.3.0

### Minor Changes

- fbc66a3: refactor: update imports and enhance Markdown component for faster JSX runtime support

### Patch Changes

- 160322a: enhance MarkdownRecursive to handle array of children with unique keys

## 0.2.1

### Patch Changes

- 6fa6b46: fix: Add ./utils to exports.

## 0.2.0

### Minor Changes

- e1d4106: Add client-side `<Md />` component and refactor core utilities.
  - **Client-side `<Md />` component**:
    - New entrypoints `@m2d/react-markdown/client` and `@m2d/react-markdown/dist/client` for a memoized, client-optimized Markdown renderer.
    - uses memoization for client side optimizations
    - Supports full JSX children, SSR-safe, and dynamic and optimized reactivity.

  - **Refactor core utilities**:
    - Move all shared types and helpers (e.g., `ComponentProps`, `AstRef`, `Markdown`, `uuid`, etc.) to `lib/src/utils.tsx`.
    - Remove duplicated code and unify server/client logic.

  - **Testing**:
    - Add comprehensive tests for the client `<Md />` component.

  - **Package exports**:
    - Update `lib/package.json` to expose new client entrypoints and dependencies.

  - **Other**:
    - Update coverage exclusions in `vitest.config.mts`.
    - Minor internal cleanups and improved type safety.

  ---

  This release introduces a modern, SSR-safe, and client-optimized Markdown renderer with unified logic and improved maintainability.

## 0.1.1

### Patch Changes

- a196614: Update readme

## 0.1.0

### Minor Changes

- 689e225: 🧪 Add test utilities for structural validation
