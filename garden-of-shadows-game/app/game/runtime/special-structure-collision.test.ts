import { describe, expect, it } from "vitest";
import * as THREE from "three/webgpu";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION, type PlayerPose } from "./PhysicsController";
import { getGameplayAnchor, tingYuXuanPrologueColliders } from "./tingyuxuan-gameplay-map";
import {
  extractMasterSpecialStructureCollision,
  MASTER_SPECIAL_STRUCTURE_SOURCES,
  REQUIRED_SPECIAL_STRUCTURE_BOX_IDS,
  SPECIAL_STRUCTURE_COLLISION_POLICY,
} from "./special-structure-collision";
import { tingYuXuanLayout } from "./tingyuxuan-layout";

const walkTo = (physics: PhysicsController, target: PlayerPose, maxSteps = 240) => {
  let pose = physics.pose();
  let peakY = pose.y;
  for (let index = 0; index < maxSteps; index += 1) {
    const dx = target.x - pose.x;
    const dz = target.z - pose.z;
    const distance = Math.hypot(dx, dz);
    if (distance <= 0.22) break;
    const step = Math.min(0.1, distance);
    pose = physics.move({ x: dx / distance * step, y: -0.1, z: dz / distance * step });
    peakY = Math.max(peakY, pose.y);
  }
  return { pose, peakY, remaining: Math.hypot(target.x - pose.x, target.z - pose.z) };
};

describe("TASK-018 door, moon-gate, threshold, stair and railing collision", () => {
  it("keeps every required compound-box component source-backed", () => {
    const special = tingYuXuanLayout.colliders.filter((collider) => collider.specialStructure);
    expect(REQUIRED_SPECIAL_STRUCTURE_BOX_IDS.every((id) => special.some((collider) => collider.id === id))).toBe(true);
    expect(special.every((collider) => Boolean(collider.specialStructure?.sourceReference))).toBe(true);
  });

  it("lets the real capsule cross the measured main gate in both directions and autostep its threshold", async () => {
    const outside = getGameplayAnchor("ROUTE_01_START").position;
    const inside = getGameplayAnchor("ROUTE_02_A_ENTRY").position;
    for (const [from, to] of [[outside, inside], [inside, outside]] as const) {
      const physics = await PhysicsController.create({ x: from[0], y: from[1], z: from[2] }, tingYuXuanLayout.colliders);
      try {
        physics.setMemory("wife");
        const result = walkTo(physics, { x: to[0], y: to[1], z: to[2] });
        expect(result.remaining, `main gate ${from[0]} -> ${to[0]}`).toBeLessThanOrEqual(0.22);
        expect(result.peakY).toBeLessThan(from[1] + PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight + 0.05);
      } finally {
        physics.dispose();
      }
    }
  });

  it("autosteps the existing 0.16 m borrowed threshold without frame sticking", async () => {
    const physics = await PhysicsController.create(
      { x: 1.2, y: 0.9, z: 0 },
      [
        { id: "test-ground", center: [0, -0.1, 0], halfExtents: [4, 0.1, 4], category: "ground" },
        { id: "west-threshold-stone-collider", center: [0, 0.08, 0], halfExtents: [0.42, 0.08, 0.34], category: "architecture" },
      ],
    );
    try {
      const result = walkTo(physics, { x: -1.2, y: 0.9, z: 0 });
      expect(result.remaining).toBeLessThanOrEqual(0.22);
      expect(result.peakY).toBeGreaterThan(0.98);
      expect(result.peakY).toBeLessThan(0.9 + PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight + 0.05);
    } finally {
      physics.dispose();
    }
  });

  it("lets the real capsule cross the three-part moon gate while its testimony lock remains physical", async () => {
    for (const [fromZ, toZ] of [[31.8, 27.2], [27.2, 31.8]] as const) {
      const physics = await PhysicsController.create({ x: 1.75, y: 0.9, z: fromZ }, tingYuXuanLayout.colliders);
      try {
        physics.setMemory("wife");
        const result = walkTo(physics, { x: 1.75, y: 0.9, z: toZ });
        expect(result.remaining, `moon gate ${fromZ} -> ${toZ}`).toBeLessThanOrEqual(0.22);
      } finally {
        physics.dispose();
      }
    }

    const restricted = await PhysicsController.create({ x: 1.9, y: 0.9, z: 32.4 }, tingYuXuanLayout.colliders);
    try {
      restricted.setMemory("gardener");
      const result = walkTo(restricted, { x: 1.75, y: 0.9, z: 29.7 }, 100);
      expect(result.remaining).toBeGreaterThan(1);
      expect(result.pose.z).toBeGreaterThan(31.25);
    } finally {
      restricted.dispose();
    }
  });

  it("keeps the independent prologue door lock blocking the otherwise passable frame", async () => {
    const outside = getGameplayAnchor("ROUTE_01_START").position;
    const physics = await PhysicsController.create(
      { x: outside[0], y: outside[1], z: outside[2] },
      [...tingYuXuanLayout.colliders, ...tingYuXuanPrologueColliders],
    );
    try {
      expect(physics.setColliderEnabled("prologue-gate-lock", true)).toBe(true);
      const result = walkTo(physics, { x: 6.9, y: 0.9, z: 39.4 });
      expect(result.pose.x).toBeGreaterThan(9.6);
    } finally {
      physics.dispose();
    }
  });

  it("extracts the audited Master stair/railing mesh and registers it as exact static geometry", async () => {
    const root = new THREE.Group();
    const source = new THREE.Mesh(new THREE.BoxGeometry(4, 1, 0.2), new THREE.MeshBasicMaterial());
    source.name = MASTER_SPECIAL_STRUCTURE_SOURCES[0].runtimeNodeName;
    source.position.set(0, 0.5, 0);
    root.add(source);
    const extraction = extractMasterSpecialStructureCollision(root, tingYuXuanLayout.colliders);
    expect(extraction.audit.complete).toBe(true);
    expect(extraction.colliders).toHaveLength(1);
    expect(extraction.audit.masterMeshSources[0]).toMatchObject({
      sourceNodeName: "214b32a0.o",
      runtimeNodeName: "214b32a0o",
      kind: "stairs-and-railing",
      triangleCount: 12,
    });

    const physics = await PhysicsController.create(
      { x: 0, y: 0.9, z: 1 },
      [{ id: "test-ground", center: [0, -0.1, 0], halfExtents: [4, 0.1, 4], category: "ground" }],
    );
    try {
      physics.addStaticTrimeshColliders(extraction.colliders);
      for (let index = 0; index < 12; index += 1) physics.move({ x: 0, y: 0, z: 0 }, 1 / 60);
      expect(physics.requestJump()).toBe(true);
      let pose = physics.pose();
      for (let index = 0; index < 70; index += 1) pose = physics.move({ x: 0, y: 0, z: -0.045 }, 1 / 60);
      expect(pose.z).toBeGreaterThan(0.25);
      expect(physics.colliderAuditSnapshot().specialStructureColliderCount).toBe(1);
    } finally {
      physics.dispose();
    }
  });

  it("calibrates railing height above the real jump-apex rise", () => {
    expect(SPECIAL_STRUCTURE_COLLISION_POLICY.minimumRailingHeight).toBeGreaterThan(SPECIAL_STRUCTURE_COLLISION_POLICY.jumpApexRise);
    expect(SPECIAL_STRUCTURE_COLLISION_POLICY.jumpApexRise).toBeGreaterThan(0.45);
    expect(SPECIAL_STRUCTURE_COLLISION_POLICY.minimumRailingHeight).toBeLessThan(0.8);
  });
});
