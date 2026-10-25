import {
  BookOpen,
  Check,
  FileText,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { AVAILABLE_PLUGINS } from "./constants";
import type { PluginId } from "./types";

interface PluginPipelineProps {
  enabledPlugins: Record<PluginId, boolean>;
  activePluginCount: number;
  coverPage: boolean;
  infoBox: boolean;
  onTogglePlugin: (id: PluginId) => void;
  onSetAllPlugins: (enable: boolean) => void;
  onToggleCoverPage: () => void;
  onToggleInfoBox: () => void;
}

export const PluginPipeline = ({
  enabledPlugins,
  activePluginCount,
  coverPage,
  infoBox,
  onTogglePlugin,
  onSetAllPlugins,
  onToggleCoverPage,
  onToggleInfoBox,
}: PluginPipelineProps) => {
  return (
    <div className="mb-6 p-4 rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Official Plugin Suite (Pluggable Pipeline):
          </span>
          <Badge variant="secondary" className="bg-primary/15 text-primary">
            {activePluginCount} of {AVAILABLE_PLUGINS.length} Active
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => onSetAllPlugins(true)}
            className="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium cursor-pointer"
          >
            Enable All
          </button>
          <span className="text-border">|</span>
          <button
            type="button"
            onClick={() => onSetAllPlugins(false)}
            className="text-xs px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-medium cursor-pointer"
          >
            Disable All
          </button>
        </div>
      </div>

      {/* Clickable Plugin Toggle Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {AVAILABLE_PLUGINS.map((plugin) => {
          const Icon = plugin.icon;
          const isEnabled = enabledPlugins[plugin.id];
          return (
            <button
              key={plugin.id}
              type="button"
              onClick={() => onTogglePlugin(plugin.id)}
              className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                isEnabled
                  ? "bg-primary/5 border-primary/40 shadow-xs"
                  : "bg-muted/30 border-border/40 opacity-50 hover:opacity-80"
              }`}
              title={`Click to ${isEnabled ? "disable" : "enable"} ${plugin.name}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon
                  className={`w-4 h-4 ${
                    isEnabled ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div
                  className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isEnabled
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-transparent"
                  }`}
                >
                  {isEnabled ? <Check className="w-2.5 h-2.5" /> : null}
                </div>
              </div>
              <div className="overflow-hidden">
                <div
                  className={`font-semibold text-xs truncate ${
                    isEnabled ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {plugin.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {plugin.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Frontmatter Layout Synthesizer sub-bar */}
      {enabledPlugins.frontmatter && (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              Frontmatter Layout Synthesizer:
            </span>
            <span className="hidden sm:inline">
              Automatically render styled cover sections or callout boxes from
              YAML/TOML
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCoverPage}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                coverPage
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                  : "bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Cover Page {coverPage ? "✓" : ""}</span>
            </button>
            <button
              type="button"
              onClick={onToggleInfoBox}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                infoBox
                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                  : "bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Info-Box Banner {infoBox ? "✓" : ""}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
