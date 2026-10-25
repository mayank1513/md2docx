import type { AstRef } from "@m2d/react-markdown/client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALL_PLUGINS_SAMPLE,
  PRESET_PLUGINS,
  PRESETS,
  TARGETS,
} from "./constants";
import { generateDocxBlob } from "./generator";
import type {
  ExecutionMode,
  PluginId,
  PresetId,
  TargetId,
  TimingResult,
  ViewMode,
} from "./types";
import { downloadBlob, generateSnippet, getPresetDocxFilename } from "./utils";

export const useDocxDemo = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetId>("all");
  const [isPresetActive, setIsPresetActive] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<TargetId>("md2docx");
  const [markdown, setMarkdown] = useState(ALL_PLUGINS_SAMPLE);
  const [fullSampleText, setFullSampleText] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("client");
  const [coverPage, setCoverPage] = useState(false);
  const [infoBox, setInfoBox] = useState(true);

  /** Captured MDAST reference from @m2d/react-markdown preview */
  const previewAstRef = useRef<NonNullable<AstRef["current"]>>([]);

  const [enabledPlugins, setEnabledPlugins] = useState<
    Record<PluginId, boolean>
  >(PRESET_PLUGINS.all);

  const [clientLoading, setClientLoading] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [timing, setTiming] = useState<TimingResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const activePluginCount = useMemo(
    () => Object.values(enabledPlugins).filter(Boolean).length,
    [enabledPlugins],
  );

  const handleSelectPreset = (id: PresetId) => {
    setSelectedPreset(id);
    setIsPresetActive(true);
  };

  const handleMarkdownChange = (newMd: string) => {
    setMarkdown(newMd);
    setIsPresetActive(false);
  };

  const togglePlugin = (id: PluginId) => {
    setIsPresetActive(false);
    setEnabledPlugins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllPlugins = (enable: boolean) => {
    setIsPresetActive(false);
    setEnabledPlugins({
      frontmatter: enable,
      math: enable,
      mermaid: enable,
      image: enable,
      table: enable,
      list: enable,
      html: enable,
      emoji: enable,
    });
  };

  const toggleCoverPage = () => {
    setIsPresetActive(false);
    setCoverPage((v) => !v);
  };

  const toggleInfoBox = () => {
    setIsPresetActive(false);
    setInfoBox((v) => !v);
  };

  const handleClearCache = () => {
    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        window.indexedDB.deleteDatabase("m2d-cache");
        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 2000);
      }
    } catch (err) {
      console.error("Failed to clear IndexedDB cache:", err);
    }
  };

  const handleResetText = () => {
    setIsPresetActive(true);
    setEnabledPlugins(PRESET_PLUGINS[selectedPreset]);
    if (selectedPreset === "full" && fullSampleText) {
      setMarkdown(fullSampleText);
    } else {
      const match = PRESETS.find((p) => p.id === selectedPreset);
      if (match) setMarkdown(match.sample);
    }
  };

  // Sync active plugins and lazy-load full sample text when preset changes
  useEffect(() => {
    setEnabledPlugins(PRESET_PLUGINS[selectedPreset]);
    if (selectedPreset === "full") {
      if (!fullSampleText) {
        setLoadingSample(true);
        fetch("/api/sample")
          .then((res) => res.json())
          .then((data) => {
            if (data?.markdown) {
              setFullSampleText(data.markdown);
              setMarkdown(data.markdown);
            }
          })
          .catch((err) => console.error("Failed to load sample.md:", err))
          .finally(() => setLoadingSample(false));
      } else {
        setMarkdown(fullSampleText);
      }
    } else {
      const match = PRESETS.find((p) => p.id === selectedPreset);
      if (match) setMarkdown(match.sample);
    }
  }, [selectedPreset, fullSampleText]);

  // Live DOCX Blob for instant side-by-side preview
  const [liveBlob, setLiveBlob] = useState<Blob | null>(null);
  const [liveBlobLoading, setLiveBlobLoading] = useState(false);
  const [liveBlobError, setLiveBlobError] = useState<string | null>(null);
  const [liveBlobRenderTimeMs, setLiveBlobRenderTimeMs] = useState<
    number | null
  >(null);

  // Debounced auto-generation of liveBlob on changes
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!markdown.trim()) {
        setLiveBlob(null);
        return;
      }
      setLiveBlobLoading(true);
      setLiveBlobError(null);
      const start = performance.now();
      try {
        const blob = await generateDocxBlob({
          markdown,
          target: selectedTarget,
          enabledPlugins,
          coverPage,
          infoBox,
          title:
            selectedPreset === "full"
              ? "Markdown Syntax Showcase"
              : "md2docx Live Preview",
        });
        if (isMounted) {
          setLiveBlob(blob);
          setLiveBlobRenderTimeMs(Math.round(performance.now() - start));
        }
      } catch (err) {
        if (isMounted) {
          console.error("Live DOCX generation failed:", err);
          setLiveBlobError(
            err instanceof Error ? err.message : "Live DOCX generation error",
          );
        }
      } finally {
        if (isMounted) {
          setLiveBlobLoading(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    markdown,
    selectedTarget,
    enabledPlugins,
    coverPage,
    infoBox,
    selectedPreset,
  ]);

  /** Client-Side Generation using the selected Target */
  const handleClientGenerate = async () => {
    setClientLoading(true);
    setErrorMsg(null);
    const start = performance.now();
    try {
      const docxProps = {
        title:
          selectedPreset === "full"
            ? "Markdown Syntax Showcase"
            : "md2docx Feature Showcase",
        creator: `${selectedTarget} Browser Engine`,
      };

      const docxBlob = await generateDocxBlob({
        markdown,
        target: selectedTarget,
        enabledPlugins,
        coverPage,
        infoBox,
        title: docxProps.title,
        creator: docxProps.creator,
      });

      const renderTimeMs = Math.round(performance.now() - start);
      const sizeKb = Number((docxBlob.size / 1024).toFixed(1));

      downloadBlob(
        docxBlob,
        getPresetDocxFilename(selectedPreset, selectedTarget, "client"),
      );

      const targetLabel =
        TARGETS.find((t) => t.id === selectedTarget)?.name || "Client Engine";

      setTiming({
        mode: "client",
        targetName: targetLabel,
        renderTimeMs,
        networkTimeMs: 0,
        totalTimeMs: renderTimeMs,
        sizeKb,
      });
    } catch (err) {
      console.error("Client conversion failed:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Client-side DOCX conversion encountered an error.",
      );
    } finally {
      setClientLoading(false);
    }
  };

  /** Server-Side Generation via API endpoint with profiling */
  const handleServerGenerate = async () => {
    setServerLoading(true);
    setErrorMsg(null);
    const roundtripStart = performance.now();
    try {
      const response = await fetch("/api/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown,
          plugins: enabledPlugins,
          coverPage,
          infoBox,
        }),
      });

      if (!response.ok) throw new Error("Server conversion failed");
      const blob = await response.blob();
      const totalTimeMs = Math.round(performance.now() - roundtripStart);

      const headerVal = response.headers.get("x-render-time");
      const serverRenderMs = headerVal
        ? Number.parseInt(headerVal, 10)
        : Math.round(totalTimeMs * 0.4);
      const networkTimeMs = Math.max(0, totalTimeMs - serverRenderMs);
      const sizeKb = Number((blob.size / 1024).toFixed(1));

      downloadBlob(
        blob,
        getPresetDocxFilename(selectedPreset, "node-server", "server"),
      );

      setTiming({
        mode: "server",
        targetName: "@m2d/remark-docx-node (Server API)",
        renderTimeMs: serverRenderMs,
        networkTimeMs,
        totalTimeMs,
        sizeKb,
      });
    } catch (err) {
      console.error("Server conversion failed:", err);
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Server-side DOCX conversion encountered an error.",
      );
    } finally {
      setServerLoading(false);
    }
  };

  const generatedCode = useMemo(
    () =>
      generateSnippet(
        selectedTarget,
        enabledPlugins,
        executionMode,
        coverPage,
        infoBox,
      ),
    [selectedTarget, enabledPlugins, executionMode, coverPage, infoBox],
  );

  const handleExportDocx = () => {
    if (executionMode === "client") {
      handleClientGenerate();
    } else {
      handleServerGenerate();
    }
  };

  return {
    selectedPreset,
    setSelectedPreset,
    isPresetActive,
    handleSelectPreset,
    selectedTarget,
    setSelectedTarget,
    markdown,
    setMarkdown: handleMarkdownChange,
    rawSetMarkdown: setMarkdown,
    loadingSample,
    viewMode,
    setViewMode,
    executionMode,
    setExecutionMode,
    coverPage,
    setCoverPage,
    infoBox,
    setInfoBox,
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
    handleClientGenerate,
    handleServerGenerate,
    handleExportDocx,
    generatedCode,
    previewAstRef,
    liveBlob,
    liveBlobLoading,
    liveBlobError,
    liveBlobRenderTimeMs,
  };
};
