import { describe, expect, it } from "vitest";
import * as THREE from "three/webgpu";
import { PLAYER_BODY_CALIBRATION } from "../runtime/player-calibration";
import { CameraRig } from "./CameraRig";

describe("CameraRig first-person exploration", () => {
  it("places the lens at the calibrated adult eye height and uses the shared exploration FOV", () => {
    const camera = new THREE.PerspectiveCamera();
    const rig = new CameraRig(camera);
    const player = new THREE.Vector3(10.9, 0.9, 39.4);

    rig.syncExploration(player, Math.PI / 2, 0, true);

    expect(camera.position.x).toBeCloseTo(10.9);
    expect(camera.position.y).toBeCloseTo(PLAYER_BODY_CALIBRATION.eyeWorldHeightAtReferenceY);
    expect(camera.position.z).toBeCloseTo(39.4);
    expect(camera.fov).toBe(PLAYER_BODY_CALIBRATION.explorationFov);
    expect(Math.hypot(camera.position.x - player.x, camera.position.z - player.z)).toBe(0);
  });

  it("turns 90 and 180 degrees without orbiting around the player", () => {
    const camera = new THREE.PerspectiveCamera();
    const rig = new CameraRig(camera);
    const player = new THREE.Vector3(2, 0.9, 3);

    for (const yaw of [0, Math.PI / 2, Math.PI]) {
      rig.syncExploration(player, yaw, 0, true);
      expect(camera.position.x).toBeCloseTo(player.x);
      expect(camera.position.z).toBeCloseTo(player.z);
      expect(camera.position.y).toBeCloseTo(PLAYER_BODY_CALIBRATION.eyeWorldHeightAtReferenceY);
    }
  });

  it("keeps investigation first-person, narrows FOV, and restores the same heading", () => {
    const camera = new THREE.PerspectiveCamera();
    const rig = new CameraRig(camera);
    const player = new THREE.Vector3(4, 0.9, 8);
    const yaw = 0.72;
    const pitch = 0.18;

    rig.syncExploration(player, yaw, pitch, true);
    const explorationDirection = new THREE.Vector3();
    camera.getWorldDirection(explorationDirection);
    rig.enterInvestigation(player, yaw, pitch, true);
    expect(camera.fov).toBe(PLAYER_BODY_CALIBRATION.investigationFov);
    expect(camera.position.y).toBeCloseTo(PLAYER_BODY_CALIBRATION.eyeWorldHeightAtReferenceY);
    expect(Math.hypot(camera.position.x - player.x, camera.position.z - player.z)).toBeCloseTo(PLAYER_BODY_CALIBRATION.investigationForwardOffset);
    rig.exitInvestigation(player, yaw, pitch, true);
    const restoredDirection = new THREE.Vector3();
    camera.getWorldDirection(restoredDirection);

    expect(camera.fov).toBe(PLAYER_BODY_CALIBRATION.explorationFov);
    expect(camera.position.x).toBeCloseTo(player.x);
    expect(camera.position.z).toBeCloseTo(player.z);
    expect(restoredDirection.angleTo(explorationDirection)).toBeLessThan(0.000001);
  });

  it("does not probe a third-person boom during exploration", () => {
    const camera = new THREE.PerspectiveCamera();
    const collision = { cameraSafeDistance: () => { throw new Error("first-person exploration must not probe a boom"); } };
    const rig = new CameraRig(camera, collision);

    expect(() => rig.syncExploration(new THREE.Vector3(0, 0.9, 0), 0, 0, true)).not.toThrow();
    expect(camera.position.x).toBeCloseTo(0);
    expect(camera.position.y).toBeCloseTo(PLAYER_BODY_CALIBRATION.eyeWorldHeightAtReferenceY);
    expect(camera.position.z).toBeCloseTo(0);
  });

  it("clamps the investigation-only forward lens offset against architecture", () => {
    const camera = new THREE.PerspectiveCamera();
    const collision = { cameraSafeDistance: () => 0.06 };
    const rig = new CameraRig(camera, collision, { investigationForwardOffset: 0.18 });
    const player = new THREE.Vector3(0, 0.9, 0);

    rig.enterInvestigation(player, 0, 0, true);

    expect(camera.position.x).toBeCloseTo(0);
    expect(camera.position.z).toBeCloseTo(-0.06);
    expect(camera.position.y).toBeCloseTo(PLAYER_BODY_CALIBRATION.eyeWorldHeightAtReferenceY);
  });
});
