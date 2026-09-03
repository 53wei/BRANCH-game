import { describe, expect, it } from "vitest";
import { worldYawToMapDegrees } from "./map-config";

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
});

