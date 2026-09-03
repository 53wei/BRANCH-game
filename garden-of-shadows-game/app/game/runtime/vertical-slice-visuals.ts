import * as THREE from "three/webgpu";
import type { TingYuXuanScene } from "./TingYuXuanScene";
import {
  CH1_ANCHOR_TARGET,
  CH1_BORROWED_VIEW_POINT,
  CH1_BORROW_SOURCE,
  CH1_REWARD_POINTS,
  CH1_TRACES,
} from "./vertical-slice-content";

export interface ChapterOneSliceVisuals {
  root: THREE.Group;
  traceObjects: Map<string, THREE.Object3D>;
  rewardObjects: Map<string, THREE.Object3D>;
  portalSurface: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  borrowSource: THREE.Object3D;
  anchorMarker: THREE.Group;
  borrowedStone: THREE.Object3D;
}

const markMaterial = (color: string, opacity = 0.72) => new THREE.MeshBasicMaterial({
  color,
  transparent: true,
  opacity,
  side: THREE.DoubleSide,
  depthWrite: false,
  toneMapped: false,
});

const cloneObjectMaterials = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const source = Array.isArray(child.material) ? child.material : [child.material];
    const cloned = source.map((material) => material.clone());
    child.material = Array.isArray(child.material) ? cloned : cloned[0];
  });
  return object;
};

export const setSliceObjectOpacity = (object: THREE.Object3D, opacity: number) => {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      material.transparent = opacity < 0.999;
      material.opacity = opacity;
      material.depthWrite = opacity >= 0.999;
      material.needsUpdate = true;
    });
  });
};

const createTraceVisual = (trace: (typeof CH1_TRACES)[number]) => {
  const group = new THREE.Group();
  group.name = `SliceTrace_${trace.id}`;
  group.position.set(trace.position[0], 0.025, trace.position[2]);

  if (trace.id === "mud") {
    // Footprints are surface marks, not substitute 3D props. Keep them as thin decals.
    for (let index = 0; index < 3; index += 1) {
      const footprint = new THREE.Mesh(
        new THREE.CircleGeometry(0.11, 18),
        markMaterial("#111713", 0.58),
      );
      footprint.scale.set(0.72, 1.45, 1);
      footprint.rotation.x = -Math.PI / 2;
      footprint.position.set(index * 0.18, 0.004, index * 0.28);
      group.add(footprint);
    }
    return group;
  }

  const points = trace.id === "waterline"
    ? [new THREE.Vector3(-0.78, 0.01, 0.06), new THREE.Vector3(0, 0.01, 0), new THREE.Vector3(0.78, 0.01, -0.06)]
    : trace.id === "lantern"
      ? [new THREE.Vector3(-0.28, 0.01, -0.08), new THREE.Vector3(0.08, 0.01, 0), new THREE.Vector3(0.48, 0.01, 0.12)]
      : [new THREE.Vector3(-0.24, 0.04, -0.08), new THREE.Vector3(-0.06, 0.23, 0), new THREE.Vector3(0.18, 0.08, 0.08)];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: trace.id === "plant" ? "#3f5942" : "#53645d",
      transparent: true,
      opacity: 0.62,
    }),
  );
  line.name = `${group.name}_SurfaceTrace`;
  group.add(line);
  return group;
};

const normalizeSteppingStone = (object: THREE.Object3D) => {
  object.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const baseScale = 0.76 / Math.max(size.x, size.z, 0.001);
  object.scale.multiply(new THREE.Vector3(baseScale, baseScale * 0.38, baseScale));
  object.updateMatrixWorld(true);
  return object;
};

export async function buildChapterOneSliceVisuals(world: Pick<TingYuXuanScene, "cloneFormalAsset">): Promise<ChapterOneSliceVisuals> {
  const root = new THREE.Group();
  root.name = "ChapterOne_VerticalSlice_Content";
  const traceObjects = new Map<string, THREE.Object3D>();
  const rewardObjects = new Map<string, THREE.Object3D>();

  CH1_TRACES.forEach((trace) => {
    const object = createTraceVisual(trace);
    root.add(object);
    traceObjects.set(trace.id, object);
  });

  // Borrowed View is an intentional perception surface, not a substitute model.
  const portalSurface = new THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>(
    new THREE.PlaneGeometry(1.48, 1.78),
    new THREE.MeshBasicMaterial({ color: "#0c1714", side: THREE.DoubleSide, transparent: true, opacity: 0.88 }),
  );
  portalSurface.name = "BorrowedView_LeakWindow";
  portalSurface.position.set(...CH1_BORROWED_VIEW_POINT.position);
  portalSurface.rotation.y = -0.78;
  portalSurface.visible = false;
  root.add(portalSurface);

  // Reuse the already-downloaded Rock_A GLB as the physical stepping-stone source.
  // This keeps the mechanic attached to a recognisable authored object instead of a
  // squashed CylinderGeometry placeholder.
  const borrowSource = normalizeSteppingStone(await world.cloneFormalAsset("tyx-nat-rock-set-a", "Rock_A"));
  borrowSource.name = "BorrowSource_WifeThresholdStone_FormalAsset";
  borrowSource.position.set(...CH1_BORROW_SOURCE.position);
  borrowSource.updateMatrixWorld(true);
  const sourceBounds = new THREE.Box3().setFromObject(borrowSource);
  borrowSource.position.y -= sourceBounds.min.y - CH1_BORROW_SOURCE.position[1];
  borrowSource.visible = false;
  root.add(borrowSource);

  // TASK-048: no permanent engineering ring/light column. This remains a logic
  // anchor only; delayed global guidance provides a soft world cue when needed.
  const anchorMarker = new THREE.Group();
  anchorMarker.name = "BorrowAnchor_LoopBreak_LogicAnchor";
  anchorMarker.position.set(...CH1_ANCHOR_TARGET.position);
  anchorMarker.visible = false;
  root.add(anchorMarker);

  const borrowedStone = cloneObjectMaterials(borrowSource.clone(true));
  borrowedStone.name = "Borrowed_ThresholdStone_FormalAsset";
  borrowedStone.position.set(...CH1_ANCHOR_TARGET.position);
  borrowedStone.updateMatrixWorld(true);
  const borrowedBounds = new THREE.Box3().setFromObject(borrowedStone);
  borrowedStone.position.y -= borrowedBounds.min.y - CH1_ANCHOR_TARGET.position[1];
  borrowedStone.visible = false;
  root.add(borrowedStone);

  CH1_REWARD_POINTS.forEach((reward) => {
    const group = new THREE.Group();
    group.name = `SliceReward_${reward.id}`;
    group.position.set(reward.position[0], reward.id === "height-marks" ? 0.05 : 0.025, reward.position[2]);

    if (reward.id === "height-marks") {
      const points: THREE.Vector3[] = [];
      [0.62, 0.83, 1.04, 1.25].forEach((height, index) => {
        const half = (0.34 - index * 0.025) * 0.5;
        points.push(new THREE.Vector3(-half, height, 0), new THREE.Vector3(half, height, 0));
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: "#8c7c5d", transparent: true, opacity: 0.72 })));
    } else if (reward.id === "rain-note") {
      // A paper note is intrinsically planar. Use a thin paper surface and let the
      // document-reading layer carry legible text instead of a fake 3D brick.
      const paper = new THREE.Mesh(
        new THREE.PlaneGeometry(0.36, 0.22),
        new THREE.MeshStandardMaterial({ color: "#8c8066", roughness: 0.96, side: THREE.DoubleSide }),
      );
      paper.rotation.x = -Math.PI / 2;
      paper.rotation.z = 0.44;
      group.add(paper);
    } else {
      for (let index = 0; index < 5; index += 1) {
        const footprint = new THREE.Mesh(new THREE.CircleGeometry(0.105, 18), markMaterial("#111a17", 0.66));
        footprint.scale.set(0.72, 1.4, 1);
        footprint.rotation.x = -Math.PI / 2;
        footprint.position.set(index * 0.18, 0.004, -index * 0.22);
        group.add(footprint);
      }
    }
    group.visible = false;
    root.add(group);
    rewardObjects.set(reward.id, group);
  });

  return { root, traceObjects, rewardObjects, portalSurface, borrowSource, anchorMarker, borrowedStone };
}
