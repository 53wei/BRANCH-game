import CameraControls from "camera-controls";
import * as THREE from "three/webgpu";

CameraControls.install({ THREE });

export type CameraMode = "exploration" | "investigation";

export interface CameraCollisionProbe {
  cameraSafeDistance(target: { x: number; y: number; z: number }, desired: { x: number; y: number; z: number }, margin?: number): number;
}

export interface CameraRigOptions {
  shoulderOffset?: number;
  explorationDistance?: number;
  targetHeight?: number;
}

export class CameraRig {
  readonly controls: CameraControls;
  private modeValue: CameraMode = "exploration";
  private readonly shoulderOffset: number;
  private readonly explorationDistance: number;
  private readonly targetHeight: number;
  private azimuth = Math.PI;
  private polar = 1.22;

  constructor(
    readonly camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    private readonly collision?: CameraCollisionProbe,
    options: CameraRigOptions = {},
  ) {
    this.shoulderOffset = options.shoulderOffset ?? 0.48;
    this.explorationDistance = options.explorationDistance ?? 4.2;
    this.targetHeight = options.targetHeight ?? 1.25;
    this.controls = new CameraControls(camera, domElement);
    this.controls.smoothTime = 0.28;
    this.controls.draggingSmoothTime = 0.12;
    this.controls.minPolarAngle = 0.65;
    this.controls.maxPolarAngle = 1.48;
    this.controls.minDistance = 0.02;
    this.controls.maxDistance = this.explorationDistance;
    this.controls.mouseButtons.wheel = CameraControls.ACTION.NONE;
    this.controls.touches.two = CameraControls.ACTION.TOUCH_ROTATE;
  }

  get mode(): CameraMode {
    return this.modeValue;
  }

  enterInvestigation(player: THREE.Vector3, yaw: number, pitch = 0): Promise<void> {
    this.modeValue = "investigation";
    this.azimuth = yaw + Math.PI;
    this.controls.enabled = false;
    return this.syncInvestigation(player, yaw, pitch, true);
  }

  syncInvestigation(player: THREE.Vector3, yaw: number, pitch: number, transition = false): Promise<void> {
    if (this.modeValue !== "investigation") return Promise.resolve();
    const eye = new THREE.Vector3(player.x, player.y + 1.4, player.z);
    const clampedPitch = THREE.MathUtils.clamp(pitch, -1.2, 0.85);
    const horizontal = Math.cos(clampedPitch);
    const look = eye.clone().add(new THREE.Vector3(
      -Math.sin(yaw) * horizontal,
      Math.sin(clampedPitch),
      -Math.cos(yaw) * horizontal,
    ).multiplyScalar(4));
    return this.controls.setLookAt(eye.x, eye.y, eye.z, look.x, look.y, look.z, transition);
  }

  exitInvestigation(player: THREE.Vector3, yaw: number): Promise<void> {
    this.modeValue = "exploration";
    this.controls.enabled = true;
    return this.syncExploration(player, yaw, true);
  }

  rotate(deltaAzimuth: number, deltaPolar: number): void {
    if (this.modeValue !== "exploration") return;
    this.azimuth += deltaAzimuth;
    this.polar = THREE.MathUtils.clamp(this.polar + deltaPolar, 0.65, 1.48);
  }

  syncExploration(player: THREE.Vector3, playerYaw: number, transition = false): Promise<void> {
    if (this.modeValue !== "exploration") return Promise.resolve();
    if (!Number.isFinite(this.azimuth)) this.azimuth = playerYaw + Math.PI;
    const target = new THREE.Vector3(player.x, player.y + this.targetHeight, player.z);
    const spherical = new THREE.Spherical(this.explorationDistance, this.polar, this.azimuth);
    const desired = target.clone().add(new THREE.Vector3().setFromSpherical(spherical));
    const right = new THREE.Vector3(Math.cos(playerYaw), 0, -Math.sin(playerYaw)).multiplyScalar(this.shoulderOffset);
    desired.add(right);
    const safeDistance = this.collision?.cameraSafeDistance(target, desired, 0.16) ?? desired.distanceTo(target);
    const direction = desired.clone().sub(target).normalize();
    const safe = target.clone().addScaledVector(direction, Math.max(0.45, safeDistance));
    return this.controls.setLookAt(safe.x, safe.y, safe.z, target.x, target.y, target.z, transition);
  }

  update(deltaSeconds: number): boolean {
    return this.controls.update(deltaSeconds);
  }

  dispose(): void {
    this.controls.dispose();
  }
}

