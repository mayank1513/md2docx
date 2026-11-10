import { readFileSync } from "node:fs";
import path from "node:path";
import { codePlugin } from "@m2d/code";
import { codeLowlightPlugin } from "@m2d/code-lowlight";
import { createCodeShikiPlugin } from "@m2d/code-shiki";
import {
  type Mdast2DocxNodePluginProps,
  remarkDocx as remarkDocxNode,
} from "@m2d/remark-docx-node";
import { toDocx } from "mdast2docx";
import {
  emojiPlugin,
  frontmatterPlugin,
  listPlugin,
  mathPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import {
  mermaidNodePlugin,
  nodeHtmlPlugin,
  nodeImagePlugin,
} from "mdast2docx/plugins/node";
import { type NextRequest, NextResponse } from "next/server";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

const docxProcessor = unified()
  .use(remarkFrontmatter)
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath);

interface LayoutOptions {
  coverPage?: boolean;
  infoBox?: boolean;
}

let cachedServerShiki: ReturnType<typeof createCodeShikiPlugin> | null = null;
/**
 * Retrieves or initializes the shared server-side Shiki highlighter plugin singleton.
 */
const getServerShikiPlugin = () => {
  if (!cachedServerShiki) {
    cachedServerShiki = createCodeShikiPlugin({
      langs: [
        "javascript",
        "typescript",
        "python",
        "json",
        "html",
        "css",
        "sql",
        "sh",
        "diff",
        "markdown",
      ],
      themes: ["github-light", "github-dark", "monokai"],
    });
  }
  return cachedServerShiki;
};

/**
 * Resolves the server-side code highlighting plugin based on the selected syntax engine.
 */
const resolveServerCodePlugin = async (codeEngine = "code") => {
  if (codeEngine === "lowlight") {
    return codeLowlightPlugin();
  }
  if (codeEngine === "shiki") {
    return await getServerShikiPlugin();
  }
  return codePlugin();
};

/**
 * Constructs the server-side plugin array based on enabled flags, layout options, and code engine.
 */
const getServerPlugins = async (
  enabled?: Record<string, boolean>,
  layoutOptions?: LayoutOptions,
  codeEngine = "code",
) => {
  const plugins = [];
  if (enabled?.frontmatter !== false) {
    plugins.push(
      frontmatterPlugin({
        coverPage: layoutOptions?.coverPage,
        infoBox: layoutOptions?.infoBox,
      }),
    );
  }
  if (enabled?.code !== false) {
    plugins.push(await resolveServerCodePlugin(codeEngine));
  }
  if (enabled?.html !== false) plugins.push(nodeHtmlPlugin());
  if (enabled?.list !== false) plugins.push(listPlugin());
  if (enabled?.table !== false) plugins.push(tablePlugin());
  if (enabled?.math !== false) plugins.push(mathPlugin());
  if (enabled?.mermaid !== false) plugins.push(mermaidNodePlugin());
  if (enabled?.image !== false) plugins.push(nodeImagePlugin());
  if (enabled?.emoji !== false) plugins.push(emojiPlugin());
  return plugins;
};

/**
 * Renders Markdown AST to DOCX and returns a streaming attachment response with profiling headers.
 */
const generateDocxResponse = async (
  markdown: string,
  filename: string,
  fileProps: Parameters<typeof toDocx>[1] = {},
  pluginsConfig?: Record<string, boolean>,
  layoutOptions?: LayoutOptions,
  target = "md2docx",
  codeEngine = "code",
): Promise<NextResponse> => {
  const start = performance.now();
  let buffer: unknown;

  if (target === "md2docx" || target === "remark-docx") {
    const pluginProps: Mdast2DocxNodePluginProps = {};
    if (pluginsConfig?.frontmatter === false) {
      pluginProps.frontmatter = false;
    } else if (
      layoutOptions?.coverPage ||
      layoutOptions?.infoBox !== undefined
    ) {
      pluginProps.frontmatter = {
        coverPage: layoutOptions?.coverPage,
        infoBox: layoutOptions?.infoBox,
      };
    }

    // Handle code engine:
    // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
    let customPlugins: Array<any> | undefined;
    if (pluginsConfig?.code === false) {
      pluginProps.code = false;
    } else if (codeEngine !== "code") {
      pluginProps.code = false;
      const activeCodePlugin = await resolveServerCodePlugin(codeEngine);
      customPlugins = [activeCodePlugin];
    }

    if (pluginsConfig?.html === false) pluginProps.html = false;
    if (pluginsConfig?.list === false) pluginProps.list = false;
    if (pluginsConfig?.table === false) pluginProps.table = false;
    if (pluginsConfig?.math === false) pluginProps.math = false;
    if (pluginsConfig?.mermaid === false) pluginProps.mermaid = false;
    if (pluginsConfig?.image === false) pluginProps.image = false;
    if (pluginsConfig?.emoji === false) pluginProps.emoji = false;

    const sectionProps = customPlugins ? { plugins: customPlugins } : undefined;

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkFrontmatter)
      .use(remarkDocxNode, "arraybuffer", fileProps, sectionProps, pluginProps);

    const res = await processor.process(markdown);
    buffer = res.result;
  } else {
    // target === "mdast2docx"
    const mdast = docxProcessor.parse(markdown);
    buffer = await toDocx(
      mdast,
      fileProps,
      {
        plugins: (await getServerPlugins(
          pluginsConfig,
          layoutOptions,
          codeEngine,
          // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
        )) as any,
      },
      "arraybuffer",
    );
  }

  const renderTimeMs = Math.round(performance.now() - start);

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Render-Time": `${renderTimeMs}`,
      "Server-Timing": `render;dur=${renderTimeMs}`,
      "Access-Control-Expose-Headers": "X-Render-Time, Server-Timing",
    },
  });
};

/**
 * Generate a docx file from markdown on server side.
 * GET: Converts monorepo root sample.md
 * POST: Converts request body { markdown, target, plugins, coverPage, infoBox }
 */
export const GET = async () => {
  try {
    const samplePath = path.resolve(process.cwd(), "../../sample.md");
    const md = readFileSync(samplePath, "utf-8");
    return await generateDocxResponse(
      md,
      "sample.docx",
      {
        title: "Markdown Syntax Showcase",
      },
      undefined,
      undefined,
      "md2docx",
    );
  } catch (error) {
    console.error("Error generating DOCX:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX document" },
      { status: 500 },
    );
  }
};

/**
 * POST endpoint converting user payload Markdown to DOCX with selected target and plugins.
 */
export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const md = body?.markdown || "# Empty Document";
    const target = (body?.target as string) || "md2docx";
    const codeEngine = (body?.codeEngine as string) || "code";
    const plugins = body?.plugins as Record<string, boolean> | undefined;
    const coverPage = body?.coverPage as boolean | undefined;
    const infoBox = body?.infoBox as boolean | undefined;
    return await generateDocxResponse(
      md,
      "document.docx",
      {},
      plugins,
      {
        coverPage,
        infoBox,
      },
      target,
      codeEngine,
    );
  } catch (error) {
    console.error("Error generating DOCX from body:", error);
    return NextResponse.json(
      { error: "Failed to generate DOCX document" },
      { status: 500 },
    );
  }
};
