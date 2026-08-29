import type { Vec3Tuple } from "./types";

export interface LoopPose {
  position: Vec3Tuple;
  yaw: number;
  velocityIntent?: Vec3Tuple;
}

export interface LoopLink {
  id: string;
  entrySensorId: string;
  exitAnchorId: string;
  entryYaw: number;
  exitYaw: number;
  preserveYaw: boolean;
  preserveVelocityIntent: boolean;
  cooldownMs: number;
}

export class LoopController {
  private readonly lastTriggeredAt = new Map<string, number>();

  canTrigger(link: LoopLink, nowMs: number): boolean {
    return nowMs - (this.lastTriggeredAt.get(link.id) ?? Number.NEGATIVE_INFINITY) >= link.cooldownMs;
  }

  traverse(link: LoopLink, pose: LoopPose, exitPosition: Vec3Tuple, nowMs: number): LoopPose | undefined {
    if (!this.canTrigger(link, nowMs)) return undefined;
    this.lastTriggeredAt.set(link.id, nowMs);
    const yawDelta = link.exitYaw - link.entryYaw;
    const rotate = (vector: Vec3Tuple): Vec3Tuple => {
      const sin = Math.sin(yawDelta);
      const cos = Math.cos(yawDelta);
      return [vector[0] * cos - vector[2] * sin, vector[1], vector[0] * sin + vector[2] * cos];
    };
    return {
      position: [...exitPosition],
      yaw: link.preserveYaw ? pose.yaw + yawDelta : link.exitYaw,
      velocityIntent: pose.velocityIntent
        ? (link.preserveVelocityIntent ? rotate(pose.velocityIntent) : [0, pose.velocityIntent[1], 0])
        : undefined,
    };
  }

  reset(): void {
    this.lastTriggeredAt.clear();
  }
}

