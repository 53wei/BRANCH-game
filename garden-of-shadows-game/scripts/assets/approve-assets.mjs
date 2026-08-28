import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const docsRoot = path.join(projectRoot, "docs", "assets");
const validator = path.join(projectRoot, "scripts", "assets", "validate-assets.mjs");
const visualAcceptancePath = path.join(projectRoot, "docs", "visual-regression", "phase-one-acceptance.json");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const runNpm = (script, args = []) => {
  const result = spawnSync(npmCommand, ["run", script, ...args], { cwd: projectRoot, env: { ...process.env }, shell: false, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};
const runValidator = (requireApproved = false) => {
  const result = spawnSync(process.execPath, [validator], {
    cwd: projectRoot,
    env: { ...process.env, ASSET_APPROVAL_REQUIRED: requireApproved ? "1" : "0" },
    shell: false,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};
const read = (name) => JSON.parse(fs.readFileSync(path.join(docsRoot, name), "utf8"));
const write = (name, value) => fs.writeFileSync(path.join(docsRoot, name), `${JSON.stringify(value, null, 2)}\n`);

runNpm("assets:prepare");
runValidator(false);

if (!fs.existsSync(visualAcceptancePath)) throw new Error("Phase-one visual acceptance record is missing.");
const visualAcceptance = JSON.parse(fs.readFileSync(visualAcceptancePath, "utf8"));
if (visualAcceptance.status !== "approved" || (visualAcceptance.capturedShots?.length ?? 0) < 5) {
  throw new Error("Phase-one formal visual layer has not been accepted. Review the five required screenshots before running assets:approve.");
}

runNpm("visual:verify-release");
runNpm("typecheck");
runNpm("lint");
runNpm("test");
runNpm("build");

const sources = read("downloaded-3d-assets.json").map((entry) => ({ ...entry, status: "approved", classification: "approved" }));
const sourceIds = new Set(sources.map((entry) => entry.id));
const runtime = read("runtime-assets.json").map((entry) => ({
  ...entry,
  status: entry.id === "tyx-arch-greybox-fallback-a" ? "fallback-only" : "approved",
}));
const nature = read("cc0-nature.json").map((entry) => ({ ...entry, status: "approved" }));
const manifest = read("asset-manifest.json").map((entry) => sourceIds.has(entry.id) ? { ...entry, status: "approved" } : entry);
write("downloaded-3d-assets.json", sources);
write("runtime-assets.json", runtime);
write("cc0-nature.json", nature);
write("asset-manifest.json", manifest);

const markdownPath = path.join(docsRoot, "ASSET_MANIFEST.md");
fs.writeFileSync(markdownPath, fs.readFileSync(markdownPath, "utf8").replaceAll("pending-preview", "approved"));

const chapterManifest = fs.readFileSync(path.join(projectRoot, "app", "game", "manifests", "west-corridor.ts"), "utf8");
const preloadSource = chapterManifest.match(/preload:\s*\[([^\]]*)\]/s)?.[1] ?? "";
const preloadUrls = [...preloadSource.matchAll(/"([^"\n]+)"/g)].map((match) => match[1]);
const preloadBytes = preloadUrls.reduce((sum, url) => {
  const runtimeEntry = runtime.find((entry) => entry.file === url);
  const filePath = runtimeEntry?.deliveryMode === "dev-source-pass-through"
    ? path.join(projectRoot, runtimeEntry.sourceRelativePath)
    : path.join(projectRoot, "public", url.replace(/^\//, ""));
  return sum + fs.statSync(filePath).size;
}, 0);
const shotTelemetry = visualAcceptance.capturedShots.map((shot) => shot.telemetry ?? {});
const measuredFps = shotTelemetry.map((item) => Number(item.fps)).filter((value) => Number.isFinite(value) && value > 0);
const measuredDrawCalls = shotTelemetry.map((item) => Number(item.drawCalls)).filter(Number.isFinite);
const measuredTriangles = shotTelemetry.map((item) => Number(item.triangles)).filter(Number.isFinite);
const measuredLoadedBytes = shotTelemetry.map((item) => Number(item.loadedAssetBytes)).filter(Number.isFinite);
const rendererBackends = [...new Set(shotTelemetry.map((item) => item.rendererBackend).filter(Boolean))];
write("release-approval.json", {
  status: "approved",
  layoutVersion: "tingyuxuan-v1.2",
  approvedAt: new Date().toISOString(),
  visualAcceptance: visualAcceptancePath.replace(projectRoot + path.sep, "").replaceAll(path.sep, "/"),
  gates: {
    license: { ccBySources: sources.length, cc0Materials: read("cc0-materials.json").length, cc0NatureModules: nature.length },
    functional: { testSuite: "passed", typecheck: "passed", lint: "passed", productionBuild: "passed", chapterRouteContract: "passed" },
    visual: { beforeScreenshots: 1, afterScreenshots: visualAcceptance.capturedShots.length, formalTingYuXuan: "approved", assetPreview: "runtime-and-source-preview-integrated", credits: "passed" },
    performance: {
      runtimeFiles: runtime.length,
      policy: "measure-fidelity-first-optimize-second",
      referenceMaxStaticMiB: 25,
      referencePreloadMiB: 18,
      chapterPreloadMiB: Number((preloadBytes / 1048576).toFixed(2)),
      minCapturedFps: measuredFps.length ? Math.min(...measuredFps) : null,
      maxCapturedDrawCalls: measuredDrawCalls.length ? Math.max(...measuredDrawCalls) : null,
      maxCapturedTriangles: measuredTriangles.length ? Math.max(...measuredTriangles) : null,
      maxLoadedAssetMiB: measuredLoadedBytes.length ? Number((Math.max(...measuredLoadedBytes) / 1048576).toFixed(2)) : null,
      meshoptKtx2: "validated-for-optimized-runtime-assets",
    },
    browsers: { visualCaptureBackends: rendererBackends, webgpuPath: "implemented-not-inferred-from-webgl-capture", recoverableAssetErrorPath: "implemented" },
  },
});

runValidator(true);
console.log(`Approved ${sources.length} audited sources, ${nature.length} CC0 nature modules and ${runtime.length} runtime assets.`);
