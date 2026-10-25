import { frontmatterPlugin } from "@m2d/frontmatter";
import { md2docx } from "@m2d/md2docx";
import { remarkDocx } from "@m2d/remark-docx";
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
      frontmatterPlugin(undefined, {
        coverPage: options?.coverPage,
        infoBox: options?.infoBox,
      }),
    );
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
  title = "Md2Docx Document",
  creator,
}: GenerateDocxOptions): Promise<Blob> => {
  const plugins = getActiveClientPlugins(enabledPlugins, {
    coverPage,
    infoBox,
  });
  const docxProps = {
    title,
    creator: creator ?? `${target} Browser Engine`,
  };

  if (target === "md2docx") {
    return (await md2docx(
      markdown,
      docxProps,
      // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
      { plugins: plugins as any },
      "blob",
    )) as Blob;
  }

  if (target === "remark-docx") {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkFrontmatter)
      // biome-ignore lint/suspicious/noExplicitAny: generic AST plugin compatibility
      .use(remarkDocx, "blob", docxProps, { plugins: plugins as any });
    const res = await processor.process(markdown);
    return res.result as Blob;
  }

  // target === "mdast2docx"
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
