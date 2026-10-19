---
"@m2d/image": patch
---

Use valid 1x1 transparent GIF buffer for placeholder images instead of empty string to prevent DOCX corruption in Microsoft Word, and gracefully fallback to raw SVG if `tightlyCropSvg` encounters parsing errors.
