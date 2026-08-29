import RAPIER from "@dimforge/rapier3d-compat";
import type { CognitionId, Vec3Tuple } from "./types";

export interface PhysicsPose {
  x: number;
  y: number;
  z: number;
}

export interface PhysicsBoxDefinition {
  id: string;
  center: Vec3Tuple;
  halfExtents: Vec3Tuple;
  cognitionIds?: readonly CognitionId[];
  sensor?: boolean;
}

export class PlayerPhysics {
  private readonly colliders = new Map<string, { collider: RAPIER.Collider; cognitionIds?: readonly CognitionId[] }>();

  private constructor(
    private readonly world: RAPIER.World,
    private readonly body: RAPIER.RigidBody,
    private readonly playerCollider: RAPIER.Collider,
    private readonly character: RAPIER.KinematicCharacterController,
  ) {}

  static async create(spawn: PhysicsPose, boxes: readonly PhysicsBoxDefinition[]): Promise<PlayerPhysics> {
    await RAPIER.init();
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z),
    );
    const playerCollider = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.32), body);
    const character = world.createCharacterController(0.025);
    character.enableAutostep(0.36, 0.18, false);
    character.enableSnapToGround(0.28);
    character.setMaxSlopeClimbAngle(42 * Math.PI / 180);
    character.setMinSlopeSlideAngle(48 * Math.PI / 180);
    const physics = new PlayerPhysics(world, body, playerCollider, character);
    boxes.forEach((box) => physics.addBox(box));
    return physics;
  }

  addBox(definition: PhysicsBoxDefinition): void {
    if (this.colliders.has(definition.id)) throw new Error(`Duplicate physics collider: ${definition.id}`);
    const collider = this.world.createCollider(
      RAPIER.ColliderDesc.cuboid(...definition.halfExtents)
        .setTranslation(...definition.center)
        .setSensor(definition.sensor === true),
    );
    this.colliders.set(definition.id, { collider, cognitionIds: definition.cognitionIds });
  }

  remove(id: string): void {
    const entry = this.colliders.get(id);
    if (!entry) return;
    this.world.removeCollider(entry.collider, true);
    this.colliders.delete(id);
  }

  setColliderEnabled(id: string, enabled: boolean): void {
    this.colliders.get(id)?.collider.setEnabled(enabled);
  }

  setCognition(cognition: CognitionId): void {
    this.colliders.forEach((entry) => {
      entry.collider.setEnabled(!entry.cognitionIds?.length || entry.cognitionIds.includes(cognition));
    });
  }

  move(translation: PhysicsPose): PhysicsPose {
    this.character.computeColliderMovement(this.playerCollider, translation);
    const movement = this.character.computedMovement();
    const current = this.body.translation();
    const next = { x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z };
    this.body.setNextKinematicTranslation(next);
    this.world.step();
    return this.pose();
  }

  teleport(pose: PhysicsPose): void {
    this.body.setTranslation(pose, true);
    this.body.setNextKinematicTranslation(pose);
    this.world.step();
  }

  pose(): PhysicsPose {
    const value = this.body.translation();
    return { x: value.x, y: value.y, z: value.z };
  }

  sensorContains(id: string, point = this.pose()): boolean {
    const entry = this.colliders.get(id);
    return Boolean(entry?.collider.isEnabled() && entry.collider.isSensor() && entry.collider.containsPoint(point));
  }

  cameraSafeDistance(
    target: { x: number; y: number; z: number },
    desired: { x: number; y: number; z: number },
    margin = 0.16,
  ): number {
    const dx = desired.x - target.x;
    const dy = desired.y - target.y;
    const dz = desired.z - target.z;
    const distance = Math.hypot(dx, dy, dz);
    if (distance <= 0.001) return distance;
    const ray = new RAPIER.Ray(target, { x: dx / distance, y: dy / distance, z: dz / distance });
    const hit = this.world.castRay(
      ray,
      distance,
      true,
      RAPIER.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      this.playerCollider,
      this.body,
    );
    return hit ? Math.max(0.38, hit.timeOfImpact - margin) : distance;
  }

  dispose(): void {
    this.colliders.clear();
    this.character.free();
    this.world.free();
  }
}

