import { codePlugin } from "@m2d/code";
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
import type { PluginId, TargetId } from "./types";

export interface GenerateDocxOptions {
  markdown: string;
  target?: TargetId;
  enabledPlugins?: Partial<Record<PluginId, boolean>>;
  coverPage?: boolean;
  infoBox?: boolean;
  title?: string;
  creator?: string;
}

export const getActiveClientPlugins = (
  enabledPlugins?: Partial<Record<PluginId, boolean>>,
  options?: { coverPage?: boolean; infoBox?: boolean },
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
  if (enabledPlugins?.code !== false) list.push(codePlugin());
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
    if (enabledPlugins?.code === false) pluginProps.code = false;
    if (enabledPlugins?.mermaid === false) pluginProps.mermaid = false;
    if (enabledPlugins?.image === false) pluginProps.image = false;
    if (enabledPlugins?.html === false) pluginProps.html = false;
    if (enabledPlugins?.table === false) pluginProps.table = false;
    if (enabledPlugins?.list === false) pluginProps.list = false;
    if (enabledPlugins?.math === false) pluginProps.math = false;
    if (enabledPlugins?.emoji === false) pluginProps.emoji = false;

    if (target === "md2docx") {
      return (await md2docx(
        markdown,
        docxProps,
        undefined,
        "blob",
        pluginProps,
      )) as Blob;
    }

    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkFrontmatter)
      .use(remarkDocx, "blob", docxProps, undefined, pluginProps);
    const res = await processor.process(markdown);
    return res.result as Blob;
  }

  // target === "mdast2docx"
  const plugins = getActiveClientPlugins(enabledPlugins, {
    coverPage,
    infoBox,
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
