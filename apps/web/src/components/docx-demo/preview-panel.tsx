"use client";

import { parseFrontmatter } from "@m2d/frontmatter";
import { Md } from "@m2d/react-markdown/client";
import {
  Check,
  Clock,
  Copy,
  FileText,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { isValidElement, useEffect, useMemo, useState } from "react";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Button } from "../ui/button";
import { TARGETS } from "./constants";
import { highlightCode } from "./highlight";
import { MermaidViewer } from "./mermaid-viewer";
import { MetadataInspector } from "./metadata-inspector";
import { TiptapRichEditor } from "./tiptap-rich-editor";
import type { PluginId, PresetId, TargetId, ViewMode } from "./types";

interface PreviewPanelProps {
  viewMode: ViewMode;
  markdown: string;
  selectedPreset: PresetId;
  selectedTarget: TargetId;
  enabledPlugins: Record<PluginId, boolean>;
  activePluginCount: number;
  coverPage: boolean;
  infoBox: boolean;
  generatedCode: string;
  onChangeMarkdown: (md: string) => void;
  onToggleCoverPage?: () => void;
  onToggleInfoBox?: () => void;
}

export const PreviewPanel = ({
  viewMode,
  markdown,
  selectedPreset,
  selectedTarget,
  enabledPlugins,
  activePluginCount,
  coverPage,
  infoBox,
  generatedCode,
  onChangeMarkdown,
  onToggleCoverPage,
  onToggleInfoBox,
}: PreviewPanelProps) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewRenderTimeMs, setPreviewRenderTimeMs] = useState<number | null>(
    null,
  );

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const remarkPlugins = useMemo(() => {
    const list = [];
    if (enabledPlugins?.table !== false) list.push(remarkGfm);
    if (enabledPlugins?.math) list.push(remarkMath);
    return list;
  }, [enabledPlugins]);

  const rehypePlugins = useMemo(() => {
    const list = [];
    if (enabledPlugins?.math) list.push(rehypeKatex);
    return list;
  }, [enabledPlugins]);

  const frontmatterMetadata = useMemo(() => {
    if (!enabledPlugins?.frontmatter) return null;
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;
    try {
      return parseFrontmatter(match[1], "yaml");
    } catch {
      return null;
    }
  }, [markdown, enabledPlugins?.frontmatter]);

  const markdownToRender = useMemo(() => {
    if (!frontmatterMetadata) return markdown;
    let body = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n\r?\n?/, "");
    if (coverPage && frontmatterMetadata.title) {
      const escapedTitle = String(frontmatterMetadata.title).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      body = body.replace(
        new RegExp(`^#\\s+${escapedTitle}\\r?\\n\\r?\\n?`, "i"),
        "",
      );
    }
    return body;
  }, [markdown, frontmatterMetadata, coverPage]);

  const markdownComponents = useMemo(
    () => ({
      pre: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLPreElement> & { node?: unknown }) => {
        // If the child is a mermaid code block and mermaid plugin is enabled, unwrap from <pre> styling
        if (
          enabledPlugins?.mermaid &&
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

        if (
          className?.includes("language-mermaid") &&
          enabledPlugins?.mermaid
        ) {
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
    [enabledPlugins],
  );

  useEffect(() => {
    if (!markdownToRender) return;
    const t0 = performance.now();
    const animId = requestAnimationFrame(() => {
      setPreviewRenderTimeMs(Math.max(1, Math.round(performance.now() - t0)));
    });
    return () => cancelAnimationFrame(animId);
  }, [markdownToRender]);

  return (
    <div className="p-5">
      {/* 1. Raw Markdown Editor */}
      <div className={viewMode === "edit" ? "block" : "hidden"}>
        <textarea
          value={markdown}
          onChange={(e) => onChangeMarkdown(e.target.value)}
          rows={selectedPreset === "full" ? 14 : 11}
          className="w-full font-mono text-xs md:text-sm p-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
          placeholder="Write Markdown here..."
          spellCheck={false}
        />
      </div>

      {/* 2. Live Document Preview via @m2d/react-markdown */}
      <div className={viewMode === "preview" ? "block" : "hidden"}>
        <div className="w-full min-h-[260px] max-h-[500px] overflow-y-auto p-5 rounded-xl border border-border bg-background text-foreground prose prose-sm dark:prose-invert max-w-none leading-relaxed">
          {/* Showcase Banner: @m2d/react-markdown & Live Render Time */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-border/60 text-xs not-prose">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                Rendered with <strong>@m2d/react-markdown</strong>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Preview render:{" "}
                <strong className="text-foreground">
                  {previewRenderTimeMs !== null
                    ? `${previewRenderTimeMs}ms`
                    : "measuring..."}
                </strong>
              </span>
            </div>
          </div>
          {/* Cover Page Visual Card */}
          {enabledPlugins?.frontmatter && coverPage && frontmatterMetadata && (
            <div className="mb-6 p-6 rounded-xl border border-primary/30 bg-card/60 shadow-md not-prose">
              <div className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary w-fit font-bold mb-3">
                Word Document Cover Page (Page 1)
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
                {String(frontmatterMetadata.title || "Untitled Document")}
              </h1>
              {(frontmatterMetadata.subtitle ||
                frontmatterMetadata.description) && (
                <p className="text-sm italic text-muted-foreground mb-4">
                  {String(
                    frontmatterMetadata.subtitle ||
                      frontmatterMetadata.description,
                  )}
                </p>
              )}
              <hr className="border-border my-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                {Boolean(frontmatterMetadata.author) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Author:{" "}
                    </span>
                    {String(frontmatterMetadata.author)}
                  </div>
                )}
                {Boolean(frontmatterMetadata.date) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Date:{" "}
                    </span>
                    {String(frontmatterMetadata.date)}
                  </div>
                )}
                {Boolean(frontmatterMetadata.version) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Version:{" "}
                    </span>
                    {String(frontmatterMetadata.version)}
                  </div>
                )}
              </div>
              <div className="mt-5 pt-3 border-t border-dashed border-primary/30 text-center font-mono text-[11px] text-primary flex items-center justify-center gap-2">
                <span>📄</span>
                <span>--- Word Page Break • Page 2 Begins Below ---</span>
              </div>
            </div>
          )}

          {/* Info-Box Banner */}
          {enabledPlugins?.frontmatter && infoBox && frontmatterMetadata && (
            <div className="mb-5 p-4 rounded-xl border-l-4 border-l-primary border-y border-r border-border bg-muted/40 not-prose shadow-xs">
              <div className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Document Overview</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Boolean(frontmatterMetadata.author) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Author:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {String(frontmatterMetadata.author)}
                    </span>
                  </div>
                )}
                {Boolean(frontmatterMetadata.date) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Date:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {String(frontmatterMetadata.date)}
                    </span>
                  </div>
                )}
                {Boolean(frontmatterMetadata.version) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Version:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {String(frontmatterMetadata.version)}
                    </span>
                  </div>
                )}
                {Boolean(frontmatterMetadata.status) && (
                  <div>
                    <span className="font-semibold text-foreground">
                      Status:{" "}
                    </span>
                    <span className="text-muted-foreground">
                      {String(frontmatterMetadata.status)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Md
            remarkPlugins={remarkPlugins}
            rehypePlugins={rehypePlugins}
            // @ts-expect-error – custom components shape conforms to HAST runtime
            components={markdownComponents}
          >
            {markdownToRender}
          </Md>
        </div>
      </div>

      {/* 3. WYSIWYG Rich Text Editor via Tiptap 3 */}
      <div className={viewMode === "tiptap" ? "block" : "hidden"}>
        <TiptapRichEditor
          value={markdown}
          onChange={onChangeMarkdown}
          isActive={viewMode === "tiptap"}
        />
      </div>

      {/* 4. Document Properties & Metadata Inspector */}
      {viewMode === "metadata" && (
        <MetadataInspector
          markdown={markdown}
          coverPage={coverPage}
          infoBox={infoBox}
          onToggleCoverPage={onToggleCoverPage}
          onToggleInfoBox={onToggleInfoBox}
          onInsertFrontmatter={() => {
            const sampleHeader = `---
title: "Project Architectural Overview"
author: "Engineering Lead"
subject: "System Design Document"
keywords: "architecture, microservices, cloud, docx"
header: "Acme Corp • Confidential Design Spec"
footer: "Internal Use Only • Page 1"
description: "Comprehensive system architecture overview and engineering roadmap."
---

`;
            onChangeMarkdown(
              sampleHeader + markdown.replace(/^---[\s\S]*?---\r?\n\r?\n?/, ""),
            );
          }}
        />
      )}

      {/* 5. Implementation Code Snippet */}
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
