import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";

export interface FrontHallInteractable {
  id: "painter-easel" | "wife-jade" | "gardener-shears" | "accountant-page" | "painted-door" | "vanishing-corridor" | "fourfold-lock";
  label: string;
  position: THREE.Vector3;
  memoryIds?: MemoryId[];
  requiresFlags?: string[];
  hidesAfterFlag?: string;
}

const box = (size: [number, number, number], position: [number, number, number], material: THREE.Material) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const disposeObject = (root: THREE.Object3D) => root.traverse((object) => {
  if (!(object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line)) return;
  object.geometry?.dispose();
  const materials = Array.isArray(object.material) ? object.material : [object.material];
  materials.forEach((material) => material.dispose());
});

export class FrontHallScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, .05, 140);
  readonly interactables: FrontHallInteractable[];

  private readonly painterLayer = new THREE.Group();
  private readonly wifeLayer = new THREE.Group();
  private readonly gardenerLayer = new THREE.Group();
  private readonly accountantLayer = new THREE.Group();
  private readonly floatingProps = new THREE.Group();
  private readonly corridorWall = new THREE.Group();
  private readonly guidanceMarker = new THREE.Group();
  private readonly memoryLight: THREE.PointLight;
  private readonly clockHands: THREE.Object3D[] = [];
  private readonly lockTokens = new Map<string, THREE.Object3D>();
  private readonly gateLeft = new THREE.Group();
  private readonly gateRight = new THREE.Group();
  private gateOpen = false;
  private currentMemory: MemoryId = "painter";
  private elapsed = 0;

  constructor(private readonly layers: MemoryLayer[], quality: "high" | "stable" | "low") {
    this.scene.background = new THREE.Color("#17131c");
    this.scene.fog = new THREE.FogExp2("#17131c", .025);
    this.camera.rotation.order = "YXZ";
    this.scene.add(new THREE.HemisphereLight("#dec9bd", "#151119", 2.7));
    const moon = new THREE.DirectionalLight("#a8b7ca", 1.8);
    moon.position.set(-7, 13, 8);
    moon.castShadow = quality !== "low";
    this.scene.add(moon);
    this.memoryLight = new THREE.PointLight("#d58b87", 30, 26, 1.4);
    this.memoryLight.position.set(0, 4.8, -8);
    this.scene.add(this.memoryLight);

    this.buildArchitecture(quality);
    this.buildPainterLayer();
    this.buildWifeLayer();
    this.buildGardenerLayer();
    this.buildAccountantLayer();
    this.buildGuidanceMarker();
    this.scene.add(this.painterLayer, this.wifeLayer, this.gardenerLayer, this.accountantLayer, this.floatingProps, this.corridorWall, this.guidanceMarker);

    this.interactables = [
      { id: "painter-easel", label: "按 F 检查未完成的中庭画", position: new THREE.Vector3(0, 1.2, -4.2), memoryIds: ["painter"], hidesAfterFlag: "front.mark.painter" },
      { id: "painted-door", label: "按 F 核对画中多出的门", position: new THREE.Vector3(.9, 1.2, -4.1), memoryIds: ["painter", "accountant"], requiresFlags: ["front.mark.painter"], hidesAfterFlag: "front.contradiction.painted-door" },
      { id: "wife-jade", label: "按 F 取回夫人遗失的玉佩", position: new THREE.Vector3(4.2, 1.2, -2.2), memoryIds: ["wife"], requiresFlags: ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor"], hidesAfterFlag: "front.mark.wife" },
      { id: "gardener-shears", label: "按 F 从假山深处取出园艺剪", position: new THREE.Vector3(-3.2, 1.2, -11), memoryIds: ["gardener"], requiresFlags: ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor"], hidesAfterFlag: "front.mark.gardener" },
      { id: "accountant-page", label: "按 F 检查账本夹页", position: new THREE.Vector3(3.1, 1.2, -10.2), memoryIds: ["accountant"], requiresFlags: ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor"], hidesAfterFlag: "front.mark.accountant" },
      { id: "vanishing-corridor", label: "按 F 勘验被涂成白墙的来路", position: new THREE.Vector3(0, 1.2, -8.2), memoryIds: ["painter", "wife"], requiresFlags: ["front.contradiction.painted-door"], hidesAfterFlag: "front.contradiction.vanishing-corridor" },
      { id: "fourfold-lock", label: "按 F 将四枚印记嵌入四面锁", position: new THREE.Vector3(0, 1.25, -17), requiresFlags: ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor", "front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"] },
    ];
    this.setMemory("painter");
  }

  private buildArchitecture(quality: "high" | "stable" | "low") {
    const plaster = new THREE.MeshStandardMaterial({ color: "#d2cdbf", roughness: .94 });
    const wood = new THREE.MeshStandardMaterial({ color: "#3a211b", roughness: .64 });
    const wetStone = new THREE.MeshStandardMaterial({ color: "#293637", roughness: .3, metalness: .12 });
    const gold = new THREE.MeshStandardMaterial({ color: "#8f7549", emissive: "#4a3513", emissiveIntensity: 1.2, roughness: .46 });
    this.scene.add(box([10, .2, 25], [0, -.12, -4], wetStone));
    this.scene.add(box([.24, 3.4, 25], [-5, 1.65, -4], plaster));
    this.scene.add(box([.24, 3.4, 25], [5, 1.65, -4], plaster));
    this.scene.add(box([10, .25, 25], [0, 3.35, -4], wood));
    for (const z of [7, 4, 1, -2, -5, -8, -11, -14]) {
      for (const x of [-4.55, 4.55]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.17, .21, 3.25, quality === "low" ? 8 : 14), wood);
        pillar.position.set(x, 1.6, z);
        pillar.castShadow = quality !== "low";
        this.scene.add(pillar);
      }
      this.scene.add(box([9.3, .18, .25], [0, 3.05, z], wood));
    }
    // 偏厅开口与低重力物件
    this.scene.add(box([5, .18, 5], [3.4, -.02, -2.2], wetStone));
    for (let i = 0; i < 7; i += 1) {
      const prop = box([.32 + i % 2 * .18, .12, .28], [2.2 + i % 3, .7 + i * .25, -1.3 - i % 3], gold);
      prop.rotation.set(i * .12, i * .46, i * .08);
      this.floatingProps.add(prop);
    }
    // 中庭月洞门与四面锁
    const arch = new THREE.TorusGeometry(2.05, .28, 14, 44, Math.PI);
    const archMesh = new THREE.Mesh(arch, plaster);
    archMesh.rotation.z = Math.PI;
    archMesh.position.set(0, 1.1, -15.2);
    this.scene.add(archMesh, box([5.9, 1.15, .45], [0, 2.78, -15.2], plaster));
    const gateMaterial = new THREE.MeshStandardMaterial({ color: "#17130f", emissive: "#26180e", emissiveIntensity: .42, roughness: .72, metalness: .12 });
    this.gateLeft.add(box([2.05, 2.7, .28], [0, 0, 0], gateMaterial));
    this.gateRight.add(box([2.05, 2.7, .28], [0, 0, 0], gateMaterial));
    this.gateLeft.position.set(-1.05, 1.35, -17.25);
    this.gateRight.position.set(1.05, 1.35, -17.25);
    this.scene.add(this.gateLeft, this.gateRight);
    const lock = new THREE.Group();
    const tokenColors = ["#a9799e", "#8bc3a9", "#758d68", "#78a6c5"];
    const tokenFlags = ["front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"];
    for (let side = 0; side < 4; side += 1) {
      const plate = box([.7, .7, .14], [0, .25 + side * .48, 0], gold);
      plate.rotation.z = side * Math.PI / 4;
      lock.add(plate);
      const token = new THREE.Mesh(new THREE.OctahedronGeometry(.16, 0), new THREE.MeshStandardMaterial({ color: tokenColors[side], emissive: tokenColors[side], emissiveIntensity: 1.8, roughness: .26 }));
      token.position.set(0, .25 + side * .48, .14);
      token.visible = false;
      lock.add(token);
      this.lockTokens.set(tokenFlags[side], token);
    }
    lock.position.set(0, .65, -17.1);
    this.scene.add(lock);
    // 前厅慢钟、中庭快钟
    for (const position of [[-3.6, 2.2, 4.5], [3.6, 2.2, -12.5]] as const) {
      const hand = box([.05, .68, .05], [position[0], position[1], position[2]], gold);
      hand.geometry.translate(0, -.28, 0);
      this.scene.add(hand);
      this.clockHands.push(hand);
    }
  }

  private buildPainterLayer() {
    const canvas = new THREE.MeshStandardMaterial({ color: "#cab79c", emissive: "#51384d", emissiveIntensity: .8, roughness: .88 });
    const ink = new THREE.MeshBasicMaterial({ color: "#332934", transparent: true, opacity: .82 });
    const easel = new THREE.Group();
    easel.add(box([2.3, 1.55, .12], [0, 1.15, 0], canvas));
    easel.add(box([.12, 2.7, .12], [-.8, .55, .12], ink), box([.12, 2.7, .12], [.8, .55, .12], ink));
    const falseDoor = box([.52, .9, .03], [.58, 1.15, -.08], new THREE.MeshBasicMaterial({ color: "#341b2c" }));
    easel.add(falseDoor);
    easel.position.set(0, 0, -4.2);
    this.painterLayer.add(easel);
    const white = new THREE.MeshStandardMaterial({ color: "#eeeae2", emissive: "#817b75", emissiveIntensity: .3, roughness: 1 });
    this.corridorWall.add(box([9.6, 3.15, .3], [0, 1.55, -6.9], white));
  }

  private buildWifeLayer() {
    const red = new THREE.MeshStandardMaterial({ color: "#7f2828", emissive: "#4b1517", emissiveIntensity: 1.2, roughness: .5 });
    const jade = new THREE.MeshStandardMaterial({ color: "#8bc3a9", emissive: "#285b49", emissiveIntensity: 2.2, roughness: .25 });
    this.wifeLayer.add(box([1.8, .85, .9], [4.1, .42, -2.2], red));
    const pendant = new THREE.Mesh(new THREE.TorusGeometry(.2, .07, 10, 24), jade);
    pendant.position.set(4.2, .95, -2.2);
    pendant.rotation.x = Math.PI / 2;
    this.wifeLayer.add(pendant);
  }

  private buildGardenerLayer() {
    const rockMat = new THREE.MeshStandardMaterial({ color: "#405548", roughness: .95 });
    for (let i = 0; i < 7; i += 1) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(.75, 0), rockMat);
      rock.position.set(-3.2 + Math.sin(i * 2) * .8, .45 + i % 3 * .5, -11 + Math.cos(i) * .7);
      rock.scale.set(.8, 1.1, .72);
      this.gardenerLayer.add(rock);
    }
    const metal = new THREE.MeshStandardMaterial({ color: "#93a9a0", metalness: .72, roughness: .28 });
    const shears = new THREE.Group();
    const left = box([.08, .7, .08], [-.13, .25, 0], metal);
    const right = box([.08, .7, .08], [.13, .25, 0], metal);
    left.rotation.z = -.25; right.rotation.z = .25;
    shears.add(left, right);
    shears.position.set(-3.2, .45, -10.3);
    this.gardenerLayer.add(shears);
  }

  private buildAccountantLayer() {
    const grid = new THREE.LineBasicMaterial({ color: "#73a9c6", transparent: true, opacity: .32 });
    for (let x = -4; x <= 4; x += 1) {
      this.accountantLayer.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, .02, 8), new THREE.Vector3(x, .02, -18)]), grid));
    }
    const desk = new THREE.MeshStandardMaterial({ color: "#243f4e", emissive: "#102c3d", emissiveIntensity: 1.1 });
    const paper = new THREE.MeshStandardMaterial({ color: "#e8e4d8", emissive: "#75838a", emissiveIntensity: .6 });
    this.accountantLayer.add(box([1.8, .75, .9], [3.1, .36, -10.2], desk));
    this.accountantLayer.add(box([.7, .04, .46], [3.1, .77, -10.2], paper));
  }

  private buildGuidanceMarker() {
    const material = new THREE.MeshBasicMaterial({ color: "#e1c47b", transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(.36, .48, 36), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .04;
    this.guidanceMarker.add(ring);
    this.guidanceMarker.visible = false;
  }

  setMemory(memory: MemoryId) {
    this.currentMemory = memory;
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.painterLayer.visible = memory === "painter";
    this.wifeLayer.visible = memory === "wife";
    this.gardenerLayer.visible = memory === "gardener";
    this.accountantLayer.visible = memory === "accountant";
    this.floatingProps.visible = memory === "painter";
    this.corridorWall.visible = false;
    this.scene.background = new THREE.Color(layer.visual.fog);
    this.scene.fog = new THREE.FogExp2(layer.visual.fog, memory === "gardener" ? .038 : .026);
    this.memoryLight.color.set(layer.visual.keyLight);
  }

  setPlayerDepth(z: number) {
    this.corridorWall.visible = this.currentMemory === "painter" && z < -7.05;
  }

  setGuidanceTarget(position?: THREE.Vector3) {
    this.guidanceMarker.visible = Boolean(position);
    if (position) this.guidanceMarker.position.set(position.x, 0, position.z);
  }

  setEvidenceFlags(flags: string[]) {
    this.lockTokens.forEach((token, flag) => { token.visible = flags.includes(flag); });
    this.gateOpen = flags.includes("front.trust.ranked");
  }

  availableInteractables(memory: MemoryId, earnedFlags: string[]) {
    return this.interactables.filter((item) => (!item.memoryIds || item.memoryIds.includes(memory))
      && (!item.requiresFlags || item.requiresFlags.every((flag) => earnedFlags.includes(flag)))
      && (!item.hidesAfterFlag || !earnedFlags.includes(item.hidesAfterFlag)));
  }

  constrain(position: THREE.Vector3, memory: MemoryId = this.currentMemory, previousZ = position.z) {
    position.x = THREE.MathUtils.clamp(position.x, -4.45, 4.45);
    position.z = THREE.MathUtils.clamp(position.z, -17.7, 8);
    if (memory === "painter" && previousZ < -7.05 && position.z >= -7.05) position.z = -7.08;
    position.y = 1.65;
    return position;
  }

  movementScale(position: THREE.Vector3, memory: MemoryId) {
    if (memory === "painter" && position.x > 2.3 && position.z < .5 && position.z > -4.8) return .78;
    if (position.z > 0) return .62;
    if (position.z < -8) return 1.28;
    return 1;
  }

  cameraLift(position: THREE.Vector3, memory: MemoryId) {
    if (memory !== "painter" || position.x <= 2.3 || position.z >= .5 || position.z <= -4.8) return 0;
    return .12 + Math.sin(this.elapsed * 1.7) * .075;
  }

  cameraRoll(position: THREE.Vector3, memory: MemoryId) {
    return this.cameraLift(position, memory) === 0 ? 0 : Math.sin(this.elapsed * 1.15) * .018;
  }

  update(delta: number, playerZ: number) {
    this.elapsed += delta;
    this.setPlayerDepth(playerZ);
    const slow = playerZ > 0 ? .16 : playerZ < -8 ? 3.1 : 1;
    this.clockHands.forEach((hand) => { hand.rotation.z -= delta * slow; });
    this.floatingProps.children.forEach((object, index) => {
      object.position.y += Math.sin(this.elapsed * 1.2 + index) * delta * .08;
      object.rotation.y += delta * (.12 + index * .015);
    });
    this.gateLeft.position.x = THREE.MathUtils.damp(this.gateLeft.position.x, this.gateOpen ? -2.35 : -1.05, 3.4, delta);
    this.gateRight.position.x = THREE.MathUtils.damp(this.gateRight.position.x, this.gateOpen ? 2.35 : 1.05, 3.4, delta);
    if (this.guidanceMarker.visible) {
      const pulse = 1 + Math.sin(this.elapsed * 3.2) * .1;
      this.guidanceMarker.scale.set(pulse, 1, pulse);
    }
  }

  dispose() { disposeObject(this.scene); }
}
