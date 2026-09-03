import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { Matrix4, Quaternion, Vector3 } from "three";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const glbPath = path.join(projectRoot, "public", "assets", "fidelity", "TYX_Master_Scene.glb");
const document = await new NodeIO().read(glbPath);
const root = document.getRoot();

const namedProbes = [
  { id: "C_WATER_EDGE", x: -23.8, z: 12.8 },
  { id: "C_WOODEN_STEPS", x: -25.8, z: 11.4 },
  { id: "C_FALL_POINT", x: -27.2, z: 10.1 },
  { id: "C_FINAL_PAVILION", x: -28.5, z: 7.4 },
];
const routeSamples = namedProbes.slice(0, -1).flatMap((from, segmentIndex) => {
  const to = namedProbes[segmentIndex + 1];
  return Array.from({ length: 17 }, (_, sampleIndex) => {
    const t = sampleIndex / 16;
    return {
      id: `C_ROUTE_${segmentIndex + 1}_${sampleIndex}`,
      x: from.x + (to.x - from.x) * t,
      z: from.z + (to.z - from.z) * t,
      segment: `${from.id}->${to.id}`,
      t,
    };
  });
});
const probes = [...namedProbes, ...routeSamples];

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
const results = Object.fromEntries(probes.map((probe) => [probe.id, []]));
const structureTriangles = [];

const projectedIntersectionY = (probe, va, vb, vc) => {
  const denominator = (vb.z - vc.z) * (va.x - vc.x) + (vc.x - vb.x) * (va.z - vc.z);
  if (Math.abs(denominator) < 1e-9) return undefined;
  const wa = ((vb.z - vc.z) * (probe.x - vc.x) + (vc.x - vb.x) * (probe.z - vc.z)) / denominator;
  const wb = ((vc.z - va.z) * (probe.x - vc.x) + (va.x - vc.x) * (probe.z - vc.z)) / denominator;
  const wc = 1 - wa - wb;
  if (wa < -1e-6 || wb < -1e-6 || wc < -1e-6) return undefined;
  return wa * va.y + wb * vb.y + wc * vc.y;
};

for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const runtimeMatrix = masterRoot.clone().multiply(new Matrix4().fromArray(node.getWorldMatrix()));
  for (const [primitiveIndex, primitive] of mesh.listPrimitives().entries()) {
    if (primitive.getMode() !== 4) continue;
    const positions = primitive.getAttribute("POSITION")?.getArray();
    if (!positions) continue;
    const indices = primitive.getIndices()?.getArray();
    const indexAt = (offset) => indices ? Number(indices[offset]) : offset;
    const triangleCount = Math.floor((indices?.length ?? positions.length / 3) / 3);
    for (let triangleIndex = 0; triangleIndex < triangleCount; triangleIndex += 1) {
      const ia = indexAt(triangleIndex * 3) * 3;
      const ib = indexAt(triangleIndex * 3 + 1) * 3;
      const ic = indexAt(triangleIndex * 3 + 2) * 3;
      a.set(Number(positions[ia]), Number(positions[ia + 1]), Number(positions[ia + 2])).applyMatrix4(runtimeMatrix);
      b.set(Number(positions[ib]), Number(positions[ib + 1]), Number(positions[ib + 2])).applyMatrix4(runtimeMatrix);
      c.set(Number(positions[ic]), Number(positions[ic + 1]), Number(positions[ic + 2])).applyMatrix4(runtimeMatrix);
      const minX = Math.min(a.x, b.x, c.x);
      const maxX = Math.max(a.x, b.x, c.x);
      const minZ = Math.min(a.z, b.z, c.z);
      const maxZ = Math.max(a.z, b.z, c.z);
      ab.copy(b).sub(a);
      ac.copy(c).sub(a);
      normal.copy(ab).cross(ac).normalize();
      if (node.getName() === "20b9b240.o" && Math.abs(normal.y) >= 0.35) {
        const centroid = a.clone().add(b).add(c).multiplyScalar(1 / 3);
        structureTriangles.push({
          triangle: triangleIndex,
          primitive: primitiveIndex,
          material: primitive.getMaterial()?.getName() ?? "",
          vertices: [a, b, c].map((point) => point.toArray().map((value) => Number(value.toFixed(4)))),
          centroid: centroid.toArray().map((value) => Number(value.toFixed(4))),
          normal: normal.toArray().map((value) => Number(value.toFixed(4))),
          slopeDegrees: Number((Math.acos(Math.min(1, Math.abs(normal.y))) * 180 / Math.PI).toFixed(2)),
        });
      }
      for (const probe of probes) {
        if (probe.x < minX || probe.x > maxX || probe.z < minZ || probe.z > maxZ) continue;
        const y = projectedIntersectionY(probe, a, b, c);
        if (y === undefined || !Number.isFinite(y)) continue;
        results[probe.id].push({
          y: Number(y.toFixed(4)),
          absNormalY: Number(Math.abs(normal.y).toFixed(4)),
          node: node.getName(),
          mesh: mesh.getName(),
          primitive: primitiveIndex,
          material: primitive.getMaterial()?.getName() ?? "",
        });
      }
    }
  }
}

for (const probe of probes) {
  const hits = results[probe.id]
    .filter((hit) => hit.y >= -1 && hit.y <= 12)
    .sort((left, right) => left.y - right.y);
  const unique = [];
  for (const hit of hits) {
    if (unique.some((candidate) => Math.abs(candidate.y - hit.y) < 0.005 && candidate.node === hit.node)) continue;
    unique.push(hit);
  }
  results[probe.id] = unique;
}

process.stdout.write(`${JSON.stringify({
  source: path.relative(projectRoot, glbPath).replaceAll("\\", "/"),
  probes: namedProbes.map((probe) => ({ ...probe, intersections: results[probe.id] })),
  routeSamples: routeSamples.map((probe) => ({
    ...probe,
    walkableIntersections: results[probe.id].filter((hit) => hit.absNormalY >= 0.7),
  })),
  structureTriangles: structureTriangles.sort((left, right) => left.centroid[1] - right.centroid[1]),
}, null, 2)}\n`);
