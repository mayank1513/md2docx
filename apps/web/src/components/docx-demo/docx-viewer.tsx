"use client";

import {
  AlertCircle,
  FileText,
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

interface DocxViewerProps {
  blob: Blob | null;
  loading?: boolean;
  error?: string | null;
  renderTimeMs?: number | null;
  className?: string;
  onRetry?: () => void;
}

export const DocxViewer = ({
  blob,
  loading = false,
  error = null,
  renderTimeMs = null,
  className = "",
  onRetry,
}: DocxViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  useEffect(() => {
    if (!blob || !containerRef.current) return;
    let active = true;
    setIsRendering(true);
    setRenderError(null);

    const renderDoc = async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        if (!active || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        await renderAsync(blob, containerRef.current, undefined, {
          className: "docx-page",
          inWrapper: true,
          breakPages: true,
          ignoreWidth: false,
          ignoreHeight: false,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
        });
      } catch (err) {
        if (active) {
          console.error("docx-preview rendering error:", err);
          setRenderError(
            err instanceof Error
              ? err.message
              : "Failed to render DOCX preview in browser.",
          );
        }
      } finally {
        if (active) {
          setIsRendering(false);
        }
      }
    };

    renderDoc();

    return () => {
      active = false;
    };
  }, [blob]);

  const handleZoomIn = () => setZoom((z) => Math.min(200, z + 15));
  const handleZoomOut = () => setZoom((z) => Math.max(50, z - 15));
  const handleZoomReset = () => setZoom(100);

  const displayError = error || renderError;

  return (
    <div
      className={`relative flex flex-col h-full bg-muted/30 dark:bg-zinc-950 overflow-hidden ${className}`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-background/80 backdrop-blur-sm text-xs select-none z-10">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground">
            Microsoft Word (.docx) Live Canvas
          </span>
          {renderTimeMs !== null && (
            <span className="text-[11px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-full border border-border/40">
              ⚡ {renderTimeMs}ms
            </span>
          )}
          {(loading || isRendering) && (
            <span className="inline-flex items-center gap-1 text-[11px] text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Compiling OpenXML...
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleZoomOut}
            title="Zoom Out"
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="w-11 text-center font-mono text-[11px] text-muted-foreground">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleZoomIn}
            title="Zoom In"
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={handleZoomReset}
            title="Reset Zoom to 100%"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Fit
          </Button>
        </div>
      </div>

      {/* Main Preview Viewport */}
      <div className="relative flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        {displayError ? (
          <div className="max-w-md mx-auto my-12 p-6 rounded-xl border border-destructive/40 bg-destructive/10 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <h4 className="font-semibold text-destructive mb-1 text-sm">
              DOCX Render Error
            </h4>
            <p className="text-xs text-muted-foreground mb-4">{displayError}</p>
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry Generation
              </Button>
            )}
          </div>
        ) : !blob && (loading || isRendering) ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span>Building Word document pages...</span>
          </div>
        ) : !blob ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-sm gap-2">
            <FileText className="w-10 h-10 opacity-30" />
            <span>No document generated yet.</span>
          </div>
        ) : (
          <div
            className="transition-transform duration-150 origin-top flex justify-center w-full"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <div
              ref={containerRef}
              className="docx-preview-mount w-fit shadow-2xl rounded-sm overflow-hidden bg-white text-black"
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        .docx-preview-mount .docx-wrapper {
          background: transparent !important;
          padding: 0 !important;
        }
        .docx-preview-mount .docx-wrapper > section.docx-page {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2) !important;
          margin-bottom: 24px !important;
          background: white !important;
          color: black !important;
          border-radius: 2px !important;
        }
        .docx-preview-mount table {
          border-collapse: collapse !important;
        }
      `}</style>
    </div>
  );
};
