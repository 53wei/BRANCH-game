import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const docsRoot = path.join(projectRoot, "docs", "assets");
const sourceInventoryPath = path.join(docsRoot, "downloaded-3d-assets.json");
const runtimeInventoryPath = path.join(docsRoot, "runtime-assets.json");
const materialInventoryPath = path.join(docsRoot, "cc0-materials.json");
const natureInventoryPath = path.join(docsRoot, "cc0-nature.json");
const referenceStaticBytes = 25 * 1024 * 1024;
const referencePreloadBytes = 18 * 1024 * 1024;
const requiredFallbackNodes = [
  "Corridor_Straight_4m", "Corridor_Straight_8m", "Corridor_Corner", "Wall_Solid",
  "Wall_Window", "Wall_MoonGate_Base", "Door_Wood", "Window_Lattice", "House_Small", "Roof_Grey",
];
const requiredNatureKinds = { shrub: 3, tree: 2, "ground-cover": 2, rock: 3 };
const errors = [];
const warnings = [];
const approvalRequired = process.env.ASSET_APPROVAL_REQUIRED === "1";
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const readJson = (filePath, label) => {
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing ${label}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
};
const publicPath = (url) => path.join(projectRoot, "public", url.replace(/^\//, ""));
const walkFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walkFiles(target) : [target];
});

const sources = readJson(sourceInventoryPath, "downloaded-3d-assets.json; run npm run assets:inventory");
const runtime = readJson(runtimeInventoryPath, "runtime-assets.json; run npm run assets:prepare");
const materials = readJson(materialInventoryPath, "cc0-materials.json; run npm run assets:fetch-cc0");
const nature = readJson(natureInventoryPath, "cc0-nature.json; run npm run assets:fetch-nature");

const allIds = [...sources, ...runtime, ...materials, ...nature].map((entry) => entry.id);
for (const id of new Set(allIds)) {
  if (allIds.filter((candidate) => candidate === id).length > 1) errors.push(`Duplicate asset id: ${id}`);
}

const requiredSourceFields = ["id", "title", "sha256", "author", "sourceUrl", "license", "bytes", "metrics", "bounds"];
for (const source of sources) {
  for (const field of requiredSourceFields) {
    if (source[field] === undefined || source[field] === "unknown") errors.push(`${source.id}: missing ${field}`);
  }
  if (!String(source.license).includes("CC-BY-4.0")) errors.push(`${source.id}: expected audited CC-BY-4.0 license`);
  if (approvalRequired && (source.status !== "approved" || source.classification !== "approved")) errors.push(`${source.id}: final approval is missing`);
  const localSource = path.join(projectRoot, source.relativeSourcePath);
  if (!fs.existsSync(localSource)) errors.push(`${source.id}: source file missing`);
  else if (sha256(localSource) !== source.sha256) errors.push(`${source.id}: source hash changed`);
}

for (const asset of runtime) {
  if (approvalRequired) {
    const expectedStatus = asset.id === "tyx-arch-greybox-fallback-a" ? "fallback-only" : "approved";
    if (asset.status !== expectedStatus) errors.push(`${asset.id}: expected final status ${expectedStatus}, got ${asset.status}`);
  }
  const localFile = asset.deliveryMode === "dev-source-pass-through"
    ? path.join(projectRoot, asset.sourceRelativePath)
    : publicPath(asset.file);
  if (!fs.existsSync(localFile)) {
    errors.push(`${asset.id}: runtime source/file missing (${asset.file})`);
    continue;
  }
  const bytes = fs.statSync(localFile).size;
  if (bytes !== asset.bytes) errors.push(`${asset.id}: recorded byte count differs`);
  if (bytes >= referenceStaticBytes) warnings.push(`${asset.id}: ${(bytes / 1048576).toFixed(2)} MiB exceeds the 25 MiB publishing reference; keep for visual validation and optimize after measurement`);
  if (sha256(localFile) !== asset.sha256) errors.push(`${asset.id}: runtime hash differs`);
  if (asset.optimizationStage === "optimized-runtime" && !asset.extensionsUsed?.includes("EXT_meshopt_compression") && asset.id !== "tyx-gmp-moon-gate-collision") {
    errors.push(`${asset.id}: optimized runtime asset is missing Meshopt compression`);
  }
  for (const node of asset.requiredNodes ?? []) {
    if (!asset.nodes.includes(node)) errors.push(`${asset.id}: required node missing (${node})`);
  }
}

const fallback = runtime.find((entry) => entry.id === "tyx-arch-greybox-fallback-a");
for (const node of requiredFallbackNodes) {
  if (!fallback?.nodes.includes(node)) errors.push(`tyx-arch-greybox-fallback-a: required fallback module missing (${node})`);
}

for (const material of materials) {
  for (const field of ["id", "sourceUrl", "author", "license", "resolution", "materialIds", "maps"]) {
    if (!material[field] || material[field] === "unknown") errors.push(`${material.id}: missing ${field}`);
  }
  if (material.license !== "CC0-1.0") errors.push(`${material.id}: expected CC0-1.0`);
  if (!['1k', '2k'].includes(material.resolution)) errors.push(`${material.id}: texture resolution must be 1K or 2K`);
  const assetId = material.id.replace(/^polyhaven-/, "").replace(/-1k$/, "");
  for (const map of material.maps ?? []) {
    const runtimeFile = publicPath(map.runtimeUrl);
    if (!fs.existsSync(runtimeFile)) errors.push(`${material.id}/${map.slot}: runtime KTX2 missing`);
    else {
      const bytes = fs.statSync(runtimeFile).size;
      if (bytes !== map.runtimeBytes) errors.push(`${material.id}/${map.slot}: recorded byte count differs`);
      if (bytes >= referenceStaticBytes) warnings.push(`${material.id}/${map.slot}: exceeds the 25 MiB publishing reference`);
      if (sha256(runtimeFile) !== map.runtimeSha256) errors.push(`${material.id}/${map.slot}: runtime hash differs`);
    }
    const sourceFile = path.join(projectRoot, "assets-source", "cc0-auto", "polyhaven", assetId, `${assetId}_${map.slot}_1k.jpg`);
    if (!fs.existsSync(sourceFile)) errors.push(`${material.id}/${map.slot}: source texture missing`);
    else if (sha256(sourceFile) !== map.sourceSha256) errors.push(`${material.id}/${map.slot}: source texture hash differs`);
  }
}

if (nature.length !== 10) errors.push(`Quaternius subset must contain exactly 10 entries; found ${nature.length}`);
for (const [kind, count] of Object.entries(requiredNatureKinds)) {
  if (nature.filter((entry) => entry.kind === kind).length !== count) errors.push(`Quaternius subset requires ${count} ${kind} assets`);
}
const natureRuntime = runtime.find((entry) => entry.id === "tyx-nat-quaternius-set-a");
for (const entry of nature) {
  if (approvalRequired && entry.status !== "approved") errors.push(`${entry.id}: final approval is missing`);
  for (const field of ["id", "author", "originalPackUrl", "mirrorModelUrl", "sourceUrl", "license", "sourceSha256", "sourceBytes", "triangles", "runtimeNode"]) {
    if (entry[field] === undefined || entry[field] === "unknown") errors.push(`${entry.id}: missing ${field}`);
  }
  if (entry.author !== "Quaternius" || entry.license !== "CC0-1.0") errors.push(`${entry.id}: expected Quaternius CC0-1.0 attribution`);
  const sourceFile = path.join(projectRoot, "assets-source", "cc0-auto", "quaternius-stylized-nature-megakit", `${entry.id.replace(/^quaternius-/, "")}.glb`);
  if (!fs.existsSync(sourceFile)) errors.push(`${entry.id}: source GLB missing`);
  else {
    if (fs.statSync(sourceFile).size !== entry.sourceBytes) errors.push(`${entry.id}: source byte count differs`);
    if (sha256(sourceFile) !== entry.sourceSha256) errors.push(`${entry.id}: source hash differs`);
  }
  if (!natureRuntime?.nodes.includes(entry.runtimeNode)) errors.push(`${entry.id}: runtime node missing (${entry.runtimeNode})`);
}

const publicRoot = path.join(projectRoot, "public");
for (const filePath of walkFiles(publicRoot)) {
  const bytes = fs.statSync(filePath).size;
  if (bytes >= referenceStaticBytes) warnings.push(`${path.relative(projectRoot, filePath)}: static file exceeds the 25 MiB publishing reference`);
}

const chapterManifest = fs.readFileSync(path.join(projectRoot, "app", "game", "manifests", "west-corridor.ts"), "utf8");
const preloadSource = chapterManifest.match(/preload:\s*\[([^\]]*)\]/s)?.[1] ?? "";
const preloadUrls = [...preloadSource.matchAll(/"([^"\n]+)"/g)].map((match) => match[1]);
let preloadBytes = 0;
for (const url of preloadUrls) {
  const runtimeEntry = runtime.find((entry) => entry.file === url);
  const filePath = runtimeEntry?.deliveryMode === "dev-source-pass-through"
    ? path.join(projectRoot, runtimeEntry.sourceRelativePath)
    : publicPath(url);
  if (!fs.existsSync(filePath)) errors.push(`Chapter preload missing: ${url}`);
  else preloadBytes += fs.statSync(filePath).size;
}
if (preloadBytes > referencePreloadBytes) warnings.push(`Chapter preload is ${(preloadBytes / 1048576).toFixed(2)} MiB; 18 MiB is advisory during formal-visual validation, not a blocking gate`);

if (warnings.length) console.warn(warnings.map((warning) => `[advisory] ${warning}`).join("\n"));
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Asset validation passed: ${sources.length} CC BY sources, ${materials.length} CC0 materials, ${nature.length} CC0 nature modules, ${runtime.length} runtime files, ${(preloadBytes / 1048576).toFixed(2)} MiB chapter preload. Visual acceptance remains a separate gate.`);
