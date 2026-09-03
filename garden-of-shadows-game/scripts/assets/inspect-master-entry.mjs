import fs from "node:fs";
import path from "node:path";
import { Box3, Euler, Matrix4, Quaternion, Vector3 } from "three";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const glbPath = path.join(projectRoot, "public", "assets", "fidelity", "TYX_Master_Scene.glb");
const buffer = fs.readFileSync(glbPath);
const authoredArchitecture = process.argv.includes("--authored-architecture");
const scaleCandidates = process.argv.includes("--scale-candidates");
const gateAudit = process.argv.includes("--gate-audit");
const specialStructures = process.argv.includes("--special-structures");
const allMeshes = process.argv.includes("--all-meshes");
let offset = 12;
let gltf;
while (offset + 8 <= buffer.length) {
  const length = buffer.readUInt32LE(offset);
  const type = buffer.readUInt32LE(offset + 4);
  if (type === 0x4e4f534a) {
    gltf = JSON.parse(buffer.subarray(offset + 8, offset + 8 + length).toString("utf8").replace(/\0+$/, ""));
    break;
  }
  offset += 8 + length;
}
if (!gltf) throw new Error("Master GLB JSON chunk missing");

const localMatrix = (node) => node.matrix
  ? new Matrix4().fromArray(node.matrix)
  : new Matrix4().compose(
    new Vector3().fromArray(node.translation ?? [0, 0, 0]),
    new Quaternion().fromArray(node.rotation ?? [0, 0, 0, 1]),
    new Vector3().fromArray(node.scale ?? [1, 1, 1]),
  );

const masterRoot = new Matrix4().compose(
  new Vector3(-17.26, 6.767, -182.68),
  new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)),
  new Vector3(0.64, 0.64, 0.64),
);
const rows = [];
const nodeRecords = [];
const visit = (nodeIndex, parentMatrix, ancestors = []) => {
  const node = gltf.nodes?.[nodeIndex] ?? {};
  const nodeName = node.name ?? gltf.meshes?.[node.mesh]?.name ?? `node-${nodeIndex}`;
  const world = parentMatrix.clone().multiply(localMatrix(node));
  const runtimeWorld = masterRoot.clone().multiply(world);
  const runtimePosition = new Vector3();
  const runtimeQuaternion = new Quaternion();
  const runtimeScale = new Vector3();
  runtimeWorld.decompose(runtimePosition, runtimeQuaternion, runtimeScale);
  nodeRecords.push({
    index: nodeIndex,
    name: nodeName,
    path: [...ancestors, nodeName].join(" / "),
    children: (node.children ?? []).map((childIndex) => gltf.nodes?.[childIndex]?.name ?? `node-${childIndex}`),
    position: runtimePosition.toArray(),
    quaternion: runtimeQuaternion.toArray(),
    scale: runtimeScale.toArray(),
  });
  if (node.mesh !== undefined) {
    const box = new Box3();
    const point = new Vector3();
    const primitives = gltf.meshes?.[node.mesh]?.primitives ?? [];
    for (const primitive of primitives) {
      const accessor = gltf.accessors?.[primitive.attributes?.POSITION];
      if (!accessor?.min || !accessor?.max) continue;
      for (const x of [accessor.min[0], accessor.max[0]]) for (const y of [accessor.min[1], accessor.max[1]]) for (const z of [accessor.min[2], accessor.max[2]]) {
        box.expandByPoint(point.set(x, y, z).applyMatrix4(world).applyMatrix4(masterRoot));
      }
    }
    const intersectsRuntimeEntry = box.max.x >= 7 && box.min.x <= 11.5 && box.max.z >= 45.5 && box.min.z <= 50.5 && box.max.y >= 1.2;
    const size = box.getSize(new Vector3());
    const playableScaleCandidate = scaleCandidates
      && (ancestors.includes("A_OuterGarden_Environment") || ancestors.includes("B_CoreGarden_Primary"))
      && box.min.y >= -0.65 && box.min.y <= 2.5
      && size.y >= 0.025 && size.y <= 0.65
      && Math.max(size.x, size.z) >= 0.25;
    const gateAuditCandidate = gateAudit && [...ancestors, nodeName].some((name) => /TYX_MAIN_GATE_SOUTH/i.test(name));
    const specialStructureCandidate = specialStructures && [
      ...ancestors,
      nodeName,
      ...primitives.map((primitive) => gltf.materials?.[primitive.material]?.name ?? ""),
    ].some((name) => /(door|gate|moon|rail|balust|fence|stair|step|threshold|parapet)/i.test(name));
    if (!box.isEmpty() && (allMeshes || intersectsRuntimeEntry || playableScaleCandidate || gateAuditCandidate || specialStructureCandidate || (authoredArchitecture && /^(TYX_|MOD_A_|CONN_)/.test(nodeName)))) {
      rows.push({
        name: nodeName,
        path: [...ancestors, nodeName].join(" / "),
        min: box.min.toArray().map((value) => Number(value.toFixed(2))),
        max: box.max.toArray().map((value) => Number(value.toFixed(2))),
        center: box.getCenter(new Vector3()).toArray().map((value) => Number(value.toFixed(2))),
        size: box.getSize(new Vector3()).toArray().map((value) => Number(value.toFixed(2))),
        materials: primitives.map((primitive) => {
          const material = gltf.materials?.[primitive.material] ?? {};
          const accessor = gltf.accessors?.[primitive.attributes?.POSITION];
          const primitiveBox = new Box3();
          if (accessor?.min && accessor?.max) {
            for (const x of [accessor.min[0], accessor.max[0]]) for (const y of [accessor.min[1], accessor.max[1]]) for (const z of [accessor.min[2], accessor.max[2]]) {
              primitiveBox.expandByPoint(new Vector3(x, y, z).applyMatrix4(world).applyMatrix4(masterRoot));
            }
          }
          return {
            index: primitive.material,
            name: material.name ?? `material-${primitive.material}`,
            alphaMode: material.alphaMode ?? "OPAQUE",
            doubleSided: Boolean(material.doubleSided),
            baseColorTexture: material.pbrMetallicRoughness?.baseColorTexture?.index ?? null,
            bounds: primitiveBox.isEmpty() ? null : {
              min: primitiveBox.min.toArray().map((value) => Number(value.toFixed(3))),
              max: primitiveBox.max.toArray().map((value) => Number(value.toFixed(3))),
              size: primitiveBox.getSize(new Vector3()).toArray().map((value) => Number(value.toFixed(3))),
            },
          };
        }),
      });
    }
  }
  for (const child of node.children ?? []) visit(child, world, [...ancestors, nodeName]);
};
for (const root of gltf.scenes?.[gltf.scene ?? 0]?.nodes ?? []) visit(root, new Matrix4());

rows.sort((a, b) => a.name.localeCompare(b.name));
if (gateAudit) {
  const gate = nodeRecords.find((record) => record.name === "TYX_MAIN_GATE_SOUTH");
  if (!gate) throw new Error("TYX_MAIN_GATE_SOUTH node missing from Master GLB");
  const descendantRows = rows.filter((row) => row.path === gate.path || row.path.startsWith(`${gate.path} / `));
  const bounds = descendantRows.reduce((box, row) => box.union(new Box3(
    new Vector3().fromArray(row.min),
    new Vector3().fromArray(row.max),
  )), new Box3());
  const quaternion = new Quaternion().fromArray(gate.quaternion);
  const localRight = new Vector3(1, 0, 0).applyQuaternion(quaternion).normalize();
  const localForward = new Vector3(0, 0, 1).applyQuaternion(quaternion).normalize();
  const localUp = new Vector3(0, 1, 0).applyQuaternion(quaternion).normalize();
  const center = bounds.getCenter(new Vector3());
  const size = bounds.getSize(new Vector3());
  const atPlayerHeight = (point) => [point.x, 0.9, point.z].map((value) => Number(value.toFixed(4)));
  const plusForward = center.clone().addScaledVector(localForward, 1.6);
  const minusForward = center.clone().addScaledVector(localForward, -2.4);
  const projectedHalfExtent = Math.abs(localForward.x) * size.x * 0.5 + Math.abs(localForward.z) * size.z * 0.5;
  const exteriorPlaneCenter = center.clone().addScaledVector(localForward, projectedHalfExtent);
  const selectedOutsideSpawn = exteriorPlaneCenter.clone().addScaledVector(localForward, 1.83);
  const relatedNodes = nodeRecords
    .filter((record) => record.path === gate.path || record.path.startsWith(`${gate.path} / `))
    .filter((record) => /(gate|door|wall)/i.test(record.name));
  process.stdout.write(`${JSON.stringify({
    source: path.relative(projectRoot, glbPath).replaceAll("\\", "/"),
    rootTransform: {
      translation: [-17.26, 6.767, -182.68],
      rotationY: Math.PI / 2,
      scale: [0.64, 0.64, 0.64],
    },
    gate: {
      index: gate.index,
      name: gate.name,
      path: gate.path,
      position: gate.position.map((value) => Number(value.toFixed(4))),
      quaternion: gate.quaternion.map((value) => Number(value.toFixed(6))),
      scale: gate.scale.map((value) => Number(value.toFixed(4))),
      bounds: {
        min: bounds.min.toArray().map((value) => Number(value.toFixed(4))),
        max: bounds.max.toArray().map((value) => Number(value.toFixed(4))),
        center: center.toArray().map((value) => Number(value.toFixed(4))),
        size: size.toArray().map((value) => Number(value.toFixed(4))),
      },
      axes: {
        right: localRight.toArray().map((value) => Number(value.toFixed(6))),
        up: localUp.toArray().map((value) => Number(value.toFixed(6))),
        forward: localForward.toArray().map((value) => Number(value.toFixed(6))),
      },
      candidatesAt1_6m: {
        plusForward: atPlayerHeight(plusForward),
        minusForward: atPlayerHeight(minusForward),
      },
      selectedEntrance: {
        outsideNormal: localForward.toArray().map((value) => Number(value.toFixed(6))),
        insideNormal: localForward.clone().multiplyScalar(-1).toArray().map((value) => Number(value.toFixed(6))),
        exteriorPlaneCenter: atPlayerHeight(exteriorPlaneCenter),
        outsideSpawn: atPlayerHeight(selectedOutsideSpawn),
        insideEntry: atPlayerHeight(minusForward),
        spawnYaw: Math.PI / 2,
        rationale: "The approved Master root rotates authored south to runtime +X; the playable A/B route continues toward runtime -X. The gatehouse is 7.04m deep, so the spawn is measured from its exterior bounds face rather than its interior volume centre.",
      },
      relatedNodes,
    },
  }, null, 2)}\n`);
} else {
  process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
}
