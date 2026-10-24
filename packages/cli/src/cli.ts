#!/usr/bin/env node

import { realpathSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createLogger,
  findProjectRoot,
  isCLI,
  type LogLevel,
  resolveConfig,
} from "@turboforge/cli-kit";
import { DEFAULT_CONFIG, type ToDocxFileOptions, toDocxFile } from "./shared";

export interface CliOptions extends ToDocxFileOptions {
  help?: boolean;
  init?: boolean;
  config?: string;
  version?: boolean;
}

export const parseArgs = (args: string[]): Partial<CliOptions> => {
  const options: Partial<CliOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--version" || arg === "-v") {
      options.version = true;
    } else if (arg === "--debug" || arg === "--verbose") {
      options.debug = true;
      options.logLevel = "debug";
    } else if (arg === "--log-level") {
      options.logLevel = args[++i] as LogLevel;
    } else if (arg.startsWith("--log-level=")) {
      options.logLevel = arg.slice(arg.indexOf("=") + 1) as LogLevel;
    } else if (arg === "--output" || arg === "-o") {
      options.output = args[++i];
    } else if (arg.startsWith("--output=") || arg.startsWith("-o=")) {
      options.output = arg.slice(arg.indexOf("=") + 1);
    } else if (arg === "--title" || arg === "-t") {
      options.title = args[++i];
    } else if (arg.startsWith("--title=") || arg.startsWith("-t=")) {
      options.title = arg.slice(arg.indexOf("=") + 1);
    } else if (arg === "--author" || arg === "-a") {
      options.author = args[++i];
    } else if (arg.startsWith("--author=") || arg.startsWith("-a=")) {
      options.author = arg.slice(arg.indexOf("=") + 1);
    } else if (arg === "--description" || arg === "-d") {
      options.description = args[++i];
    } else if (arg.startsWith("--description=") || arg.startsWith("-d=")) {
      options.description = arg.slice(arg.indexOf("=") + 1);
    } else if (arg === "--init" || arg === "-i") {
      options.init = true;
      if (args[i + 1] && !args[i + 1].startsWith("-")) {
        options.config = args[++i];
      }
    } else if (arg.startsWith("--init=")) {
      options.init = true;
      options.config = arg.slice(arg.indexOf("=") + 1);
    } else if (arg === "--config" || arg === "-c") {
      options.config = args[++i];
    } else if (arg.startsWith("--config=") || arg.startsWith("-c=")) {
      options.config = arg.slice(arg.indexOf("=") + 1);
    } else if (!arg.startsWith("-") && !options.input) {
      options.input = arg;
    }
  }

  return options;
};

export const showHelp = (): void => {
  console.log(`
Usage:
  $ md2docx <input.md> [options]
  $ m2d <input.md> [options]

Arguments:
  <input.md>               Path to Markdown file to convert

Options:
  -o, --output <file>      Output DOCX file path (default: <input>.docx)
  -t, --title <title>      Document title (metadata)
  -a, --author <author>    Document author / creator (metadata)
  -d, --description <desc> Document description (metadata)
  -c, --config <file>      Use custom configuration file
  -i, --init [file]        Create default config file
      --debug              Enable verbose debug logging
      --log-level <level>  Set log severity (debug, info, warn, error)
  -h, --help               Show this help message
  -v, --version            Show version number
`);
};

export const main = async (
  args: string[] = process.argv.slice(2),
): Promise<void> => {
  const {
    help,
    init,
    version,
    config: configFile,
    ...cliArgs
  } = parseArgs(args);

  if (help) {
    showHelp();
    return;
  }

  if (version) {
    console.log("@m2d/cli v0.1.1");
    return;
  }

  if (init) {
    const targetFile = configFile || "md2docx.config.json";
    const projectRoot = await findProjectRoot();
    const targetPath = resolve(projectRoot, targetFile);
    await writeFile(targetPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
    const logger = createLogger({ level: "info", name: "md2docx" });
    logger.info(`Created default config file at ${targetFile}`);
    return;
  }

  const config = await resolveConfig<CliOptions>({
    name: "md2docx",
    defaults: DEFAULT_CONFIG,
    cliArgs,
    configFile,
  });

  await toDocxFile(config);
};

export const isInvokedAsCli = (): boolean => {
  if (typeof process === "undefined" || !process.argv?.[1]) return false;
  if (process.env.VITEST || process.env.NODE_ENV === "test") return false;

  try {
    if (typeof isCLI === "function" && isCLI(import.meta.url)) {
      return true;
    }
  } catch {}

  try {
    const rawArgv = process.argv[1];
    let resolvedArgv = rawArgv;
    try {
      resolvedArgv = realpathSync(rawArgv);
    } catch {}

    const normalizedArgv = resolvedArgv.replace(/\\/g, "/").toLowerCase();
    const selfPath = fileURLToPath(import.meta.url)
      .replace(/\\/g, "/")
      .toLowerCase();
    if (normalizedArgv === selfPath) return true;

    const binNames = new Set(["cli", "m2d", "md2docx", "md2docx-node"]);
    const base = basename(
      normalizedArgv,
      extname(normalizedArgv),
    ).toLowerCase();
    if (binNames.has(base)) return true;
    if (
      normalizedArgv.endsWith("/cli.mjs") ||
      normalizedArgv.endsWith("/cli.js") ||
      normalizedArgv.endsWith("/cli.ts")
    ) {
      return true;
    }
  } catch {}

  return true;
};

if (isInvokedAsCli()) {
  main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
