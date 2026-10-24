import { type IDocxProps, type ISectionProps, toDocx } from "@m2d/core";
import { DEFAULT_SECTION_PROPS } from "@m2d/core/utils";
import { emojiPlugin } from "@m2d/emoji";
import { frontmatterPlugin } from "@m2d/frontmatter";
import { nodeHtmlPlugin } from "@m2d/html-node";
import { nodeImagePlugin } from "@m2d/image-node";
import { listPlugin } from "@m2d/list";
import { mathPlugin } from "@m2d/math";
import { nodeMermaidPlugin } from "@m2d/mermaid-node";
import { tablePlugin } from "@m2d/table";
import type { OutputByType, OutputType } from "docx";
import type { Root } from "mdast";
import type { Plugin } from "unified";

export interface HeaderFooterMarkdownOptions {
  readonly default?: string;
  readonly first?: string;
  readonly even?: string;
}

export type HeaderMarkdown = string | HeaderFooterMarkdownOptions;
export type FooterMarkdown = string | HeaderFooterMarkdownOptions;

export interface RemarkSectionProps extends ISectionProps {
  headerMarkdown?: HeaderMarkdown;
  footerMarkdown?: FooterMarkdown;
}

export interface Mdast2DocxNodePluginProps {
  html?: Parameters<typeof nodeHtmlPlugin>[0];
  mermaid?: Parameters<typeof nodeMermaidPlugin>[0];
  list?: Parameters<typeof listPlugin>[0];
  table?: Parameters<typeof tablePlugin>[0];
  emoji?: Parameters<typeof emojiPlugin>[0];
  image?: Parameters<typeof nodeImagePlugin>[0];
  frontmatter?: Parameters<typeof frontmatterPlugin>[1];
}

/**
 * A unified compiler plugin to convert MDAST to DOCX on Node.js using `mdast2docx/plugins/node`.
 * Automatically configures `nodeHtmlPlugin`, `nodeImagePlugin`, and `nodeMermaidPlugin` for server-side rasterization and parsing.
 *
 * @param outputType - The output type for DOCX generation (e.g. "blob", "buffer", "base64").
 *                     Defaults to `"blob"`.
 * @param docxProps - Global DOCX document properties passed to `toDocx`. Optional.
 * @param sectionProps - Section-level props including plugin overrides. Optional.
 * @param pluginProps - Configurations for node plugins (nodeHtml, nodeMermaid, list, table, emoji, nodeImage).
 * @returns A unified plugin that injects a DOCX compiler.
 */
export const remarkDocx: Plugin<
  [
    outputType?: OutputType,
    docxProps?: IDocxProps,
    sectionProps?: RemarkSectionProps,
    pluginProps?: Mdast2DocxNodePluginProps,
  ],
  Root
> = function remarkDocxNodePlugin(
  outputType = "blob",
  docxProps = {},
  sectionProps = { ...DEFAULT_SECTION_PROPS, plugins: undefined },
  pluginProps,
) {
  // @ts-expect-error -- compiler type does not support Promise
  this.compiler = (node: Root): Promise<OutputByType[OutputType]> => {
    if (!sectionProps.plugins) {
      sectionProps.plugins = [
        frontmatterPlugin(undefined, pluginProps?.frontmatter),
        nodeHtmlPlugin(pluginProps?.html),
        nodeMermaidPlugin(pluginProps?.mermaid),
        listPlugin(pluginProps?.list),
        mathPlugin(),
        tablePlugin(pluginProps?.table),
        emojiPlugin(pluginProps?.emoji),
        nodeImagePlugin(pluginProps?.image),
      ];
    }

    let headerAst = sectionProps.headerAst;
    let footerAst = sectionProps.footerAst;

    if (sectionProps.headerMarkdown && !headerAst) {
      const hm = sectionProps.headerMarkdown;
      headerAst =
        typeof hm === "string"
          ? (this.parse(hm) as Root)
          : {
              default: hm.default
                ? (this.parse(hm.default) as Root)
                : undefined,
              first: hm.first ? (this.parse(hm.first) as Root) : undefined,
              even: hm.even ? (this.parse(hm.even) as Root) : undefined,
            };
    }

    if (sectionProps.footerMarkdown && !footerAst) {
      const fm = sectionProps.footerMarkdown;
      footerAst =
        typeof fm === "string"
          ? (this.parse(fm) as Root)
          : {
              default: fm.default
                ? (this.parse(fm.default) as Root)
                : undefined,
              first: fm.first ? (this.parse(fm.first) as Root) : undefined,
              even: fm.even ? (this.parse(fm.even) as Root) : undefined,
            };
    }

    const {
      headerMarkdown: _,
      footerMarkdown: __,
      ...restSectionProps
    } = sectionProps;
    const finalSectionProps: ISectionProps = {
      ...restSectionProps,
      headerAst,
      footerAst,
    };

    return toDocx(node as Root, docxProps, finalSectionProps, outputType);
  };
  return (node) => node;
};

export const remarkDocxNode = remarkDocx;
