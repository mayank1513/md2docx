import type { OutputByType, OutputType } from "docx";
import type { Root } from "mdast";
import { type IDocxProps, type ISectionProps, toDocx } from "mdast2docx";
import {
  emojiPlugin,
  htmlPlugin,
  imagePlugin,
  listPlugin,
  mathPlugin,
  mermaidPlugin,
  tablePlugin,
} from "mdast2docx/plugins";
import { DEFAULT_SECTION_PROPS, warnOnce } from "mdast2docx/utils";
import type { Plugin } from "unified";

export interface Mdast2DocxPluginProps {
  mermaid?: Parameters<typeof mermaidPlugin>[0];
  list?: Parameters<typeof listPlugin>[0];
  table?: Parameters<typeof tablePlugin>[0];
  emoji?: Parameters<typeof emojiPlugin>[0];
  image?: Parameters<typeof imagePlugin>[0];
}

/**
 * A unified compiler plugin to convert MDAST to DOCX output using `mdast2docx`.
 *
 * @param outputType - The output type for DOCX generation (e.g. "blob", "buffer", "base64").
 *                     Defaults to `"blob"`.
 * @param docxProps - Global DOCX document properties passed to `toDocx`. Optional.
 * @param sectionProps - Section-level props including plugin overrides. Optional.
 * @returns A unified plugin that injects a DOCX compiler.
 */
export const remarkDocx: Plugin<
  [
    outputType?: OutputType,
    docxProps?: IDocxProps,
    sectionProps?: ISectionProps,
    pluginProps?: Mdast2DocxPluginProps,
  ],
  Root
> = function remarkDocxPlugin(
  outputType = "blob",
  docxProps = {},
  sectionProps = { ...DEFAULT_SECTION_PROPS, plugins: undefined },
  pluginProps,
) {
  // @ts-expect-error -- compiler type does not support Promise
  this.compiler = (node: Root): Promise<OutputByType[OutputType]> => {
    // If plugins are not defined in sectionProps, use the default set
    if (!sectionProps.plugins) {
      const plugins = [
        mermaidPlugin(pluginProps?.mermaid),
        htmlPlugin(),
        listPlugin(pluginProps?.list),
        mathPlugin(),
        tablePlugin(pluginProps?.table),
        emojiPlugin(pluginProps?.emoji),
        imagePlugin(pluginProps?.image),
      ];
      if (typeof window === "undefined") {
        warnOnce(
          "remark-docx-client-on-node",
          "Running client-side @m2d/remark-docx in a Node.js environment. Client plugins (html, image, mermaid) are skipped. Please use '@m2d/remark-docx-node' for native image and diagram support on Node.",
        );
        sectionProps.plugins = plugins.slice(2, -1);
      } else {
        sectionProps.plugins = plugins;
      }
    }

    return toDocx(node as Root, docxProps, sectionProps, outputType);
  };
  return (node) => node;
};
