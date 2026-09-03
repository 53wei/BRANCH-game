/**
 * LEGACY CHAPTER-02 WHITEBOX ONLY.
 *
 * Formal NorthTowerRuntime uses TingYuXuanScene + Gameplay Map anchors and must not
 * import this carrier. Keep this file only for historical mechanics tests until the
 * migration tests are retired; never restore its Box/Cylinder/Capsule visuals to play.
 */
import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";

export type NorthTowerZone = "lower" | "upper";
export type NorthTowerInteractableId = "sixth-teacup" | "north-stairs" | "departure-record" | "artist-viewpoint" | "fifth-person-board";

export interface NorthTowerInteractable {
  id: NorthTowerInteractableId;
  label: string;
  position: THREE.Vector3;
  zones: NorthTowerZone[];
  memoryIds?: MemoryId[];
  requiresFlags?: string[];
  hidesAfterFlag?: string;
  requiresViewAlignment?: boolean;
}

const disposeObject = (object: THREE.Object3D) => {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.Line)) return;
    if ("geometry" in child && child.geometry) geometries.add(child.geometry);
    if ("material" in child) {
      const source = child.material;
      const childMaterials = Array.isArray(source) ? source : [source];
      childMaterials.forEach((material) => { if (material) materials.add(material); });
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
};

const box = (size: [number, number, number], position: [number, number, number], material: THREE.Material) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

/**
 * Chapter 02 V4.1 whitebox carrier.
 *
 * The architecture here is intentionally a gameplay skeleton, not final art. All chapter
 * logic is tied to stable ids/positions so the Blender integration can replace visible
 * geometry without rewriting evidence, gates, camera or save logic.
 */
export class NorthTowerScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, 0.05, 160);
  readonly interactables: NorthTowerInteractable[];
  readonly figurePosition = new THREE.Vector3(-10.8, 2.0, -18.2);

  private readonly wifeLayer = new THREE.Group();
  private readonly accountantLayer = new THREE.Group();
  private readonly painterLayer = new THREE.Group();
  private readonly rainFigure = new THREE.Group();
  private readonly guidanceMarker = new THREE.Group();
  private readonly memoryLight: THREE.PointLight;
  private readonly rain: THREE.Points;
  private elapsed = 0;
  private memory: MemoryId = "wife";
  private viewAligned = false;

  constructor(private readonly layers: MemoryLayer[], quality: "high" | "stable" | "low") {
    this.scene.name = "Chapter02EvidenceWhitebox";
    this.scene.background = new THREE.Color("#0d1417");
    this.scene.fog = new THREE.FogExp2("#0d1417", 0.024);
    this.camera.rotation.order = "YXZ";

    this.scene.add(new THREE.HemisphereLight("#9fb0ae", "#111412", 2.4));
    const moonLight = new THREE.DirectionalLight("#aabec2", quality === "low" ? 1.4 : 2.5);
    moonLight.position.set(8, 14, 8);
    moonLight.castShadow = quality !== "low";
    this.scene.add(moonLight);

    this.memoryLight = new THREE.PointLight("#caa16c", 16, 26, 1.5);
    this.memoryLight.position.set(0, 5.2, -8);
    this.scene.add(this.memoryLight);

    this.buildTower(quality);
    this.buildEvidencePlaceholders();
    this.buildMemoryLayers();
    this.buildRainFigure();
    this.buildGuidanceMarker();
    this.rain = this.buildRain(quality === "high" ? 1500 : quality === "stable" ? 760 : 360);
    this.scene.add(this.wifeLayer, this.accountantLayer, this.painterLayer, this.rainFigure, this.guidanceMarker, this.rain);

    this.interactables = [
      {
        id: "sixth-teacup",
        label: "[F] 检查第六只茶杯",
        position: new THREE.Vector3(2.2, 1.0, 4.4),
        zones: ["lower"],
        hidesAfterFlag: "north.evidence.sixth-cup",
      },
      {
        id: "north-stairs",
        label: "[F] 登上二层账房",
        position: new THREE.Vector3(0, 1.2, -1),
        zones: ["lower"],
        requiresFlags: ["north.evidence.sixth-cup"],
        hidesAfterFlag: "north.reached.upper-floor",
      },
      {
        id: "departure-record",
        label: "[F] 检查被改过的离家记录",
        position: new THREE.Vector3(0.8, 4.25, -13.4),
        zones: ["upper"],
        memoryIds: ["accountant"],
        requiresFlags: ["north.reached.upper-floor"],
        hidesAfterFlag: "north.evidence.departure-record",
      },
      {
        id: "artist-viewpoint",
        label: "[F] 固定框景中的雨夜人影",
        position: new THREE.Vector3(-3.25, 4.55, -11),
        zones: ["upper"],
        memoryIds: ["painter"],
        requiresFlags: ["north.evidence.departure-record"],
        hidesAfterFlag: "north.evidence.rain-figure",
        requiresViewAlignment: true,
      },
      {
        id: "fifth-person-board",
        label: "[F] 汇总三个独立证据通道",
        position: new THREE.Vector3(2.45, 4.25, -13.2),
        zones: ["upper"],
        requiresFlags: ["north.evidence.sixth-cup", "north.evidence.departure-record", "north.evidence.rain-figure"],
        hidesAfterFlag: "north.fifth-person.confirmed",
      },
    ];

    this.setMemory("wife");
    this.setViewDependentEvidence(false);
  }

  private buildTower(quality: "high" | "stable" | "low") {
    const plaster = new THREE.MeshStandardMaterial({ color: "#aaa89b", roughness: 0.94 });
    const wood = new THREE.MeshStandardMaterial({ color: "#30251e", roughness: 0.72 });
    const wetStone = new THREE.MeshStandardMaterial({ color: "#293333", roughness: 0.5 });

    this.scene.add(box([8.6, 0.24, 11], [0, -0.12, 3], wetStone));
    this.scene.add(box([8.6, 0.24, 12], [0, 3.08, -10.5], wood));
    this.scene.add(box([0.22, 3.1, 11], [-4.2, 1.5, 3], plaster));
    this.scene.add(box([0.22, 3.1, 11], [4.2, 1.5, 3], plaster));
    this.scene.add(box([0.22, 3.1, 12], [-4.2, 4.55, -10.5], plaster));
    this.scene.add(box([0.22, 3.1, 12], [4.2, 4.55, -10.5], plaster));

    for (let step = 0; step < 9; step += 1) {
      this.scene.add(box([3.0, 0.22, 0.62], [0, 0.08 + step * 0.34, -2.1 - step * 0.57], wood));
    }

    for (const z of [6.5, 3.0, -6.5, -10.5, -14.2]) {
      for (const x of [-3.55, 3.55]) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 2.9, quality === "low" ? 8 : 14), wood);
        pillar.position.set(x, z > 0 ? 1.42 : 4.48, z);
        pillar.castShadow = quality !== "low";
        this.scene.add(pillar);
      }
    }

    const lowerTable = box([2.5, 0.18, 1.2], [2.0, 0.72, 4.5], wood);
    this.scene.add(lowerTable);
    const upperDesk = box([3.0, 0.78, 1.35], [1.0, 3.55, -13.4], wood);
    this.scene.add(upperDesk);

    const frameMat = new THREE.MeshStandardMaterial({ color: "#38312a", roughness: 0.78 });
    this.scene.add(box([0.18, 2.55, 0.2], [-3.95, 4.55, -11], frameMat));
    this.scene.add(box([0.18, 2.55, 0.2], [-2.55, 4.55, -11], frameMat));
    this.scene.add(box([1.55, 0.18, 0.2], [-3.25, 5.75, -11], frameMat));
    this.scene.add(box([1.55, 0.18, 0.2], [-3.25, 3.35, -11], frameMat));
  }

  private buildEvidencePlaceholders() {
    const porcelain = new THREE.MeshStandardMaterial({ color: "#d0cabc", roughness: 0.5 });
    const wet = new THREE.MeshStandardMaterial({ color: "#785f46", roughness: 0.28 });
    for (let index = 0; index < 6; index += 1) {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.18, 16, 1, true), porcelain);
      cup.position.set(1.25 + (index % 3) * 0.42, 0.93, 4.25 + Math.floor(index / 3) * 0.38);
      this.scene.add(cup);
      if (index === 5) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.012, 8, 24), wet);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(cup.position.x, 0.835, cup.position.z);
        this.scene.add(ring);
      }
    }

    const paper = new THREE.MeshStandardMaterial({ color: "#c8c0aa", roughness: 0.88 });
    const ink = new THREE.LineBasicMaterial({ color: "#3f3730" });
    const record = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.85), paper);
    record.rotation.x = -Math.PI / 2;
    record.position.set(0.8, 3.97, -13.4);
    this.scene.add(record);
    for (let row = 0; row < 4; row += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0.3, 3.99, -13.65 + row * 0.16),
        new THREE.Vector3(1.25 - row * 0.08, 3.99, -13.65 + row * 0.16),
      ]);
      this.scene.add(new THREE.Line(geometry, ink));
    }

    const boardMat = new THREE.MeshStandardMaterial({ color: "#44382a", roughness: 0.82 });
    const board = box([1.25, 0.75, 0.08], [2.45, 4.45, -13.0], boardMat);
    board.rotation.x = -0.12;
    this.scene.add(board);
  }

  private buildMemoryLayers() {
    const wifeMaterial = new THREE.MeshBasicMaterial({ color: "#c89d67", transparent: true, opacity: 0.16 });
    const domesticHalo = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.58, 32), wifeMaterial);
    domesticHalo.rotation.x = -Math.PI / 2;
    domesticHalo.position.set(2.2, 0.84, 4.4);
    this.wifeLayer.add(domesticHalo);

    const gridMaterial = new THREE.LineBasicMaterial({ color: "#7fa3b7", transparent: true, opacity: 0.22 });
    for (let x = -3; x <= 3; x += 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 3.2, -16), new THREE.Vector3(x, 3.2, -5)]);
      this.accountantLayer.add(new THREE.Line(geometry, gridMaterial));
    }

    const frameMaterial = new THREE.LineBasicMaterial({ color: "#aaa497", transparent: true, opacity: 0.34 });
    const frameGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.92, 3.35, -10.88),
      new THREE.Vector3(-3.92, 5.75, -10.88),
      new THREE.Vector3(-2.58, 5.75, -10.88),
      new THREE.Vector3(-2.58, 3.35, -10.88),
      new THREE.Vector3(-3.92, 3.35, -10.88),
    ]);
    this.painterLayer.add(new THREE.Line(frameGeometry, frameMaterial));
  }

  private buildRainFigure() {
    const silhouette = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.23, 1.15, 6, 12),
      new THREE.MeshBasicMaterial({ color: "#15191a", transparent: true, opacity: 0.58, depthWrite: false }),
    );
    silhouette.position.copy(this.figurePosition);
    silhouette.position.y += 0.85;
    this.rainFigure.add(silhouette);
    this.rainFigure.visible = false;
  }

  private buildGuidanceMarker() {
    const material = new THREE.MeshBasicMaterial({ color: "#bda46e", transparent: true, opacity: 0.82, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.43, 36), material);
    ring.rotation.x = -Math.PI / 2;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.09, 1.1, 12, 1, true), new THREE.MeshBasicMaterial({ color: "#bda46e", transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false }));
    beam.position.y = 0.58;
    this.guidanceMarker.add(ring, beam);
    this.guidanceMarker.visible = false;
  }

  private buildRain(count: number) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -15 + Math.random() * 25;
      positions[index * 3 + 1] = Math.random() * 9;
      positions[index * 3 + 2] = -22 + Math.random() * 34;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#94a7ac", size: 0.03, transparent: true, opacity: 0.32, depthWrite: false }));
  }

  setMemory(memory: MemoryId) {
    this.memory = memory;
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.wifeLayer.visible = memory === "wife";
    this.accountantLayer.visible = memory === "accountant";
    this.painterLayer.visible = memory === "painter";
    this.scene.background = new THREE.Color(layer?.visual.fog ?? "#0d1417");
    this.scene.fog = new THREE.FogExp2(layer?.visual.fog ?? "#0d1417", memory === "painter" ? 0.03 : 0.024);
    this.memoryLight.color.set(layer?.visual.keyLight ?? "#bda46e");
    this.memoryLight.intensity = memory === "wife" ? 18 : memory === "accountant" ? 13 : 10;
    this.rainFigure.visible = memory === "painter" && this.viewAligned;
  }

  setViewDependentEvidence(aligned: boolean) {
    this.viewAligned = aligned;
    this.rainFigure.visible = this.memory === "painter" && aligned;
  }

  setGuidanceTarget(position?: THREE.Vector3) {
    this.guidanceMarker.visible = Boolean(position);
    if (position) this.guidanceMarker.position.set(position.x, position.y > 3 ? 3.15 : 0.02, position.z);
  }

  availableInteractables(memory: MemoryId, zone: NorthTowerZone, earnedFlags: string[], viewAligned: boolean) {
    return this.interactables.filter((item) => item.zones.includes(zone)
      && (!item.memoryIds || item.memoryIds.includes(memory))
      && (!item.requiresFlags || item.requiresFlags.every((flag) => earnedFlags.includes(flag)))
      && (!item.hidesAfterFlag || !earnedFlags.includes(item.hidesAfterFlag))
      && (!item.requiresViewAlignment || viewAligned));
  }

  constrain(position: THREE.Vector3, zone: NorthTowerZone) {
    if (zone === "lower") {
      position.x = THREE.MathUtils.clamp(position.x, -3.55, 3.55);
      position.z = THREE.MathUtils.clamp(position.z, -1.5, 8);
      position.y = 1.65;
    } else {
      position.x = THREE.MathUtils.clamp(position.x, -3.45, 3.45);
      position.z = THREE.MathUtils.clamp(position.z, -15.5, -5);
      position.y = 4.72;
    }
    return position;
  }

  update(delta: number) {
    this.elapsed += delta;
    const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      let y = positions.getY(index) - delta * 7.1;
      if (y < 0) y = 7 + Math.random() * 2;
      positions.setY(index, y);
    }
    positions.needsUpdate = true;
    if (this.guidanceMarker.visible) {
      const pulse = 1 + Math.sin(this.elapsed * 3.0) * 0.08;
      this.guidanceMarker.scale.set(pulse, 1, pulse);
      this.guidanceMarker.rotation.y += delta * 0.3;
    }
  }

  dispose() {
    disposeObject(this.scene);
  }
}
