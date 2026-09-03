import { describe, expect, it } from "vitest";
import * as THREE from "three/webgpu";
import { extractArchitectureCollisionCoverage } from "./architecture-collision";
import { PhysicsController, PLAYER_PHYSICS_CALIBRATION } from "./PhysicsController";
import { tingYuXuanLayout, type LayoutCollider } from "./tingyuxuan-layout";

const addBox = (
  root: THREE.Group,
  name: string,
  position: readonly [number, number, number],
  size: readonly [number, number, number] = [1, 2, 0.2],
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), new THREE.MeshBasicMaterial());
  mesh.name = name;
  mesh.position.set(...position);
  root.add(mesh);
  return mesh;
};

describe("Master architecture collision coverage", () => {
  it("reports exclusive rejection reasons and route-region coverage", () => {
    const root = new THREE.Group();
    addBox(root, "Wall_Solid_A", [7, 1, 42.5]);
    addBox(root, "Wall_Solid_B", [-5, 1, 24]);
    addBox(root, "Wall_Solid_C", [-22, 1, 10]);
    addBox(root, "Wall_Solid_A_Duplicate", [7, 1, 42.5]);
    addBox(root, "WallGate_Door", [4, 1, 40]);
    addBox(root, "Roof_Tile", [3, 3, 40]);
    addBox(root, "Wall_Solid_TooWide", [0, 1, 40], [3, 2, 3]);
    const hidden = addBox(root, "Wall_Solid_Hidden", [1, 1, 40]);
    hidden.visible = false;

    const result = extractArchitectureCollisionCoverage(root, []);

    expect(result.audit.totalMeshCount).toBe(8);
    expect(result.audit.candidateArchitectureMeshCount).toBe(5);
    expect(result.audit.generatedColliderCount).toBe(3);
    expect(result.audit.excludedMeshCount).toBe(5);
    expect(result.audit.exclusions).toEqual({
      hidden: 1,
      nonArchitecture: 0,
      openingOrDetail: 2,
      emptyBounds: 0,
      invalidSize: 1,
      duplicate: 1,
    });
    expect(result.audit.routeCoverage.map((route) => route.id)).toEqual([
      "entrance",
      "west-court",
      "north-tower",
      "water-court",
      "finale-area",
    ]);
    expect(result.audit.routeCoverage.every((route) => route.complete)).toBe(true);
    expect(result.audit.truncatedColliderCount).toBe(0);
    expect(result.audit.colliderLimit).toBeNull();
  });

  it("does not truncate generated colliders at the former limit of 96", () => {
    const root = new THREE.Group();
    for (let index = 0; index < 120; index += 1) {
      addBox(root, "Wall_Solid_" + index, [index * 1.5, 1, 80]);
    }

    const result = extractArchitectureCollisionCoverage(root, []);

    expect(result.colliders).toHaveLength(120);
    expect(result.audit.generatedColliderCount).toBe(120);
    expect(result.audit.truncatedColliderCount).toBe(0);
  });

  it("registers every generated Master collider in the physics world", async () => {
    const definitions: LayoutCollider[] = Array.from({ length: 120 }, (_, index) => ({
      id: "master-wall-" + index,
      center: [index * 1.5, 1, 80],
      halfExtents: [0.5, 1, 0.1],
      category: "architecture",
    }));
    const physics = await PhysicsController.create({ x: 0, y: 1, z: 0 }, definitions);
    try {
      const audit = physics.colliderAuditSnapshot();
      expect(audit.staticColliderCount).toBe(120);
      expect(audit.architectureColliderCount).toBe(120);
      expect(audit.masterArchitectureColliderCount).toBe(120);
      expect(audit.categoryCounts.architecture).toBe(120);
      expect(audit.hasStaticArchitecture).toBe(true);
    } finally {
      physics.dispose();
    }
  });

  it("physically blocks crossing every route architecture volume at body height", async () => {
    const blockers = tingYuXuanLayout.colliders.filter((collider) =>
      collider.category === "architecture"
      && collider.center[1] + collider.halfExtents[1] > PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight + 0.02
      && collider.center[1] - collider.halfExtents[1] <= PLAYER_PHYSICS_CALIBRATION.capsuleTotalHeight);
    for (const blocker of blockers) {
      const thinAxis = blocker.halfExtents[0] <= blocker.halfExtents[2] ? "x" : "z";
      const halfThickness = thinAxis === "x" ? blocker.halfExtents[0] : blocker.halfExtents[2];
      const rotation = blocker.rotationY ?? 0;
      const localNormal = thinAxis === "x" ? { x: 1, z: 0 } : { x: 0, z: 1 };
      const normal = {
        x: Math.cos(rotation) * localNormal.x + Math.sin(rotation) * localNormal.z,
        z: -Math.sin(rotation) * localNormal.x + Math.cos(rotation) * localNormal.z,
      };
      const startOffset = halfThickness + PLAYER_PHYSICS_CALIBRATION.capsuleRadius + 0.08;
      const physics = await PhysicsController.create({
        x: blocker.center[0] + normal.x * startOffset,
        y: PLAYER_PHYSICS_CALIBRATION.capsuleHalfHeight + PLAYER_PHYSICS_CALIBRATION.capsuleRadius,
        z: blocker.center[2] + normal.z * startOffset,
      }, [blocker]);
      try {
        let pose = physics.pose();
        for (let step = 0; step < 40; step += 1) {
          pose = physics.move({
            x: -normal.x * 0.08,
            y: 0,
            z: -normal.z * 0.08,
          });
        }
        const remainingSide = (pose.x - blocker.center[0]) * normal.x + (pose.z - blocker.center[2]) * normal.z;
        expect(remainingSide, blocker.id).toBeGreaterThan(halfThickness + PLAYER_PHYSICS_CALIBRATION.capsuleRadius - 0.08);
      } finally {
        physics.dispose();
      }
    }
  });
});
