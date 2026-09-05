import RAPIER from "@dimforge/rapier3d-compat";
import type { MemoryId } from "../types";
import type { LayoutCollider } from "./tingyuxuan-layout";
import type { TrimeshColliderDefinition } from "./special-structure-collision";
import { PLAYER_BODY_CALIBRATION, PLAYER_MOVEMENT_CALIBRATION } from "./player-calibration";

export interface PlayerPose {
  x: number;
  y: number;
  z: number;
}

const STATIC_GROUP = 0x0001_ffff;
const STATIC_WIFE_ONLY_GROUP = 0x0001_0002;
const STATIC_GARDENER_ONLY_GROUP = 0x0001_0004;
const WIFE_PLAYER_GROUP = 0x0002_ffff;
const GARDENER_PLAYER_GROUP = 0x0004_ffff;
// Zhao Ying's reconstructed route must obey authored architecture while ignoring
// mutually-exclusive testimony walls from wife/gardener cognition layers.
const ZHAOYING_PLAYER_GROUP = 0x0008_ffff;

const collisionGroupsInteract = (first: number, second: number) => {
  const firstMembership = first >>> 16;
  const firstFilter = first & 0xffff;
  const secondMembership = second >>> 16;
  const secondFilter = second & 0xffff;
  return (firstMembership & secondFilter) !== 0 && (secondMembership & firstFilter) !== 0;
};

export const PLAYER_PHYSICS_CALIBRATION = {
  ...PLAYER_MOVEMENT_CALIBRATION,
  capsuleHalfHeight: PLAYER_BODY_CALIBRATION.capsuleHalfHeight,
  capsuleRadius: PLAYER_BODY_CALIBRATION.capsuleRadius,
  capsuleTotalHeight: PLAYER_BODY_CALIBRATION.capsuleTotalHeight,
  autostepMaxHeight: PLAYER_BODY_CALIBRATION.autostepMaxHeight,
  autostepMinWidth: PLAYER_BODY_CALIBRATION.autostepMinWidth,
  snapToGround: PLAYER_BODY_CALIBRATION.snapToGround,
  maxSlopeClimbDegrees: PLAYER_BODY_CALIBRATION.maxSlopeClimbDegrees,
  minSlopeSlideDegrees: PLAYER_BODY_CALIBRATION.minSlopeSlideDegrees,
} as const;

export class PhysicsController {
  private lastCameraCollision?: string;
  private verticalVelocity = 0;
  private constructor(
    private readonly world: RAPIER.World,
    private readonly body: RAPIER.RigidBody,
    private readonly collider: RAPIER.Collider,
    private readonly controller: RAPIER.KinematicCharacterController,
    private readonly staticColliders: Map<string, RAPIER.Collider>,
    private readonly staticColliderCategories: Map<string, LayoutCollider["category"]>,
    private readonly cameraIgnoredColliderHandles: Set<number>,
  ) {}

  static async create(spawn: PlayerPose, layoutColliders: readonly LayoutCollider[]): Promise<PhysicsController> {
    await RAPIER.init();
    const world = new RAPIER.World({ x: 0, y: PLAYER_PHYSICS_CALIBRATION.gravity, z: 0 });
    const staticColliders = new Map<string, RAPIER.Collider>();
    const staticColliderCategories = new Map<string, LayoutCollider["category"]>();
    const cameraIgnoredColliderHandles = new Set<number>();

    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z),
    );
    const collider = world.createCollider(
      RAPIER.ColliderDesc.capsule(PLAYER_PHYSICS_CALIBRATION.capsuleHalfHeight, PLAYER_PHYSICS_CALIBRATION.capsuleRadius).setCollisionGroups(WIFE_PLAYER_GROUP),
      body,
    );
    const controller = world.createCharacterController(0.02);
    controller.enableAutostep(PLAYER_PHYSICS_CALIBRATION.autostepMaxHeight, PLAYER_PHYSICS_CALIBRATION.autostepMinWidth, false);
    controller.enableSnapToGround(PLAYER_PHYSICS_CALIBRATION.snapToGround);
    controller.setMaxSlopeClimbAngle((PLAYER_PHYSICS_CALIBRATION.maxSlopeClimbDegrees * Math.PI) / 180);
    controller.setMinSlopeSlideAngle((PLAYER_PHYSICS_CALIBRATION.minSlopeSlideDegrees * Math.PI) / 180);

    const instance = new PhysicsController(world, body, collider, controller, staticColliders, staticColliderCategories, cameraIgnoredColliderHandles);
    instance.addStaticBoxColliders(layoutColliders);
    return instance;
  }

  addStaticBoxColliders(definitions: readonly LayoutCollider[]): void {
    definitions.forEach((definition) => {
      if (this.staticColliders.has(definition.id)) return;
      const [x, y, z] = definition.center;
      const [hx, hy, hz] = definition.halfExtents;
      if (![x, y, z, hx, hy, hz].every(Number.isFinite) || hx <= 0 || hy <= 0 || hz <= 0) return;
      const memoryGroup = definition.memoryIds?.length === 1
        ? definition.memoryIds[0] === "wife" ? STATIC_WIFE_ONLY_GROUP
          : definition.memoryIds[0] === "gardener" ? STATIC_GARDENER_ONLY_GROUP
            : STATIC_GROUP
        : STATIC_GROUP;
      const descriptor = RAPIER.ColliderDesc.cuboid(hx, hy, hz)
        .setTranslation(x, y, z)
        .setCollisionGroups(memoryGroup);
      if (definition.rotationY) {
        descriptor.setRotation({ x: 0, y: Math.sin(definition.rotationY / 2), z: 0, w: Math.cos(definition.rotationY / 2) });
      }
      const created = this.world.createCollider(descriptor);
      created.setEnabled(definition.initiallyEnabled ?? true);
      this.staticColliders.set(definition.id, created);
      this.staticColliderCategories.set(definition.id, definition.category);
      if (definition.category === "progression-lock") this.cameraIgnoredColliderHandles.add(created.handle);
    });
  }

  addStaticTrimeshColliders(definitions: readonly TrimeshColliderDefinition[]): void {
    definitions.forEach((definition) => {
      if (this.staticColliders.has(definition.id)) return;
      if (definition.vertices.length < 9
        || definition.vertices.length % 3 !== 0
        || definition.indices.length < 3
        || definition.indices.length % 3 !== 0
        || Array.from(definition.vertices).some((value) => !Number.isFinite(value))
        || Array.from(definition.indices).some((value) => !Number.isInteger(value) || value < 0 || value >= definition.vertices.length / 3)) return;
      const descriptor = RAPIER.ColliderDesc.trimesh(
        new Float32Array(definition.vertices),
        new Uint32Array(definition.indices),
      ).setCollisionGroups(STATIC_GROUP);
      const created = this.world.createCollider(descriptor);
      created.setEnabled(definition.initiallyEnabled ?? true);
      this.staticColliders.set(definition.id, created);
      this.staticColliderCategories.set(definition.id, definition.category);
    });
  }

  setMemory(memory: MemoryId): void {
    const group = memory === "gardener"
      ? GARDENER_PLAYER_GROUP
      : memory === "zhaoying"
        ? ZHAOYING_PLAYER_GROUP
        : WIFE_PLAYER_GROUP;
    this.collider.setCollisionGroups(group);
  }

  setColliderEnabled(id: string, enabled: boolean): boolean {
    const target = this.staticColliders.get(id);
    if (!target) return false;
    target.setEnabled(enabled);
    return true;
  }

  /**
   * Move the character. When deltaSeconds is supplied, vertical motion is owned by
   * this controller so every 3D Runtime shares the same grounded jump/gravity rules.
   * Calls without deltaSeconds retain the legacy explicit-Y behavior used by tests.
   */
  move(translation: PlayerPose, deltaSeconds?: number): PlayerPose {
    let requested = translation;
    if (deltaSeconds !== undefined) {
      const delta = Math.max(0, Math.min(deltaSeconds, 0.05));
      if (this.controller.computedGrounded() && this.verticalVelocity < 0) this.verticalVelocity = 0;
      this.verticalVelocity += PLAYER_PHYSICS_CALIBRATION.gravity * delta;
      requested = { ...translation, y: this.verticalVelocity * delta };
    }

    // KinematicCharacterController shape casts do not inherit the moved
    // collider's interaction groups unless filterGroups is passed explicitly.
    // Without this, testimony-only walls block from the reverse side even when
    // the player's active memory group should exclude them.
    this.controller.computeColliderMovement(this.collider, requested, undefined, this.collider.collisionGroups());
    const movement = this.controller.computedMovement();
    const current = this.body.translation();
    const next = { x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z };
    this.body.setNextKinematicTranslation(next);
    this.world.step();
    if (deltaSeconds !== undefined && this.controller.computedGrounded() && this.verticalVelocity < 0) this.verticalVelocity = 0;
    return this.pose();
  }

  requestJump(): boolean {
    if (!this.controller.computedGrounded() || this.verticalVelocity > 0.01) return false;
    this.verticalVelocity = PLAYER_PHYSICS_CALIBRATION.jumpSpeed;
    return true;
  }

  teleport(pose: PlayerPose): void {
    this.verticalVelocity = 0;
    this.body.setTranslation(pose, true);
    this.body.setNextKinematicTranslation(pose);
  }

  pose(): PlayerPose {
    const value = this.body.translation();
    return { x: value.x, y: value.y, z: value.z };
  }

  isGrounded(): boolean {
    return this.controller.computedGrounded();
  }

  cameraSafeDistance(
    target: { x: number; y: number; z: number },
    desired: { x: number; y: number; z: number },
    margin = 0.16,
  ): number {
    const dx = desired.x - target.x;
    const dy = desired.y - target.y;
    const dz = desired.z - target.z;
    const maxDistance = Math.hypot(dx, dy, dz);
    if (maxDistance <= 0.001) return maxDistance;
    const ray = new RAPIER.Ray(target, { x: dx / maxDistance, y: dy / maxDistance, z: dz / maxDistance });
    const cameraGroups = this.collider.collisionGroups();
    let closest: { id: string; timeOfImpact: number } | undefined;
    this.staticColliders.forEach((candidate, id) => {
      if (!candidate.isEnabled()
        || candidate.isSensor()
        || this.cameraIgnoredColliderHandles.has(candidate.handle)
        || !collisionGroupsInteract(cameraGroups, candidate.collisionGroups())) return;
      const timeOfImpact = candidate.castRay(ray, maxDistance, true);
      if (!Number.isFinite(timeOfImpact) || timeOfImpact < 0 || timeOfImpact > maxDistance) return;
      if (!closest || timeOfImpact < closest.timeOfImpact) closest = { id, timeOfImpact };
    });
    this.lastCameraCollision = closest?.id;
    return closest ? Math.max(0, closest.timeOfImpact - margin) : maxDistance;
  }

  cameraCollisionId(): string | undefined {
    return this.lastCameraCollision;
  }

  /**
   * Runtime diagnostics used by level audit tools. Keeping this read-only avoids
   * coupling QA tooling with the physics implementation.
   */
  colliderAuditSnapshot(): {
    staticColliderCount: number;
    enabledColliderCount: number;
    cameraIgnoredCount: number;
    architectureColliderCount: number;
    masterArchitectureColliderCount: number;
    specialStructureColliderCount: number;
    categoryCounts: Record<string, number>;
    hasStaticArchitecture: boolean;
  } {
    let enabledColliderCount = 0;
    let architectureColliderCount = 0;
    let masterArchitectureColliderCount = 0;
    let specialStructureColliderCount = 0;
    const categoryCounts: Record<string, number> = {};
    this.staticColliders.forEach((collider) => {
      if (collider.isEnabled()) enabledColliderCount += 1;
    });
    this.staticColliderCategories.forEach((category, id) => {
      const key = category ?? "unknown";
      categoryCounts[key] = (categoryCounts[key] ?? 0) + 1;
      if (category === "architecture") architectureColliderCount += 1;
      if (id.startsWith("master-wall-")) masterArchitectureColliderCount += 1;
      if (id.startsWith("master-special-")) specialStructureColliderCount += 1;
    });
    return {
      staticColliderCount: this.staticColliders.size,
      enabledColliderCount,
      cameraIgnoredCount: this.cameraIgnoredColliderHandles.size,
      architectureColliderCount,
      masterArchitectureColliderCount,
      specialStructureColliderCount,
      categoryCounts,
      hasStaticArchitecture: architectureColliderCount > 0,
    };
  }

  dispose(): void {
    this.controller.free();
    this.world.free();
  }
}
