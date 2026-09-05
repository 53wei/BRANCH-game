import { describe, expect, it, vi } from "vitest";
import * as THREE from "three/webgpu";
import { ObjectInspectionController } from "./ObjectInspectionController";

describe("ObjectInspectionController", () => {
  it("clones a real source, requires the configured detail angle, and restores the world object", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 100);
    const source = new THREE.Mesh(new THREE.BoxGeometry(2, 0.4, 1), new THREE.MeshStandardMaterial({ color: "#675a47" }));
    source.position.set(4, 0.2, 8);
    scene.add(source);
    const onObserve = vi.fn();
    const controller = new ObjectInspectionController(scene, camera);
    const initial = controller.open({
      id: "old-shoe",
      kind: "shoe",
      title: "旧鞋",
      source,
      hotspots: [{ id: "outer-heel", label: "右后跟", fact: "外侧磨损更深。", localDirection: [1, 0, 0], facingThreshold: 0.8 }],
      onObserve,
    });

    expect(source.visible).toBe(false);
    expect(controller.active).toBe(true);
    expect(initial.activeHotspot).toBeUndefined();
    expect(controller.rotate(-Math.PI / 2, 0)?.activeHotspot?.id).toBe("outer-heel");
    expect(controller.observeActiveHotspot()?.fact).toBe("外侧磨损更深。");
    expect(controller.snapshot().complete).toBe(true);
    expect(onObserve).toHaveBeenCalledOnce();

    controller.close();
    expect(source.visible).toBe(true);
    expect(controller.active).toBe(false);
    expect(camera.children.some((child) => child.name === "ObjectInspection_CameraStage")).toBe(false);
  });

  it("shares rotation and bounded zoom behavior across umbrella and key objects", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 100);
    const controller = new ObjectInspectionController(scene, camera);
    const source = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.4, 0.2), new THREE.MeshStandardMaterial());

    (["umbrella", "key"] as const).forEach((kind) => {
      controller.open({ id: kind, kind, title: kind, source, hideWorldSource: false });
      controller.zoomBy(20);
      expect(controller.snapshot().zoom).toBe(1.55);
      controller.zoomBy(-20);
      expect(controller.snapshot().zoom).toBe(0.72);
      expect(controller.rotate(0, 10)?.complete).toBe(true);
      controller.close();
    });
  });
});
