import * as THREE from "three/webgpu";
import {
  getGameplayAnchor,
  resolveGameplayRegionForPoint,
  tingYuXuanGameplayRegions,
  type GameplayRegionId,
  type RouteAnchorId,
  type ChapterAnchorId,
} from "./tingyuxuan-gameplay-map";
import type { LayoutCollider } from "./tingyuxuan-layout";

const ARCHITECTURE_NAME_PATTERN = /(wall_solid|wall_window|wallstraight|boundary|parapet|wall|plaster|brick|stone|pillar|column|courtyard|house|building)/i;
const OPENING_OR_DETAIL_PATTERN = /(moongate|wallgate|gate|door|roof|lattice|cap|top|railing|baluster)/i;
const NON_COLLIDABLE_DETAIL_PATTERN = /(tree|leaf|foliage|plant|grass|flower|bush|water|pond|ground|floor|paving|tile|lantern|chair|table|bench|furniture|ornament|rockery)/i;

export const ARCHITECTURE_COLLIDER_WARNING_THRESHOLD = 256;
export const ARCHITECTURE_ROUTE_COVERAGE_RADIUS = 10;

export type ArchitectureCollisionExclusionReason =
  | "hidden"
  | "nonArchitecture"
  | "openingOrDetail"
  | "emptyBounds"
  | "invalidSize"
  | "duplicate";

export interface ArchitectureCollisionRegionCoverage {
  regionId: GameplayRegionId;
  totalMeshCount: number;
  candidateArchitectureMeshCount: number;
  generatedColliderCount: number;
  explicitArchitectureColliderCount: number;
  routeWaypointCount: number;
}

export interface ArchitectureCollisionRouteCoverage {
  id: "entrance" | "west-court" | "north-tower" | "water-court" | "finale-area";
  label: string;
  anchorId: RouteAnchorId | ChapterAnchorId;
  regionId: GameplayRegionId;
  visualAssetCovered: boolean;
  colliderCovered: boolean;
  masterColliderCovered: boolean;
  gameplayRouteCovered: boolean;
  nearestArchitectureColliderDistance: number | null;
  coverageRadius: number;
  complete: boolean;
}

export interface ArchitectureCollisionAudit {
  totalMeshCount: number;
  candidateArchitectureMeshCount: number;
  generatedColliderCount: number;
  excludedMeshCount: number;
  exclusions: Record<ArchitectureCollisionExclusionReason, number>;
  categories: Record<string, number>;
  regionCoverage: Record<GameplayRegionId, ArchitectureCollisionRegionCoverage>;
  routeCoverage: ArchitectureCollisionRouteCoverage[];
  colliderLimit: null;
  truncatedColliderCount: 0;
  warningThreshold: number;
  warningThresholdExceeded: boolean;
  candidateMeshSamples: ArchitectureCollisionMeshSample[];
  geometryReviewSamples: ArchitectureCollisionMeshSample[];
}

export interface ArchitectureCollisionMeshSample {
  name: string;
  materials: string;
  center: readonly [number, number, number];
  size: readonly [number, number, number];
  regions: GameplayRegionId[];
}

export interface ArchitectureCollisionExtraction {
  colliders: readonly LayoutCollider[];
  audit: ArchitectureCollisionAudit;
}

const auditWaypoints = [
  { id: "entrance", label: "Entrance", anchorId: "ROUTE_02_A_ENTRY" },
  { id: "west-court", label: "West Court", anchorId: "ROUTE_03_A_LOOP" },
  { id: "north-tower", label: "North Tower", anchorId: "ROUTE_05_B_MAIN_COURT" },
  { id: "water-court", label: "Water Court", anchorId: "C_WATER_EDGE" },
  { id: "finale-area", label: "Finale Area", anchorId: "C_FINAL_PAVILION" },
] as const;

const regionIds = ["AREA_A", "AREA_B", "AREA_C", "OUTSIDE"] as const;

const createRegionCoverage = (): Record<GameplayRegionId, ArchitectureCollisionRegionCoverage> =>
  Object.fromEntries(regionIds.map((regionId) => [regionId, {
    regionId,
    totalMeshCount: 0,
    candidateArchitectureMeshCount: 0,
    generatedColliderCount: 0,
    explicitArchitectureColliderCount: 0,
    routeWaypointCount: 0,
  }])) as Record<GameplayRegionId, ArchitectureCollisionRegionCoverage>;

const visibleInHierarchy = (object: THREE.Object3D, root: THREE.Object3D) => {
  let cursor: THREE.Object3D | null = object;
  while (cursor) {
    if (!cursor.visible) return false;
    if (cursor === root) return true;
    cursor = cursor.parent;
  }
  return true;
};

const meshWorldBounds = (mesh: THREE.Mesh) => {
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  const localBounds = mesh.geometry.boundingBox;
  return localBounds ? new THREE.Box3().copy(localBounds).applyMatrix4(mesh.matrixWorld) : new THREE.Box3();
};

const regionsOverlappingBounds = (bounds: THREE.Box3): GameplayRegionId[] => {
  const matches = tingYuXuanGameplayRegions
    .filter((region) => {
      const minX = region.center[0] - region.halfExtents[0];
      const maxX = region.center[0] + region.halfExtents[0];
      const minZ = region.center[1] - region.halfExtents[1];
      const maxZ = region.center[1] + region.halfExtents[1];
      return bounds.max.x >= minX && bounds.min.x <= maxX && bounds.max.z >= minZ && bounds.min.z <= maxZ;
    })
    .map((region) => region.id);
  return matches.length > 0 ? matches : ["OUTSIDE"];
};

const regionsOverlappingCollider = (collider: LayoutCollider): GameplayRegionId[] => {
  const rotation = collider.rotationY ?? 0;
  const cosine = Math.abs(Math.cos(rotation));
  const sine = Math.abs(Math.sin(rotation));
  const extentX = cosine * collider.halfExtents[0] + sine * collider.halfExtents[2];
  const extentZ = sine * collider.halfExtents[0] + cosine * collider.halfExtents[2];
  const bounds = new THREE.Box3(
    new THREE.Vector3(collider.center[0] - extentX, 0, collider.center[2] - extentZ),
    new THREE.Vector3(collider.center[0] + extentX, 0, collider.center[2] + extentZ),
  );
  return regionsOverlappingBounds(bounds);
};

const distanceToColliderXZ = (point: readonly [number, number, number], collider: LayoutCollider) => {
  const rotation = collider.rotationY ?? 0;
  const dx = point[0] - collider.center[0];
  const dz = point[2] - collider.center[2];
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const localX = cosine * dx - sine * dz;
  const localZ = sine * dx + cosine * dz;
  const outsideX = Math.max(0, Math.abs(localX) - collider.halfExtents[0]);
  const outsideZ = Math.max(0, Math.abs(localZ) - collider.halfExtents[2]);
  return Math.hypot(outsideX, outsideZ);
};

/**
 * Converts only authored architectural wall/pillar meshes into simplified box
 * colliders. Doorways, moon gates, roofs and small detail remain explicit
 * exclusions for TASK-018. No generated collider is silently truncated.
 */
export const extractArchitectureCollisionCoverage = (
  visualRoot: THREE.Object3D,
  explicitLayoutColliders: readonly LayoutCollider[],
): ArchitectureCollisionExtraction => {
  visualRoot.updateMatrixWorld(true);
  const colliders: LayoutCollider[] = [];
  const seen = new Set<string>();
  const regionCoverage = createRegionCoverage();
  const exclusions: Record<ArchitectureCollisionExclusionReason, number> = {
    hidden: 0,
    nonArchitecture: 0,
    openingOrDetail: 0,
    emptyBounds: 0,
    invalidSize: 0,
    duplicate: 0,
  };
  let totalMeshCount = 0;
  let candidateArchitectureMeshCount = 0;
  const candidateMeshSamples: ArchitectureCollisionMeshSample[] = [];
  const geometryReviewCandidates: Array<ArchitectureCollisionMeshSample & { score: number }> = [];

  visualRoot.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    totalMeshCount += 1;
    if (!visibleInHierarchy(child, visualRoot)) {
      exclusions.hidden += 1;
      return;
    }

    const bounds = meshWorldBounds(child);
    if (!bounds.isEmpty()) {
      regionsOverlappingBounds(bounds).forEach((regionId) => {
        regionCoverage[regionId].totalMeshCount += 1;
      });
    }

    const hierarchy: THREE.Object3D[] = [];
    let cursor: THREE.Object3D | null = child;
    while (cursor) {
      hierarchy.push(cursor);
      if (cursor === visualRoot) break;
      cursor = cursor.parent;
    }
    const hierarchyName = hierarchy.map((item) => item.name).filter(Boolean).join("|");
    const materialNames = (Array.isArray(child.material) ? child.material : [child.material])
      .map((material) => material.name ?? "")
      .join("|");
    const identityName = child.name + "|" + materialNames;
    const sourceName = hierarchyName + "|" + materialNames;
    if (OPENING_OR_DETAIL_PATTERN.test(sourceName)) {
      exclusions.openingOrDetail += 1;
      return;
    }

    if (bounds.isEmpty()) {
      if (ARCHITECTURE_NAME_PATTERN.test(identityName)) exclusions.emptyBounds += 1;
      else exclusions.nonArchitecture += 1;
      return;
    }
    const size = bounds.getSize(new THREE.Vector3());
    const centre = bounds.getCenter(new THREE.Vector3());
    const horizontalThin = Math.min(size.x, size.z);
    const horizontalLong = Math.max(size.x, size.z);
    const overlappingRegions = regionsOverlappingBounds(bounds);
    const overlapsPlayableRegion = overlappingRegions.some((regionId) => regionId !== "OUTSIDE");
    if (overlappingRegions.some((regionId) => regionId === "AREA_B" || regionId === "AREA_C")) {
      geometryReviewCandidates.push({
        name: child.name,
        materials: materialNames,
        center: [Number(centre.x.toFixed(3)), Number(centre.y.toFixed(3)), Number(centre.z.toFixed(3))],
        size: [Number(size.x.toFixed(3)), Number(size.y.toFixed(3)), Number(size.z.toFixed(3))],
        regions: overlappingRegions,
        score: Math.abs(size.y - 2.8) + Math.max(0, horizontalThin - 1.35) * 8 + Math.max(0, 0.65 - horizontalLong) * 8,
      });
    }
    const namedArchitecture = ARCHITECTURE_NAME_PATTERN.test(identityName);
    const geometryArchitecture =
      overlapsPlayableRegion
      && !NON_COLLIDABLE_DETAIL_PATTERN.test(sourceName)
      && size.y >= 1.55
      && size.y <= 6.5
      && horizontalThin <= 0.9
      && horizontalLong >= 0.8;
    if (!namedArchitecture && !geometryArchitecture) {
      exclusions.nonArchitecture += 1;
      return;
    }

    candidateArchitectureMeshCount += 1;
    if (candidateMeshSamples.length < 24 && overlappingRegions.some((regionId) => regionId === "AREA_B" || regionId === "AREA_C")) {
      candidateMeshSamples.push({
        name: child.name,
        materials: materialNames,
        center: [Number(centre.x.toFixed(3)), Number(centre.y.toFixed(3)), Number(centre.z.toFixed(3))],
        size: [Number(size.x.toFixed(3)), Number(size.y.toFixed(3)), Number(size.z.toFixed(3))],
        regions: overlappingRegions,
      });
    }
    overlappingRegions.forEach((regionId) => {
      regionCoverage[regionId].candidateArchitectureMeshCount += 1;
    });

    if (size.y < 0.65 || size.y > 6.5 || horizontalThin > 1.35 || horizontalLong < 0.65) {
      exclusions.invalidSize += 1;
      return;
    }
    const halfX = Math.max(0.06, size.x * 0.5);
    const halfY = Math.max(0.35, size.y * 0.5);
    const halfZ = Math.max(0.06, size.z * 0.5);
    const key = [centre.x, centre.y, centre.z, halfX, halfY, halfZ].map((value) => value.toFixed(2)).join("/");
    if (seen.has(key)) {
      exclusions.duplicate += 1;
      return;
    }
    seen.add(key);
    const collider: LayoutCollider = {
      id: "master-wall-" + colliders.length,
      center: [centre.x, centre.y, centre.z],
      halfExtents: [halfX, halfY, halfZ],
      category: "architecture",
    };
    colliders.push(collider);
    regionsOverlappingCollider(collider).forEach((regionId) => {
      regionCoverage[regionId].generatedColliderCount += 1;
    });
  });

  const explicitArchitectureColliders = explicitLayoutColliders.filter((collider) => collider.category === "architecture");
  explicitArchitectureColliders.forEach((collider) => {
    regionsOverlappingCollider(collider).forEach((regionId) => {
      regionCoverage[regionId].explicitArchitectureColliderCount += 1;
    });
  });

  auditWaypoints.forEach((waypoint) => {
    const anchor = getGameplayAnchor(waypoint.anchorId);
    regionCoverage[anchor.regionId].routeWaypointCount += 1;
  });
  const allArchitectureColliders = [...explicitArchitectureColliders, ...colliders];
  const routeCoverage: ArchitectureCollisionRouteCoverage[] = auditWaypoints.map((waypoint) => {
    const anchor = getGameplayAnchor(waypoint.anchorId);
    const region = regionCoverage[anchor.regionId];
    const masterColliderCovered = region.generatedColliderCount > 0;
    const gameplayRouteCovered = resolveGameplayRegionForPoint({ x: anchor.position[0], z: anchor.position[2] }) === anchor.regionId;
    const nearestDistance = allArchitectureColliders.length > 0
      ? Math.min(...allArchitectureColliders.map((collider) => distanceToColliderXZ(anchor.position, collider)))
      : null;
    const visualAssetCovered = region.totalMeshCount > 0;
    const colliderCovered =
      region.generatedColliderCount + region.explicitArchitectureColliderCount > 0
      && nearestDistance !== null
      && nearestDistance <= ARCHITECTURE_ROUTE_COVERAGE_RADIUS;
    return {
      ...waypoint,
      regionId: anchor.regionId,
      visualAssetCovered,
      colliderCovered,
      masterColliderCovered,
      gameplayRouteCovered,
      nearestArchitectureColliderDistance: nearestDistance === null ? null : Number(nearestDistance.toFixed(3)),
      coverageRadius: ARCHITECTURE_ROUTE_COVERAGE_RADIUS,
      complete: visualAssetCovered && colliderCovered && gameplayRouteCovered,
    };
  });

  return {
    colliders,
    audit: {
      totalMeshCount,
      candidateArchitectureMeshCount,
      generatedColliderCount: colliders.length,
      excludedMeshCount: totalMeshCount - colliders.length,
      exclusions,
      categories: { architecture: colliders.length },
      regionCoverage,
      routeCoverage,
      colliderLimit: null,
      truncatedColliderCount: 0,
      warningThreshold: ARCHITECTURE_COLLIDER_WARNING_THRESHOLD,
      warningThresholdExceeded: colliders.length > ARCHITECTURE_COLLIDER_WARNING_THRESHOLD,
      candidateMeshSamples,
      geometryReviewSamples: (["AREA_B", "AREA_C"] as const).flatMap((regionId) =>
        geometryReviewCandidates
          .filter((sample) => sample.regions.includes(regionId))
          .sort((left, right) => left.score - right.score)
          .slice(0, 16)
          .map(({ score: _score, ...sample }) => sample)),
    },
  };
};
