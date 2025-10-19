#!/usr/bin/env node
/* eslint-disable no-console */
const { spawnSync, spawn } = require("node:child_process");

const composeCmd = process.env.DOCKER_COMPOSE_CMD || "docker compose";
const healthUrl = process.env.SMOKETEST_HEALTH_URL || "http://127.0.0.1:4117/health";
const previewUrl = process.env.SMOKETEST_PREVIEW_URL || "http://127.0.0.1:4117/preview/";

function run(command, args, opts = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...opts });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

async function waitForHealth(url, timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // ignore
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Health check timed out after ${timeoutMs}ms at ${url}`);
}

async function main() {
  console.log("▶︎ Building and starting Docker stack…");
  const parts = composeCmd.split(" ").filter(Boolean);
  run(parts[0], [...parts.slice(1), "up", "-d", "--build"]);

  console.log(`▶︎ Waiting for health endpoint ${healthUrl}`);
  await waitForHealth(healthUrl);
  console.log("✅ Health check passed");

  if (process.stdout.isTTY) {
    console.log(`🚀 Preview UI: ${previewUrl}`);
  }

  const opener = process.env.SMOKETEST_NO_OPEN ? null : getOpenCommand();
  if (opener) {
    try {
      spawn(opener.cmd, [...opener.args, previewUrl], {
        detached: true,
        stdio: "ignore",
      }).unref();
      console.log(`🖥️  Browser launched via ${opener.cmd}`);
    } catch (err) {
      console.warn(`Browser auto-open failed: ${err.message}`);
    }
  }
}

function getOpenCommand() {
  if (process.platform === "darwin") {
    return { cmd: "open", args: [] };
  }
  if (process.platform === "win32") {
    return { cmd: "cmd", args: ["/c", "start"] };
  }
  if (process.platform === "linux") {
    return { cmd: "xdg-open", args: [] };
  }
  return null;
}

main().catch((err) => {
  console.error("❌ Docker smoke test failed:", err);
  process.exit(1);
});
