import * as THREE from "three/webgpu";
import { playerPoseToFeetY } from "./player-calibration";

/**
 * First-person player anchor only.
 *
 * Formal runtime must never synthesize a human out of primitive geometry. Zhao Ying
 * is not rendered in ordinary first-person play; authored character assets/CG are
 * used when a visible body is actually required. Keeping this object geometry-free
 * also prevents a hidden debug proxy from accidentally leaking into release shots.
 */
export class PlayerAvatar {
  readonly root = new THREE.Group();

  constructor() {
    this.root.name = "Player_ZhaoYing_FirstPersonAnchor";
    this.root.visible = false;
  }

  update(
    pose: { x: number; y: number; z: number },
    yaw: number,
    moving: boolean,
    deltaSeconds: number,
  ): void {
    void moving;
    void deltaSeconds;
    this.root.position.set(pose.x, playerPoseToFeetY(pose.y), pose.z);
    this.root.rotation.y = yaw;
  }
}
