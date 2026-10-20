import { exec, execSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { CACHE_DIR } from "./forge.const.ts";
import { readJson } from "./utils.ts";

const execAsync = promisify(exec);

type Pkg = {
  name: string;
  dir: string;
};

const ROOT = process.cwd();
const PKG_CONFIG = path.join(ROOT, `${CACHE_DIR}/packages.json`);
const token = process.env.CODECOV_TOKEN;

if (!token) {
  console.log(
    "No CODECOV_TOKEN found in environment. Skipping Codecov upload.",
  );
  process.exit(0);
}

const getCodecovBinary = async () => {
  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";
  const binaryName = isWindows ? "codecov.exe" : "codecov";
  const binDir = path.join(ROOT, "node_modules/.bin");
  const binPath = path.join(binDir, binaryName);

  if (existsSync(binPath)) return binPath;
  if (existsSync(path.join(ROOT, binaryName)))
    return path.join(ROOT, binaryName);

  const platform = isWindows
    ? "windows/codecov.exe"
    : isMac
      ? "macos/codecov"
      : "linux/codecov";
  const url = `https://cli.codecov.io/latest/${platform}`;
  console.log(`Downloading Codecov CLI from ${url}...`);

  const res = await fetch(url);
  if (!res.ok)
    throw new Error(`Failed to download Codecov binary: ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());

  mkdirSync(binDir, { recursive: true });
  writeFileSync(binPath, buf);
  if (!isWindows) {
    chmodSync(binPath, 0o755);
  }
  return binPath;
};

const binary = await getCodecovBinary();
const packages = await readJson<Pkg[]>(PKG_CONFIG);

const commitSha =
  process.env.GITHUB_SHA || execSync("git rev-parse HEAD").toString().trim();

const uploadTasks = (packages ?? []).map(async (pkg) => {
  const pkgBasename = path.basename(pkg.dir);
  const lcovFile = path.join(ROOT, "coverage", `${pkgBasename}.lcov`);

  if (!existsSync(lcovFile)) {
    console.log(`⊘ Skipping ${pkg.name}: no coverage file at ${lcovFile}`);
    return;
  }

  console.log(`🚀 Starting upload: ${pkg.name} (${pkgBasename}.lcov)...`);
  const cmd = `"${binary}" do-upload --token "${token}" --file "${lcovFile}" --flag "${pkg.name}" --name "${pkg.name}" --disable-search -r md2docx/md2docx -C ${commitSha}`;

  try {
    const { stdout, stderr } = await execAsync(cmd);
    if (stdout) console.log(`✓ [${pkg.name}] Done`);
    if (stderr && !stderr.includes("warning"))
      console.warn(`[${pkg.name} stderr]:`, stderr);
  } catch (err: any) {
    console.warn(`✗ Failed to upload ${pkg.name}: ${err.message}`);
  }
});

// Upload all package coverage reports in parallel
await Promise.allSettled(uploadTasks);
console.log("All coverage uploads completed.");
