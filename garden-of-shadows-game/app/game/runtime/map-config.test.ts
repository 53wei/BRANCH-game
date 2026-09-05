import { describe, expect, it } from "vitest";
import { discoveredMapRoute, FULL_MAP_BOUNDS, worldPoseToMapPose, worldYawToMapDegrees } from "./map-config";

describe("worldYawToMapDegrees", () => {
  it.each([
    [0, 180],
    [Math.PI / 4, 225],
    [Math.PI / 2, 270],
    [3 * Math.PI / 4, 315],
    [Math.PI, 0],
    [-3 * Math.PI / 4, 45],
    [-Math.PI / 2, 90],
    [-Math.PI / 4, 135],
  ])("maps runtime yaw %f to north-up CSS rotation %f", (yaw, expected) => {
    expect(worldYawToMapDegrees(yaw)).toBeCloseTo(expected);
  });

  it("converts world position and yaw through one shared MiniMap/FullMap transform", () => {
    const mapped = worldPoseToMapPose({ x: FULL_MAP_BOUNDS.minX, z: FULL_MAP_BOUNDS.maxZ, yaw: -Math.PI / 2 }, FULL_MAP_BOUNDS);
    expect(mapped.left).toBe(0);
    expect(mapped.top).toBe(0);
    expect(mapped.rotationDegrees).toBeCloseTo(90);
  });

  it("draws only route anchors from regions the player has reached", () => {
    expect(new Set(discoveredMapRoute(["AREA_A"]).map((point) => point.regionId))).toEqual(new Set(["AREA_A"]));
    expect(new Set(discoveredMapRoute(["AREA_A", "AREA_B"]).map((point) => point.regionId))).toEqual(new Set(["AREA_A", "AREA_B"]));
    expect(discoveredMapRoute([])).toEqual([]);
  });
});

