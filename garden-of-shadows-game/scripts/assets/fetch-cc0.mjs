import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const workspaceRoot = path.resolve(projectRoot, "..");
const sourceRoot = path.join(projectRoot, "assets-source", "cc0-auto", "polyhaven");
const outputRoot = path.join(projectRoot, "public", "assets", "materials");
const manifestPath = path.join(projectRoot, "docs", "assets", "cc0-materials.json");
const ktx = path.join(workspaceRoot, ".tools", "KTX-Software-4.4.2", "bin", process.platform === "win32" ? "ktx.exe" : "ktx");

const materials = [
  { materialIds: ["plaster-old"], assetId: "worn_plaster_wall" },
  { materialIds: ["plaster-wet"], assetId: "white_rough_plaster" },
  { materialIds: ["wood-dark-dry"], assetId: "dark_wooden_planks" },
  { materialIds: ["wood-dark-wet", "wood-painted-old"], assetId: "weathered_planks" },
  { materialIds: ["roof-grey"], assetId: "grey_roof_tiles" },
  { materialIds: ["stone-old"], assetId: "stone_tiles_02" },
  { materialIds: ["stone-wet", "mud-wet"], assetId: "stone_tiles_03" },
  { materialIds: ["stone-moss"], assetId: "mossy_rock" },
];

const maps = [
  { slot: "diff", apiKey: "Diffuse", format: "R8G8B8_SRGB", transfer: "srgb" },
  { slot: "nor_gl", apiKey: "nor_gl", format: "R8G8B8_UNORM", transfer: "linear" },
  { slot: "arm", apiKey: "arm", format: "R8G8B8_UNORM", transfer: "linear" },
];

const digest = (algorithm, data) => crypto.createHash(algorithm).update(data).digest("hex");
const getJson = async (url) => {
  const response = await fetch(url, { headers: { "user-agent": "garden-of-shadows-asset-pipeline/1.1" } });
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return response.json();
};

if (!fs.existsSync(ktx)) throw new Error("Verified KTX-Software 4.4.2 is required before fetching CC0 materials.");
fs.mkdirSync(sourceRoot, { recursive: true });
fs.mkdirSync(outputRoot, { recursive: true });
const manifest = [];

for (const material of materials) {
  const [files, info] = await Promise.all([
    getJson(`https://api.polyhaven.com/files/${material.assetId}`),
    getJson(`https://api.polyhaven.com/info/${material.assetId}`),
  ]);
  const entry = {
    id: `polyhaven-${material.assetId}-1k`,
    title: info.name,
    sourceUrl: `https://polyhaven.com/a/${material.assetId}`,
    apiUrl: `https://api.polyhaven.com/files/${material.assetId}`,
    author: Object.keys(info.authors ?? {}).join(", "),
    license: "CC0-1.0",
    resolution: "1k",
    materialIds: material.materialIds,
    status: "approved",
    maps: [],
  };
  const sourceDirectory = path.join(sourceRoot, material.assetId);
  const outputDirectory = path.join(outputRoot, material.assetId);
  fs.mkdirSync(sourceDirectory, { recursive: true });
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const map of maps) {
    const remote = files?.[map.apiKey]?.["1k"]?.jpg;
    if (!remote?.url || !remote?.md5) throw new Error(`${material.assetId}: missing 1K JPG ${map.apiKey}`);
    const sourcePath = path.join(sourceDirectory, `${material.assetId}_${map.slot}_1k.jpg`);
    let sourceBuffer;
    if (fs.existsSync(sourcePath) && digest("md5", fs.readFileSync(sourcePath)) === remote.md5) {
      sourceBuffer = fs.readFileSync(sourcePath);
    } else {
      const response = await fetch(remote.url, { headers: { "user-agent": "garden-of-shadows-asset-pipeline/1.1" } });
      if (!response.ok) throw new Error(`${remote.url}: ${response.status} ${response.statusText}`);
      sourceBuffer = Buffer.from(await response.arrayBuffer());
      if (digest("md5", sourceBuffer) !== remote.md5) throw new Error(`${material.assetId}/${map.slot}: Poly Haven MD5 mismatch`);
      fs.writeFileSync(sourcePath, sourceBuffer);
    }

    const outputPath = path.join(outputDirectory, `${material.assetId}_${map.slot}_1k.ktx2`);
    const result = spawnSync(ktx, [
      "create", "--format", map.format, "--assign-tf", map.transfer,
      "--generate-mipmap", "--encode", "uastc", "--uastc-quality", "2",
      "--uastc-rdo", "--uastc-rdo-l", "1", "--zstd", "18", "--testrun",
      sourcePath, outputPath,
    ], { cwd: projectRoot, shell: false, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
    const outputBuffer = fs.readFileSync(outputPath);
    entry.maps.push({
      slot: map.slot,
      sourceUrl: remote.url,
      sourceMd5: remote.md5,
      sourceSha256: digest("sha256", sourceBuffer),
      runtimeUrl: path.relative(path.join(projectRoot, "public"), outputPath).replaceAll("\\", "/").replace(/^/, "/"),
      runtimeBytes: outputBuffer.byteLength,
      runtimeSha256: digest("sha256", outputBuffer),
    });
  }
  manifest.push(entry);
  console.log(`Prepared ${material.assetId} (1K, 3 maps).`);
}

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${manifest.length} audited CC0 material entries.`);
