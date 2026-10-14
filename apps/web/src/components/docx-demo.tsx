"use client";

import { toDocx } from "@m2d/core";
import {
  CheckCircle2,
  Clock,
  Code2,
  Cpu,
  Download,
  FileCheck,
  FileText,
  Globe,
  Loader2,
  RotateCcw,
  Server,
  Zap,
} from "lucide-react";
import { useState } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { Button } from "./ui/button";

const DEFAULT_MARKDOWN = `# Project Status Report

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

### Metrics
| Environment | Latency | Privacy | Server Load |
| :--- | :---: | :---: | :---: |
| **Client-Side** | < 20ms | 100% Local | Zero |
| **Server-Side** | ~50ms | Encrypted | Centralized |
`;

export const DocxDemo = () => {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [clientLoading, setClientLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [lastAction, setLastAction] = useState<{
    mode: "client" | "server";
    durationMs: number;
    sizeKb: number;
  } | null>(null);

  /** Client-Side Generation: 100% in browser using @m2d/core */
  const handleClientGenerate = async () => {
    setClientLoading(true);
    const start = performance.now();
    try {
      const processor = unified().use(remarkParse).use(remarkGfm);
      const mdast = processor.parse(markdown);
      const docxBlob = (await toDocx(
        mdast,
        {
          title: "Client-Generated Document",
          creator: "md2docx Client Engine",
        },
        {},
        "blob",
      )) as Blob;

      const durationMs = Math.round(performance.now() - start);
      const sizeKb = Number((docxBlob.size / 1024).toFixed(1));

      // Trigger instantaneous browser download
      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "client-document.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setLastAction({ mode: "client", durationMs, sizeKb });
    } catch (err) {
      console.error("Client-side generation failed:", err);
    } finally {
      setClientLoading(false);
    }
  };

  /** Server-Side Generation: via Next.js /api/docx endpoint */
  const handleServerGenerate = async () => {
    setServerLoading(true);
    const start = performance.now();
    try {
      const response = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) throw new Error("Server conversion failed");
      const blob = await response.blob();
      const durationMs = Math.round(performance.now() - start);
      const sizeKb = Number((blob.size / 1024).toFixed(1));

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "server-document.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setLastAction({ mode: "server", durationMs, sizeKb });
    } catch (err) {
      console.error("Server-side generation failed:", err);
    } finally {
      setServerLoading(false);
    }
  };

  /** Download comprehensive sample.md via server */
  const handleDownloadFullSample = async () => {
    setServerLoading(true);
    const start = performance.now();
    try {
      const response = await fetch("/api/docx");
      if (!response.ok) throw new Error("Sample conversion failed");
      const blob = await response.blob();
      const durationMs = Math.round(performance.now() - start);
      const sizeKb = Number((blob.size / 1024).toFixed(1));

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "comprehensive-sample.docx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setLastAction({ mode: "server", durationMs, sizeKb });
    } catch (err) {
      console.error("Sample download failed:", err);
    } finally {
      setServerLoading(false);
    }
  };

  return (
    <section className="py-20 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Universal Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Client-Side & Server-Side Rendering
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Compile documents instantly inside the user's browser with zero
            backend latency, or offload generation to your Next.js API routes
            and microservices.
          </p>
        </div>

        {/* Comparison Pills */}
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
                  Zero Network
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Compiles directly in browser memory using WebAssembly & JS.
                Perfect for privacy-critical apps, offline PWA, and zero-server
                bills.
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
                  Heavy Workloads
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Centralized conversion via <code>/api/docx</code> route. Ideal
                for automated reports, webhook exports, and large multi-megabyte
                docs.
              </p>
            </div>
          </div>
        </div>

        {/* Live Playground Workspace */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Code2 className="w-4 h-4 text-primary" />
              <span>input.md</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMarkdown(DEFAULT_MARKDOWN)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset to default markdown"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="p-5">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={9}
              className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
              placeholder="Write Markdown here..."
            />
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-5 py-4 border-t border-border bg-muted/30">
            {/* Feedback / Metrics */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {lastAction ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {lastAction.mode === "client" ? "Browser" : "Server"}{" "}
                    output: <strong>{lastAction.sizeKb} KB</strong> in{" "}
                    <strong>{lastAction.durationMs}ms</strong>
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ready to compile</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadFullSample}
                disabled={serverLoading || clientLoading}
                className="text-xs font-medium"
                title="Download the full comprehensive sample.md as DOCX"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Full Sample DOCX
              </Button>

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
                    Render on Server
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
                    Render in Browser
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
