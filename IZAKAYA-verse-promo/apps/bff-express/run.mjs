#!/usr/bin/env node
import { spawnSync, spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.dirname(__filename);
const PREVIEW_DIR = path.join(ROOT, "preview-ui");

const COMMAND = process.argv[2];
const HEALTH_URL = process.env.HEALTH_URL || "http://127.0.0.1:4117/health";
const PREVIEW_URL = process.env.PREVIEW_URL || "http://127.0.0.1:4117/preview/";

function log(step, msg) {
  console.log(`\x1b[36m[${step}]\x1b[0m ${msg}`);
}

function run(cmd, args = [], options = {}) {
  log("exec", `${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: ROOT,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}`);
  }
}

function ensureEnv() {
  const envPath = path.join(ROOT, ".env");
  const example = path.join(ROOT, ".env.example");
  if (!existsSync(envPath) && existsSync(example)) {
    log("setup", "Copy .env.example → .env");
    copyFileSync(example, envPath);
  }
}

function ensureInstall(directory, label) {
  const nodeModules = path.join(directory, "node_modules");
  if (!existsSync(nodeModules)) {
    log("setup", `Installing dependencies (${label})`);
    run("npm", ["install"], { cwd: directory });
  }
}

async function waitForHealth(url, retries = 20, delayMs = 1500) {
  log("wait", `Checking health at ${url}`);
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        log("wait", `Service ready (status=${json.status}, provider=${json.provider})`);
        return json;
      }
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(`Health check failed after ${retries} attempts (${url})`);
}

function openBrowser(url) {
  if (process.env.RUN_NO_OPEN) return;
  const platform = process.platform;
  let cmd;
  let args = [];
  if (platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else if (platform === "linux") {
    cmd = "xdg-open";
    args = [url];
  } else {
    return;
  }
  try {
    spawn(cmd, args, { detached: true, stdio: "ignore" }).unref();
    log("open", `Browser launched (${url})`);
  } catch (err) {
    console.warn(`Unable to open browser automatically: ${err.message}`);
  }
}

async function commandUp() {
  ensureEnv();
  ensureInstall(ROOT, "root");
  ensureInstall(PREVIEW_DIR, "preview-ui");

  log("build", "Building preview UI");
  run("npm", ["run", "build"], { cwd: PREVIEW_DIR });

  log("docker", "Launching stack (compose up --build)");
  run("docker", ["compose", "up", "-d", "--build"]);

  await waitForHealth(HEALTH_URL);
  openBrowser(PREVIEW_URL);
  log("done", `Ready → ${PREVIEW_URL}`);
}

function commandDown() {
  log("docker", "Stopping stack");
  run("docker", ["compose", "down"]);
  log("done", "Containers stopped");
}

async function commandStatus() {
  try {
    const json = await waitForHealth(HEALTH_URL, 1);
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(`Service unavailable: ${(err instanceof Error && err.message) || err}`);
    process.exitCode = 1;
  }
}

function commandLogs() {
  log("docker", "Attaching logs (Ctrl+C to exit)");
  run("docker", ["compose", "logs", "-f"]);
}

function showHelp() {
  console.log(`Usage: node run.mjs <command>

Commands:
  up       Install deps, build preview, docker compose up --build, wait for health, open /preview/
  down     docker compose down
  status   Fetch /health and print JSON
  logs     Tail docker compose logs -f
`);
}

async function main() {
  switch (COMMAND) {
    case "up":
      await commandUp();
      break;
    case "down":
      commandDown();
      break;
    case "status":
      await commandStatus();
      break;
    case "logs":
      commandLogs();
      break;
    default:
      showHelp();
      process.exitCode = COMMAND ? 1 : 0;
  }
}

main().catch((err) => {
  console.error(`\x1b[31mError:\x1b[0m ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
