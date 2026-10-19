# @m2d/core <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

<p className="flex gap-2">
  <a href="https://github.com/md2docx/md2docx/actions/workflows/ci.yml" rel="noopener noreferrer">
    <img alt="CI" src="https://github.com/md2docx/md2docx/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="https://codecov.io/gh/md2docx/md2docx/tree/main/packages/@m2d/core" rel="noopener noreferrer">
    <img alt="codecov" src="https://codecov.io/gh/md2docx/md2docx/graph/badge.svg?flag=@m2d/core" />
  </a> 
  <a href="https://npmjs.com/package/@m2d/core" rel="noopener noreferrer">
    <img alt="npm version" src="https://img.shields.io/npm/v/@m2d/core" />
  </a>
  <a href="https://npmjs.com/package/@m2d/core" rel="noopener noreferrer">
    <img alt="npm downloads" src="https://img.shields.io/npm/d18m/@m2d/core" />
  </a>
  <a href="https://npmjs.com/package/@m2d/core" rel="noopener noreferrer">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/minzip/@m2d/core" />
  </a>
  <img alt="license" src="https://img.shields.io/npm/l/@m2d/core" />
</p>

> @m2d/core: Core engine to convert extended MDAST to DOCX. Supports plugins for footnotes, images, lists, tables, and more. Designed for seamless Markdown-to-DOCX conversion.

---

## ✨ Why @m2d/core?

- 
- 

---

## 📦 Installation

```bash
$ pnpm add @m2d/core
```

**_or_**

```bash
$ npm install @m2d/core
```

**_or_**

```bash
$ yarn add @m2d/core
```

---

## ⚡ Caching Architecture

`@m2d/core` includes a persistent caching utility (`createPersistentCache`) powered by IndexedDB and an in-memory runtime cache. It deduplicates concurrent computations, persists expensive conversions across sessions, and supports cache bypass via `bypassCache`.

### Why TTL Instead of Write-on-Read LRU?

In document generation workflows, assets (raster images, Mermaid diagrams, KaTeX formulas) frequently contain multi-kilobyte or multi-megabyte binary payloads. We intentionally do **not** use write-on-read LRU (updating access timestamps during cache hits):

1. **Eliminate Write Amplification**: IndexedDB does not support partial or delta record updates. Touching a timestamp on access forces IndexedDB to re-serialize and overwrite the entire record (including binary buffers) back to disk.
2. **Lock-Free Concurrency**: `readonly` IndexedDB transactions run fully in parallel across async operations and browser tabs. Opening `readwrite` transactions on every read serializes execution, creating severe lock contention when rendering documents with dozens of images.
3. **Zero Read Side-Effects**: Read operations are completely pure with no unhandled background promise rejections or quota spikes.

Instead, records are timestamped when generated and cleaned up via age-based Time-To-Live (`simpleCleanup(maxAgeMinutes, namespace)`).

### Consumer Validation (`shouldCache`)

`@m2d/core` remains strictly domain-agnostic. Determining whether a result is valid to cache (e.g., non-empty buffers, successfully resolved images, error-free diagrams) is the responsibility of the consumer plugin via the `shouldCache(result)` predicate.

---

## License

This library is licensed under the MIT open-source license.

<hr />

<p align="center">with 💖 by <a href="https://mayankchaudhari.com" target="_blank">Mayank Kumar Chaudhari</a></p>
