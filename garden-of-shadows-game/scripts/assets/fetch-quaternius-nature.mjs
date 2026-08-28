import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const workspaceRoot = path.resolve(projectRoot, "..");
const sourceRoot = path.join(projectRoot, "assets-source", "cc0-auto", "quaternius-stylized-nature-megakit");
const manifestPath = path.join(projectRoot, "docs", "assets", "cc0-nature.json");
const blender = process.env.BLENDER_PATH || path.join(workspaceRoot, ".tools", "blender-5.2.1-windows-x64", "blender.exe");

const selections = [
  { id: "bush-a", publicId: "EoTERLq3z2", kind: "shrub", nodeName: "Quaternius_Bush_A" },
  { id: "bush-flowers-a", publicId: "U1ymDy8tbY", kind: "shrub", nodeName: "Quaternius_Bush_Flowers_A" },
  { id: "plant-big-a", publicId: "uwJ1rwrZlB", kind: "shrub", nodeName: "Quaternius_Plant_Big_A" },
  { id: "tree-a", publicId: "QVOop92WmG", kind: "tree", nodeName: "Quaternius_Tree_A" },
  { id: "tree-b", publicId: "YWjGDJ9F7g", kind: "tree", nodeName: "Quaternius_Tree_B" },
  { id: "grass-a", publicId: "vUJjrRsFp4", kind: "ground-cover", nodeName: "Quaternius_Grass_A" },
  { id: "fern-a", publicId: "jqcanvH7D6", kind: "ground-cover", nodeName: "Quaternius_Fern_A" },
  { id: "rock-a", publicId: "KZdEP3uUpa", kind: "rock", nodeName: "Quaternius_Rock_A" },
  { id: "rock-b", publicId: "s1OJ3bBzqc", kind: "rock", nodeName: "Quaternius_Rock_B" },
  { id: "rock-c", publicId: "JQxF95498B", kind: "rock", nodeName: "Quaternius_Rock_C" },
];

const sha256 = (data) => crypto.createHash("sha256").update(data).digest("hex");
const fetchBuffer = async (url) => {
  const response = await fetch(url, { headers: { "user-agent": "garden-of-shadows-asset-pipeline/1.1" } });
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
};
fs.mkdirSync(sourceRoot, { recursive: true });
const manifest = [];

for (const selection of selections) {
  const pageUrl = `https://poly.pizza/m/${selection.publicId}`;
  const page = (await fetchBuffer(pageUrl)).toString("utf8");
  const resourceId = page.match(/"ResourceID":"([^"]+)"/)?.[1];
  const title = page.match(/"Title":"([^"]+)"/)?.[1];
  const triangles = Number(page.match(/"Tris":(\d+)/)?.[1] ?? 0);
  const author = page.match(/"Creator":\{"Username":"([^"]+)"/)?.[1];
  if (!resourceId || !title || author !== "Quaternius") throw new Error(`${selection.publicId}: incomplete Poly Pizza metadata`);
  const sourceUrl = `https://static.poly.pizza/${resourceId}.glb`;
  const sourcePath = path.join(sourceRoot, `${selection.id}.glb`);
  const sourceBuffer = fs.existsSync(sourcePath) ? fs.readFileSync(sourcePath) : await fetchBuffer(sourceUrl);
  if (!fs.existsSync(sourcePath)) fs.writeFileSync(sourcePath, sourceBuffer);

  manifest.push({
    id: `quaternius-${selection.id}`,
    title,
    kind: selection.kind,
    author,
    originalPackUrl: "https://quaternius.com/packs/stylizednaturemegakit.html",
    mirrorModelUrl: pageUrl,
    sourceUrl,
    license: "CC0-1.0",
    status: "candidate",
    sourceSha256: sha256(sourceBuffer),
    sourceBytes: sourceBuffer.byteLength,
    triangles,
    runtimeAssetId: "tyx-nat-quaternius-set-a",
    runtimeUrl: "/assets/nature/TYX_NAT_Quaternius_Set_A.glb",
    runtimeNode: selection.nodeName,
  });
  console.log(`Audited ${selection.id} (${selection.kind}, ${triangles} triangles).`);
}

if (!fs.existsSync(blender)) throw new Error("Verified Blender 5.2.1 LTS is required to assemble the Quaternius subset.");
const blenderScript = path.join(projectRoot, "scripts", "assets", "build_quaternius_nature.py");
const blenderResult = spawnSync(blender, ["--background", "--factory-startup", "--python", blenderScript, "--", projectRoot], { cwd: projectRoot, shell: false, stdio: "inherit" });
if (blenderResult.error) throw blenderResult.error;
if (blenderResult.status !== 0) process.exit(blenderResult.status ?? 1);

fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log("Wrote 10 audited Quaternius CC0 nature entries and Blender working set.");
