import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Server,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { TARGETS } from "./constants";
import type { TargetId, TimingResult } from "./types";

interface ActionBarProps {
  timing: TimingResult | null;
  selectedTarget: TargetId;
  clientLoading: boolean;
  serverLoading: boolean;
  hasMarkdown: boolean;
  errorMsg: string | null;
  onClientGenerate: () => void;
  onServerGenerate: () => void;
}

export const ActionBar = ({
  timing,
  selectedTarget,
  clientLoading,
  serverLoading,
  hasMarkdown,
  errorMsg,
  onClientGenerate,
  onServerGenerate,
}: ActionBarProps) => {
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

        {/* Action Buttons for Client & Server */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onServerGenerate}
            disabled={serverLoading || clientLoading || !hasMarkdown}
            className="text-xs font-medium border-blue-500/30 text-blue-500 hover:bg-blue-500/10 hover:text-blue-500 cursor-pointer"
          >
            {serverLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Server Processing...
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5 mr-1.5" />
                Render on Server (Node API)
              </>
            )}
          </Button>

          <Button
            size="sm"
            onClick={onClientGenerate}
            disabled={clientLoading || serverLoading || !hasMarkdown}
            className="text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {clientLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Compiling in Browser...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Compile in Browser (
                {TARGETS.find((t) => t.id === selectedTarget)?.name})
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
