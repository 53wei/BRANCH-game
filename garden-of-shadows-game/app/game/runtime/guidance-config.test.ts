import { describe, expect, it } from "vitest";
import { guidanceLevelForElapsed, guidanceLevelForProximity, GUIDANCE_PROXIMITY_METERS, GUIDANCE_TIMING_SECONDS } from "./guidance-config";

describe("guidanceLevelForElapsed", () => {
  it("escalates only at 20, 45 and 90 active seconds", () => {
    expect(GUIDANCE_TIMING_SECONDS).toEqual({ distance: 20, spokenHint: 45, worldMarker: 90 });
    expect(guidanceLevelForElapsed(19.99)).toBe(0);
    expect(guidanceLevelForElapsed(20)).toBe(1);
    expect(guidanceLevelForElapsed(44.99)).toBe(1);
    expect(guidanceLevelForElapsed(45)).toBe(2);
    expect(guidanceLevelForElapsed(89.99)).toBe(2);
    expect(guidanceLevelForElapsed(90)).toBe(3);
  });

  it("quietens explicit guidance when the player has already reached the target area", () => {
    expect(GUIDANCE_PROXIMITY_METERS).toEqual({ quiet: 3.2, directionOnly: 8 });
    expect(guidanceLevelForProximity(3, 12)).toBe(3);
    expect(guidanceLevelForProximity(3, 7.9)).toBe(1);
    expect(guidanceLevelForProximity(3, 3.2)).toBe(0);
    expect(guidanceLevelForProximity(2)).toBe(2);
  });
});
