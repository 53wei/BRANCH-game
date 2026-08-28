import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Box3, Matrix4, Quaternion, Vector3 } from "three";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const sourceRoot = path.join(projectRoot, "assets-source", "manual-downloads");
const docsRoot = path.join(projectRoot, "docs", "assets");
const inventoryPath = path.join(docsRoot, "downloaded-3d-assets.json");
const manifestPath = path.join(docsRoot, "asset-manifest.json");
const markdownPath = path.join(docsRoot, "ASSET_MANIFEST.md");

const intendedUse = {
  "ancient-chinese-courtyard-house": "轻量房屋、远景与低画质降级资产",
  "ancient-chinese-courtyard-park": "回廊、园墙、亭、桥、假山与园林拆件来源",
  "chinese-pavilion": "修正比例后的备用亭阁",
  "chinese-pavilion-memoriam": "水榭外观、台基、长凳与岩石来源",
  "low-bridge": "水院低桥与独立简化碰撞",
  "traditional-chinese-siheyuan-courtyard": "正门、前厅、主屋、院墙、门窗与屋面主来源",
};

const processingClass = {
  "ancient-chinese-courtyard-house": { grade: "A", note: "低面数、结构简单；标准化比例后可直接作为北楼/内宅外轮廓。" },
  "ancient-chinese-courtyard-park": { grade: "B", note: "园林内容完整但尺度大、对象跨度广；正式使用需区域摆放与流式加载。" },
  "chinese-pavilion": { grade: "B", note: "比例坐标异常且面数偏高；保留作备用亭阁，不作为当前主水榭。" },
  "chinese-pavilion-memoriam": { grade: "A", note: "水榭、台基、长凳与岩石结构清晰，标准化后直接进入 runtime。" },
  "low-bridge": { grade: "B", note: "几何可用，但旧 Spec/Gloss 扩展需要工作副本兼容转换。" },
  "traditional-chinese-siheyuan-courtyard": { grade: "B", note: "正式建筑质量高，但原始体积和三角面较大；保真接入后再执行 KTX2/Meshopt 与区域预算。" },
};

const previewMode = { "low-bridge": "compatibility-copy" };

const walkFiles = (directory) => {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
};

const sha256 = (filePath) => {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
};

const readGlb = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString("ascii", 0, 4) !== "glTF") throw new Error("Invalid GLB magic: " + filePath);
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    if (chunkType === 0x4e4f534a) {
      return {
        version: buffer.readUInt32LE(4),
        json: JSON.parse(buffer.subarray(offset + 8, offset + 8 + chunkLength).toString("utf8").replace(/\0+$/, "")),
      };
    }
    offset += 8 + chunkLength;
  }
  throw new Error("GLB JSON chunk missing: " + filePath);
};

const primitiveTriangles = (gltf, primitive) => {
  const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION;
  const count = accessorIndex === undefined ? 0 : (gltf.accessors?.[accessorIndex]?.count ?? 0);
  const mode = primitive.mode ?? 4;
  if (mode === 4) return Math.floor(count / 3);
  if (mode === 5 || mode === 6) return Math.max(0, count - 2);
  return 0;
};

const nodeMatrix = (node) => {
  if (node.matrix) return new Matrix4().fromArray(node.matrix);
  return new Matrix4().compose(
    new Vector3().fromArray(node.translation ?? [0, 0, 0]),
    new Quaternion().fromArray(node.rotation ?? [0, 0, 0, 1]),
    new Vector3().fromArray(node.scale ?? [1, 1, 1]),
  );
};

const sceneBounds = (gltf) => {
  const box = new Box3();
  const point = new Vector3();
  const scene = gltf.scenes?.[gltf.scene ?? 0];
  const visit = (nodeIndex, parentMatrix) => {
    const node = gltf.nodes?.[nodeIndex] ?? {};
    const worldMatrix = parentMatrix.clone().multiply(nodeMatrix(node));
    if (node.mesh !== undefined) {
      const mesh = gltf.meshes?.[node.mesh];
      for (const primitive of mesh?.primitives ?? []) {
        const accessor = gltf.accessors?.[primitive.attributes?.POSITION];
        if (!accessor?.min || !accessor?.max) continue;
        for (const x of [accessor.min[0], accessor.max[0]]) {
          for (const y of [accessor.min[1], accessor.max[1]]) {
            for (const z of [accessor.min[2], accessor.max[2]]) {
              box.expandByPoint(point.set(x, y, z).applyMatrix4(worldMatrix));
            }
          }
        }
      }
    }
    for (const childIndex of node.children ?? []) visit(childIndex, worldMatrix);
  };
  for (const rootNode of scene?.nodes ?? []) visit(rootNode, new Matrix4());
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  return {
    min: box.min.toArray().map((value) => Number(value.toFixed(4))),
    max: box.max.toArray().map((value) => Number(value.toFixed(4))),
    size: size.toArray().map((value) => Number(value.toFixed(4))),
    center: center.toArray().map((value) => Number(value.toFixed(4))),
  };
};

const sourceDirectories = fs.existsSync(sourceRoot)
  ? fs.readdirSync(sourceRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  : [];

const entries = sourceDirectories.map((directory) => {
  const id = directory.name;
  const assetDirectory = path.join(sourceRoot, id);
  const files = walkFiles(assetDirectory);
  const glbPath = files
    .filter((file) => path.extname(file).toLowerCase() === ".glb")
    .sort((left, right) => Number(path.dirname(right) === assetDirectory) - Number(path.dirname(left) === assetDirectory))[0];
  if (!glbPath) throw new Error("No GLB found for " + id);
  const parsed = readGlb(glbPath);
  const gltf = parsed.json;
  const extras = gltf.asset?.extras ?? {};
  const primitives = (gltf.meshes ?? []).flatMap((mesh) => mesh.primitives ?? []);
  const externalTextures = files.filter((file) => /\.(png|jpe?g|webp|ktx2)$/i.test(file));
  const sourceFiles = files.filter((file) => /\.(fbx|zip|blend|obj)$/i.test(file));
  return {
    id,
    title: extras.title ?? id,
    sourceFile: path.basename(glbPath),
    relativeSourcePath: path.relative(projectRoot, glbPath).replaceAll("\\", "/"),
    bytes: fs.statSync(glbPath).size,
    sha256: sha256(glbPath),
    format: "GLB",
    glbVersion: parsed.version,
    generator: gltf.asset?.generator ?? "unknown",
    author: extras.author ?? "unknown",
    sourceUrl: extras.source ?? "unknown",
    license: extras.license ?? "unknown",
    webDistribution: "allowed",
    aiUsage: "allowed",
    status: "candidate",
    classification: "pending-preview",
    processingClass: processingClass[id]?.grade ?? "C",
    processingNote: processingClass[id]?.note ?? "尚未进入正式处理链路。",
    intendedUse: intendedUse[id] ?? "待定",
    previewMode: previewMode[id] ?? "raw",
    containsFbx: sourceFiles.some((file) => path.extname(file).toLowerCase() === ".fbx"),
    sourceFileCount: sourceFiles.length,
    externalTextureCount: externalTextures.length,
    metrics: {
      scenes: gltf.scenes?.length ?? 0,
      nodes: gltf.nodes?.length ?? 0,
      meshes: gltf.meshes?.length ?? 0,
      primitives: primitives.length,
      materials: gltf.materials?.length ?? 0,
      textures: gltf.textures?.length ?? 0,
      images: gltf.images?.length ?? 0,
      animations: gltf.animations?.length ?? 0,
      skins: gltf.skins?.length ?? 0,
      trianglesApprox: primitives.reduce((sum, primitive) => sum + primitiveTriangles(gltf, primitive), 0),
    },
    bounds: sceneBounds(gltf),
    meshNodes: (gltf.nodes ?? []).filter((node) => node.mesh !== undefined).map((node) => node.name ?? gltf.meshes?.[node.mesh]?.name ?? ("mesh-" + node.mesh)),
    extensionsUsed: gltf.extensionsUsed ?? [],
    extensionsRequired: gltf.extensionsRequired ?? [],
  };
}).sort((a, b) => a.id.localeCompare(b.id));

fs.mkdirSync(docsRoot, { recursive: true });
fs.writeFileSync(inventoryPath, JSON.stringify(entries, null, 2) + "\n");

const existingManifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : [];
const retainedManifest = existingManifest.filter((entry) => !entries.some((asset) => asset.id === entry.id));
const manifestEntries = entries.map((entry) => ({
  id: entry.id,
  title: entry.title,
  sourceUrl: entry.sourceUrl,
  author: entry.author,
  version: "SHA-256 " + entry.sha256.slice(0, 12),
  license: entry.license,
  webDistribution: entry.webDistribution,
  aiUsage: entry.aiUsage,
  integritySha256: entry.sha256,
  status: entry.status,
  sourceFile: entry.relativeSourcePath,
  metrics: entry.metrics,
}));
fs.writeFileSync(manifestPath, JSON.stringify([...retainedManifest, ...manifestEntries], null, 2) + "\n");

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);
const markdown = [
  "# 已下载 3D 资产清单",
  "",
  "> 由 npm run assets:inventory 从本地只读原件生成。原件不进入 Git，SHA-256 用于确认 Source → Working → Runtime 链路。",
  "",
  "| ID | 标题 | 大小 | 网格 | 材质 | 纹理 | 约三角面 | 许可 | 处理级别 | 预期用途 | 状态 |",
  "|---|---|---:|---:|---:|---:|---:|---|---|---|---|",
  ...entries.map((entry) => "| " + entry.id + " | " + entry.title + " | " + mb(entry.bytes) + " MiB | " + entry.metrics.meshes + " | " + entry.metrics.materials + " | " + entry.metrics.textures + " | " + entry.metrics.trianglesApprox.toLocaleString("en-US") + " | " + entry.license + " | " + entry.processingClass + " | " + entry.intendedUse + " | " + entry.classification + " |"),
  "",
  "## 原件规则",
  "",
  "- assets-source/manual-downloads/ 只读、Git 忽略，禁止原地覆盖。",
  "- 所有转换写入 assets-source/blender-working/，正式文件只写入 public/assets/。",
  "- 每个运行时文件必须能追溯到本表 SHA-256；许可、作者、来源或哈希缺失时不得标记 approved。",
  "",
];
fs.writeFileSync(markdownPath, markdown.join("\n") + "\n");
console.log("Wrote " + entries.length + " assets to " + path.relative(projectRoot, inventoryPath));
