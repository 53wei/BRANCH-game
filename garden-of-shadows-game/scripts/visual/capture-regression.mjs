import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const acceptancePath = path.join(projectRoot, "docs", "visual-regression", "phase-one-acceptance.json");
const outputRoot = path.join(projectRoot, "docs", "visual-regression", "after");
const metricsPath = path.join(outputRoot, "capture-metrics.json");
const defaultVisualPort = 43_000 + (process.pid % 1_000);
const baseUrl = process.env.VISUAL_BASE_URL ?? `http://127.0.0.1:${defaultVisualPort}/`;
const visualDevUrl = new URL(baseUrl);
const viewport = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

const acceptance = JSON.parse(fs.readFileSync(acceptancePath, "utf8"));
if (!Array.isArray(acceptance.requiredShots) || acceptance.requiredShots.length !== 5) {
  throw new Error("phase-one-acceptance.json must define exactly five requiredShots");
}
fs.mkdirSync(outputRoot, { recursive: true });

async function waitForHttp(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok || response.status < 500) return response;
    } catch (error) {
      lastError = error;
    }
    await sleep(350);
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError instanceof Error ? lastError.message : String(lastError ?? "no response")}`);
}

function chromeCandidates() {
  const env = process.env;
  const candidates = [
    env.CHROME_PATH,
    env.CHROMIUM_PATH,
    process.platform === "win32" ? path.join(env.PROGRAMFILES ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe") : undefined,
    process.platform === "win32" ? path.join(env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe") : undefined,
    process.platform === "win32" ? path.join(env.LOCALAPPDATA ?? "", "Google", "Chrome", "Application", "chrome.exe") : undefined,
    process.platform === "win32" ? path.join(env.PROGRAMFILES ?? "C:\\Program Files", "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
    process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : undefined,
    process.platform === "linux" ? "/usr/bin/google-chrome" : undefined,
    process.platform === "linux" ? "/usr/bin/chromium" : undefined,
    process.platform === "linux" ? "/usr/bin/chromium-browser" : undefined,
  ].filter(Boolean);
  return [...new Set(candidates)];
}

function findChrome() {
  const executable = chromeCandidates().find((candidate) => fs.existsSync(candidate));
  if (!executable) throw new Error("Chrome/Edge was not found. Set CHROME_PATH to a Chromium-based browser executable.");
  return executable;
}

async function ensureDevServer() {
  try {
    await waitForHttp(baseUrl, 1_500);
    return undefined;
  } catch {
    const npmCli = process.env.npm_execpath;
    const command = npmCli ? process.execPath : (process.platform === "win32" ? "npm.cmd" : "npm");
    const args = [
      ...(npmCli ? [npmCli] : []),
      "run", "dev", "--", "--host", visualDevUrl.hostname, "--port", visualDevUrl.port, "--strictPort",
    ];
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    let tail = "";
    const append = (chunk) => { tail = (tail + chunk.toString()).slice(-12_000); };
    child.stdout?.on("data", append);
    child.stderr?.on("data", append);
    child.on("exit", (code) => {
      if (code && code !== 0) process.stderr.write(`visual dev server exited ${code}\n${tail}\n`);
    });
    try {
      await waitForHttp(baseUrl, 90_000);
      return child;
    } catch (error) {
      child.kill();
      throw new Error(`${error instanceof Error ? error.message : String(error)}\nDev server tail:\n${tail}`);
    }
  }
}

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.opened = new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message ?? JSON.stringify(message.error)));
      else pending.resolve(message.result ?? {});
    });
  }

  async send(method, params = {}) {
    await this.opened;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  close() {
    this.socket.close();
  }
}

async function createTab(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Unable to create Chrome target: ${response.status}`);
  return response.json();
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result?.value;
}

async function waitForRuntimeReady(client, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs;
  let lastState;
  while (Date.now() < deadline) {
    lastState = await evaluate(client, `(() => {
      const canvas = document.querySelector('canvas.runtime-canvas');
      return canvas ? {
        ready: canvas.dataset.runtimeReady === 'true' && canvas.dataset.assetsReady === 'true' && canvas.dataset.streaming !== 'true',
        runtimeReady: canvas.dataset.runtimeReady,
        assetsReady: canvas.dataset.assetsReady,
        streaming: canvas.dataset.streaming,
        error: document.querySelector('.runtime-phase-error')?.textContent ?? ''
      } : {
        ready: false,
        missingCanvas: true,
        href: location.href,
        title: document.title,
        readyState: document.readyState,
        bodyText: document.body?.innerText?.slice(0, 600) ?? ''
      };
    })()`);
    if (lastState?.error) throw new Error(`Runtime entered error state: ${lastState.error}`);
    if (lastState?.ready) {
      await evaluate(client, "document.fonts?.ready ?? Promise.resolve()");
      await sleep(1_200);
      return;
    }
    await sleep(250);
  }
  throw new Error(`Runtime did not become ready: ${JSON.stringify(lastState)}`);
}

async function captureShot(debugPort, shot) {
  const tab = await createTab(debugPort);
  const client = new CdpClient(tab.webSocketDebuggerUrl);
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", viewport);
    const url = new URL(shot.query, baseUrl).toString();
    await client.send("Page.navigate", { url });
    await waitForRuntimeReady(client);

    const telemetry = await evaluate(client, `(() => {
      const canvas = document.querySelector('canvas.runtime-canvas');
      const d = canvas?.dataset ?? {};
      return {
        url: location.href,
        fps: Number(d.fps || 0),
        drawCalls: Number(d.drawCalls || 0),
        triangles: Number(d.triangles || 0),
        points: Number(d.points || 0),
        visibleModels: String(d.visibleModels || '').split(',').filter(Boolean),
        loadedAssetIds: String(d.loadedAssetIds || '').split(',').filter(Boolean),
        loadedAssetBytes: Number(d.loadedAssetBytes || 0),
        rendererBackend: String(d.rendererBackend || ''),
        transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        durationMs: performance.now(),
        fallbackEnabled: new URLSearchParams(location.search).get('fallbackArchitecture') === '1',
        errorModal: Boolean(document.querySelector('.runtime-phase-error')),
      };
    })()`);

    if (telemetry.fallbackEnabled || telemetry.errorModal) throw new Error(`${shot.id}: invalid regression state`);
    const requiredModel = ["spawn-front-view", "front-hall"].includes(shot.id) ? "siheyuan-front-compound"
      : ["west-courtyard", "curved-corridor", "moon-gate-window"].includes(shot.id) ? "courtyard-park-west-garden"
        : undefined;
    if (requiredModel && !telemetry.visibleModels.includes(requiredModel)) {
      throw new Error(`${shot.id}: required formal visual model ${requiredModel} is not visible; got ${telemetry.visibleModels.join(", ")}`);
    }
    if (telemetry.visibleModels.some((name) => name.startsWith("fallback-"))) throw new Error(`${shot.id}: fallback geometry leaked into formal visual layer`);

    const screenshot = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    const buffer = Buffer.from(screenshot.data, "base64");
    const filePath = path.join(outputRoot, `${shot.id}.png`);
    fs.writeFileSync(filePath, buffer);
    return {
      id: shot.id,
      file: path.relative(projectRoot, filePath).replaceAll("\\", "/"),
      bytes: buffer.length,
      sha256: sha256(buffer),
      telemetry,
    };
  } finally {
    client.close();
    await fetch(`http://127.0.0.1:${debugPort}/json/close/${tab.id}`).catch(() => undefined);
  }
}

const devServer = await ensureDevServer();
const chrome = findChrome();
const debugPort = 9222 + (process.pid % 700);
const profileDir = path.join(projectRoot, "assets-source", "blender-working", "runtime-test", `chrome-${process.pid}`);
fs.mkdirSync(profileDir, { recursive: true });
const chromeProcess = spawn(chrome, [
  "--headless=new",
  "--disable-gpu-sandbox",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  `--window-size=${viewport.width},${viewport.height}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });

try {
  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 30_000);
  const capturedShots = [];
  for (const shot of acceptance.requiredShots) capturedShots.push(await captureShot(debugPort, shot));

  const metrics = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    policy: {
      fpsReference: 60,
      fpsStableFloor: 45,
      note: "FPS is a measurement, not an auto-approval substitute for visual review.",
    },
    shots: capturedShots,
  };
  fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  fs.writeFileSync(acceptancePath, `${JSON.stringify({
    ...acceptance,
    status: "captured-pending-user-visual-acceptance",
    capturedShots: capturedShots.map(({ id, file, bytes, sha256: hash, telemetry }) => ({ id, file, bytes, sha256: hash, telemetry })),
    capturedAt: metrics.generatedAt,
  }, null, 2)}\n`);
  console.log(`Captured ${capturedShots.length} formal TingYuXuan regression shots.`);
} finally {
  chromeProcess.kill();
  devServer?.kill();
  await sleep(1_000);
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  } catch (error) {
    console.warn(`Chrome profile cleanup deferred: ${error instanceof Error ? error.message : String(error)}`);
  }
}
