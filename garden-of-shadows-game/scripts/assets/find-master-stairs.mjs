import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { Matrix4, Quaternion, Vector3 } from "three";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const glbPath = path.join(projectRoot, "public", "assets", "fidelity", "TYX_Master_Scene.glb");
const document = await new NodeIO().read(glbPath);
const root = document.getRoot();
const masterRoot = new Matrix4().compose(
  new Vector3(-17.26, 6.767, -182.68),
  new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2),
  new Vector3(0.64, 0.64, 0.64),
);
const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const ab = new Vector3();
const ac = new Vector3();
const normal = new Vector3();
const candidates = [];

for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const matrix = masterRoot.clone().multiply(new Matrix4().fromArray(node.getWorldMatrix()));
  const boundsMin = new Vector3(Infinity, Infinity, Infinity);
  const boundsMax = new Vector3(-Infinity, -Infinity, -Infinity);
  const horizontalLevels = [];
  let triangleCount = 0;
  for (const primitive of mesh.listPrimitives()) {
    if (primitive.getMode() !== 4) continue;
    const positions = primitive.getAttribute("POSITION")?.getArray();
    if (!positions) continue;
    const indices = primitive.getIndices()?.getArray();
    const indexAt = (offset) => indices ? Number(indices[offset]) : offset;
    const count = Math.floor((indices?.length ?? positions.length / 3) / 3);
    triangleCount += count;
    for (let triangle = 0; triangle < count; triangle += 1) {
      const ia = indexAt(triangle * 3) * 3;
      const ib = indexAt(triangle * 3 + 1) * 3;
      const ic = indexAt(triangle * 3 + 2) * 3;
      a.set(Number(positions[ia]), Number(positions[ia + 1]), Number(positions[ia + 2])).applyMatrix4(matrix);
      b.set(Number(positions[ib]), Number(positions[ib + 1]), Number(positions[ib + 2])).applyMatrix4(matrix);
      c.set(Number(positions[ic]), Number(positions[ic + 1]), Number(positions[ic + 2])).applyMatrix4(matrix);
      boundsMin.min(a).min(b).min(c);
      boundsMax.max(a).max(b).max(c);
      normal.copy(ab.copy(b).sub(a)).cross(ac.copy(c).sub(a)).normalize();
      if (Math.abs(normal.y) >= 0.965) horizontalLevels.push((a.y + b.y + c.y) / 3);
    }
  }
  if (!Number.isFinite(boundsMin.x) || horizontalLevels.length < 6) continue;
  const size = boundsMax.clone().sub(boundsMin);
  if (size.y < 0.15 || size.y > 4 || Math.min(size.x, size.z) < 0.3 || Math.max(size.x, size.z) > 14) continue;
  const levels = [...new Set(horizontalLevels.map((value) => Number(value.toFixed(2))))].sort((left, right) => left - right);
  if (levels.length < 3 || levels.length > 24) continue;
  const rises = levels.slice(1).map((value, index) => Number((value - levels[index]).toFixed(3)));
  const stepRises = rises.filter((value) => value >= 0.04 && value <= 0.32);
  if (stepRises.length < 2) continue;
  candidates.push({
    nodeName: node.getName(),
    runtimeNodeName: node.getName().replaceAll(".", ""),
    meshName: mesh.getName(),
    triangleCount,
    bounds: {
      min: boundsMin.toArray().map((value) => Number(value.toFixed(3))),
      max: boundsMax.toArray().map((value) => Number(value.toFixed(3))),
      size: size.toArray().map((value) => Number(value.toFixed(3))),
    },
    horizontalLevels: levels,
    plausibleStepRises: stepRises,
    score: levels.length * 4 + stepRises.length * 7 - triangleCount / 500,
  });
}

candidates.sort((left, right) => right.score - left.score);
process.stdout.write(`${JSON.stringify({
  source: path.relative(projectRoot, glbPath).replaceAll("\\", "/"),
  candidateCount: candidates.length,
  candidates: candidates.slice(0, 60),
}, null, 2)}\n`);
