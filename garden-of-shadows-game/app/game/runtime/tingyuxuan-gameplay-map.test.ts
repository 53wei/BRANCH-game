import { describe, expect, it } from "vitest";
import { PLAYER_PHYSICS_CALIBRATION } from "./PhysicsController";
import {
  containsGameplayRegion,
  getGameplayAnchor,
  resolveGameplayRegionForPoint,
  resolveNearestRouteAnchor,
  TINGYUXUAN_GAMEPLAY_MAP_VERSION,
  TINGYUXUAN_MAIN_GATE_AUDIT,
  TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT,
  TINGYUXUAN_MOON_GATE_COLLISION_AUDIT,
  tingYuXuanChapterAnchors,
  tingYuXuanGameplayColliders,
  tingYuXuanGameplayRegions,
  tingYuXuanGroundPatches,
  tingYuXuanPrologueColliders,
  tingYuXuanRouteAnchors,
} from "./tingyuxuan-gameplay-map";

describe("TingYuXuan Runtime Gameplay Map V1", () => {
  it("defines the exact seven-step A to B to C route in annotated-map order", () => {
    expect(TINGYUXUAN_GAMEPLAY_MAP_VERSION).toBe("tingyuxuan-gameplay-map-v1");
    expect(tingYuXuanRouteAnchors.map((anchor) => anchor.id)).toEqual([
      "ROUTE_01_START",
      "ROUTE_02_A_ENTRY",
      "ROUTE_03_A_LOOP",
      "ROUTE_04_A_EAST_EXIT",
      "ROUTE_05_B_MAIN_COURT",
      "ROUTE_06_B_NORTHEAST_LINK",
      "ROUTE_07_C_ENTRY",
    ]);
    expect(tingYuXuanRouteAnchors.map((anchor) => anchor.regionId)).toEqual([
      "AREA_A", "AREA_A", "AREA_A", "AREA_A", "AREA_B", "AREA_B", "AREA_C",
    ]);
    expect(getGameplayAnchor("ROUTE_01_START").position).toEqual([14.65, 0.9, 39.4]);
    expect(getGameplayAnchor("ROUTE_01_START").confidence).toBe("master-measured");
    expect(getGameplayAnchor("ROUTE_04_A_EAST_EXIT").confidence).toBe("blender-reviewed");
  });

  it("derives the entrance route from the measured final Master gate", () => {
    expect(TINGYUXUAN_MAIN_GATE_AUDIT.center).toEqual([9.3, 3.005, 39.4]);
    expect(TINGYUXUAN_MAIN_GATE_AUDIT.bounds.size).toEqual([7.04, 6.01, 6.4]);
    expect(TINGYUXUAN_MAIN_GATE_AUDIT.outsideNormal).toEqual([1, 0, 0]);
    expect(TINGYUXUAN_MAIN_GATE_AUDIT.insideNormal).toEqual([-1, 0, 0]);
    expect(getGameplayAnchor("ROUTE_02_A_ENTRY").position).toEqual([6.9, 0.9, 39.4]);
    expect(getGameplayAnchor("ROUTE_02_A_ENTRY").yaw).toBeCloseTo(Math.PI / 2);
    expect(Math.hypot(
      getGameplayAnchor("ROUTE_01_START").position[0] - TINGYUXUAN_MAIN_GATE_AUDIT.exteriorPlaneCenter[0],
      getGameplayAnchor("ROUTE_01_START").position[2] - TINGYUXUAN_MAIN_GATE_AUDIT.exteriorPlaneCenter[2],
    )).toBeGreaterThanOrEqual(1.2);
    expect(Math.hypot(
      getGameplayAnchor("ROUTE_01_START").position[0] - TINGYUXUAN_MAIN_GATE_AUDIT.exteriorPlaneCenter[0],
      getGameplayAnchor("ROUTE_01_START").position[2] - TINGYUXUAN_MAIN_GATE_AUDIT.exteriorPlaneCenter[2],
    )).toBeLessThanOrEqual(2);
  });

  it("resolves every route anchor into a measured A/B/C region", () => {
    for (const anchor of tingYuXuanRouteAnchors) {
      expect(resolveGameplayRegionForPoint({ x: anchor.position[0], z: anchor.position[2] })).toBe(anchor.regionId);
    }
    expect(resolveGameplayRegionForPoint({ x: 100, z: 100 })).toBe("OUTSIDE");
    expect(tingYuXuanGameplayRegions.every((region) => containsGameplayRegion(region, { x: region.center[0], z: region.center[1] }))).toBe(true);
  });

  it("keeps only C entry open while deep-C chapter anchors stay locked", () => {
    expect(getGameplayAnchor("ROUTE_07_C_ENTRY").firstPass).toBe("open");
    expect(tingYuXuanChapterAnchors.filter((anchor) => anchor.regionId === "AREA_C").every((anchor) => anchor.firstPass === "locked")).toBe(true);
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({ id: "c-deep-first-pass-lock", category: "progression-lock" }));
  });

  it("represents the A-zone cognition puzzle with mutually exclusive physical walls", () => {
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({
      id: "wife-sealed-side-path",
      category: "memory-wall",
      memoryIds: ["wife"],
    }));
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({
      id: "gardener-sealed-east-exit",
      category: "memory-wall",
      memoryIds: ["gardener"],
    }));
  });

  it("models the measured main gate as a passable compound frame instead of a sealed box", () => {
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({ id: "main-gate-frame-z-low", category: "architecture" }));
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({ id: "main-gate-frame-z-high", category: "architecture" }));
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({ id: "main-gate-frame-top", category: "architecture" }));
    const openingHalfWidth = 1.15;
    const playerClearance = PLAYER_PHYSICS_CALIBRATION.capsuleRadius;
    expect(openingHalfWidth - playerClearance).toBeGreaterThan(0.75);
    expect(2.155).toBeGreaterThan(PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight + 0.3);
    expect(tingYuXuanGameplayColliders).toContainEqual(expect.objectContaining({
      id: "main-gate-threshold",
      halfExtents: [2.81, TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT / 2, 1.056],
      specialStructure: expect.objectContaining({ kind: "threshold", passage: "required" }),
    }));
    expect(TINGYUXUAN_MAIN_GATE_THRESHOLD_HEIGHT).toBeLessThan(PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight);
  });

  it("uses the project-authored three-box moon-gate collision without sealing its opening", () => {
    expect(TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.source).toBe("public/assets/gameplay/TYX_GMP_MoonGate_Collision.glb");
    expect(TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.components.map((component) => component.nodeName)).toEqual([
      "MoonGate_Collider_Left",
      "MoonGate_Collider_Right",
      "MoonGate_Collider_Top",
    ]);
    expect(TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.clearOpening.width).toBeGreaterThan(
      PLAYER_PHYSICS_CALIBRATION.capsuleRadius * 2 + 1,
    );
    expect(TINGYUXUAN_MOON_GATE_COLLISION_AUDIT.clearOpening.height).toBeGreaterThan(
      PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight + 0.5,
    );
    expect(tingYuXuanGameplayColliders.filter((collider) => collider.specialStructure?.kind === "moon-gate")).toHaveLength(3);
  });

  it("removes the prologue pocket and keeps only a disabled story gate at the measured entrance", () => {
    expect(tingYuXuanPrologueColliders).toHaveLength(1);
    expect(tingYuXuanPrologueColliders).toContainEqual(expect.objectContaining({
      id: "prologue-gate-lock",
      center: [9.3, 1.65, 39.4],
      category: "progression-lock",
      initiallyEnabled: false,
    }));
    expect(tingYuXuanPrologueColliders.some((collider) => collider.id.startsWith("prologue-pocket-"))).toBe(false);
    expect(tingYuXuanGameplayColliders.some((collider) => collider.id === "prologue-gate-lock")).toBe(false);
    expect(getGameplayAnchor("PROLOGUE_LEDGER").regionId).toBe("AREA_A");
  });

  it("keeps anchors and blocking volumes in the same metre-scale player space", () => {
    [...tingYuXuanRouteAnchors, ...tingYuXuanChapterAnchors].forEach((anchor) => {
      expect(anchor.position[1]).toBeGreaterThanOrEqual(0.85);
      expect(anchor.position[1]).toBeLessThanOrEqual(1.05);
    });
    [...tingYuXuanGameplayColliders, ...tingYuXuanPrologueColliders]
      .filter((collider) => ["world-boundary", "architecture", "progression-lock", "memory-wall"].includes(collider.category))
      .forEach((collider) => {
        if (collider.specialStructure?.kind === "threshold") {
          expect(collider.center[1] + collider.halfExtents[1]).toBeLessThanOrEqual(PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight);
          return;
        }
        const blocksAtBodyHeight = collider.halfExtents[1] * 2 > PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight + 0.5;
        const clearsAboveHead = collider.center[1] - collider.halfExtents[1] > PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight;
        expect(blocksAtBodyHeight || clearsAboveHead).toBe(true);
      });
  });

  it("builds three visual ground layers and continuous route-ground colliders", () => {
    expect(new Set(tingYuXuanGroundPatches.map((patch) => patch.layer))).toEqual(new Set(["base", "region", "route"]));
    expect(tingYuXuanGroundPatches.filter((patch) => patch.layer === "route")).toHaveLength(6);
    const routeGround = tingYuXuanGameplayColliders.filter((collider) => collider.category === "route-ground");
    const segmentGround = routeGround.filter((collider) => !collider.specialStructure);
    expect(segmentGround).toHaveLength(tingYuXuanRouteAnchors.length - 1);
    expect(routeGround.filter((collider) => collider.specialStructure?.kind === "stair-approach")).toHaveLength(1);
    segmentGround.forEach((collider, index) => {
      const from = tingYuXuanRouteAnchors[index].position;
      const to = tingYuXuanRouteAnchors[index + 1].position;
      for (const point of [from, to]) {
        const dx = point[0] - collider.center[0];
        const dz = point[2] - collider.center[2];
        const yaw = collider.rotationY ?? 0;
        const localX = Math.cos(yaw) * dx - Math.sin(yaw) * dz;
        const localZ = Math.sin(yaw) * dx + Math.cos(yaw) * dz;
        expect(Math.abs(localX)).toBeLessThanOrEqual(collider.halfExtents[0] + 0.001);
        expect(Math.abs(localZ)).toBeLessThanOrEqual(collider.halfExtents[2] + 0.001);
      }
    });
  });

  it("reports the nearest route milestone for the debug HUD", () => {
    expect(resolveNearestRouteAnchor({ x: 14.6, z: 39.45 }).id).toBe("ROUTE_01_START");
    expect(resolveNearestRouteAnchor({ x: -21.8, z: 14.3 }).id).toBe("ROUTE_07_C_ENTRY");
  });

  it("keeps the seven-step route centerline clear of first-pass blocking walls", () => {
    const blocking = tingYuXuanGameplayColliders.filter((collider) =>
      ["world-boundary", "architecture", "progression-lock"].includes(collider.category)
      && collider.initiallyEnabled !== false
      && collider.center[1] - collider.halfExtents[1] <= PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight + 0.05
      && collider.center[1] + collider.halfExtents[1] > PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight + 0.02,
    );
    // Keep extra controller/safety clearance beyond the calibrated capsule radius so an air wall cannot silently pinch the route.
    const minimumPlayerClearance = PLAYER_PHYSICS_CALIBRATION.capsuleRadius + 0.04;

    const distanceToColliderXZ = (x: number, z: number, collider: (typeof blocking)[number]) => {
      const dx = x - collider.center[0];
      const dz = z - collider.center[2];
      const yaw = collider.rotationY ?? 0;
      const localX = Math.cos(yaw) * dx - Math.sin(yaw) * dz;
      const localZ = Math.sin(yaw) * dx + Math.cos(yaw) * dz;
      const outsideX = Math.max(Math.abs(localX) - collider.halfExtents[0], 0);
      const outsideZ = Math.max(Math.abs(localZ) - collider.halfExtents[2], 0);
      return Math.hypot(outsideX, outsideZ);
    };

    tingYuXuanRouteAnchors.slice(0, -1).forEach((from, index) => {
      const to = tingYuXuanRouteAnchors[index + 1];
      for (let step = 0; step <= 100; step += 1) {
        const t = step / 100;
        const x = from.position[0] + (to.position[0] - from.position[0]) * t;
        const z = from.position[2] + (to.position[2] - from.position[2]) * t;
        blocking.forEach((collider) => {
          expect(
            distanceToColliderXZ(x, z, collider),
            `${from.id} -> ${to.id} comes too close to ${collider.id}`,
          ).toBeGreaterThanOrEqual(minimumPlayerClearance);
        });
      }
    });
  });
});
