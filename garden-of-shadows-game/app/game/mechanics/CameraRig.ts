import * as THREE from "three/webgpu";
import { PLAYER_BODY_CALIBRATION } from "../runtime/player-calibration";

export type CameraMode = "exploration" | "investigation";

export interface CameraCollisionProbe {
  cameraSafeDistance(
    target: { x: number; y: number; z: number },
    desired: { x: number; y: number; z: number },
    margin?: number,
  ): number;
}

export interface CameraRigOptions {
  eyeHeight?: number;
  explorationFov?: number;
  investigationFov?: number;
  investigationForwardOffset?: number;
  smoothTime?: number;
  /** @deprecated Kept only so older playground callers compile. */
  shoulderOffset?: number;
  /** @deprecated First-person exploration has no camera boom. */
  explorationDistance?: number;
  /** @deprecated Replaced by eyeHeight. */
  targetHeight?: number;
  /** @deprecated First-person exploration has no separate lift. */
  explorationLift?: number;
  /** @deprecated First-person look direction is derived directly from yaw/pitch. */
  lookAhead?: number;
}

/**
 * First-person camera pose shared by exploration and close investigation.
 *
 * Runtime owns input and player physics. This class never offsets the camera
 * behind or beside the character, so turning in place cannot orbit around the
 * Rapier capsule or push the lens into the temporary player proxy.
 */
export class CameraRig {
  private modeValue: CameraMode = "exploration";
  private readonly collisionProbe?: CameraCollisionProbe;
  private readonly eyeHeight: number;
  private readonly explorationFov: number;
  private readonly investigationFov: number;
  private readonly investigationForwardOffset: number;
  private readonly smoothTime: number;
  private readonly desiredPosition = new THREE.Vector3();
  private readonly desiredTarget = new THREE.Vector3();
  private readonly currentTarget = new THREE.Vector3();
  private lookYawOffset = 0;
  private lookPitchOffset = 0;
  private desiredFov: number;
  private initialized = false;

  constructor(
    readonly camera: THREE.PerspectiveCamera,
    _collisionOrLegacyCanvas?: CameraCollisionProbe | HTMLCanvasElement,
    optionsOrLegacyCollision: CameraRigOptions | CameraCollisionProbe = {},
    legacyOptions?: CameraRigOptions,
  ) {
    const isCollisionProbe = (value: unknown): value is CameraCollisionProbe => Boolean(
      value && typeof value === "object" && "cameraSafeDistance" in value && typeof (value as CameraCollisionProbe).cameraSafeDistance === "function",
    );
    // Preserve both signatures:
    //   (camera, collision, options)
    //   (camera, canvas, collision, options) legacy playground
    this.collisionProbe = isCollisionProbe(_collisionOrLegacyCanvas)
      ? _collisionOrLegacyCanvas
      : isCollisionProbe(optionsOrLegacyCollision) ? optionsOrLegacyCollision : undefined;
    const options = legacyOptions ?? (isCollisionProbe(optionsOrLegacyCollision) ? {} : optionsOrLegacyCollision);
    this.eyeHeight = options.eyeHeight ?? PLAYER_BODY_CALIBRATION.eyeOffsetFromCapsuleCentre;
    this.explorationFov = options.explorationFov ?? PLAYER_BODY_CALIBRATION.explorationFov;
    this.investigationFov = options.investigationFov ?? PLAYER_BODY_CALIBRATION.investigationFov;
    this.investigationForwardOffset = options.investigationForwardOffset ?? PLAYER_BODY_CALIBRATION.investigationForwardOffset;
    this.smoothTime = Math.max(0.01, options.smoothTime ?? 0.12);
    this.desiredFov = this.explorationFov;
    this.camera.fov = this.explorationFov;
    this.camera.rotation.order = "YXZ";
    this.camera.updateProjectionMatrix();
  }

  get mode(): CameraMode {
    return this.modeValue;
  }

  enterInvestigation(player: THREE.Vector3, yaw: number, pitch = 0, immediate = false): void {
    this.modeValue = "investigation";
    this.syncInvestigation(player, yaw, pitch, immediate);
  }

  syncInvestigation(player: THREE.Vector3, yaw: number, pitch: number, immediate = false): void {
    if (this.modeValue !== "investigation") return;
    this.syncFirstPerson(player, yaw, pitch, this.investigationForwardOffset, this.investigationFov, immediate);
  }

  exitInvestigation(player: THREE.Vector3, yaw: number, pitch = 0, immediate = false): void {
    this.modeValue = "exploration";
    this.syncExploration(player, yaw, pitch, immediate);
  }

  syncExploration(player: THREE.Vector3, playerYaw: number, pitchOrImmediate: number | boolean = 0, immediate = false): void {
    if (this.modeValue !== "exploration") return;
    const pitch = typeof pitchOrImmediate === "boolean" ? 0 : pitchOrImmediate;
    const snapImmediately = typeof pitchOrImmediate === "boolean" ? pitchOrImmediate : immediate;
    this.syncFirstPerson(player, playerYaw, pitch, 0, this.explorationFov, snapImmediately);
  }

  rotate(yawDelta: number, pitchDelta: number): void {
    this.lookYawOffset += yawDelta;
    this.lookPitchOffset = THREE.MathUtils.clamp(this.lookPitchOffset + pitchDelta, -1.15, 1.05);
  }

  update(deltaSeconds: number): void {
    if (!this.initialized) {
      this.snapToDesired();
      return;
    }
    const alpha = 1 - Math.exp(-Math.max(0, deltaSeconds) / this.smoothTime);
    this.camera.position.lerp(this.desiredPosition, alpha);
    this.currentTarget.lerp(this.desiredTarget, alpha);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.desiredFov, alpha);
    this.camera.lookAt(this.currentTarget);
    this.camera.updateProjectionMatrix();
  }

  private syncFirstPerson(
    player: THREE.Vector3,
    yaw: number,
    pitch: number,
    forwardOffset: number,
    fov: number,
    immediate: boolean,
  ): void {
    const cameraYaw = yaw + this.lookYawOffset;
    const cameraPitch = THREE.MathUtils.clamp(pitch + this.lookPitchOffset, -1.15, 1.05);
    const horizontal = Math.cos(cameraPitch);
    const forward = new THREE.Vector3(
      -Math.sin(cameraYaw) * horizontal,
      Math.sin(cameraPitch),
      -Math.cos(cameraYaw) * horizontal,
    ).normalize();
    const planarForward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const eye = new THREE.Vector3(player.x, player.y + this.eyeHeight, player.z);
    let safeForwardOffset = forwardOffset;
    if (forwardOffset > 0 && this.collisionProbe) {
      const desired = eye.clone().addScaledVector(planarForward, forwardOffset);
      safeForwardOffset = Math.min(forwardOffset, this.collisionProbe.cameraSafeDistance(eye, desired, 0.04));
    }
    this.desiredPosition.copy(eye).addScaledVector(planarForward, safeForwardOffset);
    this.desiredTarget.copy(this.desiredPosition).addScaledVector(forward, 4);
    this.desiredFov = fov;
    if (immediate || !this.initialized) this.snapToDesired();
  }

  private snapToDesired(): void {
    this.camera.position.copy(this.desiredPosition);
    this.currentTarget.copy(this.desiredTarget);
    this.camera.fov = this.desiredFov;
    this.camera.lookAt(this.currentTarget);
    this.camera.updateProjectionMatrix();
    this.initialized = true;
  }

  dispose(): void {
    this.initialized = false;
  }
}
