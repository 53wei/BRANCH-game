import { describe, expect, it } from "vitest";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./PhysicsController";
import { GAMEPLAY_ANCHOR_REFERENCE_Y, GAMEPLAY_GROUND_Y, WORLD_METERS_PER_UNIT, tingYuXuanGameplayAnchors, tingYuXuanPrologueColliders, tingYuXuanRouteAnchors } from "./tingyuxuan-gameplay-map";
import { containsLayoutPoint, getLayoutAnchor, resolveLayoutTriggerDestination, resolveLayoutZonesForPoint, TINGYUXUAN_LAYOUT_AUDIT, TINGYUXUAN_MASTER_HIDDEN_NODES, TINGYUXUAN_MASTER_ROOT_TRANSFORM, TINGYUXUAN_MASTER_SCALE_CALIBRATION, TINGYUXUAN_RUNTIME_ZONES, tingYuXuanFallbackPlacements, tingYuXuanLayout, tingYuXuanLegacyPlacements } from "./tingyuxuan-layout";

describe("TingYuXuan Runtime Gameplay Map V1 layout", () => {
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

  it("keeps the First Walkable spawn on the coarse Master ground and closes the world edges", () => {
    const spawn = getLayoutAnchor("west-entry").position;
    const ground = tingYuXuanLayout.colliders.find((collider) => collider.id === "ground-area-a")!;
    expect(Math.abs(spawn[0] - ground.center[0])).toBeLessThan(ground.halfExtents[0]);
    expect(Math.abs(spawn[2] - ground.center[2])).toBeLessThan(ground.halfExtents[2]);
    expect(spawn).toEqual(getLayoutAnchor("ROUTE_01_START").position);
    expect(tingYuXuanLayout.colliders.filter((collider) => collider.category === "world-boundary").length).toBe(4);
    expect(tingYuXuanLayout.colliders.some((collider) => collider.category === "progression-lock")).toBe(true);
  });

  it("preserves story aliases while exposing the continuous ROUTE_01 to ROUTE_07 path", () => {
    expect(tingYuXuanLayout.roots).toEqual(["gameplaySkeleton", "visualAssets", "proceduralDressing"]);
    expect(tingYuXuanLayout.interactables.map((item) => item.id)).toEqual([
      "waterline-direction", "corridor-count", "wife-moon-gate",
    ]);
    const route = ["ROUTE_01_START", "ROUTE_02_A_ENTRY", "ROUTE_03_A_LOOP", "ROUTE_04_A_EAST_EXIT", "ROUTE_05_B_MAIN_COURT", "ROUTE_06_B_NORTHEAST_LINK", "ROUTE_07_C_ENTRY"];
    expect(route.map((id) => getLayoutAnchor(id).position[2])).toEqual([39.4, 39.4, 41.2, 31.2, 24, 19.2, 14.2]);
    expect(getLayoutAnchor("west-entry").position).toEqual(getLayoutAnchor("ROUTE_01_START").position);
  });

  it("loads only the final Master by default and keeps both rollback paths explicit", () => {
    const phaseOnePreload = tingYuXuanLayout.placements.filter((placement) => placement.load === "preload");
    expect(phaseOnePreload).toEqual([expect.objectContaining({ id: "master-scene", assetId: "tyx-master-scene", load: "preload" })]);
    expect(phaseOnePreload[0]).toMatchObject(TINGYUXUAN_MASTER_ROOT_TRANSFORM);
    expect(phaseOnePreload[0].hiddenNodeNames).toEqual(TINGYUXUAN_MASTER_HIDDEN_NODES);
    expect(TINGYUXUAN_MASTER_HIDDEN_NODES).toEqual(expect.arrayContaining([
      "B_CoreGarden_Backup", "1d6d0730o", "1d6d5ce0o", "1d621248o", "1d639b88o",
    ]));
    expect(TINGYUXUAN_MASTER_HIDDEN_NODES).not.toContain("A_MountainBackdrop_Group");
    expect(TINGYUXUAN_MASTER_HIDDEN_NODES).not.toContain("A_TransitionPlanting");
    const formalArchitectureNode = /(?:^|[_.-])(window|door|lattice|wall|roof|gate|frame|building)(?:$|[_.-])/i;
    expect(TINGYUXUAN_MASTER_HIDDEN_NODES.filter((name) => formalArchitectureNode.test(name))).toEqual([]);
    expect(tingYuXuanLayout.placements.some((placement) => placement.assetId === "tyx-arch-siheyuan-source-a" || placement.assetId === "tyx-env-courtyard-park-source-a")).toBe(false);
    expect(tingYuXuanLegacyPlacements.some((placement) => placement.assetId === "tyx-arch-siheyuan-source-a")).toBe(true);
    expect(tingYuXuanLegacyPlacements.some((placement) => placement.assetId === "tyx-env-courtyard-park-source-a")).toBe(true);
    expect(tingYuXuanLayout.placements.some((placement) => placement.assetId === "tyx-arch-greybox-fallback-a")).toBe(false);
    expect(tingYuXuanFallbackPlacements.length).toBeGreaterThan(0);
    expect(tingYuXuanFallbackPlacements.every((placement) => placement.assetId === "tyx-arch-greybox-fallback-a")).toBe(true);
    expect(TINGYUXUAN_LAYOUT_AUDIT.deprecate).toContain("legacy formal architecture placements");
  });

  it("locks the Master and player physics to measured real-world proportions", () => {
    expect(WORLD_METERS_PER_UNIT).toBe(1);
    expect(GAMEPLAY_GROUND_Y).toBe(0);
    expect(GAMEPLAY_ANCHOR_REFERENCE_Y).toBe(0.9);
    expect(tingYuXuanGameplayAnchors.every((anchor) => anchor.position[1] === GAMEPLAY_ANCHOR_REFERENCE_Y)).toBe(true);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.metersPerWorldUnit).toBe(WORLD_METERS_PER_UNIT);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.gameplayGroundY).toBe(GAMEPLAY_GROUND_Y);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.anchorReferenceY).toBe(GAMEPLAY_ANCHOR_REFERENCE_Y);
    expect(TINGYUXUAN_MASTER_ROOT_TRANSFORM.scale).toEqual([0.64, 0.64, 0.64]);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.scaleFactor).toBeCloseTo(3.2, 6);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.characterHeight).toBeGreaterThanOrEqual(1.68);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.characterHeight).toBeLessThanOrEqual(1.75);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.doorHeight).toBeGreaterThan(2.0);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.doorHeight).toBeGreaterThan(TINGYUXUAN_MASTER_SCALE_CALIBRATION.characterHeight * 1.2);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.wallHeight).toBeGreaterThan(TINGYUXUAN_MASTER_SCALE_CALIBRATION.characterHeight * 1.6);
    expect(TINGYUXUAN_MASTER_SCALE_CALIBRATION.thresholdHeight).toBeLessThan(0.15);
    expect(PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight).toBeGreaterThanOrEqual(1.7);
    expect(PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight).toBeLessThanOrEqual(1.8);
    expect(PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight).toBeLessThan(0.3);
  });

  it("streams all completed TingYuXuan districts while keeping the entrance preload minimal", () => {
    expect(TINGYUXUAN_RUNTIME_ZONES).toEqual(["west-courtyard", "corridor", "rockery", "water-court", "north-house", "inner-house"]);
    expect(resolveLayoutZonesForPoint({ x: 7, z: 42.5 })).toContain("west-courtyard");
    expect(resolveLayoutZonesForPoint({ x: 2.5, z: 40 })).toContain("corridor");
    expect(resolveLayoutZonesForPoint({ x: -12, z: 19 })).toContain("rockery");
    expect(resolveLayoutZonesForPoint({ x: -22, z: 10 })).toContain("water-court");
    expect(resolveLayoutZonesForPoint({ x: -3, z: 24 })).toContain("north-house");
    expect(resolveLayoutZonesForPoint({ x: -8, z: 25 })).toContain("inner-house");
  });

  it("does not carry old per-building collision assumptions into the Master default", () => {
    expect(tingYuXuanLayout.colliders.some((collider) => /corridor|house|pond|rockery/.test(collider.id))).toBe(false);
  });

  it("applies the gardener loop and wife escape only in their matching memories", () => {
    const loopPoint = { x: 1.8, y: 1.2, z: 41.2 };
    expect(resolveLayoutTriggerDestination("gardener-corridor-loop", "gardener", loopPoint)?.id).toBe("A_BASELINE");
    expect(resolveLayoutTriggerDestination("gardener-corridor-loop", "wife", loopPoint)).toBeUndefined();
    const exitPoint = { x: 1.9, y: 1.2, z: 31.2 };
    expect(resolveLayoutTriggerDestination("wife-moon-gate-exit", "wife", exitPoint)?.id).toBe("ROUTE_05_B_MAIN_COURT");
    expect(resolveLayoutTriggerDestination("wife-moon-gate-exit", "gardener", exitPoint)).toBeUndefined();
  });

  it("lets the real character controller traverse every direct route segment in the required cognition", async () => {
    for (let index = 0; index < tingYuXuanRouteAnchors.length - 1; index += 1) {
      const from = tingYuXuanRouteAnchors[index];
      const to = tingYuXuanRouteAnchors[index + 1];
      const physics = await PhysicsController.create({ x: from.position[0], y: from.position[1], z: from.position[2] }, tingYuXuanLayout.colliders);
      try {
        physics.setMemory(to.id === "ROUTE_03_A_LOOP" ? "gardener" : "wife");
        let pose = physics.pose();
        for (let stepIndex = 0; stepIndex < 600; stepIndex += 1) {
          const dx = to.position[0] - pose.x;
          const dz = to.position[2] - pose.z;
          const distance = Math.hypot(dx, dz);
          if (distance <= 0.65) break;
          const step = Math.min(distance, 0.12);
          pose = physics.move({ x: dx / distance * step, y: -0.1, z: dz / distance * step });
        }
        expect(
          Math.hypot(to.position[0] - pose.x, to.position[2] - pose.z),
          `${from.id} -> ${to.id} is blocked at ${pose.x.toFixed(3)},${pose.z.toFixed(3)}`,
        ).toBeLessThanOrEqual(0.65);
      } finally {
        physics.dispose();
      }
    }
  });

  it("lets Zhao Ying's reconstructed flashback route ignore both testimony-only walls", async () => {
    const route = tingYuXuanRouteAnchors.slice(0, 4);
    for (const ordered of [route, [...route].reverse()]) {
      for (let index = 0; index < ordered.length - 1; index += 1) {
        const from = ordered[index];
        const to = ordered[index + 1];
        const physics = await PhysicsController.create({ x: from.position[0], y: from.position[1], z: from.position[2] }, tingYuXuanLayout.colliders);
        try {
          physics.setMemory("zhaoying");
          let pose = physics.pose();
          for (let stepIndex = 0; stepIndex < 600; stepIndex += 1) {
            const dx = to.position[0] - pose.x;
            const dz = to.position[2] - pose.z;
            const distance = Math.hypot(dx, dz);
            if (distance <= 0.65) break;
            const step = Math.min(distance, 0.12);
            pose = physics.move({ x: dx / distance * step, y: -0.1, z: dz / distance * step });
          }
          expect(
            Math.hypot(to.position[0] - pose.x, to.position[2] - pose.z),
            `zhaoying ${from.id} -> ${to.id} is blocked at ${pose.x.toFixed(3)},${pose.z.toFixed(3)}`,
          ).toBeLessThanOrEqual(0.65);
        } finally {
          physics.dispose();
        }
      }
    }
  });

  it("walks from the measured spawn through the gate when the independent progression lock is disabled", async () => {
    const spawn = getLayoutAnchor("ROUTE_01_START");
    const inside = getLayoutAnchor("ROUTE_02_A_ENTRY");
    const controller = await PhysicsController.create(
      { x: spawn.position[0], y: spawn.position[1], z: spawn.position[2] },
      [...tingYuXuanLayout.colliders, ...tingYuXuanPrologueColliders],
    );
    try {
      let pose = controller.pose();
      for (let index = 0; index < 80; index += 1) {
        const dx = inside.position[0] - pose.x;
        const dz = inside.position[2] - pose.z;
        const distance = Math.hypot(dx, dz);
        if (distance <= 0.25) break;
        const step = Math.min(distance, 0.12);
        pose = controller.move({ x: dx / distance * step, y: -0.1, z: dz / distance * step });
      }
      expect(Math.hypot(inside.position[0] - pose.x, inside.position[2] - pose.z)).toBeLessThanOrEqual(0.25);

      controller.teleport({ x: spawn.position[0], y: spawn.position[1], z: spawn.position[2] });
      expect(controller.setColliderEnabled("prologue-gate-lock", true)).toBe(true);
      pose = controller.pose();
      for (let index = 0; index < 80; index += 1) pose = controller.move({ x: -0.12, y: -0.1, z: 0 });
      expect(pose.x).toBeGreaterThan(9.6);
    } finally {
      controller.dispose();
    }
  });

  it("allows one grounded small jump and blocks air-jumping", async () => {
    const spawn = getLayoutAnchor("ROUTE_02_A_ENTRY");
    const controller = await PhysicsController.create(
      { x: spawn.position[0], y: spawn.position[1], z: spawn.position[2] },
      tingYuXuanLayout.colliders,
    );
    try {
      for (let index = 0; index < 12; index += 1) controller.move({ x: 0, y: 0, z: 0 }, 1 / 60);
      expect(controller.isGrounded()).toBe(true);
      const groundY = controller.pose().y;
      expect(controller.requestJump()).toBe(true);
      let peakY = groundY;
      for (let index = 0; index < 18; index += 1) {
        const pose = controller.move({ x: 0, y: 0, z: 0 }, 1 / 60);
        peakY = Math.max(peakY, pose.y);
        if (index === 2) expect(controller.requestJump()).toBe(false);
      }
      expect(peakY).toBeGreaterThan(groundY + 0.2);
    } finally {
      controller.dispose();
    }
  });

  it("uses exactly the audited Quaternius 3/3/2/2 subset", () => {
    const nodes = tingYuXuanLegacyPlacements
      .filter((item) => item.assetId === "tyx-nat-quaternius-set-a")
      .map((item) => item.nodeName);
    expect(nodes).toHaveLength(10);
    expect(nodes.filter((name) => name?.includes("Rock"))).toHaveLength(3);
    expect(nodes.filter((name) => name?.includes("Bush") || name?.includes("Plant"))).toHaveLength(3);
    expect(nodes.filter((name) => name?.includes("Tree"))).toHaveLength(2);
    expect(nodes.filter((name) => name?.includes("Grass") || name?.includes("Fern"))).toHaveLength(2);
  });
});
