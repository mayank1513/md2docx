import {
  ChevronDown,
  Code2,
  Eye,
  FileCheck2,
  FileText,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Trash2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { PRESETS, TARGETS } from "./constants";
import type { PresetId, TargetId, ViewMode } from "./types";

interface DemoToolbarProps {
  selectedPreset: PresetId;
  isPresetActive: boolean;
  loadingSample: boolean;
  viewMode: ViewMode;
  cacheCleared: boolean;
  selectedTarget: TargetId;
  onSelectPreset: (id: PresetId) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onSelectTarget: (id: TargetId) => void;
  onResetText: () => void;
  onClearCache: () => void;
}

export const DemoToolbar = ({
  selectedPreset,
  isPresetActive,
  loadingSample,
  viewMode,
  cacheCleared,
  selectedTarget,
  onSelectPreset,
  onChangeViewMode,
  onSelectTarget,
  onResetText,
  onClearCache,
}: DemoToolbarProps) => {
  const currentTarget =
    TARGETS.find((t) => t.id === selectedTarget) || TARGETS[0];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/40">
      {/* 1. Presets Selector (Responsive: Dropdown on mobile, Pills on desktop) */}
      <div className="flex items-center gap-2">
        {/* Mobile Preset Dropdown (< sm) */}
        <div className="sm:hidden flex items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Preset:
          </span>
          <div className="relative">
            <select
              value={selectedPreset}
              onChange={(e) => onSelectPreset(e.target.value as PresetId)}
              className={`text-xs pl-2.5 pr-7 py-1 rounded-md border font-medium bg-background transition-colors cursor-pointer appearance-none ${
                isPresetActive
                  ? "border-primary/50 text-foreground ring-1 ring-primary/20 font-semibold"
                  : "border-border text-muted-foreground"
              }`}
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {!isPresetActive && p.id === selectedPreset
                    ? " (Custom)"
                    : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Desktop Preset Pills (sm:) */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Presets:
          </span>
          {PRESETS.map((preset) => {
            const isActive = isPresetActive && selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : selectedPreset === preset.id
                      ? "bg-muted text-foreground border border-border/80"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {preset.id === "full" && loadingSample
                  ? "Loading..."
                  : preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Center/Right: View Mode Tabs + Target Selector Dropdown + Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Mobile View Mode Dropdown (< md) */}
        <div className="md:hidden flex items-center">
          <div className="relative">
            <select
              value={viewMode}
              onChange={(e) => onChangeViewMode(e.target.value as ViewMode)}
              className="text-xs pl-2.5 pr-7 py-1 rounded-md border border-border bg-background font-medium text-foreground cursor-pointer appearance-none"
            >
              <option value="edit">Markdown</option>
              <option value="preview">Live Preview</option>
              <option value="docx">Word (.docx) Preview</option>
              <option value="tiptap">WYSIWYG (Tiptap)</option>
              <option value="metadata">Doc Properties</option>
              <option value="code">Implementation Code</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Desktop View Switcher: Edit | Preview | WYSIWYG | Properties | Code (md:) */}
        <div className="hidden md:inline-flex items-center p-0.5 rounded-lg bg-muted border border-border/60">
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
            onClick={() => onChangeViewMode("docx")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === "docx"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Word (.docx)</span>
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
            <span>WYSIWYG</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode("metadata")}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              viewMode === "metadata"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>Properties</span>
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
            <span>Code</span>
          </button>
        </div>

        {/* 3. Compilation Target Dropdown in the same line */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="hidden lg:inline font-medium">Target:</span>
          </div>
          <div className="relative">
            <select
              value={selectedTarget}
              onChange={(e) => onSelectTarget(e.target.value as TargetId)}
              className="text-xs font-mono font-semibold pl-2 pr-7 py-1 rounded-md border border-border/80 bg-background text-foreground hover:border-primary/50 transition-colors cursor-pointer appearance-none shadow-xs"
              title="Select DOCX compilation engine target"
            >
              {TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.badge})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <Badge
            variant="outline"
            className="hidden xl:inline-flex text-[10px] px-1.5 py-0 font-normal text-muted-foreground"
          >
            {currentTarget.badge}
          </Badge>
        </div>

        {/* 4. Actions: Reset and Clear Cache */}
        <div className="flex items-center gap-0.5 pl-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onResetText}
            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reset editor text to preset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCache}
            className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
          </Button>
        </div>
      </div>
    </div>
  );
};
