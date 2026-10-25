import {
  Calculator,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe,
  ImageIcon,
  ListOrdered,
  Smile,
} from "lucide-react";
import type { PluginDefinition, PluginId, TargetOption } from "./types";

export const ALL_PLUGINS_SAMPLE = `---
title: "md2docx Feature Showcase"
author: "Mayank Chaudhari"
description: "A complete demonstration of Markdown to native DOCX conversion"
keywords: "docx, markdown, openxml, remark"
---

# md2docx Feature Showcase

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

export const TECH_SPEC_SAMPLE = `---
title: "Distributed Payment Gateway Architecture"
author: "Engineering Architecture Team"
subject: "System Architecture & API Specification"
keywords: "payments, distributed-systems, architecture, api"
header: "Acme Corp • Technical Architecture Spec"
footer: "Confidential • Page 1"
---

# Distributed Payment Gateway Architecture

## 1. System Topology & Data Flow

\`\`\`mermaid
graph TD
    Client["Mobile & Web Clients"] --> Edge["Cloudflare Edge API"]
    Edge --> Service["Payment Auth Service"]
    Service --> Risk["Fraud & Risk Engine"]
    Service --> Ledger["Double-Entry Ledger"]
    Ledger --> DB[("PostgreSQL Aurora")]
    Service --> Provider["Acquiring Bank Gateway"]
\`\`\`

## 2. API Endpoints Specification

| Method | Endpoint | Latency SLA | Idempotent | Description |
| :--- | :--- | :---: | :---: | :--- |
| \`POST\` | \`/v1/charges\` | < 120ms | Yes | Authorize and capture payment intent |
| \`POST\` | \`/v1/refunds\` | < 200ms | Yes | Issue full or partial credit refund |
| \`GET\` | \`/v1/settlements\` | < 80ms | No | Query daily settlement batch records |

## 3. Reliability & Integrity Invariants
1. High Availability Invariants
   - Dual-region active-active deployment with automatic failover
   - End-to-end trace propagation across all microservices
2. Financial Transaction Safety
   - Exactly-once semantics via distributed redis mutexes
   - TLS 1.3 payload encryption and HMAC-SHA256 signature verification
`;

export const ACADEMIC_SAMPLE = `---
title: "Quantum State Superposition & Decoherence Rates"
author: "Dr. Elena Rostova, Department of Applied Physics"
subject: "Quantum Information Theory"
description: "Theoretical framework and analytical derivations for decoherence rates in trapped-ion quantum computers."
header: "Journal of Quantum Computing • Review Draft"
footer: "Physics Preprint • Page 1"
---

# Quantum State Superposition & Decoherence

## Abstract
We examine the analytical formulation of qubit phase decoherence in finite-temperature electromagnetic reservoirs.

## 1. Hamiltonian & Time Evolution

The total Hamiltonian of the coupled qubit-bath system is given by:

$$
\\hat{H} = \\frac{\\hbar \\omega_0}{2} \\hat{\\sigma}_z + \\sum_{k} \\hbar \\omega_k \\hat{b}_k^\\dagger \\hat{b}_k + \\sum_{k} g_k \\hat{\\sigma}_x (\\hat{b}_k + \\hat{b}_k^\\dagger)
$$

Under the rotating-wave approximation, the transition probability simplifies to:

$$
P(t) = \\frac{4 |g|^2}{\\Delta^2 + 4 |g|^2} \\sin^2\\left(\\frac{\\Omega t}{2}\\right)
$$

## 2. Experimental Verification
1. Trapped-Ion Benchmarks
   - Beryllium ions ($^9\\text{Be}^+$) confined in a linear Paul trap
   - Sideband laser cooling to motional ground state: $\\langle n \\rangle \\approx 0.05$
2. Dephasing Times
   - Transverse relaxation time: $T_2^* > 1.2\\text{ s}$
   - Ramsey fringe contrast decay fits exponential envelope:
     $$C(t) = e^{-(t/T_2)^2}$$
`;

export const EXECUTIVE_BRIEF_SAMPLE = `---
title: "Q3 Enterprise SaaS Performance & Strategic Review"
author: "Office of the Chief Executive Officer"
creator: "Acme Corporation Strategy Group"
subject: "Quarterly Performance & Growth Forecast"
keywords: "executive, q3-review, enterprise-saas, kpi"
description: "Executive brief covering recurring revenue expansion, enterprise retention, and fiscal forecasts."
header: "ACME CORPORATION • Q3 2026 STRATEGIC REPORT"
footer: "STRICTLY PRIVATE & CONFIDENTIAL"
---

# Q3 Enterprise Performance Review

## Executive Summary
Acme Corporation delivered exceptional financial and operational performance in Q3 2026, driven by record enterprise expansion and AI platform adoption.

## 1. Key Performance Indicators

| Metric | Target | Q3 Actual | YoY Growth | Status |
| :--- | :---: | :---: | :---: | :--- |
| **Annual Recurring Revenue (ARR)** | $45.0M | $48.2M | +38% | Outperformed |
| **Net Revenue Retention (NRR)** | 120% | 128% | +800 bps | Exceeded |
| **Gross Margin** | 78% | 81.4% | +340 bps | Healthy |
| **Customer Acquisition Payback** | 12 mos | 9.2 mos | -2.8 mos | Optimal |

## 2. Strategic Growth Initiatives
1. Enterprise Multi-Agent AI Suite
   - 42 Fortune 500 enterprise pilots initiated
   - SOC2 Type II and ISO 27001 certifications completed
2. Global Infrastructure
   - APAC cloud region operational in Tokyo
   - EMEA recurring revenue up 44% year-over-year

> **Strategic Directive**: Accelerate cloud migration incentives to convert remaining on-premise accounts to annual enterprise SaaS contracts before fiscal close.
`;

export const PRESETS = [
  { id: "all", label: "Showcase (All Plugins)", sample: ALL_PLUGINS_SAMPLE },
  { id: "tech-spec", label: "Architecture Spec", sample: TECH_SPEC_SAMPLE },
  { id: "academic", label: "Academic Paper", sample: ACADEMIC_SAMPLE },
  { id: "executive", label: "Executive Brief", sample: EXECUTIVE_BRIEF_SAMPLE },
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
    name: "Remark Plugin",
    badge: "Unified Plugin",
    desc: "Plugs into unified().use() chains (@m2d/remark-docx for browser, @m2d/remark-docx-node for Node.js)",
  },
];

export const AVAILABLE_PLUGINS: PluginDefinition[] = [
  {
    id: "frontmatter",
    name: "@m2d/frontmatter",
    fnName: "frontmatterPlugin",
    icon: FileText,
    desc: "YAML/TOML Document Properties",
  },
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

export const PRESET_PLUGINS: Record<
  (typeof PRESETS)[number]["id"],
  Record<PluginId, boolean>
> = {
  all: {
    frontmatter: true,
    math: true,
    mermaid: true,
    image: true,
    table: true,
    list: true,
    html: true,
    emoji: true,
  },
  "tech-spec": {
    frontmatter: true,
    math: false,
    mermaid: true,
    image: true,
    table: true,
    list: true,
    html: true,
    emoji: true,
  },
  academic: {
    frontmatter: true,
    math: true,
    mermaid: false,
    image: false,
    table: false,
    list: true,
    html: true,
    emoji: false,
  },
  executive: {
    frontmatter: true,
    math: false,
    mermaid: false,
    image: false,
    table: true,
    list: true,
    html: true,
    emoji: true,
  },
  full: {
    frontmatter: true,
    math: true,
    mermaid: true,
    image: true,
    table: true,
    list: true,
    html: true,
    emoji: true,
  },
  math: {
    frontmatter: false,
    math: true,
    mermaid: false,
    image: false,
    table: false,
    list: false,
    html: false,
    emoji: false,
  },
  mermaid: {
    frontmatter: false,
    math: false,
    mermaid: true,
    image: true,
    table: false,
    list: false,
    html: false,
    emoji: false,
  },
  table: {
    frontmatter: false,
    math: false,
    mermaid: false,
    image: false,
    table: true,
    list: false,
    html: false,
    emoji: false,
  },
};
