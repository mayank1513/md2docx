import { Check, Copy, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { highlight } from "sugar-high";
import { Button } from "../ui/button";
import { TARGETS } from "./constants";
import type { PresetId, TargetId, ViewMode } from "./types";
import { renderMarkdownPreviewHtml } from "./utils";

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

  return (
    <div className="p-5">
      {viewMode === "edit" && (
        <textarea
          value={markdown}
          onChange={(e) => onChangeMarkdown(e.target.value)}
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
  );
};
