"use client";

import { Cpu } from "lucide-react";
import { ActionBar } from "./action-bar";
import { DemoToolbar } from "./demo-toolbar";
import { PluginPipeline } from "./plugin-pipeline";
import { PreviewPanel } from "./preview-panel";
import { TargetSelector } from "./target-selector";
import { useDocxDemo } from "./use-docx-demo";

export const DocxDemo = () => {
  const {
    selectedPreset,
    setSelectedPreset,
    selectedTarget,
    setSelectedTarget,
    markdown,
    setMarkdown,
    loadingSample,
    viewMode,
    setViewMode,
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
    handleClientGenerate,
    handleServerGenerate,
    generatedCode,
  } = useDocxDemo();

  return (
    <section id="demo" className="py-20 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            Interactive Playground & Engine Showcase
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Universal Client & Server DOCX Generation
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Select your compilation target, configure active ecosystem plugins,
            and export native Microsoft Word (.docx) documents in real-time.
          </p>
        </div>

        {/* Target Selector Bar */}
        <TargetSelector
          selectedTarget={selectedTarget}
          onSelectTarget={setSelectedTarget}
        />

        {/* Plugin Toggles Section */}
        <PluginPipeline
          enabledPlugins={enabledPlugins}
          activePluginCount={activePluginCount}
          onTogglePlugin={togglePlugin}
          onSetAllPlugins={setAllPlugins}
        />

        {/* Workspace Card */}
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Preset Selector & Toolbar */}
          <DemoToolbar
            selectedPreset={selectedPreset}
            loadingSample={loadingSample}
            viewMode={viewMode}
            cacheCleared={cacheCleared}
            onSelectPreset={setSelectedPreset}
            onChangeViewMode={setViewMode}
            onResetText={handleResetText}
            onClearCache={handleClearCache}
          />

          {/* Main Content Area: Editor, Preview, or Code */}
          <PreviewPanel
            viewMode={viewMode}
            markdown={markdown}
            selectedPreset={selectedPreset}
            selectedTarget={selectedTarget}
            activePluginCount={activePluginCount}
            generatedCode={generatedCode}
            onChangeMarkdown={setMarkdown}
          />

          {/* Performance Profiling & Execution Action Bar */}
          <ActionBar
            timing={timing}
            selectedTarget={selectedTarget}
            clientLoading={clientLoading}
            serverLoading={serverLoading}
            hasMarkdown={Boolean(markdown.trim())}
            errorMsg={errorMsg}
            onClientGenerate={handleClientGenerate}
            onServerGenerate={handleServerGenerate}
          />
        </div>
      </div>
    </section>
  );
};
