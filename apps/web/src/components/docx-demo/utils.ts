import { AVAILABLE_PLUGINS } from "./constants";
import type { ExecutionMode, PluginId, TargetId } from "./types";

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
 * Dynamically generates code snippet tailored to the user's selected Target, Plugins, and Execution Mode.
 */
export const generateSnippet = (
  selectedTarget: TargetId,
  enabledPlugins: Record<PluginId, boolean>,
  executionMode: ExecutionMode = "client",
  coverPage: boolean = false,
  infoBox: boolean = false,
): string => {
  const activeFns = AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id]).map(
    (p) => {
      if (p.id === "frontmatter" && (coverPage || infoBox)) {
        const opts = [];
        if (coverPage) opts.push("coverPage: true");
        if (infoBox) opts.push("infoBox: true");
        return `frontmatterPlugin(undefined, { ${opts.join(", ")} })`;
      }
      return `${p.fnName}()`;
    },
  );

  if (executionMode === "server") {
    if (selectedTarget === "md2docx") {
      return `import { md2docx } from "@m2d/cli";
import fs from "node:fs";

// High-throughput Node.js conversion powered by @m2d/remark-docx-node
const docxBuffer = await md2docx(markdown, {
  title: "My Document",
  creator: "md2docx Node.js Engine",
});

fs.writeFileSync("output.docx", docxBuffer);`;
    }

    if (selectedTarget === "remark-docx") {
      return `import { remarkDocx } from "@m2d/remark-docx-node";
import fs from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

// Server-side Unified pipeline with Sharp image and beautiful-mermaid diagram rendering
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkDocx, "buffer", {
    title: "Server Document",
  });

const result = await processor.process(markdown);
fs.writeFileSync("output.docx", result.result as Buffer);`;
    }

    return `import { toDocx } from "mdast2docx";
import {
  nodeHtmlPlugin,
  nodeImagePlugin,
  nodeMermaidPlugin,
} from "mdast2docx/plugins/node";
import {
  listPlugin,
  mathPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import fs from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

// 1. Parse Markdown to MDAST
const mdast = unified().use(remarkParse).use(remarkGfm).parse(markdown);

// 2. Compile to native Word Buffer on Node.js
const docxBuffer = (await toDocx(
  mdast,
  { title: "Server Document" },
  {
    plugins: [
      nodeHtmlPlugin(),
      nodeImagePlugin(),
      nodeMermaidPlugin(),
      listPlugin(),
      tablePlugin(),
      mathPlugin(),
    ],
  },
  "buffer",
)) as Buffer;

fs.writeFileSync("output.docx", docxBuffer);`;
  }

  // Client Mode
  if (selectedTarget === "md2docx") {
    return `import { md2docx } from "@m2d/md2docx";
import {
  ${AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id])
    .map((p) => p.fnName)
    .join(",\n  ")}
} from "mdast2docx/plugins";

// Fast, client-side Markdown to DOCX conversion
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

  // Remark Plugin (Browser)
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

// Unified compiler pipeline in browser
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
};
