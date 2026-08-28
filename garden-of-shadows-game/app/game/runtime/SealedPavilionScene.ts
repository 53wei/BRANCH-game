import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";

export type PavilionInteractableId =
  | "sealed-door"
  | "wife-entry"
  | "gardener-entry"
  | "accountant-entry"
  | "painter-entry"
  | "memory-threshold"
  | "body-scene"
  | "inner-bolt"
  | "drain-channel"
  | "paint-residue"
  | "final-reconstruction";

export interface PavilionInteractable {
  id: PavilionInteractableId;
  label: string;
  position: THREE.Vector3;
  memoryIds?: MemoryId[];
  requiresFlags?: string[];
  hidesAfterFlag?: string;
}

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
};

const box = (size: [number, number, number], position: [number, number, number], material: THREE.Material) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const bodyFigure = (material: THREE.Material, seated: boolean) => {
  const group = new THREE.Group();
  const torso = box([.62, 1.05, .38], [0, seated ? .95 : .34, 0], material);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.25, 14, 10), material);
  head.position.set(0, seated ? 1.68 : .4, seated ? 0 : -.55);
  group.add(torso, head);
  if (seated) {
    group.add(box([.18, .82, .18], [-.22, .35, .16], material), box([.18, .82, .18], [.22, .35, .16], material));
  } else {
    group.rotation.x = Math.PI / 2;
    group.rotation.z = -.18;
  }
  return group;
};

export class SealedPavilionScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, .05, 140);
  readonly interactables: PavilionInteractable[];

  private readonly memoryLight: THREE.PointLight;
  private readonly wifeLayer = new THREE.Group();
  private readonly gardenerLayer = new THREE.Group();
  private readonly accountantLayer = new THREE.Group();
  private readonly painterLayer = new THREE.Group();
  private readonly interiorGroup = new THREE.Group();
  private readonly guidanceMarker = new THREE.Group();
  private readonly rain: THREE.Points;
  private readonly water: THREE.Mesh;
  private readonly doors = new THREE.Group();
  private currentMemory: MemoryId = "wife";
  private backlash = 0;
  private elapsed = 0;

  constructor(private readonly layers: MemoryLayer[], quality: "high" | "stable" | "low") {
    this.scene.background = new THREE.Color("#071314");
    this.scene.fog = new THREE.FogExp2("#071314", .025);
    this.camera.rotation.order = "YXZ";

    this.scene.add(new THREE.HemisphereLight("#9bb7b5", "#0a1110", 2.8));
    const moon = new THREE.DirectionalLight("#8eb2bd", 2.3);
    moon.position.set(8, 12, 6);
    moon.castShadow = quality !== "low";
    this.scene.add(moon);
    this.memoryLight = new THREE.PointLight("#d8a06b", 30, 30, 1.45);
    this.memoryLight.position.set(0, 4.4, -9);
    this.memoryLight.castShadow = quality !== "low";
    this.scene.add(this.memoryLight);

    this.water = this.buildBase(quality);
    this.buildPavilion(quality);
    this.buildMemoryLayers(quality);
    this.buildGuidanceMarker();
    this.rain = this.buildRain(quality === "high" ? 1500 : quality === "stable" ? 760 : 340);
    this.scene.add(this.interiorGroup, this.wifeLayer, this.gardenerLayer, this.accountantLayer, this.painterLayer, this.guidanceMarker, this.rain);

    this.interactables = [
      { id: "sealed-door", label: "按 F 检查反锁的水榭正门", position: new THREE.Vector3(0, 1.2, -4), hidesAfterFlag: "pavilion.door.confirmed" },
      { id: "wife-entry", label: "按 F 核对夫人记忆中的后门", position: new THREE.Vector3(-4.5, 1.2, -4.8), memoryIds: ["wife"], requiresFlags: ["pavilion.door.confirmed"], hidesAfterFlag: "pavilion.route.wife" },
      { id: "gardener-entry", label: "按 F 核对园丁记忆中的屋顶缺口", position: new THREE.Vector3(-2.1, 1.2, -5.1), memoryIds: ["gardener"], requiresFlags: ["pavilion.door.confirmed"], hidesAfterFlag: "pavilion.route.gardener" },
      { id: "accountant-entry", label: "按 F 核对账房记忆中的地板密道", position: new THREE.Vector3(2.1, 1.2, -3.8), memoryIds: ["accountant"], requiresFlags: ["pavilion.door.confirmed"], hidesAfterFlag: "pavilion.route.accountant" },
      { id: "painter-entry", label: "按 F 核对柳生记忆中的破窗", position: new THREE.Vector3(4.5, 1.2, -4.8), memoryIds: ["painter"], requiresFlags: ["pavilion.door.confirmed"], hidesAfterFlag: "pavilion.route.painter" },
      { id: "memory-threshold", label: "按 F 穿过证词之间的记忆裂隙", position: new THREE.Vector3(0, 1.2, -5.4), requiresFlags: ["pavilion.routes.ready"], hidesAfterFlag: "pavilion.entered" },
      { id: "body-scene", label: "按 F 勘验当前证词中的园主", position: new THREE.Vector3(0, 1.2, -10), requiresFlags: ["pavilion.entered"] },
      { id: "inner-bolt", label: "按 F 检查后门内侧锁舌", position: new THREE.Vector3(-3.2, 1.2, -7.7), memoryIds: ["wife"], requiresFlags: ["pavilion.body.all"], hidesAfterFlag: "pavilion.evidence.inner-bolt" },
      { id: "drain-channel", label: "按 F 检查向室内爬升的苔线", position: new THREE.Vector3(-2.9, 1.2, -12), memoryIds: ["gardener"], requiresFlags: ["pavilion.evidence.inner-bolt"], hidesAfterFlag: "pavilion.evidence.reverse-water" },
      { id: "paint-residue", label: "按 F 检查屏画上的湿颜料残迹", position: new THREE.Vector3(3, 1.2, -11), memoryIds: ["painter"], requiresFlags: ["pavilion.evidence.reverse-water"], hidesAfterFlag: "pavilion.evidence.vanished-exit" },
      { id: "final-reconstruction", label: "按 F 排列水榭死亡因果链", position: new THREE.Vector3(0, 1.2, -15), requiresFlags: ["pavilion.evidence.inner-bolt", "pavilion.evidence.reverse-water", "pavilion.evidence.vanished-exit"] },
    ];

    this.setMemory("wife");
    this.setEvidenceFlags([]);
  }

  private buildBase(quality: "high" | "stable" | "low") {
    const waterMat = new THREE.MeshStandardMaterial({ color: "#123235", emissive: "#071d20", emissiveIntensity: .7, roughness: .18, metalness: .28, transparent: true, opacity: .9 });
    const water = box([28, .18, 32], [0, -.3, -6], waterMat);
    this.scene.add(water);
    const stone = new THREE.MeshStandardMaterial({ color: "#3a4743", roughness: .76 });
    this.scene.add(box([3.2, .22, 11], [0, -.06, 3], stone));
    for (let index = 0; index < 8; index += 1) {
      const slab = box([1.55, .12, 1.1], [0, .04, 7 - index * 1.45], stone);
      slab.rotation.y = (index % 2 ? 1 : -1) * .025;
      this.scene.add(slab);
    }
    if (quality !== "low") {
      for (const x of [-7.2, 7.2]) {
        for (let index = 0; index < 7; index += 1) {
          const reed = new THREE.Mesh(new THREE.CylinderGeometry(.025, .04, 1.4 + index % 3 * .25, 7), new THREE.MeshStandardMaterial({ color: "#385b48", roughness: .9 }));
          reed.position.set(x + Math.sin(index) * .6, .45, 4 - index * 2.6);
          reed.rotation.z = Math.sin(index * 1.7) * .1;
          this.scene.add(reed);
        }
      }
    }
    return water;
  }

  private buildPavilion(quality: "high" | "stable" | "low") {
    const wood = new THREE.MeshStandardMaterial({ color: "#321b17", roughness: .58 });
    const plaster = new THREE.MeshStandardMaterial({ color: "#a9a99a", roughness: .9 });
    const floor = new THREE.MeshStandardMaterial({ color: "#273431", roughness: .42, metalness: .1 });
    const roof = new THREE.MeshStandardMaterial({ color: "#14211e", roughness: .72 });
    this.scene.add(box([12, .24, 12], [0, -.08, -10.5], floor));
    this.scene.add(box([12.8, .32, 13], [0, 3.3, -10.5], roof));
    this.scene.add(box([.24, 3.1, 12], [-5.9, 1.52, -10.5], plaster), box([.24, 3.1, 12], [5.9, 1.52, -10.5], plaster));
    this.scene.add(box([12, 3.1, .24], [0, 1.52, -16.4], plaster));
    for (const x of [-5.35, -3.2, 3.2, 5.35]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.16, .21, 3.1, quality === "low" ? 8 : 14), wood);
      pillar.position.set(x, 1.48, -5.2);
      pillar.castShadow = quality !== "low";
      this.scene.add(pillar);
    }
    for (const z of [-6.2, -10.2, -14.2]) {
      for (const x of [-5.55, 5.55]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(.15, .2, 3.1, quality === "low" ? 8 : 14), wood);
        pillar.position.set(x, 1.48, z);
        this.scene.add(pillar);
      }
    }
    const doorMat = new THREE.MeshStandardMaterial({ color: "#281512", emissive: "#2b120c", emissiveIntensity: .3, roughness: .55 });
    const leftDoor = box([2.2, 2.7, .22], [-1.12, 1.35, -4.62], doorMat);
    const rightDoor = box([2.2, 2.7, .22], [1.12, 1.35, -4.62], doorMat);
    this.doors.add(leftDoor, rightDoor);
    this.scene.add(this.doors);
    this.interiorGroup.visible = false;
  }

  private buildMemoryLayers(quality: "high" | "stable" | "low") {
    const wifeGold = new THREE.MeshStandardMaterial({ color: "#8c5b43", emissive: "#6b2f22", emissiveIntensity: 1.25, roughness: .55 });
    const chair = new THREE.Group();
    chair.add(box([1.4, .18, 1.1], [0, .52, 0], wifeGold), box([1.4, 1.4, .18], [0, 1.2, .48], wifeGold));
    chair.position.set(0, 0, -10);
    const wifeBody = bodyFigure(new THREE.MeshStandardMaterial({ color: "#725d55", roughness: .8 }), true);
    wifeBody.position.set(0, 0, -10);
    this.wifeLayer.add(chair, wifeBody, box([1.6, 2.5, .14], [-5.75, 1.25, -7.7], wifeGold));

    const mud = new THREE.MeshStandardMaterial({ color: "#354238", roughness: .98 });
    for (let index = 0; index < 11; index += 1) {
      const patch = new THREE.Mesh(new THREE.CircleGeometry(.35 + index % 3 * .12, 14), mud);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(-3.5 + index * .65, .035, -8.4 - Math.sin(index * 1.3) * 2.6);
      this.gardenerLayer.add(patch);
    }
    const gardenerBody = bodyFigure(new THREE.MeshStandardMaterial({ color: "#4f5650", roughness: .9 }), false);
    gardenerBody.position.set(.3, .36, -10);
    this.gardenerLayer.add(gardenerBody);
    const roofHole = new THREE.Mesh(new THREE.RingGeometry(.65, 1.15, 18), new THREE.MeshBasicMaterial({ color: "#80a593", side: THREE.DoubleSide, transparent: true, opacity: .5 }));
    roofHole.rotation.x = Math.PI / 2;
    roofHole.position.set(-2.1, 3.12, -5.4);
    this.gardenerLayer.add(roofHole);

    const gridMaterial = new THREE.LineBasicMaterial({ color: "#4c88a8", transparent: true, opacity: .42 });
    for (let x = -5; x <= 5; x += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, .03, -16), new THREE.Vector3(x, .03, -5)]);
      this.accountantLayer.add(new THREE.Line(geometry, gridMaterial));
    }
    for (let z = -16; z <= -5; z += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5, .03, z), new THREE.Vector3(5, .03, z)]);
      this.accountantLayer.add(new THREE.Line(geometry, gridMaterial));
    }
    const emptyOutline = new THREE.Mesh(new THREE.RingGeometry(.72, .79, 36), new THREE.MeshBasicMaterial({ color: "#75a8c1", transparent: true, opacity: .62, side: THREE.DoubleSide }));
    emptyOutline.rotation.x = -Math.PI / 2;
    emptyOutline.scale.set(1.7, .65, 1);
    emptyOutline.position.set(0, .045, -10);
    this.accountantLayer.add(emptyOutline, box([1.4, .12, 1.7], [2.1, .05, -3.8], new THREE.MeshStandardMaterial({ color: "#24485a", emissive: "#153447", emissiveIntensity: 1.2 })));

    const paintMat = new THREE.MeshStandardMaterial({ color: "#6a3f71", emissive: "#3d1f49", emissiveIntensity: 1.1, roughness: .45 });
    for (const position of [[-3.8, 1.2, -9], [3.8, 1.2, -10.5], [1.5, 1.2, -13]] as const) {
      const easel = new THREE.Group();
      easel.add(box([1.6, 1.9, .12], [0, .8, 0], paintMat), box([.12, 2.2, .12], [-.55, 0, .2], paintMat), box([.12, 2.2, .12], [.55, 0, .2], paintMat));
      easel.position.set(position[0], position[1], position[2]);
      this.painterLayer.add(easel);
    }
    const painterBody = bodyFigure(new THREE.MeshStandardMaterial({ color: "#5b505d", roughness: .8 }), false);
    painterBody.position.set(-.2, .36, -10);
    this.painterLayer.add(painterBody);
    const brokenWindow = new THREE.Mesh(new THREE.RingGeometry(.75, 1.15, 6), new THREE.MeshBasicMaterial({ color: "#d08c9a", transparent: true, opacity: .5, side: THREE.DoubleSide }));
    brokenWindow.position.set(5.78, 1.45, -8.2);
    brokenWindow.rotation.y = Math.PI / 2;
    this.painterLayer.add(brokenWindow);

    if (quality !== "low") {
      for (const layer of [this.wifeLayer, this.gardenerLayer, this.accountantLayer, this.painterLayer]) {
        layer.traverse((object) => { if (object instanceof THREE.Mesh) object.castShadow = true; });
      }
    }
  }

  private buildGuidanceMarker() {
    const material = new THREE.MeshBasicMaterial({ color: "#e2c36f", transparent: true, opacity: .92, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(.38, .52, 40), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .05;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.025, .13, 1.5, 14, 1, true), new THREE.MeshBasicMaterial({ color: "#e2c36f", transparent: true, opacity: .14, side: THREE.DoubleSide, depthWrite: false }));
    beam.position.y = .75;
    this.guidanceMarker.add(ring, beam);
    this.guidanceMarker.visible = false;
  }

  private buildRain(count: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -14 + Math.random() * 28;
      positions[index * 3 + 1] = Math.random() * 8;
      positions[index * 3 + 2] = -19 + Math.random() * 30;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#8caeb3", size: .03, transparent: true, opacity: .42, depthWrite: false }));
  }

  setMemory(memory: MemoryId) {
    this.currentMemory = memory;
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.wifeLayer.visible = memory === "wife" && this.interiorGroup.visible;
    this.gardenerLayer.visible = memory === "gardener" && this.interiorGroup.visible;
    this.accountantLayer.visible = memory === "accountant" && this.interiorGroup.visible;
    this.painterLayer.visible = memory === "painter" && this.interiorGroup.visible;
    this.scene.background = new THREE.Color(layer.visual.fog);
    this.scene.fog = new THREE.FogExp2(layer.visual.fog, .026 + this.backlash * .006);
    this.memoryLight.color.set(layer.visual.keyLight);
    this.memoryLight.intensity = memory === "wife" ? 30 : memory === "accountant" ? 23 : 19;
  }

  setEvidenceFlags(flags: string[]) {
    const entered = flags.includes("pavilion.entered");
    this.interiorGroup.visible = entered;
    this.wifeLayer.visible = entered && this.currentMemory === "wife";
    this.gardenerLayer.visible = entered && this.currentMemory === "gardener";
    this.accountantLayer.visible = entered && this.currentMemory === "accountant";
    this.painterLayer.visible = entered && this.currentMemory === "painter";
    const targetX = entered ? 2.5 : 1.12;
    const [left, right] = this.doors.children;
    if (left) left.position.x = -targetX;
    if (right) right.position.x = targetX;
    this.backlash = ["pavilion.body.wife", "pavilion.body.gardener", "pavilion.body.accountant", "pavilion.body.painter"].filter((flag) => flags.includes(flag)).length;
  }

  availableInteractables(memory: MemoryId, flags: string[]) {
    return this.interactables.filter((item) => (!item.memoryIds || item.memoryIds.includes(memory))
      && (!item.requiresFlags || item.requiresFlags.every((flag) => flags.includes(flag)))
      && (!item.hidesAfterFlag || !flags.includes(item.hidesAfterFlag))
      && (item.id !== "body-scene" || !flags.includes(`pavilion.body.${memory}`)));
  }

  setGuidanceTarget(position?: THREE.Vector3) {
    this.guidanceMarker.visible = Boolean(position);
    if (position) this.guidanceMarker.position.set(position.x, .02, position.z);
  }

  constrain(position: THREE.Vector3, flags: string[]) {
    position.x = THREE.MathUtils.clamp(position.x, -5.25, 5.25);
    position.z = THREE.MathUtils.clamp(position.z, flags.includes("pavilion.entered") ? -16 : -5.35, 8);
    position.y = 1.65;
    return position;
  }

  cameraRoll() {
    return this.backlash > 0 ? Math.sin(this.elapsed * (1.2 + this.backlash * .25)) * this.backlash * .006 : 0;
  }

  update(delta: number) {
    this.elapsed += delta;
    this.water.position.y = -.3 + Math.sin(this.elapsed * .65) * .025;
    const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      let y = positions.getY(index) - delta * (6.8 + this.backlash * .7);
      if (y < 0) y = 6 + Math.random() * 2;
      positions.setY(index, y);
    }
    positions.needsUpdate = true;
    if (this.guidanceMarker.visible) {
      const pulse = 1 + Math.sin(this.elapsed * 3.4) * .1;
      this.guidanceMarker.scale.set(pulse, 1, pulse);
      this.guidanceMarker.rotation.y += delta * .4;
    }
    const rotation = this.backlash * .0025 * Math.sin(this.elapsed * .7);
    this.interiorGroup.rotation.z = rotation;
  }

  dispose() { disposeObject(this.scene); }
}
