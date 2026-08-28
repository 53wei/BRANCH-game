import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";

export type NorthTimeline = "past" | "present";
export type NorthTowerZone = "rockery-route" | "lower" | "upper" | "courtyard";

export interface NorthTowerInteractable {
  id: "rockery-baseline" | "gardener-side-route" | "borrowed-moon-gate" | "borrowed-stone" | "anchor-stone" | "north-route-exit" | "north-stairs" | "ledger-desk" | "borrowed-window" | "borrowed-window-return" | "past-beads" | "past-rockery" | "window-scratches" | "secret-passage";
  label: string;
  position: THREE.Vector3;
  zones: NorthTowerZone[];
  timelines?: NorthTimeline[];
  memoryIds?: MemoryId[];
  requiresRockeryMoved?: boolean;
  requiresFlags?: string[];
  hidesAfterFlag?: string;
}

const disposeObject = (object: THREE.Object3D) => {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
      if (child.geometry) geometries.add(child.geometry);
      const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
      childMaterials.forEach((material) => {
        if (material) materials.add(material);
      });
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
};

const box = (
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

export class NorthTowerScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, 0.05, 150);
  readonly interactables: NorthTowerInteractable[];

  private readonly memoryLight: THREE.PointLight;
  private readonly accountantLayer = new THREE.Group();
  private readonly wifeLayer = new THREE.Group();
  private readonly gardenerLayer = new THREE.Group();
  private readonly pastLayer = new THREE.Group();
  private readonly presentLayer = new THREE.Group();
  private readonly pastRockery = new THREE.Group();
  private readonly presentBlocker = new THREE.Group();
  private readonly openedPassage = new THREE.Group();
  private readonly guidanceMarker = new THREE.Group();
  private readonly rockeryPrelude = new THREE.Group();
  private readonly gardenerPreludeLayer = new THREE.Group();
  private readonly borrowedPreludeLayer = new THREE.Group();
  private readonly anchoredPreludeLayer = new THREE.Group();
  private readonly rain: THREE.Points;
  private readonly borrowedFrameMaterial: THREE.MeshStandardMaterial;
  private rockeryTargetX = -9;
  private elapsed = 0;

  constructor(private readonly layers: MemoryLayer[], quality: "high" | "stable" | "low") {
    this.scene.background = new THREE.Color("#0e1b22");
    this.scene.fog = new THREE.FogExp2("#0e1b22", 0.018);
    this.camera.rotation.order = "YXZ";

    this.scene.add(new THREE.HemisphereLight("#b9d3dc", "#1d2423", 3.2));
    const moonLight = new THREE.DirectionalLight("#8eb4c9", 2.2);
    moonLight.position.set(8, 12, 7);
    moonLight.castShadow = quality !== "low";
    this.scene.add(moonLight);
    this.memoryLight = new THREE.PointLight("#83b8dc", 38, 28, 1.35);
    this.memoryLight.position.set(0, 5.8, -9);
    this.memoryLight.castShadow = quality !== "low";
    this.scene.add(this.memoryLight);

    this.borrowedFrameMaterial = new THREE.MeshStandardMaterial({ color: "#758d99", emissive: "#164a68", emissiveIntensity: 2.2, roughness: 0.35, metalness: 0.18 });
    this.buildTower(quality);
    this.buildCourtyard(quality);
    this.buildRockeryPrelude(quality);
    this.buildMemoryLayers();
    this.buildTimelineLayers();
    this.buildGuidanceMarker();
    this.rain = this.buildRain(quality === "high" ? 1500 : quality === "stable" ? 760 : 360);
    this.scene.add(this.rockeryPrelude, this.gardenerPreludeLayer, this.borrowedPreludeLayer, this.anchoredPreludeLayer, this.accountantLayer, this.wifeLayer, this.gardenerLayer, this.pastLayer, this.presentLayer, this.guidanceMarker, this.rain);

    this.interactables = [
      { id: "rockery-baseline", label: "按 F 记下假山与院墙的正常位置", position: new THREE.Vector3(12, 1.2, 2.2), zones: ["rockery-route"], memoryIds: ["accountant"], hidesAfterFlag: "north.rockery.baseline-observed" },
      { id: "gardener-side-route", label: "按 F 走进园丁记忆里的墙后侧路", position: new THREE.Vector3(15.2, 1.2, 0.5), zones: ["rockery-route"], memoryIds: ["gardener"], requiresFlags: ["north.rockery.baseline-observed"], hidesAfterFlag: "north.rockery.loop-observed" },
      { id: "borrowed-moon-gate", label: "按 F 透过月洞门观察另一份认知", position: new THREE.Vector3(9.2, 1.2, 0.2), zones: ["rockery-route"], memoryIds: ["accountant"], requiresFlags: ["north.rockery.loop-observed"], hidesAfterFlag: "north.borrowed-view.previewed" },
      { id: "borrowed-stone", label: "按 F 从框景中借出一块石板", position: new THREE.Vector3(9.2, 1.2, -2), zones: ["rockery-route"], memoryIds: ["accountant"], requiresFlags: ["north.borrowed-view.previewed"], hidesAfterFlag: "north.borrowed.stone" },
      { id: "anchor-stone", label: "按 F 锚定借来的石板", position: new THREE.Vector3(12, 1.2, -2), zones: ["rockery-route"], requiresFlags: ["north.borrowed.stone"], hidesAfterFlag: "north.anchor.learned" },
      { id: "north-route-exit", label: "按 F 沿锚定石板前往北楼", position: new THREE.Vector3(7.2, 1.2, 4.5), zones: ["rockery-route"], requiresFlags: ["north.anchor.learned"], hidesAfterFlag: "north.rockery-route.complete" },
      { id: "north-stairs", label: "按 F 沿楼梯登上二层", position: new THREE.Vector3(0, 1.2, -1), zones: ["lower"] },
      { id: "ledger-desk", label: "按 F 检查钱先生的账桌", position: new THREE.Vector3(0.8, 4.5, -12.6), zones: ["upper"], memoryIds: ["accountant"], hidesAfterFlag: "north.ledger.inspected" },
      { id: "borrowed-window", label: "按 F 检查借景窗", position: new THREE.Vector3(-3.25, 4.5, -11), zones: ["upper"], memoryIds: ["accountant"], requiresFlags: ["north.ledger.inspected"] },
      { id: "borrowed-window-return", label: "按 F 让借景回到现在", position: new THREE.Vector3(-5.8, 1.2, -10), zones: ["courtyard"], timelines: ["past"] },
      { id: "past-beads", label: "按 F 检查泥里的算盘珠痕", position: new THREE.Vector3(-7.5, 1.1, -11.6), zones: ["courtyard"], timelines: ["past"], memoryIds: ["accountant"], hidesAfterFlag: "north.past.trail-inspected" },
      { id: "past-rockery", label: "按 F 调查案发前的假山", position: new THREE.Vector3(-9, 1.1, -10), zones: ["courtyard"], timelines: ["past"], memoryIds: ["accountant"], requiresFlags: ["north.past.trail-inspected"], hidesAfterFlag: "north.rockery.moved" },
      { id: "window-scratches", label: "按 F 勘验窗框划痕", position: new THREE.Vector3(-6.1, 1.2, -8.7), zones: ["courtyard"], timelines: ["present"], memoryIds: ["accountant", "wife"] },
      { id: "secret-passage", label: "按 F 勘验假山后的暗道", position: new THREE.Vector3(-12.4, 1.2, -10), zones: ["courtyard"], timelines: ["present"], memoryIds: ["accountant", "gardener"], requiresRockeryMoved: true },
    ];

    this.setMemory("accountant");
    this.setTimeline("present", false);
    this.setPreludeFlags([]);
  }

  private buildRockeryPrelude(quality: "high" | "stable" | "low") {
    const wetStone = new THREE.MeshStandardMaterial({ color: "#303b38", roughness: 0.38, metalness: 0.08 });
    const plaster = new THREE.MeshStandardMaterial({ color: "#8e9188", roughness: 0.94 });
    const moss = new THREE.MeshStandardMaterial({ color: "#29473a", roughness: 0.9 });
    const borrowed = new THREE.MeshStandardMaterial({ color: "#66889a", emissive: "#23536a", emissiveIntensity: 1.8, transparent: true, opacity: 0.72 });
    const anchored = new THREE.MeshStandardMaterial({ color: "#9b835b", emissive: "#6b5128", emissiveIntensity: 1.45, roughness: 0.5 });

    this.rockeryPrelude.add(box([11, .2, 12], [12, -.12, 2], wetStone));
    this.rockeryPrelude.add(box([.22, 3, 8], [17.4, 1.4, 2], plaster));
    this.rockeryPrelude.add(box([5.2, 3, .22], [14.8, 1.4, -4], plaster));
    this.rockeryPrelude.add(this.rockCluster(moss, [13.7, 0, .8]));
    this.rockeryPrelude.add(this.rockCluster(moss, [15.5, 0, -1.8]));

    const moonGate = new THREE.Group();
    moonGate.add(box([.25, 2.8, .25], [8.4, 1.35, .2], plaster));
    moonGate.add(box([.25, 2.8, .25], [10, 1.35, .2], plaster));
    moonGate.add(box([1.85, .25, .25], [9.2, 2.65, .2], plaster));
    const view = new THREE.Mesh(new THREE.CircleGeometry(.72, 32), borrowed);
    view.position.set(9.2, 1.35, .32);
    moonGate.add(view);
    this.borrowedPreludeLayer.add(moonGate);

    for (let index = 0; index < 5; index += 1) {
      const slab = box([1.15, .14, .72], [8.5 + index * .92, .02, -2], index < 2 ? borrowed : anchored);
      slab.rotation.y = (index % 2 ? 1 : -1) * .08;
      if (index < 2) this.borrowedPreludeLayer.add(slab);
      else this.anchoredPreludeLayer.add(slab);
    }

    const sideRoad = box([2.8, .12, 6], [15.4, .01, 1.4], moss);
    sideRoad.rotation.y = -.18;
    this.gardenerPreludeLayer.add(sideRoad);
    for (let index = 0; index < 4; index += 1) {
      const lantern = new THREE.PointLight("#6f9d7c", quality === "low" ? 2 : 4, 5, 1.8);
      lantern.position.set(15.1 + Math.sin(index) * .5, 1.1, 3.4 - index * 1.6);
      this.gardenerPreludeLayer.add(lantern);
    }
  }

  private addLantern(position: [number, number, number], color = "#d69255", intensity = 12) {
    const frameMaterial = new THREE.MeshStandardMaterial({ color: "#3a2419", roughness: 0.7 });
    const paperMaterial = new THREE.MeshStandardMaterial({ color: "#d6b17a", emissive: color, emissiveIntensity: 2.6, roughness: 0.55 });
    const lantern = new THREE.Group();
    lantern.add(box([0.48, 0.58, 0.48], [0, 0, 0], paperMaterial));
    lantern.add(box([0.56, 0.06, 0.56], [0, 0.32, 0], frameMaterial));
    lantern.add(box([0.56, 0.06, 0.56], [0, -0.32, 0], frameMaterial));
    lantern.position.set(...position);
    const light = new THREE.PointLight(color, intensity, 7, 1.7);
    light.position.set(...position);
    this.scene.add(lantern, light);
  }

  private buildTower(quality: "high" | "stable" | "low") {
    const plaster = new THREE.MeshStandardMaterial({ color: "#c4c2ae", roughness: 0.92 });
    const darkWood = new THREE.MeshStandardMaterial({ color: "#3b2519", roughness: 0.62 });
    const floorMat = new THREE.MeshStandardMaterial({ color: "#36494c", roughness: 0.42, metalness: 0.15 });
    const ledgerBlue = new THREE.MeshStandardMaterial({ color: "#28475a", emissive: "#0b2637", emissiveIntensity: 0.75, roughness: 0.48 });
    const inkBlack = new THREE.MeshStandardMaterial({ color: "#151c1d", roughness: 0.74 });

    this.scene.add(box([8.5, 0.24, 11], [0, -0.12, 3], floorMat));
    this.scene.add(box([8.5, 0.24, 13], [0, 3.08, -10], floorMat));
    this.scene.add(box([0.2, 3.1, 11], [-4.15, 1.5, 3], plaster));
    this.scene.add(box([0.2, 3.1, 11], [4.15, 1.5, 3], plaster));
    this.scene.add(box([0.2, 3.1, 13], [-4.15, 4.55, -10], plaster));
    this.scene.add(box([0.2, 3.1, 13], [4.15, 4.55, -10], plaster));
    this.scene.add(box([8.5, 0.2, 11], [0, 3.05, 3], darkWood));
    this.scene.add(box([8.5, 0.2, 13], [0, 6.12, -10], darkWood));

    for (const z of [7.4, 4.6, 1.8, -0.8]) {
      this.scene.add(box([8.2, 0.18, 0.24], [0, 2.82, z], darkWood));
    }
    for (const z of [-6, -9, -12, -15]) {
      this.scene.add(box([8.2, 0.18, 0.24], [0, 5.88, z], darkWood));
    }

    for (let step = 0; step < 9; step += 1) {
      const stair = box([3.2, 0.22, 0.62], [0, 0.08 + step * 0.34, -2.1 - step * 0.57], darkWood);
      this.scene.add(stair);
    }
    for (const x of [-1.75, 1.75]) {
      this.scene.add(box([0.1, 1.1, 5.2], [x, 1.8, -4.35], darkWood));
    }

    for (const z of [6.5, 3, -6, -10, -14]) {
      for (const x of [-3.55, 3.55]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.9, quality === "low" ? 8 : 14), darkWood);
        pillar.position.set(x, z > 0 ? 1.42 : 4.48, z);
        pillar.castShadow = quality !== "low";
        this.scene.add(pillar);
      }
    }

    const desk = box([2.6, 0.82, 1.25], [0.8, 3.58, -13.5], darkWood);
    this.scene.add(desk);
    this.scene.add(box([1.1, 1.8, 0.5], [-2.8, 4.02, -14.9], darkWood));
    this.scene.add(box([1.1, 1.8, 0.5], [-1.4, 4.02, -14.9], darkWood));
    this.scene.add(box([1.1, 1.8, 0.5], [2.8, 4.02, -14.9], darkWood));
    for (const x of [-2.8, -1.4, 2.8]) {
      for (const y of [3.55, 4.05, 4.55]) this.scene.add(box([0.92, 0.08, 0.34], [x, y, -14.58], ledgerBlue));
    }
    this.scene.add(box([1.5, 0.08, 0.9], [0.8, 4.04, -13.5], inkBlack));
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), ledgerBlue);
        bead.scale.set(1.35, 0.7, 0.7);
        bead.position.set(0.15 + column * 0.25, 4.08 + row * 0.16, -13.48);
        this.scene.add(bead);
      }
    }

    const frame = new THREE.Group();
    frame.add(box([0.16, 2.7, 0.22], [-3.98, 4.55, -11], this.borrowedFrameMaterial));
    frame.add(box([0.16, 2.7, 0.22], [-2.52, 4.55, -11], this.borrowedFrameMaterial));
    frame.add(box([1.62, 0.16, 0.22], [-3.25, 5.82, -11], this.borrowedFrameMaterial));
    frame.add(box([1.62, 0.16, 0.22], [-3.25, 3.28, -11], this.borrowedFrameMaterial));
    const borrowedView = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 2.38), new THREE.MeshBasicMaterial({ color: "#5ca7bc", transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }));
    borrowedView.position.set(-3.25, 4.55, -10.87);
    frame.add(borrowedView);
    this.scene.add(frame);

    this.addLantern([-2.9, 2.22, 6.4], "#d89a58", 14);
    this.addLantern([2.9, 2.22, 3.3], "#d89a58", 14);
    this.addLantern([-2.9, 2.22, 0.2], "#d89a58", 16);
    this.addLantern([2.7, 5.2, -7], "#75a9c7", 13);
    this.addLantern([1.9, 5.2, -13], "#75a9c7", 13);
  }

  private buildCourtyard(quality: "high" | "stable" | "low") {
    const wetStone = new THREE.MeshStandardMaterial({ color: "#1d2928", roughness: 0.24, metalness: 0.18 });
    const wallMat = new THREE.MeshStandardMaterial({ color: "#aaa99a", roughness: 0.9 });
    this.scene.add(box([10, 0.2, 10], [-10, -0.12, -10], wetStone));
    this.scene.add(box([0.18, 2.8, 10], [-15, 1.3, -10], wallMat));
    this.scene.add(box([10, 2.8, 0.18], [-10, 1.3, -15], wallMat));
    this.scene.add(box([10, 2.8, 0.18], [-10, 1.3, -5], wallMat));

    const pathMat = new THREE.MeshStandardMaterial({ color: "#59605a", roughness: 0.78 });
    for (let index = 0; index < 8; index += 1) {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.56, 0.08, 10), pathMat);
      stone.position.set(-6.8 - index * 0.95, 0.01, -10 + Math.sin(index * 1.7) * 0.35);
      stone.rotation.y = index * 0.45;
      this.scene.add(stone);
    }

    const waterMat = new THREE.MeshStandardMaterial({ color: "#173b42", emissive: "#09262c", emissiveIntensity: 0.8, roughness: 0.18, metalness: 0.3, transparent: true, opacity: 0.86 });
    const pond = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.75, 0.08, 24), waterMat);
    pond.position.set(-10.5, -0.02, -13.1);
    this.scene.add(pond);

    const exteriorFrame = new THREE.Group();
    exteriorFrame.add(box([0.2, 2.5, 0.2], [-5.95, 1.25, -10.9], this.borrowedFrameMaterial));
    exteriorFrame.add(box([0.2, 2.5, 0.2], [-5.95, 1.25, -9.1], this.borrowedFrameMaterial));
    exteriorFrame.add(box([0.2, 0.2, 2], [-5.95, 2.45, -10], this.borrowedFrameMaterial));
    this.scene.add(exteriorFrame);

    for (const z of [-7.2, -12.8]) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.46, 12), new THREE.MeshStandardMaterial({ color: "#73452b", emissive: "#9b5b2f", emissiveIntensity: 2.2 }));
      lantern.position.set(-13.8, 2.1, z);
      this.scene.add(lantern);
      const light = new THREE.PointLight("#c77b42", quality === "low" ? 3 : 6, 6, 1.8);
      light.position.copy(lantern.position);
      this.scene.add(light);
    }

    const bambooMat = new THREE.MeshStandardMaterial({ color: "#355a43", roughness: 0.78 });
    for (let index = 0; index < 7; index += 1) {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 3 + (index % 3) * 0.35, 8), bambooMat);
      stalk.position.set(-14.25 + (index % 2) * 0.34, 1.45, -6.2 - index * 1.18);
      stalk.rotation.z = (index % 2 ? -1 : 1) * 0.035;
      this.scene.add(stalk);
    }

    const scratchMat = new THREE.MeshBasicMaterial({ color: "#d5b77f" });
    for (let index = 0; index < 3; index += 1) {
      const scratch = box([0.025, 0.55, 0.035], [-5.82, 0.95 + index * 0.18, -8.72 - index * 0.055], scratchMat);
      scratch.rotation.x = 0.18;
      this.scene.add(scratch);
    }
  }

  private rockCluster(material: THREE.Material, position: [number, number, number]) {
    const group = new THREE.Group();
    group.position.set(...position);
    const shapes: Array<[number, number, number, number, number, number]> = [
      [0, 0.65, 0, 0.9, 1.3, 0.7],
      [-0.7, 0.35, 0.35, 0.65, 0.75, 0.55],
      [0.65, 0.3, -0.35, 0.7, 0.65, 0.6],
      [0.15, 1.35, 0.12, 0.48, 0.7, 0.42],
    ];
    for (const [x, y, z, sx, sy, sz] of shapes) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), material);
      rock.position.set(x, y, z);
      rock.scale.set(sx, sy, sz);
      rock.rotation.set(x * 0.2, z * 0.4, y * 0.1);
      rock.castShadow = true;
      group.add(rock);
    }
    return group;
  }

  private buildTimelineLayers() {
    const pastStone = new THREE.MeshStandardMaterial({ color: "#69746c", roughness: 0.86 });
    const presentStone = new THREE.MeshStandardMaterial({ color: "#39423f", roughness: 0.92 });
    const beadMaterial = new THREE.MeshStandardMaterial({ color: "#334e56", emissive: "#173c4b", emissiveIntensity: 1.4, roughness: 0.4 });
    this.pastRockery.add(this.rockCluster(pastStone, [0, 0, 0]));
    this.pastRockery.position.set(-9, 0, -10);
    this.pastLayer.add(this.pastRockery);

    for (let index = 0; index < 9; index += 1) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), beadMaterial);
      bead.scale.set(1.3, 0.55, 0.9);
      bead.position.set(-6.7 - index * 0.42, 0.06, -11.25 - Math.sin(index * 0.8) * 0.22);
      this.pastLayer.add(bead);
    }

    const fallen = this.rockCluster(presentStone, [0, 0, 0]);
    fallen.rotation.z = Math.PI / 2.5;
    fallen.scale.set(1.3, 0.8, 1.45);
    this.presentBlocker.add(fallen);
    this.presentBlocker.position.set(-11.5, 0, -10);
    this.presentLayer.add(this.presentBlocker);

    const passage = box([0.25, 2.1, 2.1], [-14.83, 1, -10], new THREE.MeshStandardMaterial({ color: "#07110f", emissive: "#12392f", emissiveIntensity: 1.4, roughness: 1 }));
    const passageLight = new THREE.PointLight("#5c9d82", 7, 5, 1.8);
    passageLight.position.set(-14.2, 1.2, -10);
    this.openedPassage.add(passage, passageLight);
    this.presentLayer.add(this.openedPassage);
  }

  private buildMemoryLayers() {
    const gridMat = new THREE.LineBasicMaterial({ color: "#5c91ad", transparent: true, opacity: 0.35 });
    for (let x = -3; x <= 3; x += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 3.2, -16), new THREE.Vector3(x, 3.2, -4)]);
      this.accountantLayer.add(new THREE.Line(geometry, gridMat));
    }
    for (let z = -16; z <= -4; z += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.5, 3.2, z), new THREE.Vector3(3.5, 3.2, z)]);
      this.accountantLayer.add(new THREE.Line(geometry, gridMat));
    }

    const wifeGlow = new THREE.MeshStandardMaterial({ color: "#8a5d3d", emissive: "#6b351d", emissiveIntensity: 1.9 });
    for (const position of [[-2.8, 5.1, -7], [2.8, 5.1, -12]] as const) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.42, 12), wifeGlow);
      lantern.position.set(position[0], position[1], position[2]);
      this.wifeLayer.add(lantern);
    }

    const vineMat = new THREE.MeshBasicMaterial({ color: "#426f58", transparent: true, opacity: 0.7 });
    for (let index = 0; index < 8; index += 1) {
      const vine = new THREE.Mesh(new THREE.TorusGeometry(0.45 + index * 0.06, 0.035, 7, 28, Math.PI * 1.4), vineMat);
      vine.position.set(-14.7, 0.5 + index * 0.2, -12.5 + index * 0.35);
      vine.rotation.y = Math.PI / 2;
      this.gardenerLayer.add(vine);
    }
  }

  private buildGuidanceMarker() {
    const material = new THREE.MeshBasicMaterial({ color: "#e1c47b", transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.48, 40), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.04;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.11, 1.4, 14, 1, true), new THREE.MeshBasicMaterial({ color: "#e1c47b", transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false }));
    beam.position.y = 0.72;
    this.guidanceMarker.add(ring, beam);
    this.guidanceMarker.visible = false;
  }

  private buildRain(count: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -16 + Math.random() * 22;
      positions[index * 3 + 1] = Math.random() * 8;
      positions[index * 3 + 2] = -18 + Math.random() * 28;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#91adb7", size: 0.03, transparent: true, opacity: 0.38, depthWrite: false }));
  }

  setMemory(memory: MemoryId) {
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.accountantLayer.visible = memory === "accountant";
    this.wifeLayer.visible = memory === "wife";
    this.gardenerLayer.visible = memory === "gardener";
    this.scene.background = new THREE.Color(layer.visual.fog);
    this.scene.fog = new THREE.FogExp2(layer.visual.fog, memory === "gardener" ? 0.043 : 0.028);
    this.memoryLight.color.set(layer.visual.keyLight);
    this.memoryLight.intensity = memory === "accountant" ? 24 : memory === "wife" ? 18 : 14;
    this.borrowedFrameMaterial.emissiveIntensity = memory === "accountant" ? 2.8 : 0.18;
    this.gardenerPreludeLayer.visible = memory === "gardener";
    this.borrowedPreludeLayer.visible = memory === "accountant";
  }

  setPreludeFlags(flags: string[]) {
    this.anchoredPreludeLayer.visible = flags.includes("north.anchor.learned");
  }

  setTimeline(timeline: NorthTimeline, rockeryMoved: boolean) {
    this.pastLayer.visible = timeline === "past";
    this.presentLayer.visible = timeline === "present";
    this.rockeryTargetX = rockeryMoved ? -6.4 : -9;
    this.presentBlocker.visible = !rockeryMoved;
    this.openedPassage.visible = rockeryMoved;
  }

  setGuidanceTarget(position?: THREE.Vector3) {
    this.guidanceMarker.visible = Boolean(position);
    if (position) this.guidanceMarker.position.set(position.x, position.y > 3 ? 3.2 : 0, position.z);
  }

  availableInteractables(memory: MemoryId, timeline: NorthTimeline, zone: NorthTowerZone, rockeryMoved: boolean, earnedFlags: string[] = []) {
    return this.interactables.filter((item) => item.zones.includes(zone)
      && (!item.timelines || item.timelines.includes(timeline))
      && (!item.memoryIds || item.memoryIds.includes(memory))
      && (!item.requiresRockeryMoved || rockeryMoved)
      && (!item.requiresFlags || item.requiresFlags.every((flag) => earnedFlags.includes(flag)))
      && (!item.hidesAfterFlag || !earnedFlags.includes(item.hidesAfterFlag)));
  }

  constrain(position: THREE.Vector3, zone: NorthTowerZone) {
    if (zone === "rockery-route") {
      position.x = THREE.MathUtils.clamp(position.x, 7, 17);
      position.z = THREE.MathUtils.clamp(position.z, -3.8, 8);
      position.y = 1.65;
    } else if (zone === "lower") {
      position.x = THREE.MathUtils.clamp(position.x, -3.55, 3.55);
      position.z = THREE.MathUtils.clamp(position.z, -1.5, 8);
      position.y = 1.65;
    } else if (zone === "upper") {
      position.x = THREE.MathUtils.clamp(position.x, -3.45, 3.45);
      position.z = THREE.MathUtils.clamp(position.z, -15.5, -5);
      position.y = 4.72;
    } else {
      position.x = THREE.MathUtils.clamp(position.x, -14.25, -6.05);
      position.z = THREE.MathUtils.clamp(position.z, -14.4, -5.6);
      position.y = 1.65;
    }
    return position;
  }

  update(delta: number) {
    this.elapsed += delta;
    this.pastRockery.position.x = THREE.MathUtils.damp(this.pastRockery.position.x, this.rockeryTargetX, 3.8, delta);
    const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      let y = positions.getY(index) - delta * 7.2;
      if (y < 0) y = 6 + Math.random() * 2;
      positions.setY(index, y);
    }
    positions.needsUpdate = true;
    if (this.guidanceMarker.visible) {
      const pulse = 1 + Math.sin(this.elapsed * 3.1) * 0.09;
      this.guidanceMarker.scale.set(pulse, 1, pulse);
      this.guidanceMarker.rotation.y += delta * 0.35;
    }
  }

  dispose() {
    disposeObject(this.scene);
  }
}
