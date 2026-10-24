import { type IDocxProps, type ISectionProps, toDocx } from "@m2d/core";
import { DEFAULT_SECTION_PROPS } from "@m2d/core/utils";
import { emojiPlugin } from "@m2d/emoji";
import { frontmatterPlugin, parseFrontmatter } from "@m2d/frontmatter";
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

const parseMarkdownToAst = (
  parser: (md: string) => Root,
  input: unknown,
): ISectionProps["headerAst"] => {
  if (!input) return undefined;
  if (typeof input === "string") {
    return parser(input);
  }
  if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    return {
      default:
        typeof obj.default === "string" ? parser(obj.default) : undefined,
      first: typeof obj.first === "string" ? parser(obj.first) : undefined,
      even: typeof obj.even === "string" ? parser(obj.even) : undefined,
    };
  }
  return undefined;
};

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

    let frontmatterHeader: unknown;
    let frontmatterFooter: unknown;
    const needsHeader = !sectionProps.headerAst && !sectionProps.headerMarkdown;
    const needsFooter = !sectionProps.footerAst && !sectionProps.footerMarkdown;

    if (needsHeader || needsFooter) {
      const firstNode = node.children?.[0];
      if (
        firstNode &&
        (firstNode.type === "yaml" || (firstNode.type as string) === "toml") &&
        typeof (firstNode as { value?: unknown }).value === "string"
      ) {
        const parsed = parseFrontmatter(
          (firstNode as { value: string }).value,
          firstNode.type,
        );
        frontmatterHeader = parsed.header;
        frontmatterFooter = parsed.footer;
      }
    }

    const parseFn = (md: string) => this.parse(md) as Root;
    const headerAst =
      sectionProps.headerAst ??
      parseMarkdownToAst(
        parseFn,
        sectionProps.headerMarkdown ?? frontmatterHeader,
      );
    const footerAst =
      sectionProps.footerAst ??
      parseMarkdownToAst(
        parseFn,
        sectionProps.footerMarkdown ?? frontmatterFooter,
      );

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
