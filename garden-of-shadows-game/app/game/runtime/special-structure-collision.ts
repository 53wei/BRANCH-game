import * as THREE from "three/webgpu";
import { PLAYER_BODY_CALIBRATION } from "./player-calibration";
import { PLAYER_PHYSICS_CALIBRATION } from "./PhysicsController";
import type { LayoutCollider } from "./tingyuxuan-layout";

export type MasterSpecialStructureKind = "stairs-and-railing";

export interface TrimeshColliderDefinition {
  id: string;
  sourceNodeName: string;
  runtimeNodeName: string;
  kind: MasterSpecialStructureKind;
  vertices: Float32Array;
  indices: Uint32Array;
  category: "architecture";
  initiallyEnabled?: boolean;
}

export interface MasterSpecialStructureMeshAudit {
  id: string;
  sourceNodeName: string;
  runtimeNodeName: string;
  kind: MasterSpecialStructureKind;
  vertexCount: number;
  triangleCount: number;
  bounds: {
    min: readonly [number, number, number];
    max: readonly [number, number, number];
    size: readonly [number, number, number];
  };
}

export interface SpecialStructureCollisionAudit {
  requiredBoxColliderIds: readonly string[];
  presentBoxColliderIds: string[];
  missingBoxColliderIds: string[];
  boxSourceReferencesComplete: boolean;
  masterMeshSources: MasterSpecialStructureMeshAudit[];
  missingMasterNodeNames: string[];
  minimumRailingHeight: number;
  jumpApexRise: number;
  complete: boolean;
}

export interface SpecialStructureCollisionExtraction {
  colliders: readonly TrimeshColliderDefinition[];
  audit: SpecialStructureCollisionAudit;
}

export const MASTER_SPECIAL_STRUCTURE_SOURCES = [
  {
    nodeName: "214b32a0.o",
    runtimeNodeName: "214b32a0o",
    id: "master-special-c-stairs-railing",
    kind: "stairs-and-railing",
    evidence: "TASK-018 isolated Master-node capture plus vertical triangle sampling",
  },
] as const;

export const REQUIRED_SPECIAL_STRUCTURE_BOX_IDS = [
  "main-gate-frame-z-low",
  "main-gate-frame-z-high",
  "main-gate-frame-top",
  "main-gate-threshold",
  "wife-moon-gate-left",
  "wife-moon-gate-right",
  "wife-moon-gate-top",
  "c-wooden-steps-approach",
] as const;

const jumpApexRise = PLAYER_PHYSICS_CALIBRATION.jumpSpeed ** 2 / (2 * Math.abs(PLAYER_PHYSICS_CALIBRATION.gravity));
// At the jump apex the capsule bottom rises by jumpApexRise. A railing at
// this height plus controller/surface tolerance still intersects the capsule;
// use a small safety reserve instead of relying on a frame-perfect contact.
export const SPECIAL_STRUCTURE_COLLISION_POLICY = {
  jumpApexRise,
  minimumRailingHeight: jumpApexRise + 0.12,
} as const;

const hierarchyVisible = (object: THREE.Object3D, root: THREE.Object3D) => {
  let cursor: THREE.Object3D | null = object;
  while (cursor) {
    if (!cursor.visible) return false;
    if (cursor === root) return true;
    cursor = cursor.parent;
  }
  return false;
};

const tuple = (vector: THREE.Vector3): readonly [number, number, number] => [
  Number(vector.x.toFixed(4)),
  Number(vector.y.toFixed(4)),
  Number(vector.z.toFixed(4)),
];

/**
 * Extracts the audited low-polygon C-zone stair/railing structure directly
 * from the final Master Scene. Unlike a broad Box3, the static trimesh keeps
 * the visible slopes, openings and rail profile. The opaque source node was
 * identified by isolated render and triangle-surface audit, not by guessing.
 */
export const extractMasterSpecialStructureCollision = (
  visualRoot: THREE.Object3D,
  layoutColliders: readonly LayoutCollider[],
): SpecialStructureCollisionExtraction => {
  visualRoot.updateMatrixWorld(true);
  const colliders: TrimeshColliderDefinition[] = [];
  const masterMeshSources: MasterSpecialStructureMeshAudit[] = [];
  const missingMasterNodeNames: string[] = [];

  MASTER_SPECIAL_STRUCTURE_SOURCES.forEach((source) => {
    // GLTFLoader sanitizes Sketchfab's dotted object names for Object3D lookup.
    const object = visualRoot.getObjectByName(source.runtimeNodeName);
    if (!(object instanceof THREE.Mesh) || !hierarchyVisible(object, visualRoot)) {
      missingMasterNodeNames.push(source.nodeName);
      return;
    }
    const position = object.geometry.getAttribute("position");
    if (!position || position.count < 3) {
      missingMasterNodeNames.push(source.nodeName);
      return;
    }
    const vertices = new Float32Array(position.count * 3);
    const point = new THREE.Vector3();
    const bounds = new THREE.Box3();
    for (let index = 0; index < position.count; index += 1) {
      point.fromBufferAttribute(position, index).applyMatrix4(object.matrixWorld);
      vertices[index * 3] = point.x;
      vertices[index * 3 + 1] = point.y;
      vertices[index * 3 + 2] = point.z;
      bounds.expandByPoint(point);
    }
    const geometryIndex = object.geometry.getIndex();
    const indices = geometryIndex
      ? Uint32Array.from(geometryIndex.array, Number)
      : Uint32Array.from({ length: position.count }, (_, index) => index);
    if (indices.length < 3 || indices.length % 3 !== 0 || bounds.isEmpty()) {
      missingMasterNodeNames.push(source.nodeName);
      return;
    }
    colliders.push({
      id: source.id,
      sourceNodeName: source.nodeName,
      runtimeNodeName: source.runtimeNodeName,
      kind: source.kind,
      vertices,
      indices,
      category: "architecture",
    });
    const size = bounds.getSize(new THREE.Vector3());
    masterMeshSources.push({
      id: source.id,
      sourceNodeName: source.nodeName,
      runtimeNodeName: source.runtimeNodeName,
      kind: source.kind,
      vertexCount: position.count,
      triangleCount: indices.length / 3,
      bounds: { min: tuple(bounds.min), max: tuple(bounds.max), size: tuple(size) },
    });
  });

  const presentBoxColliderIds = layoutColliders
    .filter((collider) => collider.specialStructure)
    .map((collider) => collider.id);
  const missingBoxColliderIds = REQUIRED_SPECIAL_STRUCTURE_BOX_IDS.filter((id) => !presentBoxColliderIds.includes(id));
  const boxSourceReferencesComplete = layoutColliders
    .filter((collider) => collider.specialStructure)
    .every((collider) => Boolean(collider.specialStructure?.sourceReference));
  const complete = missingBoxColliderIds.length === 0
    && boxSourceReferencesComplete
    && missingMasterNodeNames.length === 0
    && colliders.length === MASTER_SPECIAL_STRUCTURE_SOURCES.length;

  return {
    colliders,
    audit: {
      requiredBoxColliderIds: REQUIRED_SPECIAL_STRUCTURE_BOX_IDS,
      presentBoxColliderIds,
      missingBoxColliderIds,
      boxSourceReferencesComplete,
      masterMeshSources,
      missingMasterNodeNames,
      minimumRailingHeight: Number(SPECIAL_STRUCTURE_COLLISION_POLICY.minimumRailingHeight.toFixed(4)),
      jumpApexRise: Number(SPECIAL_STRUCTURE_COLLISION_POLICY.jumpApexRise.toFixed(4)),
      complete,
    },
  };
};
