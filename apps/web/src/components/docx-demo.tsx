"use client";

import { toDocx } from "@m2d/core";
import {
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  FileText,
  Globe,
  Loader2,
  RotateCcw,
  Server,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { Button } from "./ui/button";

const SHORT_SAMPLE = `# Project Status Report

Welcome to **md2docx** — high-performance Markdown to Word (.docx) generation.

## Key Highlights
- **Dual Execution**: Runs both in **Node.js/Server** and natively in the **Browser**.
- **Typographic Fidelity**: Preserves headings, bold, italic, strikethrough, and lists.
- **Privacy & Speed**: Client-side generation requires **zero network requests**.

### Task Checklist
- [x] Monorepo architecture setup
- [x] Client-side DOCX compilation
- [x] Server-side API endpoint
- [ ] Extended media plugins

> "Convert documents seamlessly with full AST control."

### Performance Characteristics
| Environment | Execution | Network | Best For |
| :--- | :---: | :---: | :--- |
| **Client-Side** | In-Browser JS | 0ms | Offline apps, user privacy, instant downloads |
| **Server-Side** | Node.js API | Transfer | Batch jobs, heavy documents, CLI exports |
`;

type TimingResult = {
  mode: "client" | "server";
  targetName: string;
  renderTimeMs: number;
  networkTimeMs?: number;
  totalTimeMs: number;
  sizeKb: number;
};

export const DocxDemo = () => {
  const [docType, setDocType] = useState<"short" | "full">("short");
  const [markdown, setMarkdown] = useState(SHORT_SAMPLE);
  const [fullSampleText, setFullSampleText] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const [clientLoading, setClientLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [timing, setTiming] = useState<TimingResult | null>(null);

  // Lazy-load full sample text when switched to "full"
  useEffect(() => {
    if (docType === "full" && !fullSampleText) {
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
    } else if (docType === "short") {
      setMarkdown(SHORT_SAMPLE);
    } else if (docType === "full" && fullSampleText) {
      setMarkdown(fullSampleText);
    }
  }, [docType, fullSampleText]);

  /** Client-Side Generation: 100% inside the browser */
  const handleClientGenerate = async () => {
    setClientLoading(true);
    const start = performance.now();
    try {
      const processor = unified().use(remarkParse).use(remarkGfm);
      const mdast = processor.parse(markdown);
      const docxBlob = (await toDocx(
        mdast,
        {
          title:
            docType === "full"
              ? "Markdown Syntax Showcase"
              : "Project Status Report",
          creator: "md2docx Browser Engine",
        },
        {},
        "blob",
      )) as Blob;

      const renderTimeMs = Math.round(performance.now() - start);
      const sizeKb = Number((docxBlob.size / 1024).toFixed(1));

      // Trigger instant download
      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        docType === "full" ? "full-sample-client.docx" : "client-document.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setTiming({
        mode: "client",
        targetName: docType === "full" ? "Full Sample" : "Custom Document",
        renderTimeMs,
        networkTimeMs: 0,
        totalTimeMs: renderTimeMs,
        sizeKb,
      });
    } catch (err) {
      console.error("Client conversion failed:", err);
    } finally {
      setClientLoading(false);
    }
  };

  /** Server-Side Generation: via API endpoint with server vs network profiling */
  const handleServerGenerate = async () => {
    setServerLoading(true);
    const roundtripStart = performance.now();
    try {
      let response: Response;
      if (docType === "full") {
        // GET /api/docx converts monorepo root sample.md directly on server
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
        docType === "full" ? "full-sample-server.docx" : "server-document.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setTiming({
        mode: "server",
        targetName: docType === "full" ? "Full Sample" : "Custom Document",
        renderTimeMs: serverRenderMs,
        networkTimeMs,
        totalTimeMs,
        sizeKb,
      });
    } catch (err) {
      console.error("Server conversion failed:", err);
    } finally {
      setServerLoading(false);
    }
  };

  return (
    <section className="py-20 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Interactive Playground
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Universal Client & Server DOCX Generation
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Test the exact same Markdown document rendered 100% locally in your
            browser vs. streamed from a server API route.
          </p>
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
                Compiles directly in browser memory using WebAssembly & JS. Zero
                server cost, 100% private, and works offline.
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
                  Server-Side (Node / Edge API)
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                  HTTP Streaming
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Rendered on demand via <code>/api/docx</code>. Ideal for
                automated exports, webhook pipelines, and background reports.
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Document Selector & Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/40">
            {/* Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">
                Document:
              </span>
              <button
                type="button"
                onClick={() => setDocType("short")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                  docType === "short"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Project Status (Short)
              </button>
              <button
                type="button"
                onClick={() => setDocType("full")}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                  docType === "full"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {loadingSample
                  ? "Loading sample.md..."
                  : "Full Showcase (sample.md)"}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setMarkdown(
                    docType === "full" && fullSampleText
                      ? fullSampleText
                      : SHORT_SAMPLE,
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset editor text"
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
              rows={docType === "full" ? 14 : 9}
              className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
              placeholder="Write Markdown here..."
            />
          </div>

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
