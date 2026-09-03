import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

const input = process.argv[2] ?? "public/assets/gameplay/TYX_GMP_Bridge_Low_A.glb";
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const document = await io.read(input);

const transformPoint = (matrix, point) => {
  const [x, y, z] = point;
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
  ];
};

const triangles = [];
const components = [];
for (const node of document.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const matrix = node.getWorldMatrix();
  const componentTriangles = [];
  const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (const primitive of mesh.listPrimitives()) {
    const positions = primitive.getAttribute("POSITION");
    if (!positions) continue;
    const indices = primitive.getIndices();
    const indexCount = indices?.getCount() ?? positions.getCount();
    const pointAt = (index) => transformPoint(matrix, positions.getElement(index, []));
    for (let offset = 0; offset + 2 < indexCount; offset += 3) {
      const a = pointAt(indices ? indices.getScalar(offset) : offset);
      const b = pointAt(indices ? indices.getScalar(offset + 1) : offset + 1);
      const c = pointAt(indices ? indices.getScalar(offset + 2) : offset + 2);
      const triangle = { a, b, c, node: node.getName(), mesh: mesh.getName() };
      triangles.push(triangle);
      componentTriangles.push(triangle);
      for (const point of [a, b, c]) {
        for (let axis = 0; axis < 3; axis += 1) {
          bounds.min[axis] = Math.min(bounds.min[axis], point[axis]);
          bounds.max[axis] = Math.max(bounds.max[axis], point[axis]);
        }
      }
    }
  }
  components.push({
    node: node.getName(),
    mesh: mesh.getName(),
    triangles: componentTriangles.length,
    bounds: {
      min: bounds.min.map((value) => Number(value.toFixed(5))),
      max: bounds.max.map((value) => Number(value.toFixed(5))),
    },
  });
}

const cross = (u, v) => [
  u[1] * v[2] - u[2] * v[1],
  u[2] * v[0] - u[0] * v[2],
  u[0] * v[1] - u[1] * v[0],
];
const subtract = (a, b) => a.map((value, axis) => value - b[axis]);
const horizontalLevels = new Map();
for (const triangle of triangles) {
  const normal = cross(subtract(triangle.b, triangle.a), subtract(triangle.c, triangle.a));
  const length = Math.hypot(...normal);
  if (length === 0 || Math.abs(normal[1] / length) < 0.75) continue;
  const centerY = (triangle.a[1] + triangle.b[1] + triangle.c[1]) / 3;
  const key = (Math.round(centerY / 0.025) * 0.025).toFixed(3);
  horizontalLevels.set(key, (horizontalLevels.get(key) ?? 0) + 1);
}

const verticalIntersections = (x, z) => {
  const hits = [];
  for (const triangle of triangles) {
    const { a, b, c } = triangle;
    const denominator = (b[2] - c[2]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[2] - c[2]);
    if (Math.abs(denominator) < 1e-8) continue;
    const u = ((b[2] - c[2]) * (x - c[0]) + (c[0] - b[0]) * (z - c[2])) / denominator;
    const v = ((c[2] - a[2]) * (x - c[0]) + (a[0] - c[0]) * (z - c[2])) / denominator;
    const w = 1 - u - v;
    if (u < -1e-5 || v < -1e-5 || w < -1e-5) continue;
    hits.push(u * a[1] + v * b[1] + w * c[1]);
  }
  return [...new Set(hits.map((value) => Number(value.toFixed(4))))].sort((a, b) => a - b);
};

const samples = [];
for (let x = -3; x <= 3.0001; x += 0.25) {
  const zSamples = [-0.6, -0.3, 0, 0.3, 0.6].map((z) => ({
    z,
    hits: verticalIntersections(x, z),
  }));
  samples.push({ x: Number(x.toFixed(2)), zSamples });
}

console.log(JSON.stringify({
  input,
  components,
  triangleCount: triangles.length,
  horizontalLevels: [...horizontalLevels.entries()]
    .map(([y, count]) => ({ y: Number(y), triangleCount: count }))
    .sort((a, b) => a.y - b.y),
  samples,
}, null, 2));
