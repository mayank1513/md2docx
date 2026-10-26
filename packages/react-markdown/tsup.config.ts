import { defineConfig, type Options } from "tsup";

export default defineConfig(
  (options: Options) =>
    ({
      format: ["cjs", "esm"],
      target: "es2022",
      tsconfig: "../../tsconfig.build.json",
      dts: !process.env.VERCEL && !process.env.NO_DTS,
      entry: [
        "./src/index.ts",
        "./src/client/index.ts",
        "./src/server/index.ts",
        "./src/server/unwrap/index.ts",
        "./src/server/omit/index.ts",
        "./src/test-utils.ts",
        "./src/utils.tsx",
      ],
      sourcemap: false,
      clean: !options.watch,
      bundle: true,
      minify: !options.watch,
      ...options,
    }) as Options,
);
