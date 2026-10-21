import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { IDocxProps, IPlugin, ISectionProps } from "@m2d/core";
import {
  type Mdast2DocxNodePluginProps,
  remarkDocx,
} from "@m2d/remark-docx-node";
import { createLogger, deepMerge, type LogLevel } from "@turboforge/cli-kit";
import type { OutputByType, OutputType } from "docx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { unified } from "unified";

/**
 * Converts Markdown to DOCX in Node.js using `@m2d/remark-docx-node` with native image and Mermaid rasterization.
 *
 * @param md - Markdown string input
 * @param docxProps - Global document properties passed to `@m2d/core`
 * @param sectionProps - Default section properties (page size, margins, plugins)
 * @param outputType - Desired DOCX output format (`"nodebuffer"` by default on Node)
 * @param pluginProps - Configurations for sub-plugins (nodeImage, nodeMermaid, list, table, emoji)
 * @returns The generated DOCX output
 */
export const md2docx = async <T extends OutputType = "nodebuffer">(
  md: string,
  docxProps: IDocxProps = {},
  sectionProps?: ISectionProps,
  outputType: T = "nodebuffer" as T,
  pluginProps?: Mdast2DocxNodePluginProps,
): Promise<OutputByType[T]> => {
  const processor = unified().use([
    remarkParse,
    remarkGfm,
    remarkMath,
    remarkFrontmatter,
    [remarkDocx, outputType, docxProps, sectionProps, pluginProps],
  ]);
  const res = await processor.process(md);
  return res.result as OutputByType[T];
};

export interface SharedOptions {
  input?: string;
  output?: string;
  title?: string;
  author?: string;
  description?: string;
  plugins?: Array<IPlugin>;
  docxProps?: IDocxProps;
  sectionProps?: ISectionProps;
  pluginProps?: Mdast2DocxNodePluginProps;
  logLevel?: LogLevel;
}

export const DEFAULT_CONFIG: Required<SharedOptions> = {
  input: "",
  output: "",
  title: "",
  author: "",
  description: "",
  plugins: [],
  docxProps: {},
  sectionProps: {},
  pluginProps: {},
  logLevel: "info",
};

/**
 * Helper to define type-safe configuration in md2docx.config.ts / md2docx.config.mjs.
 */
export const defineConfig = (config: SharedOptions): SharedOptions => config;

/**
 * Executes a file-based Markdown to DOCX conversion for CLI invocations.
 */
export const shared = async (options: SharedOptions): Promise<void> => {
  const config = deepMerge(DEFAULT_CONFIG, options) as Required<SharedOptions>;
  const logger = createLogger({ level: config.logLevel });

  if (!config.input) {
    logger.error(
      "No input Markdown file specified. Run with --help for usage.",
    );
    return;
  }

  const inputPath = resolve(config.input);
  const markdown = await readFile(inputPath, "utf-8");
  logger.info(`Converting ${config.input} to DOCX...`);

  const docxProps: IDocxProps = { ...config.docxProps };
  if (config.title) docxProps.title = config.title;
  if (config.author) docxProps.creator = config.author;
  if (config.description) docxProps.description = config.description;

  const sectionProps: ISectionProps = {
    ...config.sectionProps,
    plugins:
      config.plugins?.length > 0
        ? config.plugins
        : config.sectionProps?.plugins,
  };

  const buffer = await md2docx(
    markdown,
    docxProps,
    sectionProps,
    "nodebuffer",
    config.pluginProps,
  );

  const outputPath = resolve(
    config.output ||
      `${config.input.replace(/\.(md|markdown|mdx)$/i, "")}.docx`,
  );

  await writeFile(outputPath, buffer as Buffer);
  logger.info(`Successfully generated ${outputPath}`);
};
