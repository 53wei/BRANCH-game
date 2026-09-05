export type GameplayVec3 = readonly [number, number, number];
export type GameplayRegionId = "AREA_A" | "AREA_B" | "AREA_C" | "OUTSIDE";
export type RouteAnchorId =
  | "ROUTE_01_START"
  | "ROUTE_02_A_ENTRY"
  | "ROUTE_03_A_LOOP"
  | "ROUTE_04_A_EAST_EXIT"
  | "ROUTE_05_B_MAIN_COURT"
  | "ROUTE_06_B_NORTHEAST_LINK"
  | "ROUTE_07_C_ENTRY";
export type ChapterAnchorId =
  | "A_BASELINE"
  | "A_FALSE_PATH"
  | "A_LOOP_RETURN"
  | "A_WET_FOOTPRINT"
  | "PROLOGUE_UMBRELLA"
  | "PROLOGUE_SHOES"
  | "PROLOGUE_LEDGER"
  | "PROLOGUE_STEWARD"
  | "PROLOGUE_WINDOW_ROW"
  | "PROLOGUE_LANTERN_TURN"
  | "PROLOGUE_MOONGATE_VIEW"
  | "PROLOGUE_ANOMALY"
  | "B_TEA_TABLE"
  | "B_LEDGER"
  | "B_IMAGE_EVIDENCE"
  | "B_MISSING_ROOM"
  | "B_MISSING_DOOR"
  | "B_MISSING_WINDOW"
  | "B_MISSING_BOUNDARY"
  | "B_MISSING_FURNITURE"
  | "B_CHILD_BOX"
  | "C_WATER_EDGE"
  | "C_WOODEN_STEPS"
  | "C_FALL_POINT"
  | "C_FINAL_PAVILION";

export interface GameplayRegionDefinition {
  id: Exclude<GameplayRegionId, "OUTSIDE">;
  label: string;
  center: readonly [number, number];
  halfExtents: readonly [number, number];
  chapters: readonly string[];
  firstPass: "open" | "entry-only";
}

export interface GameplayAnchorDefinition {
  id: RouteAnchorId | ChapterAnchorId;
  position: GameplayVec3;
  yaw: number;
  regionId: Exclude<GameplayRegionId, "OUTSIDE">;
  firstPass: "open" | "locked";
  confidence: "master-measured" | "blender-reviewed" | "annotated-plan-calibrated" | "runtime-reviewed" | "provisional";
}

export interface MainGateAuditDefinition {
  nodeName: "TYX_MAIN_GATE_SOUTH";
  center: GameplayVec3;
  bounds: { min: GameplayVec3; max: GameplayVec3; size: GameplayVec3 };
  exteriorPlaneCenter: GameplayVec3;
  worldQuaternion: readonly [number, number, number, number];
  planeDirection: GameplayVec3;
  outsideNormal: GameplayVec3;
  insideNormal: GameplayVec3;
  outsideSpawn: GameplayVec3;
  insideEntry: GameplayVec3;
  spawnYaw: number;
}

export interface GameplayColliderDefinition {
  id: string;
  center: GameplayVec3;
  halfExtents: GameplayVec3;
  rotationY?: number;
  category: "ground" | "route-ground" | "world-boundary" | "architecture" | "progression-lock" | "memory-wall";
  memoryIds?: readonly ("wife" | "gardener")[];
  initiallyEnabled?: boolean;
  specialStructure?: {
    kind: "door-frame" | "moon-gate" | "threshold" | "stair-approach";
    sourceReference: string;
    passage: "required" | "restricted" | "none";
  };
}

export interface RuntimeGroundPatchDefinition {
  id: string;
  center: GameplayVec3;
  size: readonly [number, number];
  thickness: number;
  rotationY?: number;
  material: "mud-wet" | "stone-old" | "stone-wet" | "stone-moss";
  layer: "base" | "region" | "route";
  regionId?: Exclude<GameplayRegionId, "OUTSIDE">;
}

export const TINGYUXUAN_GAMEPLAY_MAP_VERSION = "tingyuxuan-gameplay-map-v1";

// TASK-015 world-scale contract. Runtime gameplay coordinates are metres:
// 1 world unit = 1 metre, with the playable ground plane at Y=0. Anchors use a
// shared 0.9 m reference height so spawn/checkpoint/interaction coordinates do
// not drift independently when individual chapters are edited.
export const WORLD_METERS_PER_UNIT = 1;
export const GAMEPLAY_GROUND_Y = 0;
export const GAMEPLAY_ANCHOR_REFERENCE_Y = 0.9;
export const TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT = 0.09;

// Exact three-box authoring contract from the project-authored
// public/assets/gameplay/TYX_GMP_MoonGate_Collision.glb. Runtime collision
// uses these measured component transforms rather than sealing the circular
// opening with a single bounding box.
export const TINGYUXUAN_MOON_GATE_COLLISION_AUDIT = {
  source: "public/assets/gameplay/TYX_GMP_MoonGate_Collision.glb",
  placement: [1.75, 0, 29] as GameplayVec3,
  bounds: { min: [-3, 0, -0.2] as GameplayVec3, max: [3, 3.4, 0.2] as GameplayVec3 },
  components: [
    { nodeName: "MoonGate_Collider_Left", center: [-2.15, 1.7, 0] as GameplayVec3, halfExtents: [0.85, 1.7, 0.2] as GameplayVec3 },
    { nodeName: "MoonGate_Collider_Right", center: [2.15, 1.7, 0] as GameplayVec3, halfExtents: [0.85, 1.7, 0.2] as GameplayVec3 },
    { nodeName: "MoonGate_Collider_Top", center: [0, 3.075, 0] as GameplayVec3, halfExtents: [1.3, 0.325, 0.2] as GameplayVec3 },
  ],
  clearOpening: { width: 2.6, height: 2.75 },
} as const;

// Measured from TYX_MAIN_GATE_SOUTH in the final Master GLB using
// scripts/assets/inspect-master-entry.mjs --gate-audit. The authored south-gate
// normal becomes runtime +X after the single approved Master root transform;
// the playable garden continues toward -X, so +X is outside and -X is inside.
export const TINGYUXUAN_MAIN_GATE_AUDIT: MainGateAuditDefinition = {
  nodeName: "TYX_MAIN_GATE_SOUTH",
  center: [9.3, 3.005, 39.4],
  bounds: {
    min: [5.78, 0, 36.2],
    max: [12.82, 6.01, 42.6],
    size: [7.04, 6.01, 6.4],
  },
  worldQuaternion: [0, 0.707107, 0, 0.707107],
  planeDirection: [0, 0, -1],
  outsideNormal: [1, 0, 0],
  insideNormal: [-1, 0, 0],
  exteriorPlaneCenter: [12.82, GAMEPLAY_ANCHOR_REFERENCE_Y, 39.4],
  outsideSpawn: [14.65, GAMEPLAY_ANCHOR_REFERENCE_Y, 39.4],
  insideEntry: [6.9, GAMEPLAY_ANCHOR_REFERENCE_Y, 39.4],
  spawnYaw: Math.PI / 2,
} as const;

// Runtime coordinates are calibrated from the annotated V2 route against the
// final Blender top view, then converted through the one allowed Master root
// transform. ROUTE_04 is additionally backed by the Blender connection review.
export const tingYuXuanRouteAnchors: readonly GameplayAnchorDefinition[] = [
  // Entrance anchors are derived from the measured gate centre and normals,
  // not from the superseded annotated route screenshot.
  { id: "ROUTE_01_START", position: TINGYUXUAN_MAIN_GATE_AUDIT.outsideSpawn, yaw: TINGYUXUAN_MAIN_GATE_AUDIT.spawnYaw, regionId: "AREA_A", firstPass: "open", confidence: "master-measured" },
  { id: "ROUTE_02_A_ENTRY", position: TINGYUXUAN_MAIN_GATE_AUDIT.insideEntry, yaw: TINGYUXUAN_MAIN_GATE_AUDIT.spawnYaw, regionId: "AREA_A", firstPass: "open", confidence: "master-measured" },
  { id: "ROUTE_03_A_LOOP", position: [1.8, GAMEPLAY_ANCHOR_REFERENCE_Y, 41.2], yaw: 0.73, regionId: "AREA_A", firstPass: "open", confidence: "annotated-plan-calibrated" },
  { id: "ROUTE_04_A_EAST_EXIT", position: [1.9, GAMEPLAY_ANCHOR_REFERENCE_Y, 31.2], yaw: 0.37, regionId: "AREA_A", firstPass: "open", confidence: "blender-reviewed" },
  { id: "ROUTE_05_B_MAIN_COURT", position: [-1, GAMEPLAY_ANCHOR_REFERENCE_Y, 24], yaw: 1.14, regionId: "AREA_B", firstPass: "open", confidence: "annotated-plan-calibrated" },
  { id: "ROUTE_06_B_NORTHEAST_LINK", position: [-11.5, GAMEPLAY_ANCHOR_REFERENCE_Y, 19.2], yaw: 1.13, regionId: "AREA_B", firstPass: "open", confidence: "annotated-plan-calibrated" },
  { id: "ROUTE_07_C_ENTRY", position: [-22, GAMEPLAY_ANCHOR_REFERENCE_Y, 14.2], yaw: 1.13, regionId: "AREA_C", firstPass: "open", confidence: "annotated-plan-calibrated" },
] as const;

export const tingYuXuanChapterAnchors: readonly GameplayAnchorDefinition[] = [
  { id: "A_BASELINE", position: [6.1, GAMEPLAY_ANCHOR_REFERENCE_Y, 44.8], yaw: 0.78, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
  { id: "A_FALSE_PATH", position: [4.1, GAMEPLAY_ANCHOR_REFERENCE_Y, 42.9], yaw: 0.72, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
  { id: "A_LOOP_RETURN", position: [1.8, GAMEPLAY_ANCHOR_REFERENCE_Y, 41.2], yaw: 0.73, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
  { id: "A_WET_FOOTPRINT", position: [2, GAMEPLAY_ANCHOR_REFERENCE_Y, 32.2], yaw: 0.37, regionId: "AREA_A", firstPass: "open", confidence: "provisional" },
  // Prologue anchors are the one coordinate source used by world objects, objective/map targets and interactions.
  { id: "PROLOGUE_STEWARD", position: [3.35, GAMEPLAY_ANCHOR_REFERENCE_Y, 40.0], yaw: -2.46, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  // Front-hall vignette: the former z=41–43 points sat inside the dense
  // vegetation/roof overlap behind the entry path. These points use the clear
  // authored facade immediately south of the measured entrance axis.
  { id: "PROLOGUE_UMBRELLA", position: [5.15, GAMEPLAY_ANCHOR_REFERENCE_Y, 37.7], yaw: 0, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  // Legacy id retained for save/content compatibility; V5.0 uses this point for the front-hall refreshments rather than an old-shoes clue.
  { id: "PROLOGUE_SHOES", position: [4.25, GAMEPLAY_ANCHOR_REFERENCE_Y, 37.95], yaw: 0, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  { id: "PROLOGUE_LEDGER", position: [6.75, GAMEPLAY_ANCHOR_REFERENCE_Y, 37.75], yaw: 0, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  { id: "PROLOGUE_WINDOW_ROW", position: [5.85, GAMEPLAY_ANCHOR_REFERENCE_Y, 43.25], yaw: 0.78, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  { id: "PROLOGUE_LANTERN_TURN", position: [3.9, GAMEPLAY_ANCHOR_REFERENCE_Y, 42.05], yaw: 0.72, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  { id: "PROLOGUE_MOONGATE_VIEW", position: [6.45, GAMEPLAY_ANCHOR_REFERENCE_Y, 39.65], yaw: 0.72, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  { id: "PROLOGUE_ANOMALY", position: [4.15, GAMEPLAY_ANCHOR_REFERENCE_Y, 42.85], yaw: 0.72, regionId: "AREA_A", firstPass: "open", confidence: "runtime-reviewed" },
  { id: "B_TEA_TABLE", position: [-2.2, GAMEPLAY_ANCHOR_REFERENCE_Y, 24.4], yaw: 1.1, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_LEDGER", position: [-4.8, GAMEPLAY_ANCHOR_REFERENCE_Y, 25.1], yaw: 1.25, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_IMAGE_EVIDENCE", position: [-7.2, GAMEPLAY_ANCHOR_REFERENCE_Y, 22.6], yaw: 0.9, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_MISSING_ROOM", position: [-9.1, GAMEPLAY_ANCHOR_REFERENCE_Y, 26.4], yaw: 1.55, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_MISSING_DOOR", position: [-7.7, GAMEPLAY_ANCHOR_REFERENCE_Y, 27.4], yaw: 1.55, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_MISSING_WINDOW", position: [-10.4, GAMEPLAY_ANCHOR_REFERENCE_Y, 27.8], yaw: 0.15, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_MISSING_BOUNDARY", position: [-10.8, GAMEPLAY_ANCHOR_REFERENCE_Y, 25.1], yaw: -1.4, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_MISSING_FURNITURE", position: [-8.4, GAMEPLAY_ANCHOR_REFERENCE_Y, 25.2], yaw: 2.85, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "B_CHILD_BOX", position: [-9.15, GAMEPLAY_ANCHOR_REFERENCE_Y, 26.0], yaw: 1.55, regionId: "AREA_B", firstPass: "locked", confidence: "provisional" },
  { id: "C_WATER_EDGE", position: [-23.8, GAMEPLAY_ANCHOR_REFERENCE_Y, 12.8], yaw: 1.05, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
  { id: "C_WOODEN_STEPS", position: [-25.8, GAMEPLAY_ANCHOR_REFERENCE_Y, 11.4], yaw: 1.05, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
  { id: "C_FALL_POINT", position: [-27.2, GAMEPLAY_ANCHOR_REFERENCE_Y, 10.1], yaw: 1.05, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
  { id: "C_FINAL_PAVILION", position: [-28.5, GAMEPLAY_ANCHOR_REFERENCE_Y, 7.4], yaw: Math.PI, regionId: "AREA_C", firstPass: "locked", confidence: "provisional" },
] as const;

export const tingYuXuanGameplayAnchors = [...tingYuXuanRouteAnchors, ...tingYuXuanChapterAnchors] as const;

export const tingYuXuanGameplayRegions: readonly GameplayRegionDefinition[] = [
  { id: "AREA_A", label: "旧园入口区", center: [7, 42.5], halfExtents: [12, 13.5], chapters: ["序章", "第一章"], firstPass: "open" },
  { id: "AREA_B", label: "主宅调查区", center: [-5, 24], halfExtents: [11, 7], chapters: ["第二章", "第三章"], firstPass: "open" },
  { id: "AREA_C", label: "深园水域区", center: [-22, 10], halfExtents: [13, 10], chapters: ["第五章", "终章"], firstPass: "entry-only" },
] as const;

const routeSegments = tingYuXuanRouteAnchors.slice(0, -1).map((from, index) => {
  const to = tingYuXuanRouteAnchors[index + 1];
  const dx = to.position[0] - from.position[0];
  const dz = to.position[2] - from.position[2];
  const length = Math.hypot(dx, dz);
  return {
    id: `route-ground-${String(index + 1).padStart(2, "0")}`,
    center: [(from.position[0] + to.position[0]) / 2, -0.25, (from.position[2] + to.position[2]) / 2] as GameplayVec3,
    halfExtents: [1.8, 0.25, length / 2 + 0.45] as GameplayVec3,
    rotationY: Math.atan2(dx, dz),
    category: "route-ground" as const,
  };
});

export const tingYuXuanGameplayColliders: readonly GameplayColliderDefinition[] = [
  { id: "ground-area-a", center: [7, -0.25, 42.5], halfExtents: [12, 0.25, 13.5], category: "ground" },
  { id: "ground-area-b", center: [-5, -0.25, 24], halfExtents: [11, 0.25, 7], category: "ground" },
  { id: "ground-area-c-entry", center: [-18.5, -0.25, 16.5], halfExtents: [6.5, 0.25, 4.5], category: "ground" },
  // Runtime-reviewed approach surface for the authored wooden stair/railing
  // node 214b32a0.o. The final Master visibly supplies the terrain here; this
  // collider prevents the real capsule from falling through it while testing
  // the exact stair trimesh.
  { id: "c-wooden-steps-approach", center: [-13.59, -0.1, 0.27], halfExtents: [3, 0.1, 1.35], category: "route-ground", specialStructure: { kind: "stair-approach", sourceReference: "TYX_Master_Scene.glb / 214b32a0.o approach terrain", passage: "required" } },
  ...routeSegments,
  { id: "boundary-x-min", center: [-35.25, 1.8, 27.5], halfExtents: [0.25, 1.8, 28.5], category: "world-boundary" },
  { id: "boundary-x-max", center: [19.25, 1.8, 27.5], halfExtents: [0.25, 1.8, 28.5], category: "world-boundary" },
  { id: "boundary-z-min", center: [-8, 1.8, -1.25], halfExtents: [27, 1.8, 0.25], category: "world-boundary" },
  { id: "boundary-z-max", center: [-8, 1.8, 56.25], halfExtents: [27, 1.8, 0.25], category: "world-boundary" },
  { id: "a-x-min-wall", center: [-5.25, 1.6, 42.5], halfExtents: [0.25, 1.6, 13.5], category: "architecture" },
  // TYX_MAIN_GATE_SOUTH measured bounds are x 5.78..12.82 and z 36.20..42.60.
  // Keep the 2.30 m clear opening used by the independent prologue story lock;
  // model the visible frame as left/right wings plus an overhead beam, never as
  // one full box that would seal the doorway.
  { id: "main-gate-frame-z-low", center: [9.3, 1.48, 37.225], halfExtents: [3.52, 1.48, 1.025], category: "architecture", specialStructure: { kind: "door-frame", sourceReference: "TYX_MAIN_GATE_SOUTH", passage: "required" } },
  { id: "main-gate-frame-z-high", center: [9.3, 1.48, 41.575], halfExtents: [3.52, 1.48, 1.025], category: "architecture", specialStructure: { kind: "door-frame", sourceReference: "TYX_MAIN_GATE_SOUTH", passage: "required" } },
  { id: "main-gate-frame-top", center: [9.3, 2.58, 39.4], halfExtents: [3.52, 0.425, 1.15], category: "architecture", specialStructure: { kind: "door-frame", sourceReference: "TYX_MAIN_GATE_SOUTH", passage: "required" } },
  // The threshold footprint comes from the gate's Material #126 primitive;
  // its collision height uses the independently audited 0.09 m threshold
  // contract so it remains below the shared 0.28 m character autostep.
  { id: "main-gate-threshold", center: [8.59, TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT / 2, 39.315], halfExtents: [2.81, TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT / 2, 1.056], category: "architecture", specialStructure: { kind: "threshold", sourceReference: "TYX_MAIN_GATE_SOUTH / Material #126", passage: "required" } },
  { id: "a-b-wall-positive-x", center: [11, 1.6, 29], halfExtents: [8, 1.6, 0.25], category: "architecture" },
  { id: "a-b-wall-negative-x", center: [-2.25, 1.6, 29], halfExtents: [2.75, 1.6, 0.25], category: "architecture" },
  ...TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.components.map((component) => ({
    id: `wife-moon-gate-${component.nodeName.replace("MoonGate_Collider_", "").toLowerCase()}`,
    center: [
      TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.placement[0] + component.center[0],
      component.center[1],
      TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.placement[2] + component.center[2],
    ] as GameplayVec3,
    halfExtents: component.halfExtents,
    category: "architecture" as const,
    specialStructure: {
      kind: "moon-gate" as const,
      sourceReference: `${TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.source} / ${component.nodeName}`,
      passage: "required" as const,
    },
  })),
  { id: "b-c-wall-upper-z", center: [-16, 1.6, 26], halfExtents: [0.25, 1.6, 5], category: "architecture" },
  { id: "b-x-max-wall", center: [6.25, 1.6, 24], halfExtents: [0.25, 1.6, 7], category: "architecture" },
  { id: "b-z-min-wall", center: [-3.5, 1.6, 16.75], halfExtents: [9.5, 1.6, 0.25], category: "architecture" },
  { id: "c-entry-bank-left", center: [-17.63, 1.4, 18.55], halfExtents: [0.18, 1.4, 6.25], rotationY: -2.016, category: "architecture" },
  { id: "c-entry-bank-right", center: [-15.87, 1.4, 14.85], halfExtents: [0.18, 1.4, 6.25], rotationY: -2.016, category: "architecture" },
  // Memory topology is collision, not just tint: the wife's version physically
  // seals the side path while the gardener's version physically seals the east
  // exit. Switching testimony changes the player collision group at runtime.
  { id: "wife-sealed-side-path", center: [4.1, 1.45, 42.9], halfExtents: [1.55, 1.45, 0.18], rotationY: -0.78, category: "memory-wall", memoryIds: ["wife"] },
  { id: "gardener-sealed-east-exit", center: [1.9, 1.45, 31.2], halfExtents: [1.45, 1.45, 0.18], rotationY: -0.38, category: "memory-wall", memoryIds: ["gardener"] },
  { id: "c-deep-first-pass-lock", center: [-23.4, 1.8, 12.5], halfExtents: [0.3, 1.8, 8.5], category: "progression-lock" },
] as const;

const routeGroundPatches: RuntimeGroundPatchDefinition[] = routeSegments.map((segment, index) => ({
  id: `route-patch-${String(index + 1).padStart(2, "0")}`,
  center: [segment.center[0], -0.035, segment.center[2]],
  size: [3.05, segment.halfExtents[2] * 2],
  thickness: 0.04,
  rotationY: segment.rotationY,
  material: index < 5 ? "stone-wet" : "mud-wet",
  layer: "route",
  regionId: index < 3 ? "AREA_A" : index < 5 ? "AREA_B" : "AREA_C",
}));

// Prologue-specific collision contains only the independently controlled story
// gate. The former four-sided prologue pocket was not a world boundary and has
// been removed; the global world boundary already protects the full map.
export const tingYuXuanPrologueColliders: readonly GameplayColliderDefinition[] = [
  { id: "prologue-gate-lock", center: [9.3, 1.65, 39.4], halfExtents: [0.18, 1.65, 1.15], category: "progression-lock", initiallyEnabled: false },
] as const;

export const tingYuXuanGroundPatches: readonly RuntimeGroundPatchDefinition[] = [
  { id: "base-ground", center: [-8, -0.09, 27.5], size: [54, 57], thickness: 0.12, material: "mud-wet", layer: "base" },
  { id: "area-a-ground", center: [7, -0.055, 42.5], size: [24, 27], thickness: 0.06, material: "stone-old", layer: "region", regionId: "AREA_A" },
  { id: "area-b-ground", center: [-5, -0.055, 24], size: [22, 14], thickness: 0.06, material: "stone-wet", layer: "region", regionId: "AREA_B" },
  { id: "area-c-entry-ground", center: [-18.5, -0.06, 16.5], size: [13, 9], thickness: 0.06, material: "mud-wet", layer: "region", regionId: "AREA_C" },
  ...routeGroundPatches,
] as const;

export const containsGameplayRegion = (region: GameplayRegionDefinition, point: { x: number; z: number }) =>
  Math.abs(point.x - region.center[0]) <= region.halfExtents[0]
  && Math.abs(point.z - region.center[1]) <= region.halfExtents[1];

export const resolveGameplayRegionForPoint = (point: { x: number; z: number }): GameplayRegionId =>
  tingYuXuanGameplayRegions.find((region) => containsGameplayRegion(region, point))?.id ?? "OUTSIDE";

export const getGameplayAnchor = (id: RouteAnchorId | ChapterAnchorId): GameplayAnchorDefinition => {
  const anchor = tingYuXuanGameplayAnchors.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Unknown TingYuXuan gameplay anchor: ${id}`);
  return anchor;
};

export const resolveNearestRouteAnchor = (point: { x: number; z: number }) => {
  const nearest = tingYuXuanRouteAnchors.reduce((best, anchor) => {
    const distance = Math.hypot(point.x - anchor.position[0], point.z - anchor.position[2]);
    return distance < best.distance ? { id: anchor.id as RouteAnchorId, distance } : best;
  }, { id: tingYuXuanRouteAnchors[0].id as RouteAnchorId, distance: Number.POSITIVE_INFINITY });
  return nearest;
};
