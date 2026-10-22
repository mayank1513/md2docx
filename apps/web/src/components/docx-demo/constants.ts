import {
  Calculator,
  FileSpreadsheet,
  GitBranch,
  Globe,
  ImageIcon,
  ListOrdered,
  Smile,
} from "lucide-react";
import type { PluginDefinition, TargetOption } from "./types";

export const ALL_PLUGINS_SAMPLE = `# md2docx Feature Showcase

A balanced, complete demonstration of standard Markdown, GitHub Flavored Markdown (GFM), math formulas, diagrams, tables, and rich HTML tags converted into a native Microsoft Word (.docx) document.

## 1. Mathematical Formulas (@m2d/math)
Inline equation: Einstein's mass-energy equivalence is $E = mc^2$.
Pythagorean theorem: $a^2 + b^2 = c^2$.

Display integral equation:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Euler's identity:
$$
e^{i\\pi} + 1 = 0
$$

Quadratic formula:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

## 2. Mermaid Diagram (@m2d/mermaid + @m2d/image)
\`\`\`mermaid
graph LR
    A["Markdown Source"] --> B["Unified / Remark Parser"]
    B --> C["Extended MDAST Tree"]
    C --> D["Plugin Pipeline"]
    D --> E["@m2d/core Converter"]
    E --> F["docx Document (.docx)"]
\`\`\`

## 3. Data Tables (@m2d/table)
| Plugin Package | Category | Execution Target | Status |
| :--- | :---: | :---: | ---: |
| \`@m2d/core\` | Engine | Universal (Browser + Node) | Stable |
| \`@m2d/math\` | Plugin | Word MathRuns / Equations | Active |
| \`@m2d/mermaid\` | Plugin | SVG to Raster Embedding | Active |
| \`@m2d/table\` | Plugin | OpenXML Tables & Alignments | Active |
| \`@m2d/list\` | Plugin | Numbered & Bulleted Hierarchies | Active |
| \`@m2d/html\` | Plugin | Raw HTML to DOCX Elements | Active |
| \`@m2d/image\` | Plugin | Browser Image / Canvas Rasterizer | Active |
| \`@m2d/image-node\` | Plugin | Node.js / Sharp Image Rasterizer | Active |

## 4. Nested Hierarchical Lists (@m2d/list)
1. Engine Architecture
   - Core AST parsing
   - Section configuration
2. Plugin Ecosystem
   1. Graphic Renderers
      - Mermaid Diagrams
      - Math LaTeX
   2. Typography
      - Rich HTML styling
      - Custom bullet sets

## 5. Inline HTML & Styling (@m2d/html)
Press <kbd>Ctrl</kbd> + <kbd>P</kbd> to export or inspect.
Status: <span style="color: #16a34a; font-weight: bold;">● Live & Ready</span>
Important note: <mark style="background-color: #fef08a;">Highlighted text rendered directly in Word</mark>.

## 6. Embedded Graphics (@m2d/image)
![Sample Badge](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAYElEQVQYV2NkgIL//xmCgcxMIHaGCu0F0tMZGRnWgviMIAKoqANIlcM0odGtQMU1jEBFPkCJzTgUwYS9QAoPAHn2BBQeBCn8AFTET0DhR5IUEm21J9DabQQ9Q3TwEBvgACT3J/F3uWU/AAAAAElFTkSuQmCC)
`;

export const MATH_SAMPLE = `# LaTeX Math Equations Showcase

Powered by **@m2d/math** — compiles LaTeX syntax into native Microsoft Word \`MathRun\`, \`MathFraction\`, \`MathRadical\`, and \`MathSum\` elements.

## Fundamental Physics & Mathematics

Einstein's mass-energy equivalence:
$E = mc^2$

The Pythagorean Theorem:
$a^2 + b^2 = c^2$

The Quadratic Formula:
$$
x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Euler's Identity:
$$
e^{i\\pi} + 1 = 0
$$

Gaussian Integral:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

Summation and Series:
$$
\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$
`;

export const MERMAID_SAMPLE = `# Mermaid Diagram Showcase

Powered by **@m2d/mermaid** and **@m2d/image** — compiles Mermaid diagram specifications into centered SVG vector graphics and embeds them into the DOCX document.

## Architecture Flowchart

\`\`\`mermaid
graph TD
    A[Markdown Input] --> B[Unified Pipeline]
    B --> C[AST Transformation]
    C --> D[Plugin Engine]
    D --> E[OpenXML Generation]
    E --> F[DOCX Output]
\`\`\`

## System Sequence Flow

\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>Server API: POST /api/docx with Markdown
    Server API->>Unified Engine: Parse AST
    Unified Engine->>Core Converter: toDocx(mdast, props)
    Core Converter->>DOCX Packer: Pack OpenXML Document
    DOCX Packer-->>Server API: Uint8Array Buffer
    Server API-->>Client: 200 OK (application/vnd.openxmlformats...)
\`\`\`
`;

export const TABLE_SAMPLE = `# Advanced Tables & Alignment Showcase

Powered by **@m2d/table** — converts Markdown and GFM tables into styled Microsoft Word tables with custom borders, headers, and column alignments.

## Multi-Column Performance Matrix

| Feature | Browser Execution | Server Execution | Benchmark Status |
| :--- | :---: | :---: | ---: |
| **AST Parsing** | In-Memory (V8) | Node.js Runtime | < 5ms |
| **LaTeX Math** | Native MathRuns | Native MathRuns | < 12ms |
| **Mermaid SVG** | Client-rendered | Vector/Fallback | < 35ms |
| **Table Layout** | Percentage Width | Percentage Width | < 8ms |
| **DOCX Packaging** | Blob Stream | Buffer Stream | < 45ms |

## Formatting Details
- Header rows automatically set \`tableHeader: true\` to repeat across page breaks.
- Text alignment in columns (\`:---\`, \`:---:\`, \`---:\`) is preserved in OpenXML.
`;

export const PRESETS = [
  { id: "all", label: "Showcase (All Plugins)", sample: ALL_PLUGINS_SAMPLE },
  { id: "math", label: "Math Equations", sample: MATH_SAMPLE },
  { id: "mermaid", label: "Mermaid Diagrams", sample: MERMAID_SAMPLE },
  { id: "table", label: "Tables & Data", sample: TABLE_SAMPLE },
  { id: "full", label: "Full Reference (sample.md)", sample: "" },
] as const;

export const TARGETS: TargetOption[] = [
  {
    id: "md2docx",
    name: "@m2d/md2docx",
    badge: "All-in-One",
    desc: "Batteries-included Markdown to DOCX converter for browser & client applications",
  },
  {
    id: "mdast2docx",
    name: "mdast2docx",
    badge: "Core AST",
    desc: "Low-level AST compiler for custom Unified/Remark pipelines with plugin array",
  },
  {
    id: "remark-docx",
    name: "@m2d/remark-docx",
    badge: "Unified Plugin",
    desc: "Unified compiler plugin that seamlessly plugs into unified().use() chains",
  },
  {
    id: "server",
    name: "@m2d/remark-docx-node",
    badge: "Node.js API",
    desc: "Server-side streaming API using Sharp rasterizer & Linkedom HTML parser",
    isServer: true,
  },
];

export const AVAILABLE_PLUGINS: PluginDefinition[] = [
  {
    id: "math",
    name: "@m2d/math",
    fnName: "mathPlugin",
    icon: Calculator,
    desc: "LaTeX Equations ($...$, $$...$$)",
  },
  {
    id: "mermaid",
    name: "@m2d/mermaid",
    fnName: "mermaidPlugin",
    icon: GitBranch,
    desc: "Flowcharts & Sequence diagrams",
  },
  {
    id: "image",
    name: "@m2d/image",
    fnName: "imagePlugin",
    icon: ImageIcon,
    desc: "Browser Images & SVGs",
  },
  {
    id: "table",
    name: "@m2d/table",
    fnName: "tablePlugin",
    icon: FileSpreadsheet,
    desc: "GFM Tables & Alignments",
  },
  {
    id: "list",
    name: "@m2d/list",
    fnName: "listPlugin",
    icon: ListOrdered,
    desc: "Numbered & Bulleted Trees",
  },
  {
    id: "html",
    name: "@m2d/html",
    fnName: "htmlPlugin",
    icon: Globe,
    desc: "HTML Markup (<kbd>, <mark>, etc.)",
  },
  {
    id: "emoji",
    name: "@m2d/emoji",
    fnName: "emojiPlugin",
    icon: Smile,
    desc: "GitHub Shortcodes & Twemoji",
  },
];
