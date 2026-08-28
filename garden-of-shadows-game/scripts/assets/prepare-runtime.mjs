import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const workspaceRoot = path.resolve(projectRoot, "..");
const rawRoot = path.join(projectRoot, "assets-source", "blender-working", "runtime-raw");
const docsRoot = path.join(projectRoot, "docs", "assets");
const ktxBin = path.join(workspaceRoot, ".tools", "KTX-Software-4.4.2", "bin");
const cli = process.execPath;
const cliScript = path.join(projectRoot, "node_modules", "@gltf-transform", "cli", "bin", "cli.js");
const referenceStaticBytes = 25 * 1024 * 1024;

const assets = [
  {
    id: "tyx-arch-siheyuan-source-a",
    file: "TYX_ARCH_Siheyuan_Source_A.glb",
    output: "public/assets/fidelity/architecture/TYX_ARCH_Siheyuan_Source_A.glb",
    sources: ["traditional-chinese-siheyuan-courtyard"],
    preload: true,
    sourceRelativePath: "assets-source/manual-downloads/traditional-chinese-siheyuan-courtyard/traditional_chinese_siheyuan_courtyard.glb",
    workingRelativePath: "assets-source/blender-working/fidelity/TYX_ARCH_Siheyuan_Source_A.glb",
    // Phase-one visual validation must begin with the audited source geometry
    // and textures. The current Sketchfab texture colourspace trips the local
    // UASTC/libvips conversion, so compression remains a later measured step
    // instead of becoming a gate that prevents the real model from loading.
    preserveUncompressed: true,
    optimizationStage: "source-faithful-runtime",
  },
  {
    id: "tyx-env-courtyard-park-source-a",
    file: "TYX_ENV_Courtyard_Park_Source_A.glb",
    output: "public/assets/fidelity/environment/TYX_ENV_Courtyard_Park_Source_A.glb",
    sources: ["ancient-chinese-courtyard-park"],
    preload: false,
    sourceRelativePath: "assets-source/manual-downloads/ancient-chinese-courtyard-park/ancient_chinese_courtyard_park.glb",
    workingRelativePath: "assets-source/blender-working/fidelity/TYX_ENV_Courtyard_Park_Source_A.glb",
    preserveUncompressed: true,
    optimizationStage: "source-faithful-runtime",
  },
  {
    id: "tyx-arch-greybox-fallback-a",
    file: "TYX_ARCH_Greybox_Fallback_A.glb",
    legacyRawFile: "TYX_ARCH_Kit_A.glb",
    output: "public/assets/architecture/TYX_ARCH_Kit_A.glb",
    sources: ["project-authored"],
    preload: false,
    requiredNodes: [
      "Corridor_Straight_4m", "Corridor_Straight_8m", "Corridor_Corner", "Wall_Solid",
      "Wall_Window", "Wall_MoonGate_Base", "Door_Wood", "Window_Lattice", "House_Small", "Roof_Grey",
    ],
    optimizationStage: "fallback-only",
  },
  {
    id: "tyx-arch-house-a",
    file: "TYX_ARCH_House_A.glb",
    output: "public/assets/architecture/TYX_ARCH_House_A.glb",
    sources: ["ancient-chinese-courtyard-house"],
    preload: false,
  },
  {
    id: "tyx-arch-pavilion-a",
    file: "TYX_ARCH_Pavilion_A.glb",
    output: "public/assets/architecture/TYX_ARCH_Pavilion_A.glb",
    sources: ["chinese-pavilion-memoriam"],
    preload: false,
  },
  {
    id: "tyx-arch-pavilion-b",
    file: "TYX_ARCH_Pavilion_B.glb",
    output: "public/assets/architecture/TYX_ARCH_Pavilion_B.glb",
    sources: ["chinese-pavilion"],
    preload: false,
  },
  {
    id: "tyx-gmp-bridge-low-a",
    file: "TYX_GMP_Bridge_Low_A.glb",
    output: "public/assets/gameplay/TYX_GMP_Bridge_Low_A.glb",
    sources: ["low-bridge"],
    preload: false,
    compatibilityConversion: "KHR_materials_pbrSpecularGlossiness to metallic-roughness on a working copy",
  },
  {
    id: "tyx-gmp-moon-gate-collision",
    file: "TYX_GMP_MoonGate_Collision.glb",
    output: "public/assets/gameplay/TYX_GMP_MoonGate_Collision.glb",
    sources: ["project-authored"],
    preload: false,
    preserveUncompressed: true,
  },
  {
    id: "tyx-nat-rock-set-a",
    file: "TYX_NAT_Rock_Set_A.glb",
    output: "public/assets/nature/TYX_NAT_Rock_Set_A.glb",
    sources: ["chinese-pavilion-memoriam"],
    preload: false,
    requiredNodes: ["Rock_A", "Rock_B", "Rock_C"],
  },
  {
    id: "tyx-nat-quaternius-set-a",
    file: "TYX_NAT_Quaternius_Set_A.glb",
    output: "public/assets/nature/TYX_NAT_Quaternius_Set_A.glb",
    sources: ["quaternius-stylized-nature-megakit"],
    license: "CC0-1.0",
    preload: false,
    requiredNodes: [
      "Quaternius_Bush_A", "Quaternius_Bush_Flowers_A", "Quaternius_Plant_Big_A",
      "Quaternius_Tree_A", "Quaternius_Tree_B", "Quaternius_Grass_A", "Quaternius_Fern_A",
      "Quaternius_Rock_A", "Quaternius_Rock_B", "Quaternius_Rock_C",
    ],
  },
];

const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const readGlbJson = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString("ascii", 0, 4) !== "glTF") throw new Error(`Invalid GLB: ${filePath}`);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    if (type === 0x4e4f534a) {
      return JSON.parse(buffer.subarray(offset + 8, offset + 8 + length).toString("utf8").replace(/\0+$/, ""));
    }
    offset += 8 + length;
  }
  throw new Error(`Missing GLB JSON chunk: ${filePath}`);
};

if (!fs.existsSync(cliScript)) throw new Error("Run npm install before preparing runtime assets.");
if (!fs.existsSync(path.join(ktxBin, "ktx.exe"))) {
  throw new Error("Verified KTX-Software 4.4.2 is missing from .tools/KTX-Software-4.4.2/bin.");
}

const childEnv = { ...process.env, PATH: `${ktxBin}${path.delimiter}${process.env.PATH ?? ""}` };
for (const asset of assets) {
  let source = path.join(rawRoot, asset.file);
  if (!fs.existsSync(source) && asset.legacyRawFile) source = path.join(rawRoot, asset.legacyRawFile);
  if (asset.sourceRelativePath) {
    const original = path.join(projectRoot, asset.sourceRelativePath);
    if (!fs.existsSync(original)) throw new Error(`Missing audited source asset: ${original}`);
    const working = path.join(projectRoot, asset.workingRelativePath);
    fs.mkdirSync(path.dirname(working), { recursive: true });
    if (!fs.existsSync(working) || sha256(working) !== sha256(original)) fs.copyFileSync(original, working);
    source = working;
  }
  const output = path.join(projectRoot, asset.output);
  if (!fs.existsSync(source)) throw new Error(`Missing runtime working copy: ${source}. Run npm run assets:build-blender for authored derivatives.`);
  fs.mkdirSync(path.dirname(output), { recursive: true });

  if (asset.preserveUncompressed) {
    fs.copyFileSync(source, output);
  } else {
    const ktxOutput = path.join(projectRoot, "assets-source", "blender-working", "runtime-ktx", asset.file);
    fs.mkdirSync(path.dirname(ktxOutput), { recursive: true });
    const textureResult = spawnSync(
      cli,
      [cliScript, "uastc", source, ktxOutput, "--jobs", "4", "--rdo", "--zstd", "18"],
      { cwd: projectRoot, env: childEnv, shell: false, stdio: "inherit" },
    );
    if (textureResult.error) throw textureResult.error;
    if (textureResult.status !== 0) process.exit(textureResult.status ?? 1);
    const args = [
      "optimize", ktxOutput, output,
      "--compress", "meshopt",
      "--texture-compress", "false",
      "--flatten", "false",
      "--join", "false",
      "--palette", "false",
      "--simplify", "false",
    ];
    const result = spawnSync(cli, [cliScript, ...args], { cwd: projectRoot, env: childEnv, shell: false, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
  }

  const validation = spawnSync(cli, [cliScript, "validate", output], { cwd: projectRoot, env: childEnv, shell: false, stdio: "inherit" });
  if (validation.error) throw validation.error;
  if (validation.status !== 0) process.exit(validation.status ?? 1);
  if (fs.statSync(output).size >= referenceStaticBytes) {
    console.warn(`[reference budget] ${asset.file} is ${(fs.statSync(output).size / 1048576).toFixed(2)} MiB; keep for visual validation, optimize only after in-scene measurement.`);
  }
}

const basisSource = path.join(projectRoot, "node_modules", "three", "examples", "jsm", "libs", "basis");
const basisOutput = path.join(projectRoot, "public", "basis");
fs.mkdirSync(basisOutput, { recursive: true });
for (const filename of ["basis_transcoder.js", "basis_transcoder.wasm"]) {
  const source = path.join(basisSource, filename);
  if (!fs.existsSync(source)) throw new Error(`Three.js Basis transcoder missing: ${source}`);
  fs.copyFileSync(source, path.join(basisOutput, filename));
}

const runtimeEntries = assets.map((asset) => {
  const output = path.join(projectRoot, asset.output);
  const gltf = readGlbJson(output);
  return {
    id: asset.id,
    file: asset.output.replace(/^public/, ""),
    bytes: fs.statSync(output).size,
    sha256: sha256(output),
    sourceAssetIds: asset.sources,
    license: asset.license ?? (asset.sources[0] === "project-authored" ? "project-owned" : "CC-BY-4.0"),
    status: "candidate",
    preload: asset.preload,
    requiredNodes: asset.requiredNodes ?? [],
    compatibilityConversion: asset.compatibilityConversion,
    optimizationStage: asset.optimizationStage ?? "optimized-runtime",
    extensionsUsed: gltf.extensionsUsed ?? [],
    extensionsRequired: gltf.extensionsRequired ?? [],
    nodes: (gltf.nodes ?? []).map((node) => node.name).filter(Boolean),
  };
});

fs.mkdirSync(docsRoot, { recursive: true });
fs.writeFileSync(path.join(docsRoot, "runtime-assets.json"), `${JSON.stringify(runtimeEntries, null, 2)}\n`);
const total = runtimeEntries.reduce((sum, entry) => sum + entry.bytes, 0);
const preload = runtimeEntries.filter((entry) => entry.preload).reduce((sum, entry) => sum + entry.bytes, 0);
console.log(`Prepared ${runtimeEntries.length} runtime assets (${(total / 1048576).toFixed(2)} MiB total, ${(preload / 1048576).toFixed(2)} MiB preload).`);
