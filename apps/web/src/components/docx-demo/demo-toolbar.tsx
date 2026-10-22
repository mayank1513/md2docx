import {
  Code2,
  Eye,
  FileText,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PRESETS } from "./constants";
import type { PresetId, ViewMode } from "./types";

interface DemoToolbarProps {
  selectedPreset: PresetId;
  loadingSample: boolean;
  viewMode: ViewMode;
  cacheCleared: boolean;
  onSelectPreset: (id: PresetId) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onResetText: () => void;
  onClearCache: () => void;
}

export const DemoToolbar = ({
  selectedPreset,
  loadingSample,
  viewMode,
  cacheCleared,
  onSelectPreset,
  onChangeViewMode,
  onResetText,
  onClearCache,
}: DemoToolbarProps) => {
  return (
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
            onClick={() => onSelectPreset(preset.id)}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
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

      {/* View Mode Toggle & Actions Toolbar */}
      <div className="flex items-center gap-2">
        {/* View Switcher: Edit | Preview | Code */}
        <div className="inline-flex items-center p-0.5 rounded-lg bg-muted border border-border/60">
          <button
            type="button"
            onClick={() => onChangeViewMode("edit")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
            onClick={() => onChangeViewMode("preview")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
            onClick={() => onChangeViewMode("tiptap")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === "tiptap"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>WYSIWYG (Tiptap)</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("code")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
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
          onClick={onResetText}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 cursor-pointer"
          title="Reset editor text to preset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Clear Cache */}
        <button
          type="button"
          onClick={onClearCache}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 cursor-pointer"
          title={
            cacheCleared
              ? "Cache Cleared!"
              : "Clear browser IndexedDB diagram/image cache"
          }
        >
          <Trash2
            className={`w-3.5 h-3.5 ${cacheCleared ? "text-emerald-500" : ""}`}
          />
          {cacheCleared && (
            <span className="text-[11px] text-emerald-500 font-medium">
              Cleared!
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
