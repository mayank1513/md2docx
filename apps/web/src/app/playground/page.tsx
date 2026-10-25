"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Code2,
  Download,
  FileCheck2,
  FileText,
  Layers,
  LayoutTemplate,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import icon from "@/app/icon.png";
import { PRESETS, TARGETS } from "@/components/docx-demo/constants";
import { DocumentStats } from "@/components/docx-demo/document-stats";
import { DocxViewer } from "@/components/docx-demo/docx-viewer";
import { highlightCode } from "@/components/docx-demo/highlight";
import { MetadataInspector } from "@/components/docx-demo/metadata-inspector";
import { PluginPipeline } from "@/components/docx-demo/plugin-pipeline";
import { TiptapRichEditor } from "@/components/docx-demo/tiptap-rich-editor";
import type {
  PresetId,
  TargetId,
  ViewMode,
} from "@/components/docx-demo/types";
import { useDocxDemo } from "@/components/docx-demo/use-docx-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { githubUrl, name } from "@/meta.json";

export default function PlaygroundPage() {
  const {
    selectedPreset,
    isPresetActive,
    handleSelectPreset,
    selectedTarget,
    setSelectedTarget,
    markdown,
    setMarkdown,
    loadingSample,
    viewMode,
    setViewMode,
    executionMode,
    setExecutionMode,
    coverPage,
    infoBox,
    toggleCoverPage,
    toggleInfoBox,
    enabledPlugins,
    togglePlugin,
    setAllPlugins,
    activePluginCount,
    clientLoading,
    serverLoading,
    timing,
    errorMsg,
    cacheCleared,
    handleClearCache,
    handleResetText,
    handleExportDocx,
    generatedCode,
    liveBlob,
    liveBlobLoading,
    liveBlobError,
    liveBlobRenderTimeMs,
  } = useDocxDemo();

  const currentTarget =
    TARGETS.find((t) => t.id === selectedTarget) || TARGETS[0];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground select-none">
      {/* Top Application Navbar */}
      <header className="h-14 border-b border-border/80 bg-background/95 backdrop-blur-md px-4 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="Back to Home"
          >
            <Image src={icon} alt="Md2Docx Logo" width={26} height={26} />
            <span className="font-bold text-sm hidden sm:inline-block">
              {name}
            </span>
          </Link>
          <Badge
            variant="outline"
            className="hidden md:inline-flex text-[11px] font-semibold text-primary border-primary/30 bg-primary/5"
          >
            Workbench
          </Badge>

          {/* Preset Selector Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
            <span className="text-xs text-muted-foreground hidden lg:inline font-medium">
              Preset:
            </span>
            <div className="relative">
              <select
                value={selectedPreset}
                onChange={(e) => handleSelectPreset(e.target.value as PresetId)}
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
            {loadingSample && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            )}
          </div>

          {/* Compilation Target Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Layers className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="hidden xl:inline font-medium">Engine:</span>
            </div>
            <div className="relative">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value as TargetId)}
                className="text-xs font-mono font-semibold pl-2 pr-7 py-1 rounded-md border border-border/80 bg-background text-foreground hover:border-primary/50 transition-colors cursor-pointer appearance-none shadow-xs"
              >
                {TARGETS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.badge})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Layout Synthesizer Toggles */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-border/60 bg-muted/30 text-xs">
            <span className="text-[11px] text-muted-foreground font-medium">
              Layout:
            </span>
            <button
              type="button"
              onClick={toggleCoverPage}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                coverPage
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Cover
            </button>
            <button
              type="button"
              onClick={toggleInfoBox}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                infoBox
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              InfoBox
            </button>
          </div>

          {/* Reset / Cache Utilities */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetText}
            className="h-8 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            title="Reset to selected preset content"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCache}
            className="h-8 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            title="Clear persistent IndexedDB cache"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            {cacheCleared ? "Cleared!" : "Clear Cache"}
          </Button>

          {/* Docs Link */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="h-8 text-xs hidden md:inline-flex"
          >
            <Link href="/docs">
              <BookOpen className="w-3.5 h-3.5 mr-1" />
              Docs
            </Link>
          </Button>

          {/* Primary Export Button */}
          <Button
            size="sm"
            onClick={handleExportDocx}
            disabled={clientLoading || serverLoading || !markdown.trim()}
            className="h-8 text-xs font-semibold shadow-xs"
          >
            {clientLoading || serverLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export .docx
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Side-by-Side Split Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Editor, Plugins & Metadata (50% on desktop) */}
        <section className="w-full lg:w-1/2 flex flex-col border-r border-border/80 bg-card overflow-hidden">
          {/* Sub-toolbar: View tabs and Stats */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/40 gap-2 shrink-0">
            <div className="inline-flex items-center p-0.5 rounded-lg bg-muted border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
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
                onClick={() => setViewMode("tiptap")}
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
                onClick={() => setViewMode("metadata")}
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
                onClick={() => setViewMode("code")}
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

            {/* Quick plugin counter pill */}
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 border-border/80 text-muted-foreground"
              >
                {activePluginCount} plugins active
              </Badge>
            </div>
          </div>

          {/* Compact Document Stats Bar */}
          <DocumentStats markdown={markdown} />

          {/* Left Pane Body: Scrollable Content Canvas */}
          <div className="flex-1 overflow-auto p-4">
            {viewMode === "edit" && (
              <div className="h-full flex flex-col">
                <textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Type or paste Markdown here..."
                  className="w-full flex-1 min-h-[420px] p-4 font-mono text-xs leading-relaxed bg-background border border-border/80 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary resize-none text-foreground select-text"
                  spellCheck={false}
                />
              </div>
            )}

            {viewMode === "tiptap" && (
              <div className="h-full">
                <TiptapRichEditor
                  value={markdown}
                  onChange={setMarkdown}
                  isActive={viewMode === "tiptap"}
                />
              </div>
            )}

            {viewMode === "metadata" && (
              <div className="space-y-6">
                <PluginPipeline
                  enabledPlugins={enabledPlugins}
                  activePluginCount={activePluginCount}
                  coverPage={coverPage}
                  infoBox={infoBox}
                  onTogglePlugin={togglePlugin}
                  onSetAllPlugins={setAllPlugins}
                  onToggleCoverPage={toggleCoverPage}
                  onToggleInfoBox={toggleInfoBox}
                />
                <MetadataInspector
                  markdown={markdown}
                  coverPage={coverPage}
                  infoBox={infoBox}
                  onToggleCoverPage={toggleCoverPage}
                  onToggleInfoBox={toggleInfoBox}
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
                    setMarkdown(
                      sampleHeader +
                        markdown.replace(/^---[\s\S]*?---\r?\n\r?\n?/, ""),
                    );
                  }}
                />
              </div>
            )}

            {viewMode === "code" && (
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <pre className="font-mono text-xs overflow-x-auto leading-relaxed text-foreground select-text">
                  <code>{highlightCode(generatedCode, "typescript")}</code>
                </pre>
              </div>
            )}
          </div>
        </section>

        {/* Right Pane: Live Side-by-Side DOCX Preview (50% on desktop) */}
        <section className="w-full lg:w-1/2 flex flex-col bg-muted/20 overflow-hidden h-[500px] lg:h-auto">
          <DocxViewer
            blob={liveBlob}
            loading={liveBlobLoading}
            error={liveBlobError}
            renderTimeMs={liveBlobRenderTimeMs}
            className="h-full"
            onRetry={handleExportDocx}
          />
        </section>
      </main>
    </div>
  );
}
