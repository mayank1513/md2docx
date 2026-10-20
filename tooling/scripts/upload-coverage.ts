import { exec, execSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
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

const isCI = process.env.GITHUB_ACTIONS === "true";
const slug = process.env.GITHUB_REPOSITORY || "md2docx/md2docx";

// Determine commit SHA and PR context
let commitSha = "";
let prNumber = "";

if (isCI) {
  if (
    process.env.GITHUB_EVENT_PATH &&
    existsSync(process.env.GITHUB_EVENT_PATH)
  ) {
    try {
      const eventData = JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"),
      );
      if (eventData.pull_request) {
        commitSha = eventData.pull_request.head?.sha || "";
        prNumber = String(eventData.pull_request.number || "");
      }
    } catch {
      // fallback
    }
  }
  if (!commitSha) {
    commitSha = process.env.GITHUB_SHA || "";
  }
} else {
  try {
    commitSha = execSync("git rev-parse HEAD").toString().trim();
  } catch {
    // fallback
  }
}

const uploadTasks = (packages ?? []).map(async (pkg) => {
  const pkgBasename = path.basename(pkg.dir);
  const lcovFile = path.join(ROOT, "coverage", `${pkgBasename}.lcov`);

  if (!existsSync(lcovFile)) {
    console.log(`⊘ Skipping ${pkg.name}: no coverage file at ${lcovFile}`);
    return;
  }

  console.log(`🚀 Starting upload: ${pkg.name} (${pkgBasename}.lcov)...`);

  let cmd = `"${binary}" do-upload --token "${token}" --file "${lcovFile}" --flag "${pkg.name}" --name "${pkg.name}" --disable-search -r "${slug}"`;

  if (commitSha) {
    cmd += ` -C ${commitSha}`;
  }
  if (prNumber) {
    cmd += ` -P ${prNumber}`;
  }

  try {
    const { stdout, stderr } = await execAsync(cmd);
    const combinedOutput = `${stdout || ""}\n${stderr || ""}`.trim();

    // Extract Codecov dashboard URL if present
    const urlMatch = combinedOutput.match(
      /https:\/\/app\.codecov\.io\/[^\s)]+/,
    );
    const reportUrl = urlMatch ? urlMatch[0] : "";

    if (reportUrl) {
      console.log(`✓ [${pkg.name}] Uploaded! Dashboard: ${reportUrl}`);
    } else {
      console.log(`✓ [${pkg.name}] Upload completed successfully.`);
    }
  } catch (err: unknown) {
    const error = err as { message?: string; stdout?: string; stderr?: string };
    console.error(
      `✗ [${pkg.name}] Upload failed: ${error.message || ""}\n${error.stderr || error.stdout || ""}`,
    );
  }
});

// Upload all package coverage reports in parallel
await Promise.allSettled(uploadTasks);
console.log("All coverage uploads completed.");
