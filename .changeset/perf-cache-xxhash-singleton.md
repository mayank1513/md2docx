---
"@m2d/core": patch
---

Reuse singleton `xxhash-wasm` instance to avoid redundant WebAssembly re-initialization during cache key generation.
