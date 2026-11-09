---
"@m2d/math": patch
---

Resolve nested superscripts and subscripts inside braces (e.g. `e^{-x^2}`, `a^{b^2}`, `x_{i_j}`) to nested DOCX MathSuperScript and MathSubScript elements instead of plain text.
