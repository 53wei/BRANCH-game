import { describe, expect, it, vi } from "vitest";
import * as THREE from "three/webgpu";
import { InteractionController, INTERACTION_RANGE_CALIBRATION } from "./InteractionController";

describe("InteractionController", () => {
  it("focuses a low world object through the dedicated interaction layer", () => {
    const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.05, 100);
    camera.position.set(1, 2.3, 1.8);
    camera.lookAt(1, 0.12, 0.1);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const bridgeMaterial = new THREE.MeshStandardMaterial({ color: "#4a463d", emissive: "#000000", emissiveIntensity: 0 });
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 1.3), bridgeMaterial);
    bridge.position.set(1, 0.12, 0.1);
    bridge.updateMatrixWorld(true);

    const interact = vi.fn();
    const controller = new InteractionController();
    controller.register({
      id: "source-bridge",
      type: "borrow",
      label: "借出桥段",
      maxDistance: 5.2,
      onInteract: interact,
    }, bridge);

    const focus = controller.focus(camera);
    expect(focus?.definition.id).toBe("source-bridge");
    expect(focus?.canInteract).toBe(true);
    expect(bridgeMaterial.emissiveIntensity).toBeGreaterThan(0);
    expect(controller.interact()).toBe(true);
    expect(interact).toHaveBeenCalledOnce();

    controller.setEnabled("source-bridge", false);
    expect(controller.focus(camera)).toBeUndefined();
    expect(bridgeMaterial.emissiveIntensity).toBe(0);
  });

  it("uses mid-range focus as a quiet cue but withholds the prompt action", () => {
    const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 100);
    camera.position.set(0, 1.6, 0);
    camera.lookAt(0, 1.1, -3.25);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const evidence = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: "#51483c", emissive: "#000000", emissiveIntensity: 0 }),
    );
    evidence.position.set(0, 1.1, -3.25);
    evidence.updateMatrixWorld(true);
    const interact = vi.fn();
    const controller = new InteractionController();
    controller.register({ id: "far-evidence", type: "evidence", label: "查看旧盒子", maxDistance: 2.35, onInteract: interact }, evidence);

    const focus = controller.focus(camera, camera.position);
    expect(focus?.distance).toBeGreaterThan(2.35);
    expect(focus?.distance).toBeLessThan(2.35 * INTERACTION_RANGE_CALIBRATION.focusMultiplier);
    expect(focus?.canInteract).toBe(false);
    expect(controller.interact()).toBe(false);
    expect(interact).not.toHaveBeenCalled();

    controller.clearFocus();
    expect((evidence.material as THREE.MeshStandardMaterial).emissiveIntensity).toBe(0);
  });

  it("keeps only one world object highlighted and fires focus transitions once", () => {
    const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 100);
    camera.position.set(0, 1.6, 0);
    camera.lookAt(0, 1.2, -2);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
    const firstMaterial = new THREE.MeshStandardMaterial({ emissive: "#000000", emissiveIntensity: 0 });
    const first = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), firstMaterial);
    first.position.set(0, 1.2, -2);
    first.updateMatrixWorld(true);
    const secondMaterial = new THREE.MeshStandardMaterial({ emissive: "#000000", emissiveIntensity: 0 });
    const second = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), secondMaterial);
    second.position.set(2, 1.2, -2);
    second.updateMatrixWorld(true);
    const firstFocus = vi.fn();
    const firstBlur = vi.fn();
    const controller = new InteractionController();
    controller.register({ id: "first", type: "evidence", label: "查看第一件证物", maxDistance: 3, onFocus: firstFocus, onBlur: firstBlur, onInteract: vi.fn() }, first);
    controller.register({ id: "second", type: "evidence", label: "查看第二件证物", maxDistance: 3, onInteract: vi.fn() }, second);

    controller.focus(camera);
    controller.focus(camera);
    expect(firstFocus).toHaveBeenCalledOnce();
    expect(firstMaterial.emissiveIntensity).toBeGreaterThan(0);

    camera.lookAt(2, 1.2, -2);
    camera.updateMatrixWorld(true);
    controller.focus(camera);
    expect(firstBlur).toHaveBeenCalledOnce();
    expect(firstMaterial.emissiveIntensity).toBe(0);
    expect(secondMaterial.emissiveIntensity).toBeGreaterThan(0);
  });
});
