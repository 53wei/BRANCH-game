import type { MemoryId } from "../types";
import type { RuntimeAssetId } from "./RuntimeAssetLoader";

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
  memoryIds?: MemoryId[];
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

export const TINGYUXUAN_LAYOUT_VERSION = "tingyuxuan-v1.2";

const anchors: LayoutAnchor[] = [
  { id: "west-entry", position: [1.5, 0.9, 37.5], yaw: 0, role: "spawn" },
  { id: "front-gate", position: [0, 0.9, 25], yaw: 0, role: "camera" },
  { id: "front-hall", position: [0, 0.9, 23.25], yaw: 0, role: "camera" },
  { id: "west-courtyard", position: [-8, 0.9, 12], yaw: 0, role: "checkpoint" },
  { id: "west-waterline", position: [-8, 0.9, 6], yaw: 0, role: "checkpoint" },
  { id: "corridor-turn-one", position: [-8, 0.9, -2], yaw: -Math.PI / 2, role: "checkpoint" },
  { id: "corridor-turn-two", position: [2, 0.9, -4], yaw: 0, role: "checkpoint" },
  { id: "loop-seventh-window", position: [2, 0.9, -17], yaw: 0, role: "checkpoint" },
  { id: "chase-retry", position: [2, 0.9, -10], yaw: 0, role: "checkpoint" },
  { id: "wife-moon-gate", position: [2, 0.9, -20], yaw: 0, role: "checkpoint" },
  { id: "west-safe-courtyard", position: [2, 0.9, -23], yaw: -0.25, role: "checkpoint" },
  { id: "water-court", position: [8, 1.05, -26], yaw: 0.2, role: "camera" },
  { id: "pavilion-view", position: [3.8, 1.2, -24], yaw: -0.65, role: "camera" },
  { id: "bridge-approach", position: [5.6, 0.9, -24.6], yaw: -0.35, role: "checkpoint" },
  { id: "water-pavilion-entry", position: [9.2, 0.9, -30.5], yaw: Math.PI, role: "checkpoint" },
  { id: "pavilion-landmark", position: [10, 0, -32], yaw: Math.PI, role: "landmark" },
  { id: "mirror-threshold", position: [10, 0.9, -34.2], yaw: Math.PI, role: "checkpoint" },
  { id: "rockery-side-route", position: [14, 0.9, -17], yaw: -Math.PI / 2, role: "checkpoint" },
  { id: "rockery-mouth", position: [10.8, 0.9, -18.8], yaw: -0.75, role: "camera" },
  { id: "east-pavilion-landmark", position: [18, 0, -9], yaw: -Math.PI / 2, role: "landmark" },
  { id: "north-tower-entry", position: [10, 0.9, 9], yaw: Math.PI, role: "checkpoint" },
  { id: "north-court", position: [10, 0.9, 15], yaw: Math.PI, role: "camera" },
  { id: "interior-entry", position: [-13, 0.9, 17], yaw: Math.PI / 2, role: "checkpoint" },
  { id: "inner-court", position: [-9.5, 0.9, 18], yaw: -Math.PI / 2, role: "camera" },
];

const colliders: LayoutCollider[] = [
  { id: "terrain", center: [2, -0.18, 4], halfExtents: [24, 0.2, 40] },
  { id: "front-east-wall", center: [4.2, 1.5, 25], halfExtents: [0.18, 1.5, 5] },
  { id: "front-west-wall", center: [-4.2, 1.5, 25], halfExtents: [0.18, 1.5, 5] },
  { id: "front-gate-left", center: [-3.1, 1.5, 30], halfExtents: [1.2, 1.5, 0.18] },
  { id: "front-gate-right", center: [3.1, 1.5, 30], halfExtents: [1.2, 1.5, 0.18] },
  { id: "front-hall-east", center: [4.2, 1.5, 17], halfExtents: [0.18, 1.5, 3] },
  { id: "front-hall-west", center: [-4.2, 1.5, 17], halfExtents: [0.18, 1.5, 3] },
  { id: "west-court-west-wall", center: [-12.2, 1.5, 10], halfExtents: [0.18, 1.5, 6] },
  { id: "west-court-north-wall", center: [-8, 1.5, 16], halfExtents: [4.2, 1.5, 0.18] },
  { id: "west-corridor-left", center: [-9.8, 1.5, 4], halfExtents: [0.18, 1.5, 8] },
  { id: "west-corridor-right", center: [-6.2, 1.5, 4], halfExtents: [0.18, 1.5, 8] },
  { id: "cross-corridor-north", center: [-3, 1.5, -2.2], halfExtents: [2.8, 1.5, 0.18] },
  { id: "cross-corridor-south", center: [-3, 1.5, -5.8], halfExtents: [2.8, 1.5, 0.18] },
  { id: "loop-corridor-left", center: [0.2, 1.5, -13], halfExtents: [0.18, 1.5, 7.2] },
  { id: "loop-corridor-right", center: [3.8, 1.5, -13], halfExtents: [0.18, 1.5, 7.2] },
  { id: "moon-gate-left", center: [-0.15, 1.7, -21], halfExtents: [0.85, 1.7, 0.22] },
  { id: "moon-gate-right", center: [4.15, 1.7, -21], halfExtents: [0.85, 1.7, 0.22] },
  { id: "moon-gate-top", center: [2, 3.08, -21], halfExtents: [1.3, 0.33, 0.22] },
  // West bank is split to leave a deliberate 3.8 m bridge-approach opening.
  { id: "pond-west-north", center: [4.6, 0.8, -21.95], halfExtents: [0.2, 0.8, 0.45] },
  { id: "pond-west-south", center: [4.6, 0.8, -31.35], halfExtents: [0.2, 0.8, 5.15] },
  { id: "pond-east", center: [15.4, 0.8, -29], halfExtents: [0.2, 0.8, 7.5] },
  { id: "pond-north", center: [10, 0.8, -21.5], halfExtents: [5.6, 0.8, 0.2] },
  { id: "pond-south", center: [10, 0.8, -36.5], halfExtents: [5.6, 0.8, 0.2] },
  { id: "north-house", center: [10, 1.8, 11], halfExtents: [5.4, 1.8, 2.3] },
  { id: "inner-house", center: [-13, 1.8, 18], halfExtents: [4.8, 1.8, 3.2] },
  { id: "rockery-block-a", center: [12.4, 1.4, -14.8], halfExtents: [1.3, 1.4, 1.7] },
  { id: "rockery-block-b", center: [15.3, 1.2, -18.5], halfExtents: [1.2, 1.2, 1.5] },
  { id: "rockery-block-c", center: [11.7, 1.1, -19.2], halfExtents: [0.9, 1.1, 1.2] },
];

const triggers: LayoutTrigger[] = [
  { id: "front-hall-to-west", center: [-7.8, 1.2, 13.6], halfExtents: [1.7, 1.8, 1.2], kind: "arrival" },
  { id: "gardener-corridor-loop", center: [2, 1.2, -20.25], halfExtents: [1.45, 1.8, 0.55], kind: "memory-loop", memoryIds: ["gardener"], destinationAnchorId: "west-courtyard" },
  { id: "wife-moon-gate-exit", center: [2, 1.2, -21.75], halfExtents: [1.25, 1.8, 0.55], kind: "chapter-exit", memoryIds: ["wife"], destinationAnchorId: "west-safe-courtyard" },
  { id: "rockery-chapter-two-route", center: [15.5, 1.2, -15.5], halfExtents: [1.2, 1.8, 1.2], kind: "chapter-route", destinationAnchorId: "rockery-side-route" },
];

const placements: LayoutPlacement[] = [
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
  { zone: "west-courtyard", center: [-5.5, 7], radius: 18 },
  { zone: "corridor", center: [-1.5, -10], radius: 18 },
  { zone: "rockery", center: [13.5, -17], radius: 12 },
  { zone: "water-court", center: [10, -29], radius: 17 },
  { zone: "north-house", center: [10, 11], radius: 11 },
  { zone: "inner-house", center: [-13, 18], radius: 11 },
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
  { id: "waterline-direction", label: "勘验逆向水痕", position: [-8, 1.1, 6], memoryIds: ["wife", "gardener"], kind: "contradiction" },
  { id: "corridor-count", label: "核对重复漏窗", position: [2.8, 1.2, -14], memoryIds: ["wife", "gardener"], kind: "contradiction" },
  { id: "wife-moon-gate", label: "穿过夫人记忆里的月洞门", position: [2, 1.2, -21], memoryIds: ["wife"], kind: "portal" },
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
