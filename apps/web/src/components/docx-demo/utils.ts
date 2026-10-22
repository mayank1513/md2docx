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

  // Remark Plugin (Unified Pipeline - Browser & Node.js)
  return `// Browser: import { remarkDocx } from "@m2d/remark-docx";
// Node.js: import { remarkDocxNode as remarkDocx } from "@m2d/remark-docx-node";
import { remarkDocx } from "@m2d/remark-docx";
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
    "blob", // use "buffer" or "uint8array" in Node.js
    { title: "My Document" },
    {
      plugins: [
        ${activeFns.join(",\n        ")}
      ]
    }
  );

const result = await processor.process(markdown);
const docxBlob = result.result;`;
};
