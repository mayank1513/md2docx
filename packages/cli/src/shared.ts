import { createLogger, deepMerge, type LogLevel } from "@turboforge/cli-kit";

export interface SharedOptions {
  logLevel?: LogLevel;
}

export const DEFAULT_CONFIG: Required<SharedOptions> = {
  logLevel: "info",
};

export const shared = async (options: SharedOptions) => {
  const config = deepMerge(DEFAULT_CONFIG, options) as Required<SharedOptions>;
  const logger = createLogger({ level: config.logLevel });
  logger.info("Hello from shared!");
};
