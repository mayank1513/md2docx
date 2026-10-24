import { md2docx } from "@m2d/md2docx";
import { remarkDocx } from "@m2d/remark-docx";
import { toDocx } from "mdast2docx";
import {
  emojiPlugin,
  frontmatterPlugin,
  htmlPlugin,
  imagePlugin,
  listPlugin,
  mathPlugin,
  mermaidPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import { useEffect, useMemo, useState } from "react";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import {
  ALL_PLUGINS_SAMPLE,
  PRESET_PLUGINS,
  PRESETS,
  TARGETS,
} from "./constants";
import type {
  PluginId,
  PresetId,
  TargetId,
  TimingResult,
  ViewMode,
} from "./types";
import { downloadBlob, generateSnippet, getPresetDocxFilename } from "./utils";

export const useDocxDemo = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetId>("all");
  const [selectedTarget, setSelectedTarget] = useState<TargetId>("md2docx");
  const [markdown, setMarkdown] = useState(ALL_PLUGINS_SAMPLE);
  const [fullSampleText, setFullSampleText] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");

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

  const togglePlugin = (id: PluginId) => {
    setEnabledPlugins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllPlugins = (enable: boolean) => {
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

  /** Helper to instantiate only the active client plugins */
  const getActiveClientPlugins = () => {
    const list = [];
    if (enabledPlugins.frontmatter) list.push(frontmatterPlugin());
    if (enabledPlugins.mermaid) list.push(mermaidPlugin());
    if (enabledPlugins.html) list.push(htmlPlugin());
    if (enabledPlugins.list) list.push(listPlugin());
    if (enabledPlugins.math) list.push(mathPlugin());
    if (enabledPlugins.table) list.push(tablePlugin());
    if (enabledPlugins.emoji) list.push(emojiPlugin());
    if (enabledPlugins.image) list.push(imagePlugin());
    return list;
  };

  /** Client-Side Generation using the selected Target */
  const handleClientGenerate = async () => {
    setClientLoading(true);
    setErrorMsg(null);
    const start = performance.now();
    try {
      const plugins = getActiveClientPlugins();
      const docxProps = {
        title:
          selectedPreset === "full"
            ? "Markdown Syntax Showcase"
            : "md2docx Feature Showcase",
        creator: `${selectedTarget} Browser Engine`,
      };

      let docxBlob: Blob;

      if (selectedTarget === "md2docx") {
        docxBlob = (await md2docx(
          markdown,
          docxProps,
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          { plugins: plugins as any },
          "blob",
        )) as Blob;
      } else if (selectedTarget === "remark-docx") {
        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkFrontmatter)
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          .use(remarkDocx, "blob", docxProps, { plugins: plugins as any });
        const res = await processor.process(markdown);
        docxBlob = res.result as Blob;
      } else {
        const processor = unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkFrontmatter);
        const mdast = processor.parse(markdown);
        docxBlob = (await toDocx(
          mdast,
          docxProps,
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
          { plugins: plugins as any },
          "blob",
        )) as Blob;
      }

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
    () => generateSnippet(selectedTarget, enabledPlugins),
    [selectedTarget, enabledPlugins],
  );

  return {
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
  };
};
