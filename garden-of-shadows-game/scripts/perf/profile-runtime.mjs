import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const baseUrl = process.env.VISUAL_BASE_URL ?? "http://localhost:3000/";
const sampleMs = Math.max(15_000, Number(process.env.PERF_SAMPLE_MS ?? 15_000));
const warmupMs = Math.max(1_500, Number(process.env.PERF_WARMUP_MS ?? 2_500));
const viewport = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
const recordRoot = path.join(projectRoot, "docs", "development-records");
const jsonPath = path.join(recordRoot, "performance-profile-2026-08-30.json");
const markdownPath = path.join(recordRoot, "performance-profile-2026-08-30.md");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const scenarios = [
  { id: "A", label: "完整视觉", profile: "full", renderer: "auto" },
  { id: "B", label: "只关雨", profile: "no-rain", renderer: "auto" },
  { id: "C", label: "只关 procedural dressing", profile: "no-procedural-dressing", renderer: "auto" },
  { id: "D", label: "只关额外 PointLight", profile: "no-extra-lights", renderer: "auto" },
  { id: "E", label: "只关动态 shadow", profile: "no-shadows", renderer: "auto" },
  { id: "F", label: "WebGPU", profile: "full", renderer: "auto", expectedBackend: "webgpu" },
  { id: "G", label: "WebGL2", profile: "full", renderer: "webgl", expectedBackend: "webgl2" },
  { id: "H", label: "Master-only", profile: "master-only", renderer: "auto" },
  { id: "I", label: "Master + gameplay dressing", profile: "master-plus-gameplay-dressing", renderer: "auto" },
];

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

function findChrome() {
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
  ].filter(Boolean);
  const executable = [...new Set(candidates)].find((candidate) => fs.existsSync(candidate));
  if (!executable) throw new Error("Chrome/Edge was not found. Set CHROME_PATH to a Chromium-based browser executable.");
  return executable;
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

  close() { this.socket.close(); }
}

async function createTab(debugPort) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Unable to create Chrome target: ${response.status}`);
  return response.json();
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? "Runtime evaluation failed");
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
      } : { ready: false, missingCanvas: true, bodyText: document.body?.innerText?.slice(0, 500) ?? '' };
    })()`);
    if (lastState?.error) throw new Error(`Runtime entered error state: ${lastState.error}`);
    if (lastState?.ready) return;
    await sleep(250);
  }
  throw new Error(`Runtime did not become ready: ${JSON.stringify(lastState)}`);
}

const round = (value, digits = 2) => Number(value.toFixed(digits));
const percentile = (sortedValues, fraction) => {
  if (sortedValues.length === 0) return 0;
  const index = Math.min(sortedValues.length - 1, Math.max(0, Math.ceil(sortedValues.length * fraction) - 1));
  return sortedValues[index];
};

async function runScenario(debugPort, scenario) {
  const tab = await createTab(debugPort);
  const client = new CdpClient(tab.webSocketDebuggerUrl);
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", viewport);
    const url = new URL(baseUrl);
    url.search = new URLSearchParams({
      visualTest: "1",
      visualChapter: "prologue-rain",
      visualUi: "0",
      debugGameplay: "1",
      visualScenario: "profile-camera",
      renderer: scenario.renderer,
      profile: scenario.profile,
    }).toString();
    await client.send("Page.navigate", { url: url.toString() });
    await waitForRuntimeReady(client);
    await sleep(warmupMs);
    const frameTimes = await evaluate(client, `(async () => {
      const values = [];
      const duration = ${sampleMs};
      await new Promise((resolve) => {
        let started;
        let previous;
        const step = (now) => {
          if (started === undefined) { started = now; previous = now; requestAnimationFrame(step); return; }
          values.push(now - previous);
          previous = now;
          if (now - started >= duration) resolve(); else requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      return values;
    })()`);
    const telemetry = await evaluate(client, `(() => {
      const canvas = document.querySelector('canvas.runtime-canvas');
      const d = canvas?.dataset ?? {};
      const resources = performance.getEntriesByType('resource');
      return {
        rendererBackend: String(d.rendererBackend || ''),
        antialias: d.antialias === 'true',
        shadowsEnabled: d.shadowsEnabled === 'true',
        drawCalls: Number(d.drawCalls || 0),
        triangles: Number(d.triangles || 0),
        points: Number(d.points || 0),
        textures: Number(d.textures || 0),
        materials: Number(d.materials || 0),
        lights: Number(d.lights || 0),
        shadowCasterCount: Number(d.shadowCasterCount || 0),
        loadedAssetBytes: Number(d.loadedAssetBytes || 0),
        transferBytes: resources.reduce((sum, entry) => sum + Number(entry.transferSize || 0), 0),
        renderWidth: Number(d.renderWidth || canvas?.width || 0),
        renderHeight: Number(d.renderHeight || canvas?.height || 0),
        clientWidth: Number(canvas?.clientWidth || 0),
        clientHeight: Number(canvas?.clientHeight || 0),
        pixelRatio: Number(d.pixelRatio || 0),
        profileVariant: String(d.profileVariant || ''),
        visibleModels: String(d.visibleModels || '').split(',').filter(Boolean),
        loadedAssetIds: String(d.loadedAssetIds || '').split(',').filter(Boolean),
        userAgent: navigator.userAgent,
        webgpuExposed: 'gpu' in navigator,
      };
    })()`);
    const sorted = frameTimes.filter((value) => Number.isFinite(value) && value > 0).sort((a, b) => a - b);
    const total = sorted.reduce((sum, value) => sum + value, 0);
    const avgFrameMs = sorted.length ? total / sorted.length : 0;
    const p95FrameMs = percentile(sorted, 0.95);
    const p99FrameMs = percentile(sorted, 0.99);
    return {
      ...scenario,
      status: "measured",
      backendMatched: scenario.expectedBackend ? telemetry.rendererBackend === scenario.expectedBackend : true,
      sampleMs,
      sampleFrames: sorted.length,
      avgFps: round(avgFrameMs ? 1000 / avgFrameMs : 0),
      onePercentLowFps: round(p99FrameMs ? 1000 / p99FrameMs : 0),
      avgFrameMs: round(avgFrameMs),
      p95FrameMs: round(p95FrameMs),
      p99FrameMs: round(p99FrameMs),
      ...telemetry,
    };
  } catch (error) {
    return { ...scenario, status: "error", error: error instanceof Error ? error.message : String(error) };
  } finally {
    client.close();
    await fetch(`http://127.0.0.1:${debugPort}/json/close/${tab.id}`).catch(() => undefined);
  }
}

function markdownFor(report) {
  const rows = report.scenarios.map((item) => item.status === "measured"
    ? `| ${item.id} | ${item.label} | ${item.avgFps.toFixed(2)} | ${item.onePercentLowFps.toFixed(2)} | ${item.avgFrameMs.toFixed(2)} / ${item.p95FrameMs.toFixed(2)} / ${item.p99FrameMs.toFixed(2)} | ${item.drawCalls} | ${item.triangles.toLocaleString("en-US")} | ${item.points.toLocaleString("en-US")} | ${item.textures} | ${item.materials} | ${item.lights} | ${item.shadowCasterCount} | ${item.loadedAssetBytes.toLocaleString("en-US")} | ${item.renderWidth}×${item.renderHeight} @ ${item.pixelRatio} | ${item.rendererBackend}${item.backendMatched ? "" : " ⚠"} |`
    : `| ${item.id} | ${item.label} | ERROR | — | — | — | — | — | — | — | — | — | — | — | ${String(item.error).replaceAll("|", "\\|")} |`);
  const backendWarning = report.scenarios.filter((item) => item.status === "measured" && !item.backendMatched);
  return `# Performance Profile — 2026-08-30

同一主门 Spawn、第一人称相机、1440×900 浏览器窗口；每组预热 ${report.warmupMs / 1000} 秒并采样 ${report.sampleMs / 1000} 秒。除场景声明的单一变量外，其他设置保持一致。AA 保持开启，像素比不使用 0.65/0.78 应急降级。

| 组 | 场景 | avg FPS | 1% low FPS | frame ms avg / p95 / p99 | calls | triangles | points | textures | materials | lights | shadow casters | asset bytes | render resolution | backend |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
${rows.join("\n")}

## 口径

- 1% low 以 \`1000 / p99 frame time\` 计算；frame time 来自连续 \`requestAnimationFrame\` 时间差。
- draw calls / triangles / points 取采样结束时 renderer telemetry；纹理、材质、灯和 shadow caster 只统计可见层级。
- \`loadedAssetBytes\` 是运行时资产清单口径；原始资源传输字节和完整逐帧数据保存在同名 JSON。
- A、F 都是完整视觉自动后端，F 用于明确验证 WebGPU；G 强制 WebGL2。I 是 Master + gameplay skeleton、关闭 atmospheric procedural dressing 的控制组。
${backendWarning.length ? `- 注意：${backendWarning.map((item) => `${item.id} 预期 ${item.expectedBackend}，实际 ${item.rendererBackend}`).join("；")}。这是环境能力结果，未伪装成目标后端。\n` : ""}
## 初步结论

本文件由 \`scripts/perf/profile-runtime.mjs\` 自动生成。优化决策应优先比较单变量组 B–E 与 A，并以不损失 Master 正式窗、门、格栅、墙、屋顶和贴图为前提。
`;
}

await waitForHttp(baseUrl, 5_000);
fs.mkdirSync(recordRoot, { recursive: true });
const chrome = findChrome();
const debugPort = 9_222 + (process.pid % 700);
// Keep Chromium's locked Cookies/Cache files outside the Vite watch root.
// Otherwise Windows can terminate the dev server with EBUSY while it watches
// this short-lived profile.
const profileDir = path.join(os.tmpdir(), `garden-shadows-perf-chrome-${process.pid}`);
fs.mkdirSync(profileDir, { recursive: true });
const chromeProcess = spawn(chrome, [
  "--headless=new",
  "--enable-unsafe-webgpu",
  "--disable-gpu-sandbox",
  "--disable-extensions",
  "--disable-component-extensions-with-background-pages",
  "--no-first-run",
  "--no-default-browser-check",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  `--window-size=${viewport.width},${viewport.height}`,
  "about:blank",
], { stdio: "ignore", windowsHide: true });

try {
  await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 30_000);
  const results = [];
  for (const scenario of scenarios) {
    process.stdout.write(`[${scenario.id}/I] ${scenario.label}... `);
    const result = await runScenario(debugPort, scenario);
    results.push(result);
    console.log(result.status === "measured" ? `${result.avgFps} avg FPS (${result.rendererBackend})` : `ERROR: ${result.error}`);
  }
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    viewport,
    warmupMs,
    sampleMs,
    policy: {
      fixedSpawn: "TINGYUXUAN_MAIN_GATE_AUDIT.spawn",
      fixedCamera: "first-person explore FOV 70",
      onePercentLowFormula: "1000 / p99 frame time",
      masterFidelityProtected: true,
    },
    scenarios: results,
  };
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownPath, markdownFor(report));
  if (results.some((item) => item.status === "error")) process.exitCode = 1;
} finally {
  if (process.platform === "win32" && chromeProcess.pid) {
    spawnSync("taskkill", ["/PID", String(chromeProcess.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    chromeProcess.kill();
  }
  await sleep(500);
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  } catch (error) {
    console.warn(`Chrome profile cleanup deferred: ${error instanceof Error ? error.message : String(error)}`);
  }
}
