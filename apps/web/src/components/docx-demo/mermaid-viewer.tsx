"use client";

import {
  AlertCircle,
  Check,
  Code2,
  Copy,
  Eye,
  GitBranch,
  Loader2,
} from "lucide-react";
import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";
import { highlightCode } from "./highlight";

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer = ({ chart }: MermaidViewerProps) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"diagram" | "code">("diagram");
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const id = `mmd_${rawId.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const trimmedChart = chart.trim();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const renderChart = async () => {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "loose",
          fontFamily: "inherit",
        });

        const { svg: renderedSvg } = await mermaid.render(id, trimmedChart);
        if (active) {
          setSvg(renderedSvg);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to parse diagram",
          );
          setLoading(false);
        }
      }
    };

    renderChart();

    return () => {
      active = false;
    };
  }, [trimmedChart, id]);

  // Safely inject SVG into DOM element without dangerouslySetInnerHTML
  useEffect(() => {
    if (
      view === "diagram" &&
      !loading &&
      !error &&
      containerRef.current &&
      svg
    ) {
      containerRef.current.replaceChildren();
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const svgEl = doc.documentElement;
        if (svgEl) {
          containerRef.current.appendChild(svgEl);
        }
      } catch {
        // Fallback if parsing fails
      }
    }
  }, [svg, view, loading, error]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmedChart);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs not-prose">
        <div className="flex items-center gap-1.5 font-bold mb-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Mermaid Diagram Syntax Error:</span>
        </div>
        <pre className="font-mono text-[11px] p-2 rounded bg-background/50 border border-destructive/20 overflow-x-auto text-foreground">
          <code>{highlightCode(trimmedChart, "mermaid")}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="my-5 rounded-xl border border-border bg-card/60 backdrop-blur-sm shadow-xs overflow-hidden not-prose">
      {/* GitHub-style Header Controls */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/60 text-xs">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <GitBranch className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono">Mermaid Diagram</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View Mode Toggle: Diagram vs Code */}
          <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setView("diagram")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                view === "diagram"
                  ? "bg-muted text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="View rendered diagram"
            >
              <Eye className="w-3 h-3" />
              <span>Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => setView("code")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                view === "code"
                  ? "bg-muted text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="View Mermaid source code"
            >
              <Code2 className="w-3 h-3" />
              <span>Code</span>
            </button>
          </div>

          {/* Copy Source Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Copy Mermaid code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {view === "diagram" ? (
        <div className="p-4 flex flex-col items-center justify-center min-h-[140px]">
          {loading ? (
            <div className="py-8 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Rendering diagram...</span>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="w-full flex justify-center overflow-x-auto py-2 [&_svg]:max-w-full [&_svg]:h-auto"
            />
          )}
        </div>
      ) : (
        <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed bg-muted/20 text-foreground">
          <code>{highlightCode(trimmedChart, "mermaid")}</code>
        </pre>
      )}
    </div>
  );
};
