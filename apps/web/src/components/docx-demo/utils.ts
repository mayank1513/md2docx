import katex from "katex";
import { AVAILABLE_PLUGINS } from "./constants";
import type { PluginId, TargetId } from "./types";

/**
 * Triggers a client-side file download from a Blob.
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Generates standard filename for demo preset downloads.
 */
export const getPresetDocxFilename = (
  preset: string,
  target: string,
  mode: "client" | "server",
): string =>
  preset === "full"
    ? `full-sample-${target}-${mode}.docx`
    : `md2docx-${preset}-${target}-${mode}.docx`;

/**
 * Simple, fast client-side markdown to HTML renderer for the Live Preview tab.
 */
export const renderMarkdownPreviewHtml = (md: string): string => {
  const html = md
    .replace(/&/g, "&amp;")
    // Display Math: $$ ... $$
    .replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      try {
        return `<div class="my-4 text-center overflow-x-auto">${katex.renderToString(
          tex.trim(),
          { displayMode: true, throwOnError: false },
        )}</div>`;
      } catch {
        return `<div class="text-amber-500 font-mono text-xs my-2">$$${tex}$$</div>`;
      }
    })
    // Inline Math: $ ... $
    .replace(/\$([^$\n]+?)\$/g, (_, tex) => {
      try {
        return katex.renderToString(tex.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `<span class="text-amber-500 font-mono text-xs">$${tex}$</span>`;
      }
    })
    // Fenced Code Blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, _lang, code) => {
      return `<pre class="my-3 p-3 rounded-lg bg-muted text-foreground font-mono text-xs overflow-x-auto border border-border"><code>${code.trim()}</code></pre>`;
    })
    // Headings
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-lg font-bold mt-5 mb-2 text-foreground">$1</h3>',
    )
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-xl font-extrabold mt-6 mb-3 text-foreground border-b border-border/40 pb-1">$1</h2>',
    )
    .replace(
      /^# (.*$)/gim,
      '<h1 class="text-2xl font-black mt-4 mb-3 text-foreground">$1</h1>',
    )
    // Horizontal Rule
    .replace(/^---$/gim, '<hr class="my-6 border-border" />')
    // Bold & Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-primary">$1</code>',
    )
    // Safe HTML showcase elements
    .replace(
      /&lt;kbd&gt;(.*?)&lt;\/kbd&gt;/g,
      '<kbd class="px-1.5 py-0.5 rounded text-xs font-mono bg-muted border border-border shadow-xs">$1</kbd>',
    )
    .replace(
      /&lt;mark style="([^"]*)"&gt;(.*?)&lt;\/mark&gt;/g,
      '<mark style="$1" class="px-1 rounded">$2</mark>',
    )
    .replace(
      /&lt;span style="([^"]*)"&gt;(.*?)&lt;\/span&gt;/g,
      '<span style="$1">$2</span>',
    );

  return html;
};

/**
 * Splits raw markdown into text segments and Mermaid code blocks for live rendering.
 */
export type MarkdownSegment =
  | { type: "markdown"; content: string }
  | { type: "mermaid"; code: string };

export const splitMarkdownWithMermaid = (md: string): MarkdownSegment[] => {
  const regex = /```mermaid\s*\n([\s\S]*?)```/g;
  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while (true) {
    match = regex.exec(md);
    if (!match) break;

    if (match.index > lastIndex) {
      segments.push({
        type: "markdown",
        content: md.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: "mermaid",
      code: match[1],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < md.length) {
    segments.push({
      type: "markdown",
      content: md.slice(lastIndex),
    });
  }

  return segments;
};

/**
 * Dynamically generates code snippet tailored to the user's selected Target & Plugins
 */
export const generateSnippet = (
  selectedTarget: TargetId,
  enabledPlugins: Record<PluginId, boolean>,
): string => {
  const activeFns = AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id]).map(
    (p) => `${p.fnName}()`,
  );

  if (selectedTarget === "md2docx") {
    return `import { md2docx } from "@m2d/md2docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";

// Fast, all-in-one Markdown to DOCX conversion
const docxBlob = await md2docx(
  markdown,
  {
    title: "My Document",
    creator: "md2docx Browser Engine"
  },
  {
    plugins: [
      ${activeFns.join(",\n      ")}
    ]
  },
  "blob"
);`;
  }

  if (selectedTarget === "mdast2docx") {
    return `import { toDocx } from "mdast2docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// 1. Parse Markdown into MDAST tree
const mdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .parse(markdown);

// 2. Compile MDAST tree into Word OpenXML document (.docx)
const docxBlob = await toDocx(
  mdast,
  { title: "My Document" },
  {
    plugins: [
      ${activeFns.join(",\n      ")}
    ]
  },
  "blob"
);`;
  }

  if (selectedTarget === "remark-docx") {
    return `import { remarkDocx } from "@m2d/remark-docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// Unified compiler pipeline
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(
    remarkDocx,
    "blob",
    { title: "My Document" },
    {
      plugins: [
        ${activeFns.join(",\n        ")}
      ]
    }
  );

const result = await processor.process(markdown);
const docxBlob = result.result;`;
  }

  // Node Server / CLI Target
  return `import { remarkDocxNode } from "@m2d/remark-docx-node";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import fs from "node:fs/promises";

// Server-side Node.js / CLI workflow
// Powered by Linkedom (DOM-less HTML) and Sharp (Native Image/SVG)
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDocxNode, "buffer", { title: "Architecture Report" });

const file = await processor.process(markdown);
await fs.writeFile("document.docx", Buffer.from(file.result));`;
};
