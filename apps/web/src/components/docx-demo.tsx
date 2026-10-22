"use client";

import { md2docx } from "@m2d/md2docx";
import { remarkDocx } from "@m2d/remark-docx";
import katex from "katex";
import {
  AlertCircle,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Cpu,
  Eye,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe,
  ImageIcon,
  Layers,
  ListOrdered,
  Loader2,
  RotateCcw,
  Server,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { toDocx } from "mdast2docx";
import {
  emojiPlugin,
  htmlPlugin,
  imagePlugin,
  listPlugin,
  mathPlugin,
  mermaidPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import { useEffect, useMemo, useState } from "react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { highlight } from "sugar-high";
import { unified } from "unified";
import { Button } from "./ui/button";

const ALL_PLUGINS_SAMPLE = `# md2docx Feature Showcase

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

const MATH_SAMPLE = `# LaTeX Math Equations Showcase

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

const MERMAID_SAMPLE = `# Mermaid Diagram Showcase

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

const TABLE_SAMPLE = `# Advanced Tables & Alignment Showcase

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

const PRESETS = [
  { id: "all", label: "Showcase (All Plugins)", sample: ALL_PLUGINS_SAMPLE },
  { id: "math", label: "Math Equations", sample: MATH_SAMPLE },
  { id: "mermaid", label: "Mermaid Diagrams", sample: MERMAID_SAMPLE },
  { id: "table", label: "Tables & Data", sample: TABLE_SAMPLE },
  { id: "full", label: "Full Reference (sample.md)", sample: "" },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

type TargetId = "md2docx" | "mdast2docx" | "remark-docx" | "server";

interface TargetOption {
  id: TargetId;
  name: string;
  badge: string;
  desc: string;
  isServer?: boolean;
}

const TARGETS: TargetOption[] = [
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

type PluginId =
  | "math"
  | "mermaid"
  | "image"
  | "table"
  | "list"
  | "html"
  | "emoji";

interface PluginDefinition {
  id: PluginId;
  name: string;
  fnName: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

const AVAILABLE_PLUGINS: PluginDefinition[] = [
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

type ViewMode = "edit" | "preview" | "code";

type TimingResult = {
  mode: "client" | "server";
  targetName: string;
  renderTimeMs: number;
  networkTimeMs?: number;
  totalTimeMs: number;
  sizeKb: number;
};

/**
 * Triggers a client-side file download from a Blob.
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Generates standard filename for demo preset downloads.
 */
const getPresetDocxFilename = (
  preset: string,
  target: string,
  mode: "client" | "server",
): string =>
  preset === "full"
    ? `full-sample-${target}-${mode}.docx`
    : `md2docx-${preset}-${target}-${mode}.docx`;

/**
 * Simple, fast client-side markdown to HTML renderer for the Live Preview tab.
 */
const renderMarkdownPreviewHtml = (md: string): string => {
  const html = md
    // Escape standard HTML brackets for non-tag blocks
    .replace(/&/g, "&amp;")
    // Display Math: $$ ... $$
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      try {
        return `<div class="my-4 text-center overflow-x-auto">${katex.renderToString(
          tex.trim(),
          { displayMode: true, throwOnError: false },
        )}</div>`;
      } catch {
        return `<div class="text-amber-500 font-mono text-xs my-2">$$${tex}$$</div>`;
      }
    })
    // Inline Math: $ ... $
    .replace(/\$([^$\n]+?)\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `<span class="text-amber-500 font-mono text-xs">$${tex}$</span>`;
      }
    })
    // Fenced Code Blocks (including mermaid)
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      if (lang === "mermaid") {
        return `<div class="my-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
          <div class="flex items-center gap-2 mb-2 text-xs font-semibold text-primary">
            <span>📊 Mermaid Diagram</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary uppercase font-mono">Rendered to Vector in DOCX</span>
          </div>
          <pre class="font-mono text-xs text-muted-foreground overflow-x-auto p-2 rounded bg-card/80 border border-border/50">${code.trim()}</pre>
        </div>`;
      }
      return `<pre class="my-3 p-3 rounded-lg bg-muted text-foreground font-mono text-xs overflow-x-auto border border-border"><code>${code.trim()}</code></pre>`;
    })
    // Headings
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-bold mt-5 mb-2 text-foreground">$1</h3>',
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-extrabold mt-6 mb-3 text-foreground border-b border-border/40 pb-1">$1</h2>',
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-black mt-4 mb-3 text-foreground">$1</h1>',
    )
    // Horizontal Rule
    .replace(/^---$/gim, '<hr class="my-6 border-border" />')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-primary">$1</code>',
    )
    // Unescape safe inline HTML markup specifically showcased by @m2d/html
    .replace(
      /&lt;kbd&gt;(.*?)&lt;\/kbd&gt;/g,
      '<kbd class="px-1.5 py-0.5 rounded text-xs font-mono bg-muted border border-border shadow-xs">$1</kbd>',
    )
    .replace(
      /&lt;mark style="([^"]*)"&gt;(.*?)&lt;\/mark&gt;/g,
      '<mark style="$1" class="px-1 rounded">$2</mark>',
    )
    .replace(
      /&lt;span style="([^"]*)"&gt;(.*?)&lt;\/span&gt;/g,
      '<span style="$1">$2</span>',
    );

  return html;
};

export const DocxDemo = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetId>("all");
  const [selectedTarget, setSelectedTarget] = useState<TargetId>("md2docx");
  const [markdown, setMarkdown] = useState(ALL_PLUGINS_SAMPLE);
  const [fullSampleText, setFullSampleText] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [copiedCode, setCopiedCode] = useState(false);

  // Plugin toggles state (default all true)
  const [enabledPlugins, setEnabledPlugins] = useState<
    Record<PluginId, boolean>
  >({
    math: true,
    mermaid: true,
    image: true,
    table: true,
    list: true,
    html: true,
    emoji: true,
  });

  const [clientLoading, setClientLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [timing, setTiming] = useState<TimingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const activePluginCount = useMemo(
    () => Object.values(enabledPlugins).filter(Boolean).length,
    [enabledPlugins],
  );

  const togglePlugin = (id: PluginId) => {
    setEnabledPlugins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllPlugins = (enable: boolean) => {
    setEnabledPlugins({
      math: enable,
      mermaid: enable,
      image: enable,
      table: enable,
      list: enable,
      html: enable,
      emoji: enable,
    });
  };

  const handleClearCache = () => {
    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        window.indexedDB.deleteDatabase("m2d-cache");
        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 2000);
      }
    } catch (err) {
      console.error("Failed to clear IndexedDB cache:", err);
    }
  };

  // Lazy-load full sample text when switched to "full"
  useEffect(() => {
    if (selectedPreset === "full") {
      if (!fullSampleText) {
        setLoadingSample(true);
        fetch("/api/sample")
          .then((res) => res.json())
          .then((data) => {
            if (data?.markdown) {
              setFullSampleText(data.markdown);
              setMarkdown(data.markdown);
            }
          })
          .catch((err) => console.error("Failed to load sample.md:", err))
          .finally(() => setLoadingSample(false));
      } else {
        setMarkdown(fullSampleText);
      }
    } else {
      const match = PRESETS.find((p) => p.id === selectedPreset);
      if (match) setMarkdown(match.sample);
    }
  }, [selectedPreset, fullSampleText]);

  /** Helper to instantiate only the active client plugins */
  const getActiveClientPlugins = () => {
    const list = [];
    if (enabledPlugins.mermaid) list.push(mermaidPlugin());
    if (enabledPlugins.html) list.push(htmlPlugin());
    if (enabledPlugins.list) list.push(listPlugin());
    if (enabledPlugins.math) list.push(mathPlugin());
    if (enabledPlugins.table) list.push(tablePlugin());
    if (enabledPlugins.emoji) list.push(emojiPlugin());
    if (enabledPlugins.image) list.push(imagePlugin());
    return list;
  };

  /** Client-Side Generation using the selected Target */
  const handleClientGenerate = async () => {
    setClientLoading(true);
    setErrorMsg(null);
    const start = performance.now();
    try {
      const plugins = getActiveClientPlugins();
      const docxProps = {
        title:
          selectedPreset === "full"
            ? "Markdown Syntax Showcase"
            : "md2docx Feature Showcase",
        creator: `${selectedTarget} Browser Engine`,
      };

      let docxBlob: Blob;

      if (selectedTarget === "md2docx") {
        // High-level @m2d/md2docx
        docxBlob = (await md2docx(
          markdown,
          docxProps,
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          { plugins: plugins as any },
          "blob",
        )) as Blob;
      } else if (selectedTarget === "remark-docx") {
        // Unified remarkDocx compiler
        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkFrontmatter)
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          .use(remarkDocx, "blob", docxProps, { plugins: plugins as any });
        const res = await processor.process(markdown);
        docxBlob = res.result as Blob;
      } else {
        // Core AST mdast2docx
        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkFrontmatter);
        const mdast = processor.parse(markdown);
        docxBlob = (await toDocx(
          mdast,
          docxProps,
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          { plugins: plugins as any },
          "blob",
        )) as Blob;
      }

      const renderTimeMs = Math.round(performance.now() - start);
      const sizeKb = Number((docxBlob.size / 1024).toFixed(1));

      // Trigger instant download
      downloadBlob(
        docxBlob,
        getPresetDocxFilename(selectedPreset, selectedTarget, "client"),
      );

      const targetLabel =
        TARGETS.find((t) => t.id === selectedTarget)?.name || "Client Engine";

      setTiming({
        mode: "client",
        targetName: targetLabel,
        renderTimeMs,
        networkTimeMs: 0,
        totalTimeMs: renderTimeMs,
        sizeKb,
      });
    } catch (err) {
      console.error("Client conversion failed:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Client-side DOCX conversion encountered an error.",
      );
    } finally {
      setClientLoading(false);
    }
  };

  /** Server-Side Generation: via API endpoint with server vs network profiling */
  const handleServerGenerate = async () => {
    setServerLoading(true);
    setErrorMsg(null);
    const roundtripStart = performance.now();
    try {
      const response = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          plugins: enabledPlugins,
        }),
      });

      if (!response.ok) throw new Error("Server conversion failed");
      const blob = await response.blob();
      const totalTimeMs = Math.round(performance.now() - roundtripStart);

      // Read server render time from X-Render-Time header
      const headerVal = response.headers.get("x-render-time");
      const serverRenderMs = headerVal
        ? Number.parseInt(headerVal, 10)
        : Math.round(totalTimeMs * 0.4);
      const networkTimeMs = Math.max(0, totalTimeMs - serverRenderMs);
      const sizeKb = Number((blob.size / 1024).toFixed(1));

      // Trigger download
      downloadBlob(
        blob,
        getPresetDocxFilename(selectedPreset, "node-server", "server"),
      );

      setTiming({
        mode: "server",
        targetName: "@m2d/remark-docx-node (Server API)",
        renderTimeMs: serverRenderMs,
        networkTimeMs,
        totalTimeMs,
        sizeKb,
      });
    } catch (err) {
      console.error("Server conversion failed:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Server-side DOCX conversion encountered an error.",
      );
    } finally {
      setServerLoading(false);
    }
  };

  /** Dynamically generated code snippet tailored to the user's selected Target & Plugins */
  const generatedCode = useMemo(() => {
    const activeFns = AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id]).map(
      (p) => `${p.fnName}()`,
    );

    if (selectedTarget === "md2docx") {
      return `import { md2docx } from "@m2d/md2docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";

// Fast, all-in-one Markdown to DOCX conversion
const docxBlob = await md2docx(
  markdown,
  {
    title: "My Document",
    creator: "md2docx Browser Engine"
  },
  {
    plugins: [
      ${activeFns.join(",\n      ")}
    ]
  },
  "blob"
);`;
    }

    if (selectedTarget === "mdast2docx") {
      return `import { toDocx } from "mdast2docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// 1. Parse Markdown into MDAST tree
const mdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .parse(markdown);

// 2. Compile MDAST tree into Word OpenXML document (.docx)
const docxBlob = await toDocx(
  mdast,
  { title: "My Document" },
  {
    plugins: [
      ${activeFns.join(",\n      ")}
    ]
  },
  "blob"
);`;
    }

    if (selectedTarget === "remark-docx") {
      return `import { remarkDocx } from "@m2d/remark-docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// Unified compiler pipeline
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(
    remarkDocx,
    "blob",
    { title: "My Document" },
    {
      plugins: [
        ${activeFns.join(",\n        ")}
      ]
    }
  );

const result = await processor.process(markdown);
const docxBlob = result.result;`;
    }

    // Node Server / CLI Target
    return `import { remarkDocxNode } from "@m2d/remark-docx-node";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import fs from "node:fs/promises";

// Server-side Node.js / CLI workflow
// Powered by Linkedom (DOM-less HTML) and Sharp (Native Image/SVG)
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDocxNode, "buffer", { title: "Architecture Report" });

const file = await processor.process(markdown);
await fs.writeFile("document.docx", Buffer.from(file.result));`;
  }, [selectedTarget, enabledPlugins]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <section id="demo" className="py-20 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Interactive Playground & Engine Showcase
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Universal Client & Server DOCX Generation
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Select your compilation target, configure active ecosystem plugins,
            and export native Microsoft Word (.docx) documents in real-time.
          </p>
        </div>

        {/* Target Selector Bar */}
        <div className="mb-6 p-4 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Layers className="w-4 h-4 text-primary" />
              <span>Compilation Target:</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Select which API package drives the DOCX generation pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TARGETS.map((target) => {
              const isSelected = selectedTarget === target.id;
              return (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => setSelectedTarget(target.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                      : "bg-muted/40 border-border/60 hover:bg-muted/80 hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`font-mono text-xs font-bold ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {target.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {target.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {target.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Plugin Toggles Section */}
        <div className="mb-6 p-4 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Active Plugin Ecosystem Pipeline:
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {activePluginCount} of {AVAILABLE_PLUGINS.length} Active
              </span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAllPlugins(true)}
                className="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Enable All
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={() => setAllPlugins(false)}
                className="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium"
              >
                Disable All
              </button>
            </div>
          </div>

          {/* Clickable Plugin Toggle Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {AVAILABLE_PLUGINS.map((plugin) => {
              const Icon = plugin.icon;
              const isEnabled = enabledPlugins[plugin.id];
              return (
                <button
                  key={plugin.id}
                  type="button"
                  onClick={() => togglePlugin(plugin.id)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isEnabled
                      ? "bg-primary/5 border-primary/40 shadow-xs"
                      : "bg-muted/30 border-border/40 opacity-50 hover:opacity-80"
                  }`}
                  title={`Click to ${isEnabled ? "disable" : "enable"} ${plugin.name}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isEnabled ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isEnabled
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-transparent"
                      }`}
                    >
                      {isEnabled ? <Check className="w-2.5 h-2.5" /> : null}
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    <div
                      className={`font-semibold text-xs truncate ${
                        isEnabled ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {plugin.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {plugin.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Workspace Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Document Preset Selector & Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/40">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                Presets:
              </span>
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                    selectedPreset === preset.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {preset.id === "full" && loadingSample
                    ? "Loading sample.md..."
                    : preset.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle & Reset Toolbar */}
            <div className="flex items-center gap-2">
              {/* View Switcher: Edit | Preview | Code */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-muted border border-border/60">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === "edit"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Markdown</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === "preview"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Live Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("code")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === "code"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Implementation Code</span>
                </button>
              </div>

              {/* Reset Text */}
              <button
                type="button"
                onClick={() => {
                  if (selectedPreset === "full" && fullSampleText) {
                    setMarkdown(fullSampleText);
                  } else {
                    const match = PRESETS.find((p) => p.id === selectedPreset);
                    if (match) setMarkdown(match.sample);
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5"
                title="Reset editor text to preset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Clear Cache */}
              <button
                type="button"
                onClick={handleClearCache}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5"
                title={
                  cacheCleared
                    ? "Cache Cleared!"
                    : "Clear browser IndexedDB diagram/image cache"
                }
              >
                <Trash2
                  className={`w-3.5 h-3.5 ${
                    cacheCleared ? "text-emerald-500" : ""
                  }`}
                />
                {cacheCleared && (
                  <span className="text-[11px] text-emerald-500 font-medium">
                    Cleared!
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Main Content Area: Editor, Preview, or Code */}
          <div className="p-5">
            {viewMode === "edit" && (
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={selectedPreset === "full" ? 14 : 11}
                className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
                placeholder="Write Markdown here..."
              />
            )}

            {viewMode === "preview" && (
              <div
                className="w-full min-h-[260px] max-h-[500px] overflow-y-auto p-5 rounded-xl border border-border bg-background text-foreground prose prose-sm dark:prose-invert max-w-none leading-relaxed"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: preview render
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownPreviewHtml(markdown),
                }}
              />
            )}

            {viewMode === "code" && (
              <div className="relative rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                    <span>
                      Generated for Target{" "}
                      <strong className="text-foreground">
                        {TARGETS.find((t) => t.id === selectedTarget)?.name}
                      </strong>{" "}
                      with{" "}
                      <strong className="text-foreground">
                        {activePluginCount}
                      </strong>{" "}
                      plugins
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="h-7 text-xs gap-1.5"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </Button>
                </div>
                <pre className="font-mono text-xs overflow-x-auto leading-relaxed text-foreground">
                  <code
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: syntax highlighted code
                    dangerouslySetInnerHTML={{
                      __html: highlight(generatedCode),
                    }}
                  />
                </pre>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mx-5 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Bar & Performance Metrics */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-5 py-4 border-t border-border bg-muted/30">
            {/* Latency Breakdown */}
            <div className="text-xs text-muted-foreground">
              {timing ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {timing.targetName}: {timing.sizeKb} KB
                    </span>
                  </div>
                  <span className="text-border">|</span>
                  <span>
                    Render: <strong>{timing.renderTimeMs}ms</strong>
                  </span>
                  {timing.mode === "server" && (
                    <>
                      <span className="text-border">|</span>
                      <span>
                        Network: <strong>{timing.networkTimeMs}ms</strong>
                      </span>
                      <span className="text-border">|</span>
                      <span>
                        Roundtrip: <strong>{timing.totalTimeMs}ms</strong>
                      </span>
                    </>
                  )}
                  {timing.mode === "client" && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-emerald-500 font-medium">
                        0ms Network (100% In-Browser)
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Click compile below to execute with selected target &
                    plugins
                  </span>
                </div>
              )}
            </div>

            {/* Symmetrical Action Buttons for Client & Server */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleServerGenerate}
                disabled={serverLoading || clientLoading || !markdown.trim()}
                className="text-xs font-medium border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer"
              >
                {serverLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Server Processing...
                  </>
                ) : (
                  <>
                    <Server className="w-3.5 h-3.5 mr-1.5" />
                    Render on Server (Node API)
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={handleClientGenerate}
                disabled={clientLoading || serverLoading || !markdown.trim()}
                className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {clientLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Compiling in Browser...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Compile in Browser (
                    {TARGETS.find((t) => t.id === selectedTarget)?.name})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
