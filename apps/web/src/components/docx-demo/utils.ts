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

const formatPluginProps = (
  enabledPlugins: Record<PluginId, boolean>,
  coverPage: boolean,
  infoBox: boolean,
  indent = "    ",
): string | null => {
  const lines: string[] = [];
  for (const p of AVAILABLE_PLUGINS) {
    if (enabledPlugins[p.id] === false) {
      lines.push(`${indent}${p.id}: false,`);
    }
  }
  if (enabledPlugins.frontmatter !== false && (coverPage || !infoBox)) {
    const opts: string[] = [];
    if (coverPage) opts.push("coverPage: true");
    if (!infoBox) opts.push("infoBox: false");
    lines.push(`${indent}frontmatter: { ${opts.join(", ")} },`);
  }
  if (lines.length === 0) return null;
  return `{\n${lines.join("\n")}\n${indent.slice(2)}}`;
};

const buildMdast2DocxSnippet = (
  enabledPlugins: Record<PluginId, boolean>,
  coverPage: boolean,
  infoBox: boolean,
  isServer: boolean,
): string => {
  const activePlugins = AVAILABLE_PLUGINS.filter((p) => enabledPlugins[p.id]);
  const nodePluginIds = new Set(["html", "image", "mermaid"]);
  const coreImports: string[] = [];
  const nodeImports: string[] = [];
  const invocations: string[] = [];
  let hasCode = false;
  let hasFrontmatter = false;

  for (const p of activePlugins) {
    if (p.id === "code") {
      hasCode = true;
      invocations.push("codePlugin()");
    } else if (p.id === "frontmatter") {
      hasFrontmatter = true;
      const opts: string[] = [];
      if (coverPage) opts.push("coverPage: true");
      if (!infoBox) opts.push("infoBox: false");
      invocations.push(
        opts.length > 0
          ? `frontmatterPlugin({ ${opts.join(", ")} })`
          : "frontmatterPlugin()",
      );
    } else if (isServer && nodePluginIds.has(p.id)) {
      const nodeFn =
        p.id === "mermaid"
          ? "mermaidNodePlugin"
          : `node${p.id[0].toUpperCase()}${p.id.slice(1)}Plugin`;
      nodeImports.push(nodeFn);
      invocations.push(`${nodeFn}()`);
    } else {
      coreImports.push(p.fnName);
      invocations.push(`${p.fnName}()`);
    }
  }

  const importLines: string[] = ['import { toDocx } from "mdast2docx";'];
  if (hasCode) importLines.push('import { codePlugin } from "@m2d/code";');
  if (hasFrontmatter)
    importLines.push('import { frontmatterPlugin } from "@m2d/frontmatter";');
  if (nodeImports.length > 0) {
    importLines.push(
      `import {\n  ${nodeImports.join(",\n  ")},\n} from "mdast2docx/plugins/node";`,
    );
  }
  if (coreImports.length > 0) {
    importLines.push(
      `import {\n  ${coreImports.join(",\n  ")},\n} from "mdast2docx/plugins";`,
    );
  }
  if (isServer) importLines.push('import fs from "node:fs";');
  importLines.push(
    'import { unified } from "unified";',
    'import remarkParse from "remark-parse";',
    'import remarkGfm from "remark-gfm";',
    'import remarkMath from "remark-math";',
    'import remarkFrontmatter from "remark-frontmatter";',
  );

  const outFormat = isServer ? '"buffer"' : '"blob"';
  const outDocTitle = isServer ? "Server Document" : "My Document";
  const outVar = isServer ? "docxBuffer" : "docxBlob";
  const outComment = isServer
    ? "// 2. Compile to native Word Buffer on Node.js"
    : "// 2. Compile MDAST tree into Word OpenXML document (.docx)";
  const saveCall = isServer
    ? '\nfs.writeFileSync("output.docx", docxBuffer);'
    : "";

  return `${importLines.join("\n")}

// 1. Parse Markdown into MDAST tree
const mdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter)
  .parse(markdown);

${outComment}
const ${outVar} = await toDocx(
  mdast,
  { title: "${outDocTitle}" },
  {
    plugins: [
      ${invocations.join(",\n      ")}
    ]
  },
  ${outFormat}
);${saveCall}`;
};

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
  if (executionMode === "server") {
    if (selectedTarget === "md2docx") {
      const pluginPropsStr = formatPluginProps(
        enabledPlugins,
        coverPage,
        infoBox,
        "    ",
      );
      if (pluginPropsStr) {
        return `import { md2docx } from "@m2d/cli";
import fs from "node:fs";

// High-throughput Node.js conversion powered by @m2d/remark-docx-node
const docxBuffer = await md2docx(
  markdown,
  {
    title: "My Document",
    creator: "md2docx Node.js Engine",
  },
  undefined,
  "nodebuffer",
  ${pluginPropsStr}
);

fs.writeFileSync("output.docx", docxBuffer);`;
      }

      return `import { md2docx } from "@m2d/cli";
import fs from "node:fs";

// High-throughput Node.js conversion powered by @m2d/remark-docx-node (default plugins enabled)
const docxBuffer = await md2docx(markdown, {
  title: "My Document",
  creator: "md2docx Node.js Engine",
});

fs.writeFileSync("output.docx", docxBuffer);`;
    }

    if (selectedTarget === "remark-docx") {
      const pluginPropsStr = formatPluginProps(
        enabledPlugins,
        coverPage,
        infoBox,
        "    ",
      );
      if (pluginPropsStr) {
        return `import { remarkDocx } from "@m2d/remark-docx-node";
import fs from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";

// Server-side Unified pipeline with Sharp image and beautiful-mermaid diagram rendering
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter)
  .use(
    remarkDocx,
    "buffer",
    {
      title: "Server Document",
    },
    undefined,
    ${pluginPropsStr}
  );

const result = await processor.process(markdown);
fs.writeFileSync("output.docx", result.result as Buffer);`;
      }

      return `import { remarkDocx } from "@m2d/remark-docx-node";
import fs from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";

// Server-side Unified pipeline with Sharp image and beautiful-mermaid diagram rendering (default plugins enabled)
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter)
  .use(remarkDocx, "buffer", {
    title: "Server Document",
  });

const result = await processor.process(markdown);
fs.writeFileSync("output.docx", result.result as Buffer);`;
    }

    // mdast2docx (Server)
    return buildMdast2DocxSnippet(enabledPlugins, coverPage, infoBox, true);
  }

  // Client Mode
  if (selectedTarget === "md2docx") {
    const pluginPropsStr = formatPluginProps(
      enabledPlugins,
      coverPage,
      infoBox,
      "    ",
    );
    if (pluginPropsStr) {
      return `import { md2docx } from "@m2d/md2docx";

// Client-side Markdown to DOCX conversion
const docxBlob = await md2docx(
  markdown,
  {
    title: "My Document",
    creator: "md2docx Browser Engine",
  },
  undefined,
  "blob",
  ${pluginPropsStr}
);`;
    }

    return `import { md2docx } from "@m2d/md2docx";

// Fast, client-side Markdown to DOCX conversion (default plugins enabled)
const docxBlob = await md2docx(markdown, {
  title: "My Document",
  creator: "md2docx Browser Engine",
});`;
  }

  if (selectedTarget === "remark-docx") {
    const pluginPropsStr = formatPluginProps(
      enabledPlugins,
      coverPage,
      infoBox,
      "    ",
    );
    if (pluginPropsStr) {
      return `import { remarkDocx } from "@m2d/remark-docx";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";

// Unified compiler pipeline in browser
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter)
  .use(
    remarkDocx,
    "blob",
    {
      title: "My Document",
    },
    undefined,
    ${pluginPropsStr}
  );

const result = await processor.process(markdown);
const docxBlob = result.result;`;
    }

    return `import { remarkDocx } from "@m2d/remark-docx";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";

// Unified compiler pipeline in browser (default plugins enabled)
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter)
  .use(remarkDocx, "blob", {
    title: "My Document",
  });

const result = await processor.process(markdown);
const docxBlob = result.result;`;
  }

  // mdast2docx (Client)
  return buildMdast2DocxSnippet(enabledPlugins, coverPage, infoBox, false);
};
