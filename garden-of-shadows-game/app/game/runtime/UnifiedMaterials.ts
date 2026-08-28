import * as THREE from "three/webgpu";

export const tingYuXuanMaterialSpecs = {
  "plaster-old": { label: "旧白灰墙", color: "#9f9b89", roughness: 0.92, metalness: 0 },
  "plaster-wet": { label: "潮湿白墙", color: "#747b70", roughness: 0.58, metalness: 0.04 },
  "wood-dark-dry": { label: "干深木", color: "#27140f", roughness: 0.7, metalness: 0 },
  "wood-dark-wet": { label: "湿旧木", color: "#1a1210", roughness: 0.32, metalness: 0.08 },
  "roof-grey": { label: "灰瓦", color: "#182522", roughness: 0.76, metalness: 0.03 },
  "stone-old": { label: "旧石板", color: "#404945", roughness: 0.72, metalness: 0.03 },
  "stone-wet": { label: "湿石板", color: "#263734", roughness: 0.2, metalness: 0.18 },
  "stone-moss": { label: "苔石", color: "#35473a", roughness: 0.84, metalness: 0 },
  "mud-wet": { label: "湿泥", color: "#2d251d", roughness: 0.62, metalness: 0 },
  "wood-painted-old": { label: "旧漆木", color: "#5a241c", roughness: 0.48, metalness: 0.04 },
} as const;

export type TingYuXuanMaterialId = keyof typeof tingYuXuanMaterialSpecs;

const cc0MaterialSources: Record<TingYuXuanMaterialId, string> = {
  "plaster-old": "worn_plaster_wall",
  "plaster-wet": "white_rough_plaster",
  "wood-dark-dry": "dark_wooden_planks",
  "wood-dark-wet": "weathered_planks",
  "roof-grey": "grey_roof_tiles",
  "stone-old": "stone_tiles_02",
  "stone-wet": "stone_tiles_03",
  "stone-moss": "mossy_rock",
  "mud-wet": "stone_tiles_03",
  "wood-painted-old": "weathered_planks",
};

export function createUnifiedMaterials() {
  return Object.fromEntries(
    Object.entries(tingYuXuanMaterialSpecs).map(([id, spec]) => [
      id,
      new THREE.MeshStandardMaterial({
        name: `TYX_MAT_${id}`,
        color: spec.color,
        roughness: spec.roughness,
        metalness: spec.metalness,
      }),
    ]),
  ) as Record<TingYuXuanMaterialId, THREE.MeshStandardMaterial>;
}

export async function hydrateUnifiedMaterials(
  materials: Record<TingYuXuanMaterialId, THREE.MeshStandardMaterial>,
  loadTexture: (url: string) => Promise<THREE.Texture>,
) {
  const cache = new Map<string, Promise<{ diff: THREE.Texture; normal: THREE.Texture; arm: THREE.Texture }>>();
  const loadSet = (assetId: string) => {
    const cached = cache.get(assetId);
    if (cached) return cached;
    const base = `/assets/materials/${assetId}/${assetId}`;
    const request = Promise.all([
      loadTexture(`${base}_diff_1k.ktx2`),
      loadTexture(`${base}_nor_gl_1k.ktx2`),
      loadTexture(`${base}_arm_1k.ktx2`),
    ]).then(([diff, normal, arm]) => ({ diff, normal, arm }));
    cache.set(assetId, request);
    return request;
  };
  await Promise.all((Object.keys(materials) as TingYuXuanMaterialId[]).map(async (id) => {
    const set = await loadSet(cc0MaterialSources[id]);
    for (const texture of [set.diff, set.normal, set.arm]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2.5, 2.5);
    }
    const material = materials[id];
    material.map = set.diff;
    material.normalMap = set.normal;
    material.roughnessMap = set.arm;
    material.metalnessMap = set.arm;
    material.aoMap = set.arm;
    material.normalScale.set(0.62, 0.62);
    material.needsUpdate = true;
  }));
}
