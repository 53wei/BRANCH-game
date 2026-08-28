import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const acceptancePath = path.join(projectRoot, "docs", "visual-regression", "phase-one-acceptance.json");
const acceptance = JSON.parse(fs.readFileSync(acceptancePath, "utf8"));
const requiredIds = ["spawn-front-view", "front-hall", "west-courtyard", "curved-corridor", "moon-gate-window"];
const errors = [];
const warnings = [];
const hash = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const requiredShots = acceptance.requiredShots ?? [];
if (requiredShots.map((shot) => shot.id).join("|") !== requiredIds.join("|")) {
  errors.push(`Visual gate must contain exactly: ${requiredIds.join(", ")}`);
}
const captured = new Map((acceptance.capturedShots ?? []).map((shot) => [shot.id, shot]));

for (const id of requiredIds) {
  const shot = captured.get(id);
  if (!shot) {
    errors.push(`${id}: not captured`);
    continue;
  }
  const filePath = path.join(projectRoot, shot.file);
  if (!fs.existsSync(filePath)) {
    errors.push(`${id}: screenshot missing (${shot.file})`);
    continue;
  }
  if (shot.sha256 && hash(filePath) !== shot.sha256) errors.push(`${id}: screenshot hash changed after capture`);
  const telemetry = shot.telemetry ?? {};
  if (telemetry.errorModal) errors.push(`${id}: runtime error modal was present`);
  if (telemetry.fallbackEnabled) errors.push(`${id}: fallbackArchitecture was enabled`);
  if ((telemetry.visibleModels ?? []).some((name) => String(name).startsWith("fallback-"))) errors.push(`${id}: fallback visual model leaked into capture`);
  if (!(telemetry.fps > 0)) errors.push(`${id}: FPS telemetry missing`);
  if (!(telemetry.drawCalls > 0)) errors.push(`${id}: draw-call telemetry missing`);
  if (!(telemetry.triangles > 0)) errors.push(`${id}: triangle telemetry missing`);
  if (!(telemetry.loadedAssetBytes > 0)) errors.push(`${id}: loaded-asset byte telemetry missing`);
  if (telemetry.fps > 0 && telemetry.fps < 45) warnings.push(`${id}: measured ${telemetry.fps.toFixed(1)} FPS below the 45 FPS stable reference`);
}

const requires = {
  "spawn-front-view": "siheyuan-front-compound",
  "front-hall": "siheyuan-front-compound",
  "west-courtyard": "courtyard-park-west-garden",
  "curved-corridor": "courtyard-park-west-garden",
  "moon-gate-window": "courtyard-park-west-garden",
};
for (const [id, model] of Object.entries(requires)) {
  const visible = captured.get(id)?.telemetry?.visibleModels ?? [];
  if (!visible.includes(model)) errors.push(`${id}: required formal model ${model} is absent`);
}

if (process.argv.includes("--release") && acceptance.status !== "approved") {
  errors.push(`Visual gate is ${acceptance.status}; release verification requires status=approved after manual review`);
}
if (process.env.VISUAL_PERF_STRICT === "1" && warnings.length) errors.push(...warnings.splice(0));
if (warnings.length) console.warn(warnings.map((warning) => `[visual advisory] ${warning}`).join("\n"));
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Visual regression capture verified: ${requiredIds.length}/5 formal screenshots, no fallback leakage.${acceptance.status === "approved" ? " Manual visual gate approved." : " Manual visual approval still pending."}`);
