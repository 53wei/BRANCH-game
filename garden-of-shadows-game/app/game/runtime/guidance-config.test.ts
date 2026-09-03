import { describe, expect, it } from "vitest";
import { guidanceLevelForElapsed, GUIDANCE_TIMING_SECONDS } from "./guidance-config";

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
});

