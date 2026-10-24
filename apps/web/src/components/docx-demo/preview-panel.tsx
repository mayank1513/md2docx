"use client";

import { Md } from "@m2d/react-markdown/client";
import { Check, Copy, SlidersHorizontal } from "lucide-react";
import { isValidElement, useMemo, useState } from "react";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Button } from "../ui/button";
import { TARGETS } from "./constants";
import { highlightCode } from "./highlight";
import { MermaidViewer } from "./mermaid-viewer";
import { TiptapRichEditor } from "./tiptap-rich-editor";
import type { PresetId, TargetId, ViewMode } from "./types";

interface PreviewPanelProps {
  viewMode: ViewMode;
  markdown: string;
  selectedPreset: PresetId;
  selectedTarget: TargetId;
  activePluginCount: number;
  generatedCode: string;
  onChangeMarkdown: (md: string) => void;
}

export const PreviewPanel = ({
  viewMode,
  markdown,
  selectedPreset,
  selectedTarget,
  activePluginCount,
  generatedCode,
  onChangeMarkdown,
}: PreviewPanelProps) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const markdownComponents = useMemo(
    () => ({
      pre: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLPreElement> & { node?: unknown }) => {
        // If the child is a mermaid code block, unwrap from <pre> styling
        if (
          isValidElement<{ className?: string }>(children) &&
          children.props?.className?.includes("language-mermaid")
        ) {
          return <>{children}</>;
        }
        return (
          <pre
            className="my-3 p-3 rounded-lg bg-muted/60 text-foreground font-mono text-xs overflow-x-auto border border-border not-prose"
            {...props}
          >
            {children}
          </pre>
        );
      },
      code: ({
        className,
        children,
        ...props
      }: React.HTMLAttributes<HTMLElement> & { node?: unknown }) => {
        const text = Array.isArray(children)
          ? children.join("")
          : String(children ?? "");

        if (className?.includes("language-mermaid")) {
          return <MermaidViewer chart={text} />;
        }

        const match = /language-(\w+)/.exec(className || "");
        if (match) {
          return (
            <code className={className} {...props}>
              {highlightCode(text, match[1])}
            </code>
          );
        }

        return (
          <code
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-primary"
            {...props}
          >
            {children}
          </code>
        );
      },
    }),
    [],
  );

  return (
    <div className="p-5">
      {viewMode === "edit" && (
        <textarea
          value={markdown}
          onChange={(e) => onChangeMarkdown(e.target.value)}
          rows={selectedPreset === "full" ? 14 : 11}
          className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
          placeholder="Write Markdown here..."
          spellCheck={false}
        />
      )}

      {viewMode === "preview" && (
        <div className="w-full min-h-[260px] max-h-[500px] overflow-y-auto p-5 rounded-xl border border-border bg-background text-foreground prose prose-sm dark:prose-invert max-w-none leading-relaxed">
          <Md
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            // @ts-expect-error – custom components shape conforms to HAST runtime
            components={markdownComponents}
          >
            {markdown}
          </Md>
        </div>
      )}

      {viewMode === "tiptap" && (
        <TiptapRichEditor value={markdown} onChange={onChangeMarkdown} />
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
                <strong className="text-foreground">{activePluginCount}</strong>{" "}
                plugins
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="h-7 text-xs gap-1.5 cursor-pointer"
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
            <code>{highlightCode(generatedCode, "typescript")}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
