"use client";

import { Cpu } from "lucide-react";
import { ActionBar } from "./action-bar";
import { DemoToolbar } from "./demo-toolbar";
import { DocumentStats } from "./document-stats";
import { PluginPipeline } from "./plugin-pipeline";
import { PreviewPanel } from "./preview-panel";
import { useDocxDemo } from "./use-docx-demo";

export const DocxDemo = () => {
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
    previewAstRef,
    liveBlob,
    liveBlobLoading,
    liveBlobError,
    liveBlobRenderTimeMs,
  } = useDocxDemo();

  return (
    <section id="demo" className="py-20 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Interactive Playground & Engine Showcase
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Pluggable Architecture & Official Plugin Ecosystem
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Select your compilation target, toggle our rich suite of official
            plugins, or wire custom AST transformers to export native Microsoft
            Word (.docx) documents in real-time.
          </p>
        </div>

        {/* Plugin Toggles Section */}
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

        {/* Workspace Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Preset Selector, View Switcher & Target Dropdown Toolbar */}
          <DemoToolbar
            selectedPreset={selectedPreset}
            isPresetActive={isPresetActive}
            loadingSample={loadingSample}
            viewMode={viewMode}
            cacheCleared={cacheCleared}
            selectedTarget={selectedTarget}
            onSelectPreset={handleSelectPreset}
            onChangeViewMode={setViewMode}
            onSelectTarget={setSelectedTarget}
            onResetText={handleResetText}
            onClearCache={handleClearCache}
          />

          {/* Document Stats Bar */}
          <DocumentStats markdown={markdown} />

          {/* Main Content Area: Editor, Preview, Doc Properties, or Code */}
          <PreviewPanel
            viewMode={viewMode}
            markdown={markdown}
            selectedPreset={selectedPreset}
            selectedTarget={selectedTarget}
            enabledPlugins={enabledPlugins}
            activePluginCount={activePluginCount}
            coverPage={coverPage}
            infoBox={infoBox}
            generatedCode={generatedCode}
            previewAstRef={previewAstRef}
            docxBlob={liveBlob}
            docxLoading={liveBlobLoading}
            docxError={liveBlobError}
            docxRenderTimeMs={liveBlobRenderTimeMs}
            onChangeMarkdown={setMarkdown}
            onToggleCoverPage={toggleCoverPage}
            onToggleInfoBox={toggleInfoBox}
          />

          {/* Performance Profiling & Execution Action Bar */}
          <ActionBar
            timing={timing}
            executionMode={executionMode}
            clientLoading={clientLoading}
            serverLoading={serverLoading}
            hasMarkdown={Boolean(markdown.trim())}
            errorMsg={errorMsg}
            onSelectExecutionMode={setExecutionMode}
            onExportDocx={handleExportDocx}
          />
        </div>
      </div>
    </section>
  );
};
