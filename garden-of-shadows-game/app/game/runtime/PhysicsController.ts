import RAPIER from "@dimforge/rapier3d-compat";
import type { MemoryId } from "../types";
import type { LayoutCollider } from "./tingyuxuan-layout";

export interface PlayerPose {
  x: number;
  y: number;
  z: number;
}

const STATIC_GROUP = 0x0001_ffff;
const WIFE_PLAYER_GROUP = 0x0002_ffff;
const GARDENER_PLAYER_GROUP = 0x0004_ffff;

export class PhysicsController {
  private constructor(
    private readonly world: RAPIER.World,
    private readonly body: RAPIER.RigidBody,
    private readonly collider: RAPIER.Collider,
    private readonly controller: RAPIER.KinematicCharacterController,
  ) {}

  static async create(spawn: PlayerPose, layoutColliders: LayoutCollider[]): Promise<PhysicsController> {
    await RAPIER.init();
    const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z),
    );
    const collider = world.createCollider(
      RAPIER.ColliderDesc.capsule(0.55, 0.32).setCollisionGroups(WIFE_PLAYER_GROUP),
      body,
    );
    const controller = world.createCharacterController(0.02);
    controller.enableSnapToGround(0.25);
    controller.setMaxSlopeClimbAngle((42 * Math.PI) / 180);
    controller.setMinSlopeSlideAngle((48 * Math.PI) / 180);

    const addBox = (x: number, y: number, z: number, hx: number, hy: number, hz: number) => {
      world.createCollider(
        RAPIER.ColliderDesc.cuboid(hx, hy, hz)
          .setTranslation(x, y, z)
          .setCollisionGroups(STATIC_GROUP),
      );
    };
    layoutColliders.forEach(({ center, halfExtents }) => addBox(...center, ...halfExtents));

    return new PhysicsController(world, body, collider, controller);
  }

  setMemory(memory: MemoryId): void {
    this.collider.setCollisionGroups(memory === "gardener" ? GARDENER_PLAYER_GROUP : WIFE_PLAYER_GROUP);
  }

  move(translation: PlayerPose): PlayerPose {
    this.controller.computeColliderMovement(this.collider, translation);
    const movement = this.controller.computedMovement();
    const current = this.body.translation();
    const next = { x: current.x + movement.x, y: current.y + movement.y, z: current.z + movement.z };
    this.body.setNextKinematicTranslation(next);
    this.world.step();
    return this.pose();
  }

  teleport(pose: PlayerPose): void {
    this.body.setTranslation(pose, true);
    this.body.setNextKinematicTranslation(pose);
  }

  pose(): PlayerPose {
    const value = this.body.translation();
    return { x: value.x, y: value.y, z: value.z };
  }

  dispose(): void {
    this.controller.free();
    this.world.free();
  }
}
