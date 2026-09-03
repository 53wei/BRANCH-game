import { describe, expect, it } from "vitest";
import { STORY_BACKDROPS } from "../narrative/story-backdrops";
import { A_ZONE_MAP_BOUNDS, FULL_MAP_BOUNDS, mapPointToPercent } from "./map-config";
import { UI_STORY_ASSET_MANIFEST } from "./ui-story-assets";

describe("UI story asset configuration", () => {
  it("imports every planned first-pass asset and maps world coordinates safely", () => {
    expect(STORY_BACKDROPS["prologue.letter"]).toContain("story-prologue-letter-v1.webp");
    expect(STORY_BACKDROPS["ch1.loop"]).toContain("story-ch1-loop-realization-v1.webp");
    expect(UI_STORY_ASSET_MANIFEST.length).toBeGreaterThanOrEqual(11);
    expect(UI_STORY_ASSET_MANIFEST.every((asset) => asset.path.startsWith("/media/") && asset.fallback === "live-3d-or-css")).toBe(true);
    expect(mapPointToPercent({ x: 7, z: 42.5 }, A_ZONE_MAP_BOUNDS)).toEqual(expect.objectContaining({ left: expect.any(Number), top: expect.any(Number) }));
    expect(mapPointToPercent({ x: 999, z: -999 }, FULL_MAP_BOUNDS)).toEqual({ left: 100, top: 100 });
  });
});
