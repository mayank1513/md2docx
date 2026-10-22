"use client";

import { AlertCircle, GitBranch, Loader2 } from "lucide-react";
import mermaid from "mermaid";
import { useEffect, useId, useState } from "react";

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer = ({ chart }: MermaidViewerProps) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const rawId = useId();
  const id = `mmd_${rawId.replace(/[^a-zA-Z0-9]/g, "_")}`;

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

        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
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
  }, [chart, id]);

  if (error) {
    return (
      <div className="my-4 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-xs">
        <div className="flex items-center gap-1.5 font-bold mb-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Mermaid Diagram Syntax Error:</span>
        </div>
        <pre className="font-mono text-[11px] p-2 rounded bg-background/50 border border-destructive/20 overflow-x-auto text-foreground">
          {chart.trim()}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-5 p-4 rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-xs flex flex-col items-center not-prose">
      <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-border/40 text-[11px] text-muted-foreground font-mono">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Interactive Mermaid Vector</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold">
          Rendered Diagram
        </span>
      </div>

      {loading ? (
        <div className="py-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Rendering diagram...</span>
        </div>
      ) : (
        <div
          className="w-full flex justify-center overflow-x-auto py-2 [&_svg]:max-w-full [&_svg]:h-auto"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid svg
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
};
