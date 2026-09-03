import crypto from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const mapAudit = process.argv.includes("--map-audit");
const prologueSpawnAudit = process.argv.includes("--prologue-spawn");
const walkAuditOnly = process.argv.includes("--walk-only");
const specialStructureAudit = process.argv.includes("--special-structures");
const masterNodeAudit = process.argv.includes("--master-nodes");
const acceptancePath = path.join(projectRoot, "docs", "visual-regression", "phase-one-acceptance.json");
const outputRoot = prologueSpawnAudit
  ? path.join(projectRoot, "docs", "development-records", "prologue-spawn-captures")
  : specialStructureAudit
    ? path.join(projectRoot, "docs", "development-records", "special-structure-captures")
  : masterNodeAudit
    ? path.join(projectRoot, "assets-source", "blender-working", "runtime-test", "master-node-audit")
  : walkAuditOnly
    ? path.join(projectRoot, "docs", "development-records", "gameplay-map-walk-audit")
  : mapAudit
    ? path.join(projectRoot, "docs", "development-records", "gameplay-map-v1-captures")
    : path.join(projectRoot, "docs", "visual-regression", "after");
const metricsPath = path.join(outputRoot, "capture-metrics.json");
const defaultVisualPort = 43_000 + (process.pid % 1_000);
// vinext currently binds its local dev listener to localhost/IPv6 on Windows
// even when --host receives 127.0.0.1. Use the advertised host so the audit
// does not report a false timeout while the server is healthy on ::1.
const baseUrl = process.env.VISUAL_BASE_URL ?? `http://localhost:${defaultVisualPort}/`;
const visualDevUrl = new URL(baseUrl);
const viewport = { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sha256 = (buffer) => crypto.createHash("sha256").update(buffer).digest("hex");

const acceptance = JSON.parse(fs.readFileSync(acceptancePath, "utf8"));
if (!Array.isArray(acceptance.requiredShots) || acceptance.requiredShots.length !== 5) {
  throw new Error("phase-one-acceptance.json must define exactly five requiredShots");
}
const routeAuditShots = [
  ["route-01-start", "ROUTE_01_START", "AREA_A"],
  ["route-02-a-entry", "ROUTE_02_A_ENTRY", "AREA_A"],
  ["route-03-a-loop", "ROUTE_03_A_LOOP", "AREA_A"],
  ["route-04-a-east-exit", "ROUTE_04_A_EAST_EXIT", "AREA_A"],
  ["route-05-b-main-court", "ROUTE_05_B_MAIN_COURT", "AREA_B"],
  ["route-06-b-northeast-link", "ROUTE_06_B_NORTHEAST_LINK", "AREA_B"],
  ["route-07-c-entry", "ROUTE_07_C_ENTRY", "AREA_C"],
].map(([id, anchorId, expectedArea]) => ({
  id,
  anchorId,
  expectedArea,
  query: `?visualTest=1&visualUi=1&debugGameplay=1&debugMap=1&visualAnchor=${anchorId}&visualPitch=-0.08&renderer=webgl`,
}));
const prologueSpawnShots = [
  {
    id: "scale-wall-character",
    expectedArea: "AREA_A",
    query: "?visualTest=1&visualChapter=prologue-rain&visualUi=1&debugGameplay=1&visualScenario=wall-scale&renderer=webgl",
  },
  {
    id: "scale-door-character",
    expectedArea: "AREA_A",
    query: "?visualTest=1&visualChapter=prologue-rain&visualUi=1&debugGameplay=1&visualScenario=door-scale&renderer=webgl",
  },
  {
    id: "gameplay-shoulder-camera",
    anchorId: "ROUTE_01_START",
    expectedArea: "AREA_A",
    query: "?visualTest=1&visualChapter=prologue-rain&visualUi=1&debugGameplay=1&visualScenario=gameplay-camera&renderer=webgl",
  },
];
const specialStructureShots = [
  {
    id: "main-gate-outside",
    anchorId: "ROUTE_01_START",
    expectedArea: "AREA_A",
    query: "?visualTest=1&visualUi=1&debugGameplay=1&visualAnchor=ROUTE_01_START&visualPitch=0&renderer=webgl",
  },
  {
    id: "moon-gate-wife-side",
    anchorId: "ROUTE_04_A_EAST_EXIT",
    expectedArea: "AREA_A",
    query: "?visualTest=1&visualUi=1&debugGameplay=1&visualAnchor=ROUTE_04_A_EAST_EXIT&visualPitch=0&renderer=webgl",
  },
  {
    id: "water-edge",
    expectedArea: "AREA_C",
    query: "?visualTest=1&visualUi=1&debugGameplay=1&visualAnchor=C_WATER_EDGE&visualPitch=-0.12&renderer=webgl",
  },
 {
   id: "wooden-steps",
   expectedArea: "AREA_C",
    query: `?visualTest=1&visualUi=1&debugGameplay=1&visualAnchor=ROUTE_01_START&visualX=-11&visualY=0.9&visualZ=0.25&visualYaw=${Math.PI / 2}&visualPitch=-0.08&renderer=webgl`,
 },
];
const masterNodeShots = [
  { nodeName: "214b32a0o", position: [-11, 1.0, 0.25], area: "AREA_C" },
  { nodeName: "214afe40o", position: [-11, 1.0, 0.25], area: "AREA_C" },
  { nodeName: "214b9790o", position: [-11, 1.0, 0.25], area: "AREA_C" },
  { nodeName: "1d6638d0o", position: [18, 1.0, 9.5], area: "OUTSIDE" },
  { nodeName: "20ca4e00o", position: [-10.5, 2.5, 23.7], area: "AREA_B" },
].map(({ nodeName, position, area }, index) => ({
  id: `node-${String(index + 1).padStart(2, "0")}`,
  expectedArea: area,
  query: `?visualTest=1&visualUi=1&debugGameplay=1&visualAnchor=ROUTE_01_START&visualX=${position[0]}&visualY=${position[1]}&visualZ=${position[2]}&visualYaw=${Math.PI / 2}&visualPitch=-0.08&auditMasterNode=${encodeURIComponent(nodeName)}&renderer=webgl`,
}));
const shots = walkAuditOnly ? [] : prologueSpawnAudit ? prologueSpawnShots : specialStructureAudit ? specialStructureShots : masterNodeAudit ? masterNodeShots : mapAudit ? routeAuditShots : acceptance.requiredShots;
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
    const vinextCli = path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js");
    const child = spawn(process.execPath, [
      vinextCli,
      "dev",
      "--host",
      visualDevUrl.hostname,
      "--port",
      visualDevUrl.port,
      "--strictPort",
    ], {
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
      const colliderCoverageReport = (() => {
        try { return JSON.parse(String(d.colliderCoverageReport || '{}')); }
        catch { return {}; }
      })();
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
        architectureMode: String(d.architectureMode || ''),
        architectureColliderCount: Number(d.architectureColliderCount || 0),
       masterArchitectureColliderCount: Number(d.masterArchitectureColliderCount || 0),
        specialStructureColliderCount: Number(d.specialStructureColliderCount || 0),
        specialStructureCollision: String(d.specialStructureCollision || ''),
        specialStructureCollisionReport: (() => {
          try { return JSON.parse(String(d.specialStructureCollisionReport || '{}')); }
          catch { return {}; }
        })(),
        colliderCoverage: String(d.colliderCoverage || ''),
        colliderCoverageReport,
        playerPose: String(d.playerPose || '').split(',').map(Number),
        playerAvatarVisible: d.playerAvatarVisible === 'true',
        cameraPose: String(d.cameraPose || '').split(',').map(Number),
        visualScenario: String(d.visualScenario || ''),
        cameraFov: Number(d.cameraFov || 0),
        characterHeight: Number(d.characterHeight || 0),
        wallHeight: Number(d.wallHeight || 0),
        doorHeight: Number(d.doorHeight || 0),
        masterScaleFactor: Number(d.masterScaleFactor || 0),
        cameraCollisionId: String(d.cameraCollisionId || ''),
        spawnVisualOccluders: String(d.spawnVisualOccluders || '').split(',').filter(Boolean),
        spawnScreenSamples: String(d.spawnScreenSamples || ''),
        interactionPrompt: String(document.querySelector('.interaction-prompt')?.textContent || ''),
        grounded: d.grounded === 'true',
        gameplayArea: String(d.gameplayArea || ''),
        nearestRouteAnchor: String(d.nearestRouteAnchor || ''),
        nearestRouteDistance: Number(d.nearestRouteDistance || 0),
        prologuePhase: String(d.prologuePhase || ''),
        transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        durationMs: performance.now(),
        fallbackEnabled: new URLSearchParams(location.search).get('fallbackArchitecture') === '1',
        errorModal: Boolean(document.querySelector('.runtime-phase-error')),
      };
    })()`);
    // The formal runtime is first-person and PlayerAvatar is intentionally a
    // geometry-free transform anchor. Do not require a synthetic primitive body
    // merely to make a regression screenshot pass.
    if (prologueSpawnAudit) {
      if (telemetry.cameraPose[1] < 0.98 || telemetry.cameraPose[1] > 1.18) {
        throw new Error(`${shot.id} camera must stay at the low exploration height, got y=${telemetry.cameraPose[1]}`);
      }
      if (telemetry.cameraFov < 58 || telemetry.cameraFov > 65) {
        throw new Error(`${shot.id} FOV must stay in the 58–65 degree exploration range, got ${telemetry.cameraFov}`);
      }
      if (Math.abs(telemetry.characterHeight - 1.693) > 0.01
        || Math.abs(telemetry.wallHeight - 2.946) > 0.01
        || Math.abs(telemetry.doorHeight - 2.155) > 0.01
        || Math.abs(telemetry.masterScaleFactor - 3.2) > 0.01) {
        throw new Error(`${shot.id} scale telemetry drifted: character=${telemetry.characterHeight}, wall=${telemetry.wallHeight}, door=${telemetry.doorHeight}, factor=${telemetry.masterScaleFactor}`);
      }
      if (telemetry.spawnVisualOccluders.length > 0) {
        throw new Error(`${shot.id} avatar is visually occluded by: ${telemetry.spawnVisualOccluders.join(', ')}`);
      }
      if (telemetry.interactionPrompt) {
        throw new Error(`${shot.id} starts inside an interaction prompt: ${telemetry.interactionPrompt}`);
      }
    }

    if (telemetry.fallbackEnabled || telemetry.errorModal) throw new Error(`${shot.id}: invalid regression state`);
    if (telemetry.architectureMode !== 'master') throw new Error(`${shot.id}: expected Master architecture, got ${telemetry.architectureMode || 'unknown'}`);
    if (!masterNodeAudit && telemetry.masterArchitectureColliderCount <= 0) {
      throw new Error(`${shot.id}: Master architecture did not register any physics colliders`);
    }
    if (!masterNodeAudit && (telemetry.colliderCoverage !== 'complete' || telemetry.colliderCoverageReport?.complete !== true)) {
      throw new Error(`${shot.id}: architecture collision coverage is incomplete: ${JSON.stringify(telemetry.colliderCoverageReport)}`);
    }
    if (!masterNodeAudit && (telemetry.specialStructureColliderCount <= 0 || telemetry.specialStructureCollision !== 'complete')) {
      throw new Error(`${shot.id}: TASK-018 special-structure collision is incomplete: ${JSON.stringify(telemetry.specialStructureCollisionReport)}`);
    }
    if (shot.expectedArea && telemetry.gameplayArea !== shot.expectedArea) {
      throw new Error(`${shot.id}: expected ${shot.expectedArea}, got ${telemetry.gameplayArea || 'unknown'}`);
    }
    if (shot.anchorId && telemetry.nearestRouteAnchor !== shot.anchorId) {
      throw new Error(`${shot.id}: expected nearest ${shot.anchorId}, got ${telemetry.nearestRouteAnchor || 'unknown'}`);
    }
    const requiredModel = "master-scene";
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

async function runWalkAudit(debugPort) {
  const tab = await createTab(debugPort);
  const client = new CdpClient(tab.webSocketDebuggerUrl);
  const startedAt = Date.now();
  const expectedMilestones = routeAuditShots.slice(1).map(({ anchorId }) => anchorId);
  const expectedAreaByAnchor = new Map(routeAuditShots.map(({ anchorId, expectedArea }) => [anchorId, expectedArea]));
  const milestones = [];
  let lastProgressAt = startedAt;
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", viewport);
    const url = new URL("?visualTest=1&visualUi=1&debugGameplay=1&debugOverlay=1&walkAudit=1&visualAnchor=ROUTE_01_START&renderer=webgl", baseUrl).toString();
    await client.send("Page.navigate", { url });
    await waitForRuntimeReady(client);
    lastProgressAt = Date.now();
    const deadline = Date.now() + 120_000;
    let state;
    while (Date.now() < deadline) {
      state = await evaluate(client, `(() => {
        const canvas = document.querySelector('canvas.runtime-canvas');
        const d = canvas?.dataset ?? {};
        return {
          status: String(d.walkAuditStatus || ''),
          target: String(d.walkAuditTarget || ''),
          reached: String(d.walkAuditReached || ''),
          reachedPose: String(d.walkAuditReachedPose || '').split(',').map(Number),
          reachedGrounded: d.walkAuditReachedGrounded === 'true',
          reachedArea: String(d.walkAuditReachedArea || ''),
          reachedNearest: String(d.walkAuditReachedNearest || ''),
          milestoneLog: JSON.parse(d.walkAuditMilestones || '[]'),
          playerPose: String(d.playerPose || '').split(',').map(Number),
          grounded: d.grounded === 'true',
          gameplayArea: String(d.gameplayArea || ''),
          nearestRouteAnchor: String(d.nearestRouteAnchor || ''),
          loopTeleport: d.walkAuditLoopTeleport === 'true',
          exitHandoff: d.walkAuditExitHandoff === 'true',
          error: document.querySelector('.runtime-phase-error')?.textContent ?? '',
        };
      })()`);
      if (state?.error) throw new Error(`Walk audit entered error state: ${state.error}`);
      const pendingMilestones = (state?.milestoneLog ?? []).slice(milestones.length);
      for (const event of pendingMilestones) {
        const expectedArea = expectedAreaByAnchor.get(event.id);
        const milestone = { ...event, elapsedMs: Date.now() - startedAt };
        milestones.push(milestone);
        lastProgressAt = Date.now();
        if (!milestone.grounded
          || (expectedArea && milestone.gameplayArea !== expectedArea)
          || milestone.nearestRouteAnchor !== event.id) {
          throw new Error(`Walk audit reached ${event.id} in invalid state: ${JSON.stringify(milestone)}`);
        }
      }
      if (state?.status === "complete") break;
      if (Date.now() - lastProgressAt > 20_000) {
        throw new Error(`Walk audit stalled for 20s: ${JSON.stringify({ state, milestones })}`);
      }
      await sleep(250);
    }
    if (state?.status !== "complete") throw new Error(`Walk audit timed out: ${JSON.stringify({ state, milestones })}`);
    const reachedMilestones = milestones.map(({ id }) => id);
    if (JSON.stringify(reachedMilestones) !== JSON.stringify(expectedMilestones)) {
      throw new Error(`Walk audit milestone sequence mismatch: ${JSON.stringify({ expectedMilestones, reachedMilestones, milestones })}`);
    }
    if (!state.grounded || state.gameplayArea !== "AREA_C" || state.nearestRouteAnchor !== "ROUTE_07_C_ENTRY") {
      throw new Error(`Walk audit ended in invalid state: ${JSON.stringify({ state, milestones })}`);
    }
    if (!state.loopTeleport) throw new Error(`Walk audit bypassed the gardener loop: ${JSON.stringify({ state, milestones })}`);
    if (!state.exitHandoff) throw new Error(`Walk audit bypassed the ROUTE_04 to ROUTE_05 chapter handoff: ${JSON.stringify({ state, milestones })}`);
    const screenshot = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    const buffer = Buffer.from(screenshot.data, "base64");
    const filePath = path.join(outputRoot, "walk-audit-complete.png");
    fs.writeFileSync(filePath, buffer);
    return {
      ...state,
      milestones,
      durationMs: Date.now() - startedAt,
      file: path.relative(projectRoot, filePath).replaceAll("\\", "/"),
      bytes: buffer.length,
      sha256: sha256(buffer),
    };
  } finally {
    client.close();
    await fetch(`http://127.0.0.1:${debugPort}/json/close/${tab.id}`).catch(() => undefined);
  }
}

async function runSpecialStructureWalkAudit(debugPort) {
  const tab = await createTab(debugPort);
  const client = new CdpClient(tab.webSocketDebuggerUrl);
  const startedAt = Date.now();
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", viewport);
    const url = new URL(`?visualTest=1&visualUi=1&debugGameplay=1&specialStructureWalkAudit=1&visualAnchor=ROUTE_01_START&visualX=-11&visualY=0.9&visualZ=0.25&visualYaw=${Math.PI / 2}&renderer=webgl`, baseUrl).toString();
    await client.send("Page.navigate", { url });
    await waitForRuntimeReady(client);
    const deadline = Date.now() + 60_000;
    let state;
    while (Date.now() < deadline) {
      state = await evaluate(client, `(() => {
        const d = document.querySelector('canvas.runtime-canvas')?.dataset ?? {};
        return {
          status: String(d.specialStructureWalkStatus || ''),
          remaining: Number(d.specialStructureWalkRemaining || Infinity),
          playerPose: String(d.playerPose || '').split(',').map(Number),
          grounded: d.grounded === 'true',
          specialStructureColliderCount: Number(d.specialStructureColliderCount || 0),
          specialStructureCollision: String(d.specialStructureCollision || ''),
          error: document.querySelector('.runtime-phase-error')?.textContent ?? '',
        };
      })()`);
      if (state?.error) throw new Error(`Special-structure walk entered error state: ${state.error}`);
      if (state?.status === "complete") break;
      await sleep(150);
    }
    if (state?.status !== "complete" || state.remaining > 0.3) {
      throw new Error(`Special-structure walk did not cross the authored stairs: ${JSON.stringify(state)}`);
    }
    if (!state.grounded || state.playerPose[0] > -14.9) {
      throw new Error(`Special-structure walk ended in invalid pose: ${JSON.stringify(state)}`);
    }
    if (state.specialStructureColliderCount <= 0 || state.specialStructureCollision !== "complete") {
      throw new Error(`Special-structure trimesh was not active: ${JSON.stringify(state)}`);
    }
    const screenshot = await client.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    const buffer = Buffer.from(screenshot.data, "base64");
    const filePath = path.join(outputRoot, "wooden-steps-walk-complete.png");
    fs.writeFileSync(filePath, buffer);
    return {
      ...state,
      durationMs: Date.now() - startedAt,
      file: path.relative(projectRoot, filePath).replaceAll("\\", "/"),
      bytes: buffer.length,
      sha256: sha256(buffer),
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
  const capturedShots = [];
  for (const shot of shots) capturedShots.push(await captureShot(debugPort, shot));
  const walkAudit = mapAudit || walkAuditOnly ? await runWalkAudit(debugPort) : undefined;
  const specialStructureWalkAudit = specialStructureAudit ? await runSpecialStructureWalkAudit(debugPort) : undefined;

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
    ...(walkAudit ? { walkAudit } : {}),
    ...(specialStructureWalkAudit ? { specialStructureWalkAudit } : {}),
  };
  fs.writeFileSync(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
  if (!mapAudit && !prologueSpawnAudit && !walkAuditOnly) {
    fs.writeFileSync(acceptancePath, `${JSON.stringify({
      ...acceptance,
      status: "captured-pending-user-visual-acceptance",
      capturedShots: capturedShots.map(({ id, file, bytes, sha256: hash, telemetry }) => ({ id, file, bytes, sha256: hash, telemetry })),
      capturedAt: metrics.generatedAt,
    }, null, 2)}\n`);
  }
  console.log(walkAuditOnly
    ? `Completed continuous Gameplay Map walk in ${(walkAudit.durationMs / 1000).toFixed(1)}s.`
    : prologueSpawnAudit
    ? "Captured the Prologue ROUTE_01 spawn view."
    : specialStructureAudit
      ? `Captured ${capturedShots.length} TASK-018 special-structure views; authored stair walk completed in ${(specialStructureWalkAudit.durationMs / 1000).toFixed(1)}s.`
    : masterNodeAudit
      ? `Captured ${capturedShots.length} isolated Master-node views.`
    : mapAudit
      ? `Captured ${capturedShots.length} Gameplay Map anchors; continuous walk completed in ${(walkAudit.durationMs / 1000).toFixed(1)}s.`
      : `Captured ${capturedShots.length} formal TingYuXuan regression shots.`);
} finally {
  if (process.platform === "win32" && chromeProcess.pid) {
    spawnSync("taskkill", ["/PID", String(chromeProcess.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
  } else {
    chromeProcess.kill();
  }
  devServer?.kill();
  await sleep(1_000);
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 });
  } catch (error) {
    console.warn(`Chrome profile cleanup deferred: ${error instanceof Error ? error.message : String(error)}`);
  }
}
