import { Layers } from "lucide-react";
import { Badge } from "../ui/badge";
import { TARGETS } from "./constants";
import type { TargetId } from "./types";

interface TargetSelectorProps {
  selectedTarget: TargetId;
  onSelectTarget: (id: TargetId) => void;
}

export const TargetSelector = ({
  selectedTarget,
  onSelectTarget,
}: TargetSelectorProps) => {
  return (
    <div className="mb-6 p-4 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Layers className="w-4 h-4 text-primary" />
          <span>Compilation Target:</span>
        </div>
        <span className="text-xs text-muted-foreground">
          Select which API package drives the DOCX generation pipeline
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {TARGETS.map((target) => {
          const isSelected = selectedTarget === target.id;
          return (
            <button
              key={target.id}
              type="button"
              onClick={() => onSelectTarget(target.id)}
              className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30"
                  : "bg-muted/40 border-border/60 hover:bg-muted/80 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`font-mono text-xs font-bold ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {target.name}
                </span>
                <Badge
                  variant={isSelected ? "default" : "secondary"}
                  className="text-[10px] px-2 py-0.5"
                >
                  {target.badge}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                {target.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
