import { AVAILABLE_PLUGINS } from "./constants";
import type { CodeEngine, ExecutionMode, PluginId, TargetId } from "./types";

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
 * Returns import statements, initializers, and plugin expressions for alternative code engines.
 */
const getCustomCodePluginSnippet = (codeEngine: CodeEngine) => {
  if (codeEngine === "lowlight") {
    return {
      importStatement:
        'import { codeLowlightPlugin } from "@m2d/code-lowlight";',
      pluginExpr: "codeLowlightPlugin()",
      preCode: "",
      desc: "Highlight.js AST parser",
    };
  }
  if (codeEngine === "shiki") {
    return {
      importStatement:
        'import { createCodeShikiPlugin } from "@m2d/code-shiki";',
      pluginExpr: "codePlugin",
      preCode:
        "\n// Pre-initialize Shiki TextMate highlighter\nconst codePlugin = await createCodeShikiPlugin();\n",
      desc: "VS Code TextMate grammar engine",
    };
  }
  return null;
};

/**
 * Formats plugin configuration properties into a serialized object snippet string.
 */
const formatPluginProps = (
  enabledPlugins: Record<PluginId, boolean>,
  coverPage: boolean,
  infoBox: boolean,
  indent = "    ",
  codeEngine: CodeEngine = "code",
): string | null => {
  const lines: string[] = [];
  for (const p of AVAILABLE_PLUGINS) {
    if (enabledPlugins[p.id] === false) {
      lines.push(`${indent}${p.id}: false,`);
    } else if (p.id === "code" && codeEngine !== "code") {
      lines.push(
        `${indent}code: false, // Disables built-in @m2d/code to use ${codeEngine}`,
      );
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

/**
 * Constructs the imports and pipeline invocation code snippet for the mdast2docx target.
 */
const buildMdast2DocxSnippet = (
  enabledPlugins: Record<PluginId, boolean>,
  coverPage: boolean,
  infoBox: boolean,
  isServer: boolean,
  codeEngine: CodeEngine = "code",
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
      if (codeEngine === "shiki") {
        invocations.push("codePlugin");
      } else if (codeEngine === "lowlight") {
        invocations.push("codeLowlightPlugin()");
      } else {
        invocations.push("codePlugin()");
      }
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
  if (hasCode) {
    if (codeEngine === "lowlight") {
      importLines.push(
        'import { codeLowlightPlugin } from "@m2d/code-lowlight";',
      );
    } else if (codeEngine === "shiki") {
      importLines.push(
        'import { createCodeShikiPlugin } from "@m2d/code-shiki";',
      );
    } else {
      importLines.push('import { codePlugin } from "@m2d/code";');
    }
  }
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

  const preInit =
    hasCode && codeEngine === "shiki"
      ? "\n// Initialize Shiki TextMate highlighter\nconst codePlugin = await createCodeShikiPlugin();\n"
      : "";

  return `${importLines.join("\n")}

// 1. Parse Markdown into MDAST tree
const mdast = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkFrontmatter)
  .parse(markdown);
${preInit}
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
  codeEngine: CodeEngine = "code",
): string => {
  const customCode =
    enabledPlugins.code !== false
      ? getCustomCodePluginSnippet(codeEngine)
      : null;

  if (executionMode === "server") {
    if (selectedTarget === "md2docx") {
      const codeImport = customCode ? `${customCode.importStatement}\n` : "";
      const preInit = customCode ? `${customCode.preCode}` : "";
      const sectionPropsStr = customCode
        ? `{\n    plugins: [${customCode.pluginExpr}],\n  }`
        : "undefined";
      const pluginPropsStr = formatPluginProps(
        enabledPlugins,
        coverPage,
        infoBox,
        "    ",
        codeEngine,
      );

      if (pluginPropsStr || customCode) {
        return `${codeImport}import { md2docx } from "@m2d/cli";
import fs from "node:fs";
${preInit}
// High-throughput Node.js conversion powered by @m2d/remark-docx-node
const docxBuffer = await md2docx(
  markdown,
  {
    title: "My Document",
    creator: "md2docx Node.js Engine",
  },
  ${sectionPropsStr},
  "nodebuffer",
  ${pluginPropsStr || "{}"}
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
      const codeImport = customCode ? `${customCode.importStatement}\n` : "";
      const preInit = customCode ? `${customCode.preCode}` : "";
      const pluginPropsStr = formatPluginProps(
        enabledPlugins,
        coverPage,
        infoBox,
        "    ",
        codeEngine,
      );
      const sectionPropsStr = customCode
        ? `,\n    {\n      plugins: [${customCode.pluginExpr}],\n    }`
        : "";
      const pluginPropsArg =
        pluginPropsStr || customCode
          ? `${sectionPropsStr || ", undefined"},\n    ${pluginPropsStr || "{}"}`
          : "";

      if (pluginPropsStr || customCode) {
        return `${codeImport}import { remarkDocx } from "@m2d/remark-docx-node";
import fs from "node:fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
${preInit}
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
    }${pluginPropsArg}
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
    return buildMdast2DocxSnippet(
      enabledPlugins,
      coverPage,
      infoBox,
      true,
      codeEngine,
    );
  }

  // Client Mode
  if (selectedTarget === "md2docx") {
    const codeImport = customCode ? `${customCode.importStatement}\n` : "";
    const preInit = customCode ? `${customCode.preCode}` : "";
    const sectionPropsStr = customCode
      ? `{\n    plugins: [${customCode.pluginExpr}],\n  }`
      : "undefined";
    const pluginPropsStr = formatPluginProps(
      enabledPlugins,
      coverPage,
      infoBox,
      "    ",
      codeEngine,
    );

    if (pluginPropsStr || customCode) {
      return `${codeImport}import { md2docx } from "@m2d/md2docx";
${preInit}
// Client-side Markdown to DOCX conversion
const docxBlob = await md2docx(
  markdown,
  {
    title: "My Document",
    creator: "md2docx Browser Engine",
  },
  ${sectionPropsStr},
  "blob",
  ${pluginPropsStr || "{}"}
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
    const codeImport = customCode ? `${customCode.importStatement}\n` : "";
    const preInit = customCode ? `${customCode.preCode}` : "";
    const pluginPropsStr = formatPluginProps(
      enabledPlugins,
      coverPage,
      infoBox,
      "    ",
      codeEngine,
    );
    const sectionPropsStr = customCode
      ? `,\n    {\n      plugins: [${customCode.pluginExpr}],\n    }`
      : "";
    const pluginPropsArg =
      pluginPropsStr || customCode
        ? `${sectionPropsStr || ", undefined"},\n    ${pluginPropsStr || "{}"}`
        : "";

    if (pluginPropsStr || customCode) {
      return `${codeImport}import { remarkDocx } from "@m2d/remark-docx";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
${preInit}
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
    }${pluginPropsArg}
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
  return buildMdast2DocxSnippet(
    enabledPlugins,
    coverPage,
    infoBox,
    false,
    codeEngine,
  );
};
