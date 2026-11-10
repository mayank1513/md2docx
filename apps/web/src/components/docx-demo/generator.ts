import { codePlugin } from "@m2d/code";
import { codeLowlightPlugin } from "@m2d/code-lowlight";
import { createCodeShikiPlugin } from "@m2d/code-shiki";
import { frontmatterPlugin } from "@m2d/frontmatter";
import { md2docx } from "@m2d/md2docx";
import { type Mdast2DocxPluginProps, remarkDocx } from "@m2d/remark-docx";
import type { Root } from "mdast";
import { toDocx } from "mdast2docx";
import {
  emojiPlugin,
  htmlPlugin,
  imagePlugin,
  listPlugin,
  mathPlugin,
  mermaidPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";
import type { CodeEngine, PluginId, TargetId } from "./types";

export interface GenerateDocxOptions {
  markdown: string;
  target?: TargetId;
  enabledPlugins?: Partial<Record<PluginId, boolean>>;
  coverPage?: boolean;
  infoBox?: boolean;
  codeEngine?: CodeEngine;
  title?: string;
  creator?: string;
}

let cachedShikiPromise: ReturnType<typeof createCodeShikiPlugin> | null = null;
const getShikiPlugin = () => {
  if (!cachedShikiPromise) {
    cachedShikiPromise = createCodeShikiPlugin({
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
  return cachedShikiPromise;
};

export const resolveCodePlugin = async (codeEngine: CodeEngine = "code") => {
  if (codeEngine === "lowlight") {
    return codeLowlightPlugin();
  }
  if (codeEngine === "shiki") {
    return await getShikiPlugin();
  }
  return codePlugin();
};

export const getActiveClientPlugins = async (
  enabledPlugins?: Partial<Record<PluginId, boolean>>,
  options?: {
    coverPage?: boolean;
    infoBox?: boolean;
    codeEngine?: CodeEngine;
  },
) => {
  const list = [];
  if (enabledPlugins?.frontmatter !== false) {
    list.push(
      frontmatterPlugin({
        coverPage: options?.coverPage,
        infoBox: options?.infoBox,
      }),
    );
  }
  if (enabledPlugins?.code !== false) {
    list.push(await resolveCodePlugin(options?.codeEngine));
  }
  if (enabledPlugins?.mermaid !== false) list.push(mermaidPlugin());
  if (enabledPlugins?.html !== false) list.push(htmlPlugin());
  if (enabledPlugins?.list !== false) list.push(listPlugin());
  if (enabledPlugins?.math !== false) list.push(mathPlugin());
  if (enabledPlugins?.table !== false) list.push(tablePlugin());
  if (enabledPlugins?.emoji !== false) list.push(emojiPlugin());
  if (enabledPlugins?.image !== false) list.push(imagePlugin());
  return list;
};

export const generateDocxBlob = async ({
  markdown,
  target = "md2docx",
  enabledPlugins,
  coverPage = false,
  infoBox = true,
  codeEngine = "code",
  title = "Md2Docx Document",
  creator,
}: GenerateDocxOptions): Promise<Blob> => {
  const docxProps = {
    title,
    creator: creator ?? `${target} Browser Engine`,
  };

  if (target === "md2docx" || target === "remark-docx") {
    const pluginProps: Mdast2DocxPluginProps = {};
    if (enabledPlugins?.frontmatter === false) {
      pluginProps.frontmatter = false;
    } else if (coverPage || !infoBox) {
      pluginProps.frontmatter = { coverPage, infoBox };
    }

    // Handle code engine:
    // If code is disabled, pass false in pluginProps.
    // If non-default engine (lowlight or shiki), disable built-in code and pass the engine via sectionProps.plugins
    // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
    let customPlugins: Array<any> | undefined;
    if (enabledPlugins?.code === false) {
      pluginProps.code = false;
    } else if (codeEngine !== "code") {
      pluginProps.code = false;
      const activeCodePlugin = await resolveCodePlugin(codeEngine);
      customPlugins = [activeCodePlugin];
    }

    if (enabledPlugins?.mermaid === false) pluginProps.mermaid = false;
    if (enabledPlugins?.image === false) pluginProps.image = false;
    if (enabledPlugins?.html === false) pluginProps.html = false;
    if (enabledPlugins?.table === false) pluginProps.table = false;
    if (enabledPlugins?.list === false) pluginProps.list = false;
    if (enabledPlugins?.math === false) pluginProps.math = false;
    if (enabledPlugins?.emoji === false) pluginProps.emoji = false;

    const sectionProps = customPlugins ? { plugins: customPlugins } : undefined;

    if (target === "md2docx") {
      return (await md2docx(
        markdown,
        docxProps,
        sectionProps,
        "blob",
        pluginProps,
      )) as Blob;
    }

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkFrontmatter)
      .use(remarkDocx, "blob", docxProps, sectionProps, pluginProps);
    const res = await processor.process(markdown);
    return res.result as Blob;
  }

  // target === "mdast2docx"
  const plugins = await getActiveClientPlugins(enabledPlugins, {
    coverPage,
    infoBox,
    codeEngine,
  });
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkFrontmatter);
  const ast = processor.parse(markdown) as Root;
  return (await toDocx(
    ast,
    docxProps,
    // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
    { plugins: plugins as any },
    "blob",
  )) as Blob;
};
