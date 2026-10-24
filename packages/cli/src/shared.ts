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

export interface ToDocxFileOptions {
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
  debug?: boolean;
}

export const DEFAULT_CONFIG: Required<ToDocxFileOptions> = {
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
  debug: false,
};

/**
 * Helper to define type-safe configuration in md2docx.config.ts / md2docx.config.mjs.
 */
export const defineConfig = (config: ToDocxFileOptions): ToDocxFileOptions =>
  config;

/**
 * Executes a file-based Markdown to DOCX conversion for CLI invocations.
 */
export const toDocxFile = async (options: ToDocxFileOptions): Promise<void> => {
  const config = deepMerge(
    DEFAULT_CONFIG,
    options,
  ) as Required<ToDocxFileOptions>;
  const effectiveLogLevel: LogLevel =
    config.debug || options.debug ? "debug" : config.logLevel;
  const logger = createLogger({ level: effectiveLogLevel, name: "md2docx" });

  if (effectiveLogLevel === "debug") {
    logger.debug("Resolved configuration:", JSON.stringify(config, null, 2));
  }

  if (!config.input) {
    logger.error(
      "No input Markdown file specified. Run with --help for usage.",
    );
    process.exitCode = 1;
    return;
  }

  const inputPath = resolve(config.input);
  let markdown = "";
  try {
    markdown = await readFile(inputPath, "utf-8");
  } catch (err) {
    logger.error(
      `Failed to read input file "${inputPath}": ${(err as Error).message}`,
    );
    process.exitCode = 1;
    return;
  }

  logger.info(`Converting ${config.input} to DOCX...`);
  if (effectiveLogLevel === "debug") {
    logger.debug(
      `Loaded input markdown (${markdown.length} characters) from ${inputPath}`,
    );
  }

  const docxProps: IDocxProps = { ...config.docxProps };
  if (config.title) docxProps.title = config.title;
  if (config.author) docxProps.creator = config.author;
  if (config.description) docxProps.description = config.description;

  if (effectiveLogLevel === "debug") {
    logger.debug(
      "Applying document properties:",
      JSON.stringify(docxProps, null, 2),
    );
  }

  const sectionProps: ISectionProps = {
    ...config.sectionProps,
    plugins:
      config.plugins?.length > 0
        ? config.plugins
        : config.sectionProps?.plugins,
  };

  if (effectiveLogLevel === "debug") {
    if (sectionProps.plugins && sectionProps.plugins.length > 0) {
      logger.debug(
        `Registered ${sectionProps.plugins.length} custom AST plugin(s)`,
      );
    }
    logger.debug("Compiling Markdown AST to DOCX via @m2d/remark-docx-node...");
  }

  let buffer: OutputByType["nodebuffer"];
  try {
    buffer = await md2docx(
      markdown,
      docxProps,
      sectionProps,
      "nodebuffer",
      config.pluginProps,
    );
  } catch (err) {
    logger.error(`DOCX compilation failed: ${(err as Error).message}`);
    if (effectiveLogLevel === "debug" && (err as Error).stack) {
      logger.debug((err as Error).stack);
    }
    process.exitCode = 1;
    return;
  }

  const outputPath = resolve(
    config.output ||
      `${config.input.replace(/\.(md|markdown|mdx)$/i, "")}.docx`,
  );

  try {
    await writeFile(outputPath, buffer as Buffer);
    logger.info(`Successfully generated ${outputPath}`);
    if (effectiveLogLevel === "debug") {
      logger.debug(`Wrote ${(buffer as Buffer).length} bytes to ${outputPath}`);
    }
  } catch (err) {
    logger.error(
      `Failed to write output file "${outputPath}": ${(err as Error).message}`,
    );
    process.exitCode = 1;
  }
};
