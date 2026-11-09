"use client";

import { PageOrientation } from "docx";
import {
  AlertTriangle,
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  FileCheck2,
  Layers,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react";
import type { Root } from "mdast";
import { toDocx } from "mdast2docx";
import {
  emojiPlugin,
  htmlPlugin,
  listPlugin,
  mathPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import { useCallback, useEffect, useMemo, useState } from "react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { DocxViewer } from "../docx-demo/docx-viewer";
import { highlightCode } from "../docx-demo/highlight";
import { downloadBlob } from "../docx-demo/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface SectionPayload {
  id: string;
  name: string;
  orientation: "portrait" | "landscape";
  markdown: string;
}

const DEFAULT_SECTIONS: SectionPayload[] = [
  {
    id: "section-1",
    name: "Section 1: Executive Overview",
    orientation: "portrait",
    markdown: `---
title: "Enterprise Multi-Section System Architecture"
author: "Mayank Chaudhari"
subject: "Multi-Section AST & Cross-Section Scoping Showcase"
---

# Executive Overview

This document demonstrates **multi-section compilation** in md2docx by passing an array of discrete AST trees (\`{ ast, props }[]\`) to \`toDocx\`.

### Key Multi-Section Capabilities:
1. **Dynamic Page Geometry**: Switch orientation between Portrait and Landscape per section.
2. **Cross-Section Definitions**: Notice the link to the [Technical Architecture Guide][arch-guide]. The reference definition is declared in **Section 3**, yet resolves here under \`definitionsScope: "shared"\`.
3. **Collision-Free Footnotes**: Sequential numbering automatically offsets across sections[^exec-note].

[^exec-note]: Footnotes defined in Section 1 receive ID 1 without colliding with subsequent section footnotes.
`,
  },
  {
    id: "section-2",
    name: "Section 2: Topology & Benchmark Matrix",
    orientation: "landscape",
    markdown: `# System Topology & Benchmark Matrix

This section automatically switches page geometry to **Landscape** to accommodate wide system architecture tables without column crowding or text truncation.

| Subsystem Component | Operational Scope | Throughput Target | Latency (p99) | High Availability | Failover SLA |
| :--- | :---: | :---: | :---: | :---: | ---: |
| **AST Ingestion Engine** | Section Parsing & Aggregation | 25,000 nodes/s | < 0.8 ms | Active-Active | Zero Downtime |
| **Definitions Scoper** | Cross-Section Link Resolution | 18,500 refs/s | < 0.2 ms | In-Memory Graph | Instantaneous |
| **Footnote Offset Mapper** | Global ID Collision Resolution | 50,000 notes/s | < 0.1 ms | Deterministic Index | Safe Reindexing |
| **OpenXML ZIP Packer** | OPC Archive Generation | 120 docs/s | 14.5 ms | Multi-Threaded | Isolated Task |

Footnote reference from Section 2: [^bench-note]  
External repository link: [md2docx GitHub Repository][repo-link] *(defined in Section 3)*

[^bench-note]: Footnote ID automatically offsets to 2, preventing accidental overwrites in the Word document package!
`,
  },
  {
    id: "section-3",
    name: "Section 3: Appendix & Reference Definitions",
    orientation: "portrait",
    markdown: `# Appendix & Shared Definitions

This final section reverts back to standard **Portrait** orientation. It holds shared reference definitions and global resources.

With \`definitionsScope: "shared"\` (the default), link definitions declared below resolve transparently in Section 1 and Section 2:

- \`[arch-guide]\` resolves to the Architecture & Layout Guide
- \`[repo-link]\` resolves to the official GitHub repository

### Reference Definitions:
[arch-guide]: https://md2docx.js.org/docs/sections-and-layout "Official Architecture & Section Layout Guide"
[repo-link]: https://github.com/md2docx/md2docx "md2docx Open Source GitHub Repository"
`,
  },
];

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter);

export const MultiSectionDemo = () => {
  const [sections, setSections] = useState<SectionPayload[]>(DEFAULT_SECTIONS);
  const [definitionsScope, setDefinitionsScope] = useState<
    "shared" | "section"
  >("shared");
  const [docTitle, setDocTitle] = useState(
    "Multi-Section Architecture Showcase",
  );
  const [activeTab, setActiveTab] = useState<"viewer" | "code" | "ast">(
    "viewer",
  );

  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileTimeMs, setCompileTimeMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleUpdateSectionMarkdown = (id: string, newMd: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, markdown: newMd } : s)),
    );
  };

  const handleToggleOrientation = (id: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              orientation:
                s.orientation === "portrait" ? "landscape" : "portrait",
            }
          : s,
      ),
    );
  };

  const handleResetDefaults = () => {
    setSections(DEFAULT_SECTIONS);
    setDefinitionsScope("shared");
    setDocTitle("Multi-Section Architecture Showcase");
  };

  const compileDocx = useCallback(async () => {
    setIsCompiling(true);
    setErrorMsg(null);
    const start = performance.now();

    try {
      // 1. Parse each discrete section markdown into an independent MDAST tree
      const astInputs = sections.map((sec) => ({
        ast: parser.parse(sec.markdown) as Root,
        props: {
          properties: {
            page: {
              size: {
                orientation:
                  sec.orientation === "landscape"
                    ? PageOrientation.LANDSCAPE
                    : PageOrientation.PORTRAIT,
              },
            },
          },
        },
      }));

      // 2. Compile all sections into a single unified Word document via toDocx
      const blob = (await toDocx(
        astInputs,
        {
          title: docTitle,
          creator: "md2docx Multi-AST Compiler",
          definitionsScope,
        },
        {
          plugins: [
            tablePlugin(),
            mathPlugin(),
            listPlugin(),
            htmlPlugin(),
            emojiPlugin(),
            // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          ] as any,
        },
        "blob",
      )) as Blob;

      setDocxBlob(blob);
      setCompileTimeMs(Math.round(performance.now() - start));
    } catch (err) {
      console.error("Multi-AST compilation error:", err);
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to compile multi-AST DOCX",
      );
    } finally {
      setIsCompiling(false);
    }
  }, [sections, definitionsScope, docTitle]);

  // Initial compilation on mount
  useEffect(() => {
    compileDocx();
  }, [compileDocx]);

  const handleDownload = () => {
    if (!docxBlob) return;
    downloadBlob(docxBlob, "multi-section-architecture-showcase.docx");
  };

  const generatedSnippet = useMemo(
    () => `import { toDocx } from "mdast2docx";
import { PageOrientation } from "docx";
import { tablePlugin, mathPlugin, listPlugin, htmlPlugin, emojiPlugin } from "mdast2docx/plugins";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

const parser = unified().use(remarkParse).use(remarkGfm);

// 1. Parse discrete section markdowns into independent AST trees
${sections
  .map(
    (sec, idx) =>
      `const section${idx + 1}Ast = parser.parse(\`${sec.markdown.replace(/\\/g, "\\\\").replace(/`/g, "\\`")}\`);`,
  )
  .join("\n\n")}

// 2. Compile into unified Word document with discrete per-section page options
const docxBlob = await toDocx(
  [
${sections
  .map(
    (sec, idx) => `    {
      ast: section${idx + 1}Ast,
      props: {
        properties: {
          page: {
            size: {
              orientation: PageOrientation.${sec.orientation === "landscape" ? "LANDSCAPE" : "PORTRAIT"},
            },
          },
        },
      },
    },`,
  )
  .join("\n")}
  ],
  {
    title: ${JSON.stringify(docTitle)},
    definitionsScope: ${JSON.stringify(definitionsScope)}, // "shared" resolves cross-section links & offsets footnotes
  },
  {
    plugins: [tablePlugin(), mathPlugin(), listPlugin(), htmlPlugin(), emojiPlugin()],
  },
  "blob",
);`,
    [sections, docTitle, definitionsScope],
  );

  const highlightedCode = useMemo(
    () => highlightCode(generatedSnippet, "typescript"),
    [generatedSnippet],
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (e) {
      console.error("Failed to copy code snippet:", e);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 py-8">
      {/* Deprecation Warning Callout Banner */}
      <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">
            Scheduled Deprecation Notice (Next Major Version):
          </strong>{" "}
          Passing an array of multiple ASTs (
          <code className="px-1.5 py-0.5 rounded bg-amber-500/20 font-mono text-xs">
            {`{ ast: Root, props?: ISectionProps }[]`}
          </code>
          ) is scheduled for deprecation in the upcoming major release. Over{" "}
          <strong className="underline">99% of users</strong> compile single
          Markdown documents and will remain completely unaffected. Future
          multi-section authoring will be handled seamlessly within a single
          Markdown AST via standard section break directives. This page
          demonstrates the current low-level multi-AST compiler pipeline.
        </div>
      </div>

      {/* Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm mb-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Definitions Scope:
            </span>
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted">
              <button
                type="button"
                onClick={() => setDefinitionsScope("shared")}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  definitionsScope === "shared"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                shared (default)
              </button>
              <button
                type="button"
                onClick={() => setDefinitionsScope("section")}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  definitionsScope === "section"
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                section (isolated)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Title:
            </span>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-md border border-border bg-background text-foreground font-medium w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetDefaults}
            className="text-xs gap-1.5"
            title="Reset to default multi-section payload"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            size="sm"
            onClick={compileDocx}
            disabled={isCompiling}
            className="text-xs gap-1.5 font-semibold shadow-xs"
          >
            {isCompiling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Recompile DOCX</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            disabled={!docxBlob || isCompiling}
            className="text-xs gap-1.5 font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .docx</span>
          </Button>
        </div>
      </div>

      {/* Main Workbench Grid: Section Payloads on Left, Live Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Discrete Section Editors (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">
                Section AST Payloads ({sections.length})
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Independent MDAST Trees
            </span>
          </div>

          {sections.map((section, index) => (
            <div
              key={section.id}
              className="rounded-xl border border-border bg-card p-4 shadow-xs flex flex-col gap-2.5 transition-all focus-within:border-primary/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {section.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-mono tracking-wider cursor-pointer select-none transition-colors ${
                      section.orientation === "landscape"
                        ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                        : "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                    }`}
                    onClick={() => handleToggleOrientation(section.id)}
                    title="Click to toggle between Portrait and Landscape"
                  >
                    {section.orientation === "landscape"
                      ? "Landscape 📐"
                      : "Portrait 📄"}
                  </Badge>
                </div>
              </div>

              <textarea
                value={section.markdown}
                onChange={(e) =>
                  handleUpdateSectionMarkdown(section.id, e.target.value)
                }
                rows={6}
                className="w-full text-xs font-mono p-3 rounded-lg border border-border bg-muted/30 text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed"
                spellCheck={false}
              />
            </div>
          ))}
        </div>

        {/* Right Column: Output Viewer / Code / AST Tabs (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* View Tab Selector */}
          <div className="flex items-center justify-between p-1 rounded-xl bg-muted/60 border border-border/80">
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("viewer")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "viewer"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-primary" />
                <span>Word (.docx) Live Canvas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "code"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>TypeScript Pipeline Code</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ast")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "ast"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>AST Tree Hierarchy</span>
              </button>
            </div>

            {compileTimeMs !== null && (
              <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground px-2 py-0.5">
                <Clock className="w-3 h-3 text-emerald-500" />
                <span>
                  Compiled in{" "}
                  <strong className="text-foreground">{compileTimeMs}ms</strong>
                </span>
              </div>
            )}
          </div>

          {/* Active Tab Content */}
          <div className="min-h-[580px] rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
            {activeTab === "viewer" && (
              <div className="flex-1 flex flex-col min-h-[580px]">
                <DocxViewer
                  blob={docxBlob}
                  loading={isCompiling}
                  error={errorMsg}
                  renderTimeMs={compileTimeMs}
                  onRetry={compileDocx}
                />
              </div>
            )}

            {activeTab === "code" && (
              <div className="relative flex flex-col flex-1 p-4 bg-zinc-950 font-mono text-xs overflow-auto max-h-[640px]">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="absolute top-4 right-4 text-xs gap-1.5 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-100 z-10"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                </Button>
                <div className="leading-relaxed selection:bg-primary/30">
                  {highlightedCode}
                </div>
              </div>
            )}

            {activeTab === "ast" && (
              <div className="p-4 font-mono text-xs overflow-auto max-h-[640px] bg-muted/20 flex flex-col gap-4">
                <div className="text-xs text-muted-foreground">
                  Discrete MDAST Trees passed as an array to{" "}
                  <code className="text-primary font-bold">toDocx(...)</code>:
                </div>
                {sections.map((sec, idx) => {
                  const ast = parser.parse(sec.markdown);
                  return (
                    <div
                      key={sec.id}
                      className="p-3 rounded-lg border border-border bg-card"
                    >
                      <div className="font-bold text-foreground mb-2 flex items-center justify-between">
                        <span>
                          Section {idx + 1}: {sec.name} ({sec.orientation})
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {ast.children.length} root nodes
                        </span>
                      </div>
                      <pre className="text-[11px] text-muted-foreground overflow-x-auto p-2 rounded bg-muted/50 max-h-48">
                        {JSON.stringify(
                          {
                            type: ast.type,
                            nodeCount: ast.children.length,
                            childTypes: ast.children.map((c) => c.type),
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
