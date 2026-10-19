"use client";

import { toDocx } from "@m2d/core";
import { htmlPlugin } from "@m2d/html";
import { imagePlugin } from "@m2d/image";
import { listPlugin } from "@m2d/list";
import { mathPlugin } from "@m2d/math";
import { mermaidPlugin } from "@m2d/mermaid";
import { tablePlugin } from "@m2d/table";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Clock,
  Cpu,
  FileSpreadsheet,
  GitBranch,
  Globe,
  ImageIcon,
  ListOrdered,
  Loader2,
  RotateCcw,
  Server,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
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
    A[Markdown Source] --> B[Unified / Remark Parser]
    B --> C[Extended MDAST Tree]
    C --> D[Plugin Pipeline]
    D --> E[@m2d/core Converter]
    E --> F[docx Document (.docx)]
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

type TimingResult = {
  mode: "client" | "server";
  targetName: string;
  renderTimeMs: number;
  networkTimeMs?: number;
  totalTimeMs: number;
  sizeKb: number;
};

const ACTIVE_PLUGINS = [
  { name: "@m2d/math", icon: Calculator, desc: "LaTeX Equations" },
  { name: "@m2d/mermaid", icon: GitBranch, desc: "Mermaid Diagrams" },
  { name: "@m2d/image", icon: ImageIcon, desc: "Images & SVGs" },
  { name: "@m2d/table", icon: FileSpreadsheet, desc: "GFM Tables" },
  { name: "@m2d/list", icon: ListOrdered, desc: "Nested Lists" },
  { name: "@m2d/html", icon: Globe, desc: "HTML Tags" },
];

export const DocxDemo = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetId>("all");
  const [markdown, setMarkdown] = useState(ALL_PLUGINS_SAMPLE);
  const [fullSampleText, setFullSampleText] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const [clientLoading, setClientLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [timing, setTiming] = useState<TimingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  /** Client-Side Generation: All plugins run 100% inside the browser */
  const handleClientGenerate = async () => {
    setClientLoading(true);
    setErrorMsg(null);
    const start = performance.now();
    try {
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath);
      const mdast = processor.parse(markdown);

      // Instantiate all plugins for client compilation
      const plugins = [
        htmlPlugin(),
        mermaidPlugin(),
        imagePlugin(),
        listPlugin(),
        tablePlugin(),
        mathPlugin(),
      ];

      const docxBlob = (await toDocx(
        mdast,
        {
          title:
            selectedPreset === "full"
              ? "Markdown Syntax Showcase"
              : "md2docx Feature Showcase",
          creator: "md2docx Browser Engine",
        },
        { plugins },
        "blob",
      )) as Blob;

      const renderTimeMs = Math.round(performance.now() - start);
      const sizeKb = Number((docxBlob.size / 1024).toFixed(1));

      // Trigger instant download
      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        selectedPreset === "full"
          ? "full-sample-client.docx"
          : `md2docx-${selectedPreset}-client.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const targetLabel =
        PRESETS.find((p) => p.id === selectedPreset)?.label || "Custom Doc";

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
      let response: Response;
      if (selectedPreset === "full") {
        // GET /api/docx converts sample.md directly on server
        response = await fetch("/api/docx");
      } else {
        // POST /api/docx converts provided markdown on server
        response = await fetch("/api/docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown }),
        });
      }

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
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        selectedPreset === "full"
          ? "full-sample-server.docx"
          : `md2docx-${selectedPreset}-server.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      const targetLabel =
        PRESETS.find((p) => p.id === selectedPreset)?.label || "Custom Doc";

      setTiming({
        mode: "server",
        targetName: targetLabel,
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

  return (
    <section className="py-20 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Interactive Playground
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Universal Client & Server DOCX Generation
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Test the complete plugin ecosystem rendered 100% locally in your
            browser or streamed on demand from a Node.js server API.
          </p>
        </div>

        {/* Active Plugins Strip */}
        <div className="mb-6 p-4 rounded-xl border border-border/70 bg-card/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Active Ecosystem Plugins Loaded in Pipeline:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {ACTIVE_PLUGINS.map((plugin) => {
              const Icon = plugin.icon;
              return (
                <div
                  key={plugin.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/60 text-xs"
                >
                  <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-medium text-foreground truncate">
                      {plugin.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {plugin.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">
                  Client-Side (Browser)
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                  0ms Network
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                All 6 plugins active: Mermaid diagrams to SVG, LaTeX to
                MathRuns, GFM tables, and images compiled in WebAssembly/JS.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0 mt-0.5">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">
                  Server-Side (Node API)
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                  HTTP Streaming
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Rendered on demand via <code>/api/docx</code> with server-timing
                diagnostics. Ideal for CLI exports, webhooks, and automated
                batch runs.
              </p>
            </div>
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

            {/* Actions */}
            <div className="flex items-center gap-3">
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
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset editor text to preset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="p-5">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={selectedPreset === "full" ? 14 : 10}
              className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
              placeholder="Write Markdown here..."
            />
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
            {/* Detailed Latency Breakdown */}
            <div className="text-xs text-muted-foreground">
              {timing ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {timing.mode === "client"
                        ? "Browser (Local)"
                        : "Server API"}
                      : {timing.sizeKb} KB
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
                        Network/Transfer:{" "}
                        <strong>{timing.networkTimeMs}ms</strong>
                      </span>
                      <span className="text-border">|</span>
                      <span>
                        Total Roundtrip: <strong>{timing.totalTimeMs}ms</strong>
                      </span>
                    </>
                  )}
                  {timing.mode === "client" && (
                    <>
                      <span className="text-border">|</span>
                      <span className="text-emerald-500 font-medium">
                        0ms Network
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Choose an environment to compile and download</span>
                </div>
              )}
            </div>

            {/* Symmetrical Action Buttons for both Client & Server */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleServerGenerate}
                disabled={serverLoading || clientLoading || !markdown.trim()}
                className="text-xs font-medium border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500"
              >
                {serverLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Server Processing...
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 mr-1.5" />
                    Render on Server (API)
                  </>
                )}
              </Button>

              <Button
                size="sm"
                onClick={handleClientGenerate}
                disabled={clientLoading || serverLoading || !markdown.trim()}
                className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {clientLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Compiling in Browser...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Render in Browser (Client)
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
