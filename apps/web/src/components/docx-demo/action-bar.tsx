import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileDown,
  Loader2,
  Server,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import type { ExecutionMode, TimingResult } from "./types";

interface ActionBarProps {
  timing: TimingResult | null;
  executionMode: ExecutionMode;
  clientLoading: boolean;
  serverLoading: boolean;
  hasMarkdown: boolean;
  errorMsg: string | null;
  onSelectExecutionMode: (mode: ExecutionMode) => void;
  onExportDocx: () => void;
}

export const ActionBar = ({
  timing,
  executionMode,
  clientLoading,
  serverLoading,
  hasMarkdown,
  errorMsg,
  onSelectExecutionMode,
  onExportDocx,
}: ActionBarProps) => {
  const loading = clientLoading || serverLoading;

  return (
    <>
      {/* Error Banner */}
      {errorMsg && (
        <div className="mx-5 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Bar & Performance Metrics */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-5 py-4 border-t border-border bg-muted/30">
        {/* Latency Breakdown */}
        <div className="text-xs text-muted-foreground">
          {timing ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {timing.targetName}: {timing.sizeKb} KB
                </span>
              </div>
              <span className="text-border">|</span>
              <span>
                Render: <strong>{timing.renderTimeMs}ms</strong>
              </span>
              {timing.mode === "server" && (
                <>
                  <span className="text-border">|</span>
                  <span>
                    Network: <strong>{timing.networkTimeMs}ms</strong>
                  </span>
                  <span className="text-border">|</span>
                  <span>
                    Roundtrip: <strong>{timing.totalTimeMs}ms</strong>
                  </span>
                </>
              )}
              {timing.mode === "client" && (
                <>
                  <span className="text-border">|</span>
                  <span className="text-emerald-500 font-medium">
                    0ms Network (100% In-Browser)
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Click compile below to execute with selected target & plugins
              </span>
            </div>
          )}
        </div>

        {/* Execution Mode Toggle & Unified Export Button */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {/* Client / Server Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-muted border border-border/60">
            <button
              type="button"
              onClick={() => onSelectExecutionMode("client")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                executionMode === "client"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>Browser (Blob)</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectExecutionMode("server")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                executionMode === "server"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Server className="w-3.5 h-3.5 text-blue-500" />
              <span>Node.js API</span>
            </button>
          </div>

          {/* Unified Export Button */}
          <Button
            size="sm"
            onClick={onExportDocx}
            disabled={loading || !hasMarkdown}
            className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 h-9 cursor-pointer shadow-xs gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {executionMode === "client"
                    ? "Compiling in Browser..."
                    : "Rendering on Server..."}
                </span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                <span>
                  Export DOCX (
                  {executionMode === "client" ? "Browser" : "Node.js"})
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
