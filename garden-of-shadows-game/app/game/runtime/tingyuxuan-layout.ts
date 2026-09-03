import type { MemoryId } from "../types";
import type { RuntimeAssetId } from "./RuntimeAssetLoader";
import {
  GAMEPLAY_ANCHOR_REFERENCE_Y,
  GAMEPLAY_GROUND_Y,
  getGameplayAnchor,
  TINGYUXUAN_GAMEPLAY_MAP_VERSION,
  TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT,
  WORLD_METERS_PER_UNIT,
  tingYuXuanGameplayAnchors,
  tingYuXuanGameplayColliders,
} from "./tingyuxuan-gameplay-map";

export type Vec3 = readonly [number, number, number];

export interface LayoutAnchor {
  id: string;
  position: Vec3;
  yaw: number;
  role: "spawn" | "checkpoint" | "camera" | "landmark";
}

export interface LayoutCollider {
  id: string;
  center: Vec3;
  halfExtents: Vec3;
  rotationY?: number;
  category?: "ground" | "route-ground" | "world-boundary" | "architecture" | "progression-lock" | "memory-wall";
  memoryIds?: readonly MemoryId[];
  initiallyEnabled?: boolean;
  specialStructure?: {
    kind: "door-frame" | "moon-gate" | "threshold" | "stair-approach";
    sourceReference: string;
    passage: "required" | "restricted" | "none";
  };
}

export interface LayoutTrigger {
  id: string;
  center: Vec3;
  halfExtents: Vec3;
  kind: "arrival" | "memory-loop" | "chapter-exit" | "chapter-route";
  memoryIds?: MemoryId[];
  destinationAnchorId?: string;
}

export type LayoutZone = "front-gate" | "front-hall" | "west-courtyard" | "corridor" | "water-court" | "rockery" | "north-house" | "inner-house";

export interface LayoutPlacement {
  id: string;
  assetId: RuntimeAssetId;
  nodeName?: string;
  position: Vec3;
  rotationY?: number;
  scale?: Vec3;
  load: "preload" | "deferred";
  zone: LayoutZone;
  loadZones?: readonly LayoutZone[];
  hiddenNodeNames?: readonly string[];
}

export interface LayoutZoneLoadVolume {
  zone: LayoutZone;
  center: readonly [number, number];
  radius: number;
}

export interface LayoutInteractable {
  id: "waterline-direction" | "corridor-count" | "wife-moon-gate";
  label: string;
  position: Vec3;
  memoryIds: MemoryId[];
  kind: "contradiction" | "portal";
}

export const TINGYUXUAN_LAYOUT_VERSION = TINGYUXUAN_GAMEPLAY_MAP_VERSION;

const gameplayAlias = (id: string, sourceId: Parameters<typeof getGameplayAnchor>[0], role: LayoutAnchor["role"]): LayoutAnchor => {
  const source = getGameplayAnchor(sourceId);
  return { id, position: source.position, yaw: source.yaw, role };
};

const anchors: LayoutAnchor[] = [
  ...tingYuXuanGameplayAnchors.map((anchor): LayoutAnchor => ({
    id: anchor.id,
    position: anchor.position,
    yaw: anchor.yaw,
    role: anchor.id === "ROUTE_01_START" ? "spawn" : anchor.id.startsWith("ROUTE_") ? "checkpoint" : "landmark",
  })),
  // Compatibility aliases preserve story/save IDs while all positions now
  // resolve onto Runtime Gameplay Map V1 instead of the deprecated layout.
  gameplayAlias("west-entry", "ROUTE_01_START", "spawn"),
  gameplayAlias("front-gate", "ROUTE_02_A_ENTRY", "camera"),
  gameplayAlias("front-hall", "A_BASELINE", "camera"),
  gameplayAlias("west-courtyard", "ROUTE_02_A_ENTRY", "checkpoint"),
  gameplayAlias("west-waterline", "A_FALSE_PATH", "checkpoint"),
  gameplayAlias("corridor-turn-one", "A_LOOP_RETURN", "checkpoint"),
  gameplayAlias("corridor-turn-two", "A_LOOP_RETURN", "checkpoint"),
  gameplayAlias("loop-seventh-window", "A_LOOP_RETURN", "checkpoint"),
  gameplayAlias("chase-retry", "A_BASELINE", "checkpoint"),
  gameplayAlias("wife-moon-gate", "ROUTE_04_A_EAST_EXIT", "checkpoint"),
  gameplayAlias("west-safe-courtyard", "ROUTE_05_B_MAIN_COURT", "checkpoint"),
  gameplayAlias("water-court", "C_WATER_EDGE", "camera"),
  gameplayAlias("pavilion-view", "C_FINAL_PAVILION", "camera"),
  gameplayAlias("bridge-approach", "C_WOODEN_STEPS", "checkpoint"),
  gameplayAlias("water-pavilion-entry", "C_FALL_POINT", "checkpoint"),
  gameplayAlias("pavilion-landmark", "C_FINAL_PAVILION", "landmark"),
  gameplayAlias("rockery-side-route", "ROUTE_06_B_NORTHEAST_LINK", "checkpoint"),
  gameplayAlias("rockery-mouth", "ROUTE_06_B_NORTHEAST_LINK", "camera"),
  gameplayAlias("east-pavilion-landmark", "ROUTE_07_C_ENTRY", "landmark"),
  gameplayAlias("north-tower-entry", "ROUTE_05_B_MAIN_COURT", "checkpoint"),
  gameplayAlias("north-court", "B_TEA_TABLE", "camera"),
  gameplayAlias("interior-entry", "B_MISSING_ROOM", "checkpoint"),
  gameplayAlias("inner-court", "B_LEDGER", "camera"),
];

const colliders: LayoutCollider[] = tingYuXuanGameplayColliders.map((collider) => ({ ...collider }));

const triggers: LayoutTrigger[] = [
  { id: "front-hall-to-west", center: [6.5, 1.2, 45.8], halfExtents: [1.5, 1.8, 1.5], kind: "arrival" },
  { id: "gardener-corridor-loop", center: [1.8, 1.2, 41.2], halfExtents: [1.45, 1.8, 0.65], kind: "memory-loop", memoryIds: ["gardener"], destinationAnchorId: "A_BASELINE" },
  { id: "wife-moon-gate-exit", center: [1.9, 1.2, 31.2], halfExtents: [1.25, 1.8, 0.65], kind: "chapter-exit", memoryIds: ["wife"], destinationAnchorId: "ROUTE_05_B_MAIN_COURT" },
  { id: "rockery-chapter-two-route", center: [-11.5, 1.2, 19.2], halfExtents: [1.2, 1.8, 1.2], kind: "chapter-route", destinationAnchorId: "ROUTE_07_C_ENTRY" },
];

export const tingYuXuanLegacyPlacements: LayoutPlacement[] = [
  // Phase-one formal visual layer: source geometry is preserved. The complete
  // Siheyuan supplies the gate/front-hall compound; Courtyard Park supplies
  // the west-garden and corridor transition instead of the old greybox kit.
  // The authored exterior gate is on the source model's +X side. Rotate the
  // complete source compound so that real gate faces the chapter's +Z entry.
  { id: "siheyuan-front-compound", assetId: "tyx-arch-siheyuan-source-a", position: [0.05, 0.224, 23.25], rotationY: -Math.PI / 2, load: "preload", zone: "front-gate" },
  // Source bounds are 143.33 × 16.54 × 175.58. A 0.185 scale made authored
  // doors and corridor eaves shorter than the 0.9 m player eye. Preserve the
  // real geometry at a legible architectural scale and align minY=-2.6553 to 0.
  { id: "courtyard-park-west-garden", assetId: "tyx-env-courtyard-park-source-a", position: [-1.865, 0.903, -6.7], scale: [0.34, 0.34, 0.34], load: "deferred", zone: "west-courtyard", loadZones: ["west-courtyard", "corridor"] },
  { id: "north-outline", assetId: "tyx-arch-house-a", position: [10, 0, 11], rotationY: Math.PI, scale: [1.05, 1, 1.05], load: "deferred", zone: "north-house" },
  { id: "inner-outline", assetId: "tyx-arch-house-a", position: [-13, 0, 18], rotationY: Math.PI / 2, scale: [0.9, 0.85, 0.9], load: "deferred", zone: "inner-house" },
  { id: "water-pavilion", assetId: "tyx-arch-pavilion-a", position: [10, 0.2, -32], rotationY: Math.PI, scale: [0.72, 0.72, 0.72], load: "deferred", zone: "water-court" },
  { id: "water-bridge", assetId: "tyx-gmp-bridge-low-a", position: [7.3, 0.18, -25.5], rotationY: Math.PI / 2, scale: [0.82, 0.82, 0.82], load: "deferred", zone: "water-court" },
  { id: "secondary-garden-pavilion", assetId: "tyx-arch-pavilion-b", position: [18, 0, -9], rotationY: -Math.PI / 2, scale: [0.9, 0.9, 0.9], load: "deferred", zone: "rockery" },
  { id: "rockery-a", assetId: "tyx-nat-rock-set-a", nodeName: "Rock_A", position: [12.4, 0, -14.8], scale: [1.5, 1.7, 1.5], load: "deferred", zone: "rockery" },
  { id: "rockery-b", assetId: "tyx-nat-rock-set-a", nodeName: "Rock_B", position: [15.2, 0, -18.5], rotationY: 0.8, scale: [1.35, 1.5, 1.35], load: "deferred", zone: "rockery" },
  { id: "rockery-c", assetId: "tyx-nat-rock-set-a", nodeName: "Rock_C", position: [11.7, 0, -19.2], rotationY: 1.6, scale: [1.15, 1.2, 1.15], load: "deferred", zone: "rockery" },
  { id: "cc0-rock-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Rock_A", position: [5.1, 0, -34.2], rotationY: 0.4, scale: [1.35, 1.35, 1.35], load: "deferred", zone: "water-court" },
  { id: "cc0-rock-b", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Rock_B", position: [15.1, 0, -24.2], rotationY: 1.2, scale: [1.55, 1.55, 1.55], load: "deferred", zone: "water-court" },
  { id: "cc0-rock-c", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Rock_C", position: [14.6, 0, -34.5], rotationY: 2.15, scale: [1.2, 1.2, 1.2], load: "deferred", zone: "water-court" },
  { id: "cc0-bush-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Bush_A", position: [5.2, 0, -22.4], rotationY: -0.5, scale: [1.1, 1.1, 1.1], load: "deferred", zone: "water-court" },
  { id: "cc0-bush-flowers-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Bush_Flowers_A", position: [15, 0, -24], rotationY: 0.8, scale: [1.15, 1.15, 1.15], load: "deferred", zone: "water-court" },
  { id: "cc0-plant-big-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Plant_Big_A", position: [-11, 0, 14], rotationY: 1.7, scale: [0.9, 0.9, 0.9], load: "deferred", zone: "west-courtyard" },
  { id: "cc0-tree-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Tree_A", position: [14, 0, -26], rotationY: -0.35, scale: [1.25, 1.25, 1.25], load: "deferred", zone: "water-court" },
  { id: "cc0-tree-b", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Tree_B", position: [-11, 0, 7], rotationY: 0.65, scale: [1.05, 1.05, 1.05], load: "deferred", zone: "west-courtyard" },
  { id: "cc0-grass-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Grass_A", position: [6.1, 0, -23.8], rotationY: -0.2, scale: [1.3, 1.3, 1.3], load: "deferred", zone: "water-court" },
  { id: "cc0-fern-a", assetId: "tyx-nat-quaternius-set-a", nodeName: "Quaternius_Fern_A", position: [12.1, 0, -22.6], rotationY: 1.3, scale: [1.2, 1.2, 1.2], load: "deferred", zone: "water-court" },
];

// Runtime metres are calibrated from authored architecture instead of the old
// thumbnail-scale 0.2 import. MOD_A_WallGate_10m has a 3.3674-unit clear
// opening and MOD_A_WallStraight_16m is 4.6034 units high. At 0.64 they become
// a 2.155 m door and a 2.946 m garden wall. The X/Z translation keeps the
// placed TYX_MAIN_GATE_SOUTH centre at (9.3, 39.4), while Y=6.767 puts its
// authored base on gameplay ground.
export const TINGYUXUAN_MASTER_SCALE_CALIBRATION = {
  metersPerWorldUnit: WORLD_METERS_PER_UNIT,
  gameplayGroundY: GAMEPLAY_GROUND_Y,
  anchorReferenceY: GAMEPLAY_ANCHOR_REFERENCE_Y,
  sourceScale: 0.2,
  runtimeScale: 0.64,
  scaleFactor: 3.2,
  characterHeight: 1.693,
  wallHeight: 2.946,
  doorHeight: 2.155,
  thresholdHeight: TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT,
  fixedGateCenter: [9.3, 39.4] as const,
  measuredReferences: {
    adult: { meters: 1.693, source: "character calibration" },
    doorClear: { meters: 2.155, source: "MOD_A_WallGate_10m" },
    gardenWall: { meters: 2.946, source: "MOD_A_WallStraight_16m" },
    gateThreshold: { meters: 0.09, source: "TYX_MAIN_GATE_SOUTH" },
  },
} as const;

export const TINGYUXUAN_MASTER_ROOT_TRANSFORM = {
  position: [-17.26, 6.767, -182.68] as Vec3,
  rotationY: Math.PI / 2,
  scale: [0.64, 0.64, 0.64] as Vec3,
} as const;

// Blender visibility flags are not represented by core glTF nodes. These roots
// were hidden source/backup objects in the final .blend and must not reappear in
// the browser as duplicate formal architecture.
export const TINGYUXUAN_MASTER_HIDDEN_NODES = [
  // A_ExpandedBoundary is authored visible in the final .blend and contains
  // TYX_MAIN_GATE_SOUTH plus the placed full-height boundary modules. It must
  // remain visible; only the hidden MOD_A_* source templates stay out of glTF.
  // Preserve the authored outer terrain/mountain and transition planting.
  // They are part of the Master Scene's visual envelope and must remain visible
  // in normal gameplay; collision is handled separately by Runtime physics.
  "B_CoreGarden_Backup",
  "CONN_SourcePavingTile",
  "Cube",
  // Do not hide generic Sketchfab/skfb wrapper roots: in the authored Master
  // they can own visible descendants. Hiding a wrapper hides the whole subtree
  // and can make an entire imported building/garden group disappear.
  // Two source-garden meshes occupy the ROUTE_01 camera/player corridor
  // (runtime bounds x 8.66–10.53, z 46.76–48.81). They are entrance willow
  // trunk/canopy pieces, not architecture, and obscure both Zhao Ying and the
  // wall gate in the required spawn composition.
  "1d6d0730.o",
  "1d6d5ce0.o",
  // GLTFLoader sanitizes the same node names for Object3D lookup.
  "1d6d0730o",
  "1d6d5ce0o",
  // This paired outer-garden plant mesh is exported as one long trunk set plus
  // one translucent foliage-card set. At ROUTE_01 the cards lie almost flat in
  // front of the camera and render as large tan polygons instead of vegetation.
  // Keep the authored wall/buildings and remove only the broken plant pair.
  "1d621248.o",
  "1d639b88.o",
  "1d621248o",
  "1d639b88o",
] as const;

const placements: LayoutPlacement[] = [{
  id: "master-scene",
  assetId: "tyx-master-scene",
  ...TINGYUXUAN_MASTER_ROOT_TRANSFORM,
  load: "preload",
  zone: "front-gate",
  hiddenNodeNames: TINGYUXUAN_MASTER_HIDDEN_NODES,
}];

export const TINGYUXUAN_LAYOUT_AUDIT = {
  keep: ["roots", "memory-layers", "procedural-atmosphere"],
  remap: ["legacy story aliases onto Gameplay Map V1"],
  deprecate: ["legacy formal architecture placements"],
  unknown: ["provisional chapter anchors until chapter walkthrough"],
} as const;

// Streaming is driven by gameplay-space volumes rather than arbitrary chapter
// milestones. The whole TingYuXuan topology can now stream in without forcing
// every large visual asset into the entrance preload.
export const TINGYUXUAN_RUNTIME_ZONES: readonly LayoutZone[] = [
  "west-courtyard",
  "corridor",
  "rockery",
  "water-court",
  "north-house",
  "inner-house",
] as const;

export const tingYuXuanZoneLoadVolumes: readonly LayoutZoneLoadVolume[] = [
  { zone: "west-courtyard", center: [7, 42.5], radius: 14 },
  { zone: "corridor", center: [2.5, 40], radius: 9 },
  { zone: "rockery", center: [-12, 19], radius: 8 },
  { zone: "water-court", center: [-22, 10], radius: 13 },
  { zone: "north-house", center: [-3, 24], radius: 8 },
  { zone: "inner-house", center: [-8, 25], radius: 7 },
] as const;

export const resolveLayoutZonesForPoint = (point: { x: number; z: number }): LayoutZone[] => {
  const zones = tingYuXuanZoneLoadVolumes
    .filter((volume) => Math.hypot(point.x - volume.center[0], point.z - volume.center[1]) <= volume.radius)
    .map((volume) => volume.zone);
  return [...new Set(zones)];
};

export const placementLoadsInZones = (placement: LayoutPlacement, zones: ReadonlySet<LayoutZone>) =>
  (placement.loadZones ?? [placement.zone]).some((zone) => zones.has(zone));

// Explicit opt-in fallback only. These instances never enter visualAssets and
// are shown only with ?fallbackArchitecture=1 or during layout debugging.
export const tingYuXuanFallbackPlacements: LayoutPlacement[] = [
  { id: "fallback-gate-moon-frame", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Wall_MoonGate_Base", position: [0, 0, 30], load: "preload", zone: "front-gate" },
  { id: "fallback-gate-door", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Door_Wood", position: [0, 0, 30.1], load: "preload", zone: "front-gate" },
  { id: "fallback-front-hall", assetId: "tyx-arch-greybox-fallback-a", nodeName: "House_Small", position: [0, 0, 18.5], load: "preload", zone: "front-hall" },
  { id: "fallback-west-house", assetId: "tyx-arch-greybox-fallback-a", nodeName: "House_Small", position: [-8, 0, 14], rotationY: Math.PI, load: "preload", zone: "west-courtyard" },
  { id: "fallback-west-run-a", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [-8, 0, 7], load: "preload", zone: "corridor" },
  { id: "fallback-west-run-b", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [-8, 0, 0], load: "preload", zone: "corridor" },
  { id: "fallback-turn-one", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Corner", position: [-8, 0, -4], rotationY: -Math.PI / 2, load: "preload", zone: "corridor" },
  { id: "fallback-cross-run", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [-3, 0, -4], rotationY: Math.PI / 2, load: "preload", zone: "corridor" },
  { id: "fallback-turn-two", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Corner", position: [2, 0, -4], rotationY: Math.PI, load: "preload", zone: "corridor" },
  { id: "fallback-loop-run-a", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [2, 0, -9], load: "preload", zone: "corridor" },
  { id: "fallback-loop-run-b", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Corridor_Straight_8m", position: [2, 0, -16.5], load: "preload", zone: "corridor" },
  { id: "fallback-loop-window-a", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Wall_Window", position: [3.9, 0, -11], rotationY: Math.PI / 2, load: "preload", zone: "corridor" },
  { id: "fallback-loop-window-b", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Window_Lattice", position: [3.9, 0, -15], rotationY: Math.PI / 2, load: "preload", zone: "corridor" },
  { id: "fallback-story-moon-gate", assetId: "tyx-arch-greybox-fallback-a", nodeName: "Wall_MoonGate_Base", position: [2, 0, -21], load: "preload", zone: "corridor" },
];

const interactables: LayoutInteractable[] = [
  { id: "waterline-direction", label: "勘验墙脚与侧路痕迹", position: [4.1, 1.1, 42.9], memoryIds: ["wife", "gardener"], kind: "contradiction" },
  { id: "corridor-count", label: "核对重复地标", position: [1.8, 1.2, 41.2], memoryIds: ["wife", "gardener"], kind: "contradiction" },
  { id: "wife-moon-gate", label: "穿过西院东侧门洞", position: [1.9, 1.2, 31.2], memoryIds: ["wife"], kind: "portal" },
];

export const tingYuXuanLayout = {
  id: "ting-yu-xuan",
  version: TINGYUXUAN_LAYOUT_VERSION,
  roots: ["gameplaySkeleton", "visualAssets", "proceduralDressing"] as const,
  anchors,
  colliders,
  triggers,
  placements,
  interactables,
};

export const getLayoutAnchor = (id: string): LayoutAnchor => {
  const anchor = anchors.find((candidate) => candidate.id === id);
  if (!anchor) throw new Error(`Unknown TingYuXuan anchor: ${id}`);
  return anchor;
};

export const getLayoutTrigger = (id: string): LayoutTrigger => {
  const trigger = triggers.find((candidate) => candidate.id === id);
  if (!trigger) throw new Error(`Unknown TingYuXuan trigger: ${id}`);
  return trigger;
};

export const containsLayoutPoint = (trigger: LayoutTrigger, point: { x: number; y: number; z: number }) =>
  Math.abs(point.x - trigger.center[0]) <= trigger.halfExtents[0]
  && Math.abs(point.y - trigger.center[1]) <= trigger.halfExtents[1]
  && Math.abs(point.z - trigger.center[2]) <= trigger.halfExtents[2];

export const resolveLayoutTriggerDestination = (triggerId: string, memoryId: MemoryId, point: { x: number; y: number; z: number }) => {
  const trigger = getLayoutTrigger(triggerId);
  if (trigger.memoryIds?.length && !trigger.memoryIds.includes(memoryId)) return undefined;
  if (!containsLayoutPoint(trigger, point) || !trigger.destinationAnchorId) return undefined;
  return getLayoutAnchor(trigger.destinationAnchorId);
};

export const interactablePosition = (id: LayoutInteractable["id"]): [number, number, number] => {
  const position = interactables.find((item) => item.id === id)?.position;
  if (!position) throw new Error(`Unknown TingYuXuan interactable: ${id}`);
  return [...position];
};
