#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { findProjectRoot, isCLI, resolveConfig } from "@turboforge/cli-kit";
import { DEFAULT_CONFIG, type SharedOptions, shared } from "./shared";

export interface CliOptions extends SharedOptions {
  help?: boolean;
  init?: boolean;
  config?: string;
  version?: boolean;
}

export const parseArgs = (args: string[]): Partial<CliOptions> => {
  const options: Partial<CliOptions> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--version":
      case "-v":
        options.version = true;
        break;
      case "--output":
      case "-o":
        options.output = args[++i];
        break;
      case "--title":
      case "-t":
        options.title = args[++i];
        break;
      case "--author":
      case "-a":
        options.author = args[++i];
        break;
      case "--description":
      case "-d":
        options.description = args[++i];
        break;
      case "--init":
      case "-i":
        options.init = true;
        if (args[i + 1] && !args[i + 1].startsWith("-")) {
          options.config = args[++i];
        }
        break;
      case "--config":
      case "-c":
        options.config = args[++i];
        break;
      default:
        if (!arg.startsWith("-") && !options.input) {
          options.input = arg;
        }
        break;
    }
  }

  return options;
};

export const showHelp = () => {
  console.log(`
Usage:
  $ md2docx <input.md> [options]
  $ m2d <input.md> [options]

Arguments:
  <input.md>               Path to Markdown file to convert

Options:
  -o, --output <file>      Output DOCX file path (default: <input>.docx)
  -t, --title <title>      Document title
  -a, --author <author>    Document author
  -d, --description <desc> Document description
  -c, --config <file>      Use custom configuration file
  -i, --init [file]        Create default config file
  -h, --help               Show this help message
  -v, --version            Show version number
`);
};

export const main = async (args: string[] = process.argv.slice(2)) => {
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
    console.log("@m2d/cli v0.0.0");
    return;
  }

  if (init) {
    await writeFile(
      resolve(await findProjectRoot(), configFile || "md2docx.config.json"),
      JSON.stringify(DEFAULT_CONFIG, null, 2),
    );
    console.log(
      `Created default config file at ${configFile || "md2docx.config.json"}`,
    );
    return;
  }

  const config = await resolveConfig<CliOptions>({
    name: "md2docx",
    defaults: DEFAULT_CONFIG,
    cliArgs,
    configFile,
  });

  await shared(config);
};

if (isCLI()) {
  main().catch(console.error);
}
