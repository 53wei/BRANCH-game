import RAPIER from "@dimforge/rapier3d-compat";
import type { CognitionId, Vec3Tuple } from "./types";
import { PLAYER_BODY_CALIBRATION, PLAYER_MOVEMENT_CALIBRATION } from "../runtime/player-calibration";

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
  private verticalVelocity = 0;

  private constructor(
    private readonly world: RAPIER.World,
    private readonly body: RAPIER.RigidBody,
    private readonly playerCollider: RAPIER.Collider,
    private readonly character: RAPIER.KinematicCharacterController,
  ) {}

  static async create(spawn: PhysicsPose, boxes: readonly PhysicsBoxDefinition[]): Promise<PlayerPhysics> {
    await RAPIER.init();
    const world = new RAPIER.World({ x: 0, y: PLAYER_MOVEMENT_CALIBRATION.gravity, z: 0 });
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z),
    );
    const playerCollider = world.createCollider(RAPIER.ColliderDesc.capsule(PLAYER_BODY_CALIBRATION.capsuleHalfHeight, PLAYER_BODY_CALIBRATION.capsuleRadius), body);
    const character = world.createCharacterController(0.025);
    character.enableAutostep(PLAYER_BODY_CALIBRATION.autostepMaxHeight, PLAYER_BODY_CALIBRATION.autostepMinWidth, false);
    character.enableSnapToGround(PLAYER_BODY_CALIBRATION.snapToGround);
    character.setMaxSlopeClimbAngle(PLAYER_BODY_CALIBRATION.maxSlopeClimbDegrees * Math.PI / 180);
    character.setMinSlopeSlideAngle(PLAYER_BODY_CALIBRATION.minSlopeSlideDegrees * Math.PI / 180);
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

  move(translation: PhysicsPose, deltaSeconds?: number): PhysicsPose {
    let requested = translation;
    if (deltaSeconds !== undefined) {
      const delta = Math.max(0, Math.min(deltaSeconds, 0.05));
      if (this.character.computedGrounded() && this.verticalVelocity < 0) this.verticalVelocity = 0;
      this.verticalVelocity += PLAYER_MOVEMENT_CALIBRATION.gravity * delta;
      requested = { ...translation, y: this.verticalVelocity * delta };
    }
    this.character.computeColliderMovement(this.playerCollider, requested);
    const movement = this.character.computedMovement();
    const current = this.body.translation();
    const next = { x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z };
    this.body.setNextKinematicTranslation(next);
    this.world.step();
    if (deltaSeconds !== undefined && this.character.computedGrounded() && this.verticalVelocity < 0) this.verticalVelocity = 0;
    return this.pose();
  }

  isGrounded(): boolean {
    return this.character.computedGrounded();
  }

  requestJump(): boolean {
    if (!this.character.computedGrounded() || this.verticalVelocity > 0.01) return false;
    this.verticalVelocity = PLAYER_MOVEMENT_CALIBRATION.jumpSpeed;
    return true;
  }

  teleport(pose: PhysicsPose): void {
    this.verticalVelocity = 0;
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
    return hit ? Math.max(0, hit.timeOfImpact - margin) : distance;
  }

  dispose(): void {
    this.colliders.clear();
    this.character.free();
    this.world.free();
  }
}

