import { describe, expect, it } from "vitest";
import { containsLayoutPoint, getLayoutAnchor, resolveLayoutTriggerDestination, resolveLayoutZonesForPoint, TINGYUXUAN_RUNTIME_ZONES, tingYuXuanFallbackPlacements, tingYuXuanLayout } from "./tingyuxuan-layout";

describe("TingYuXuan layout v1.2", () => {
  it("keeps ids unique inside each namespace and every destination anchor valid", () => {
    for (const collection of [tingYuXuanLayout.anchors, tingYuXuanLayout.colliders, tingYuXuanLayout.triggers, tingYuXuanLayout.placements, tingYuXuanLayout.interactables]) {
      const ids = collection.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    for (const trigger of tingYuXuanLayout.triggers) {
      if (trigger.destinationAnchorId) expect(() => getLayoutAnchor(trigger.destinationAnchorId!)).not.toThrow();
    }
  });

  it("defines legal simplified colliders and traversable triggers", () => {
    for (const collider of tingYuXuanLayout.colliders) {
      expect(collider.halfExtents.every((value) => Number.isFinite(value) && value > 0)).toBe(true);
    }
    for (const trigger of tingYuXuanLayout.triggers) {
      expect(trigger.halfExtents.every((value) => Number.isFinite(value) && value > 0)).toBe(true);
      expect(containsLayoutPoint(trigger, { x: trigger.center[0], y: trigger.center[1], z: trigger.center[2] })).toBe(true);
      // At the 20 FPS simulation clamp a 4.5 m/s sprint advances 0.225 m;
      // every story trigger is deeper than two sprint frames.
      expect(trigger.halfExtents[2] * 2).toBeGreaterThan(0.45);
    }
  });

  it("leaves capsule-width openings at both curved-corridor turns", () => {
    const playerRadius = 0.32;
    const blocks = (x: number, z: number) => tingYuXuanLayout.colliders
      .filter((collider) => collider.id !== "terrain")
      .some((collider) => Math.abs(x - collider.center[0]) <= collider.halfExtents[0] + playerRadius
        && Math.abs(z - collider.center[2]) <= collider.halfExtents[2] + playerRadius);
    expect(blocks(-8, -3.2)).toBe(false);
    expect(blocks(-8, -4)).toBe(false);
    expect(blocks(2, -4)).toBe(false);
    expect(blocks(2, -6.4)).toBe(false);
  });

  it("preserves story ids and the continuous gate-to-moon-gate route", () => {
    expect(tingYuXuanLayout.roots).toEqual(["gameplaySkeleton", "visualAssets", "proceduralDressing"]);
    expect(tingYuXuanLayout.interactables.map((item) => item.id)).toEqual([
      "waterline-direction", "corridor-count", "wife-moon-gate",
    ]);
    const route = ["west-entry", "front-gate", "front-hall", "west-courtyard", "corridor-turn-one", "corridor-turn-two", "loop-seventh-window", "wife-moon-gate"];
    expect(route.map((id) => getLayoutAnchor(id).position[2])).toEqual([37.5, 25, 23.25, 12, -2, -4, -17, -20]);
  });

  it("keeps formal architecture on audited assets, streams the park, and keeps greybox fallback-only", () => {
    const phaseOnePreload = tingYuXuanLayout.placements.filter((placement) => placement.load === "preload");
    expect(phaseOnePreload.map((placement) => placement.assetId)).toEqual(["tyx-arch-siheyuan-source-a"]);
    expect(tingYuXuanLayout.placements.find((placement) => placement.id === "courtyard-park-west-garden")?.load).toBe("deferred");
    expect(tingYuXuanLayout.placements.find((placement) => placement.id === "secondary-garden-pavilion")).toMatchObject({ assetId: "tyx-arch-pavilion-b", load: "deferred", zone: "rockery" });
    expect(tingYuXuanLayout.placements.some((placement) => placement.assetId === "tyx-arch-greybox-fallback-a")).toBe(false);
    expect(tingYuXuanFallbackPlacements.length).toBeGreaterThan(0);
    expect(tingYuXuanFallbackPlacements.every((placement) => placement.assetId === "tyx-arch-greybox-fallback-a")).toBe(true);
  });

  it("streams all completed TingYuXuan districts while keeping the entrance preload minimal", () => {
    expect(TINGYUXUAN_RUNTIME_ZONES).toEqual(["west-courtyard", "corridor", "rockery", "water-court", "north-house", "inner-house"]);
    expect(resolveLayoutZonesForPoint({ x: -8, z: 12 })).toContain("west-courtyard");
    expect(resolveLayoutZonesForPoint({ x: 2, z: -13 })).toContain("corridor");
    expect(resolveLayoutZonesForPoint({ x: 14, z: -17 })).toContain("rockery");
    expect(resolveLayoutZonesForPoint({ x: 10, z: -29 })).toContain("water-court");
    expect(resolveLayoutZonesForPoint({ x: 10, z: 11 })).toContain("north-house");
    expect(resolveLayoutZonesForPoint({ x: -13, z: 18 })).toContain("inner-house");
  });

  it("leaves a deliberate opening in the west pond bank for the bridge approach", () => {
    const point = getLayoutAnchor("bridge-approach").position;
    const blockingWestBank = tingYuXuanLayout.colliders
      .filter((collider) => collider.id.startsWith("pond-west"))
      .some((collider) => Math.abs(point[0] - collider.center[0]) <= collider.halfExtents[0] + 1.1
        && Math.abs(point[2] - collider.center[2]) <= collider.halfExtents[2]);
    expect(blockingWestBank).toBe(false);
  });

  it("applies the gardener loop and wife escape only in their matching memories", () => {
    const loopPoint = { x: 2, y: 1.2, z: -20.25 };
    expect(resolveLayoutTriggerDestination("gardener-corridor-loop", "gardener", loopPoint)?.id).toBe("west-courtyard");
    expect(resolveLayoutTriggerDestination("gardener-corridor-loop", "wife", loopPoint)).toBeUndefined();
    const exitPoint = { x: 2, y: 1.2, z: -21.75 };
    expect(resolveLayoutTriggerDestination("wife-moon-gate-exit", "wife", exitPoint)?.id).toBe("west-safe-courtyard");
    expect(resolveLayoutTriggerDestination("wife-moon-gate-exit", "gardener", exitPoint)).toBeUndefined();
  });

  it("uses exactly the audited Quaternius 3/3/2/2 subset", () => {
    const nodes = tingYuXuanLayout.placements
      .filter((item) => item.assetId === "tyx-nat-quaternius-set-a")
      .map((item) => item.nodeName);
    expect(nodes).toHaveLength(10);
    expect(nodes.filter((name) => name?.includes("Rock"))).toHaveLength(3);
    expect(nodes.filter((name) => name?.includes("Bush") || name?.includes("Plant"))).toHaveLength(3);
    expect(nodes.filter((name) => name?.includes("Tree"))).toHaveLength(2);
    expect(nodes.filter((name) => name?.includes("Grass") || name?.includes("Fern"))).toHaveLength(2);
  });
});
