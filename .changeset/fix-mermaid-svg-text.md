---
"@m2d/mermaid": patch
---

Disable `htmlLabels` in global and flowchart Mermaid configuration to generate native SVG `<text>` elements instead of HTML `<foreignObject>` tags, resolving unrenderable images in Microsoft Word ("the picture can't be displayed").
