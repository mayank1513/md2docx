---
"@m2d/frontmatter": major
---

**BREAKING CHANGE:** Fix `frontmatterPlugin` signature by removing the unused `_docx` first parameter.

We apologize for the design mistake in earlier versions where `_docx` was accepted as a dummy first parameter `frontmatterPlugin(_docx, options)`. 

`frontmatterPlugin` now directly accepts options as its first argument: `frontmatterPlugin(options?: FrontmatterPluginOptions)`.

### Migration Guide
Before:
```ts
frontmatterPlugin(undefined, { coverPage: true });
```
After:
```ts
frontmatterPlugin({ coverPage: true });
```
