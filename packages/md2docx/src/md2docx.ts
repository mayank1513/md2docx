import type { IDocxProps, ISectionProps } from "@m2d/core";
import { type Mdast2DocxPluginProps, remarkDocx } from "@m2d/remark-docx";
import type { OutputType } from "docx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Converts a Markdown string into a DOCX document using Unified and `@m2d/remark-docx`.
 *
 * @param md - The Markdown string to convert.
 * @param docxProps - Document properties passed to `@m2d/core`.
 * @param sectionProps - Default section properties (page size, margins, plugins).
 * @param outputType - Desired DOCX output format (`"blob"`, `"buffer"`, `"base64"`, etc.). Default: `"blob"`.
 * @param pluginProps - Configurations for sub-plugins (mermaid, emoji, list, table, image).
 * @returns The generated DOCX output in the requested format.
 */
export const md2docx = async (
  md: string,
  docxProps: IDocxProps = {},
  sectionProps?: ISectionProps,
  outputType: OutputType = "blob",
  pluginProps?: Mdast2DocxPluginProps,
) => {
  const processor = unified().use([
    remarkParse,
    remarkGfm,
    remarkMath,
    remarkFrontmatter,
    [remarkDocx, outputType, docxProps, sectionProps, pluginProps],
  ]);
  const res = await processor.process(md);
  return res.result;
};
