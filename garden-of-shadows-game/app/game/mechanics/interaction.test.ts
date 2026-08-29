import { describe, expect, it, vi } from "vitest";
import * as THREE from "three/webgpu";
import { InteractionController } from "./InteractionController";

describe("InteractionController", () => {
  it("focuses a low world object through the dedicated interaction layer", () => {
    const camera = new THREE.PerspectiveCamera(58, 16 / 9, 0.05, 100);
    camera.position.set(1, 2.3, 1.8);
    camera.lookAt(1, 0.12, 0.1);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.24, 1.3));
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

    expect(controller.focus(camera)?.definition.id).toBe("source-bridge");
    expect(controller.interact()).toBe(true);
    expect(interact).toHaveBeenCalledOnce();

    controller.setEnabled("source-bridge", false);
    expect(controller.focus(camera)).toBeUndefined();
  });
});
