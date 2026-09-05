import { tingYuXuanGameplayRegions, tingYuXuanRouteAnchors, type GameplayRegionId } from "./tingyuxuan-gameplay-map";

export interface MapBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface MapPoint {
  x: number;
  z: number;
}

export const FULL_MAP_BOUNDS: MapBounds = { minX: -35.5, maxX: 19.5, minZ: -1.5, maxZ: 56.5 };
export const A_ZONE_MAP_BOUNDS: MapBounds = { minX: -5.5, maxX: 19.5, minZ: 29, maxZ: 56.5 };

export const MAP_ASSETS = {
  miniMapA: "/media/maps/minimap/map-minimap-a-zone-v1.webp",
  fullMap: "/media/maps/fullmap/map-minimap-full-v1.webp",
} as const;

export const MAP_REGIONS = tingYuXuanGameplayRegions.map((region) => ({
  id: region.id,
  label: region.label,
  center: { x: region.center[0], z: region.center[1] },
  halfExtents: { x: region.halfExtents[0], z: region.halfExtents[1] },
}));

export const MAP_ROUTE = tingYuXuanRouteAnchors.map((anchor) => ({
  id: anchor.id,
  regionId: anchor.regionId,
  position: { x: anchor.position[0], z: anchor.position[2] },
}));

export const discoveredMapRoute = (openRegions: readonly GameplayRegionId[]) => {
  const visible = new Set(openRegions);
  return MAP_ROUTE.filter((point) => visible.has(point.regionId));
};

export const MAP_REGION_LABELS: Record<GameplayRegionId, string> = {
  AREA_A: "旧园入口",
  AREA_B: "主宅",
  AREA_C: "深园水域",
  OUTSIDE: "听雨轩外缘",
};

/**
 * Runtime yaw 0 faces world -Z. The map is north-up with world +Z at the top,
 * so the CSS arrow (whose unrotated tip points up) needs a half-turn offset.
 */
export function worldYawToMapDegrees(yaw: number) {
  return ((180 + yaw * 180 / Math.PI) % 360 + 360) % 360;
}

export function mapPointToPercent(point: MapPoint, bounds: MapBounds) {
  const x = (point.x - bounds.minX) / (bounds.maxX - bounds.minX);
  const y = (bounds.maxZ - point.z) / (bounds.maxZ - bounds.minZ);
  return {
    left: Math.max(0, Math.min(100, x * 100)),
    top: Math.max(0, Math.min(100, y * 100)),
  };
}

/** Single world-pose -> north-up map transform shared by MiniMap and FullMap. */
export function worldPoseToMapPose(pose: MapPoint & { yaw: number }, bounds: MapBounds) {
  return {
    ...mapPointToPercent(pose, bounds),
    rotationDegrees: worldYawToMapDegrees(pose.yaw),
  };
}
