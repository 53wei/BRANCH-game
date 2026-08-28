import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";
import { RuntimeAssetLoader, type RuntimeAssetId } from "./RuntimeAssetLoader";
import { createUnifiedMaterials, hydrateUnifiedMaterials } from "./UnifiedMaterials";
import { resolveLayoutZonesForPoint, TINGYUXUAN_RUNTIME_ZONES, tingYuXuanFallbackPlacements, tingYuXuanLayout, type LayoutPlacement, type LayoutZone } from "./tingyuxuan-layout";

export interface SceneInteractable {
  id: string;
  label: string;
  position: THREE.Vector3;
  memoryIds: MemoryId[];
  kind: "contradiction" | "portal";
}

const placeObject = (object: THREE.Object3D, placement: LayoutPlacement) => {
  object.name = placement.id;
  object.position.set(...placement.position);
  object.rotation.y = placement.rotationY ?? 0;
  if (placement.scale) object.scale.set(...placement.scale);
  object.updateMatrixWorld(true);
  return object;
};

const disposeObject = (object: THREE.Object3D) => {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) return;
    geometries.add(child.geometry);
    const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
    childMaterials.forEach((material) => {
      materials.add(material);
      Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value); });
    });
  });
  textures.forEach((texture) => texture.dispose());
  materials.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
};

const mulberry32 = (seed: number) => () => {
  let value = seed += 0x6d2b79f5;
  value = Math.imul(value ^ value >>> 15, value | 1);
  value ^= value + Math.imul(value ^ value >>> 7, value | 61);
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};

export class TingYuXuanScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(64, 16 / 9, 0.05, 180);
  readonly gameplaySkeleton = new THREE.Group();
  readonly visualAssets = new THREE.Group();
  readonly proceduralDressing = new THREE.Group();
  readonly interactables: SceneInteractable[];
  private readonly wifeLayer = new THREE.Group();
  private readonly gardenerLayer = new THREE.Group();
  private readonly facelessOwner = new THREE.Group();
  private readonly guidanceMarker = new THREE.Group();
  private readonly waterRipples = new THREE.Group();
  private readonly moonGateMaterial: THREE.MeshStandardMaterial;
  private readonly waterMaterial: THREE.MeshPhysicalMaterial;
  private readonly memoryLight: THREE.PointLight;
  private readonly materials = createUnifiedMaterials();
  private rain: THREE.Points;
  private memory: MemoryId = "wife";
  private elapsed = 0;
  private readonly loadedDeferredPlacementIds = new Set<string>();
  private readonly pendingDeferredPlacementIds = new Set<string>();
  private materialHydrationPromise?: Promise<void>;
  private lastAreaSignature = "";

  private constructor(
    private readonly layers: MemoryLayer[],
    private readonly quality: "high" | "stable" | "low",
    private readonly assetLoader: RuntimeAssetLoader,
    private readonly fallbackEnabled: boolean,
  ) {
    this.scene.name = "TingYuXuanScene";
    this.gameplaySkeleton.name = "gameplaySkeleton";
    this.visualAssets.name = "visualAssets";
    this.proceduralDressing.name = "proceduralDressing";
    this.scene.add(this.gameplaySkeleton, this.visualAssets, this.proceduralDressing);
    this.scene.background = new THREE.Color("#07100f");
    this.scene.fog = new THREE.FogExp2("#10201e", 0.022);
    this.camera.rotation.order = "YXZ";

    this.scene.add(new THREE.HemisphereLight("#8ab0a4", "#101613", 1.8));
    const moonKey = new THREE.DirectionalLight("#b9d1c8", quality === "low" ? 1.8 : 3.2);
    moonKey.position.set(-12, 18, 16);
    moonKey.castShadow = quality !== "low";
    this.proceduralDressing.add(moonKey);
    const courtyardFill = new THREE.PointLight("#e3b66e", quality === "low" ? 7 : 13, 34, 1.4);
    courtyardFill.position.set(0, 5.8, 22);
    this.proceduralDressing.add(courtyardFill);
    this.memoryLight = new THREE.PointLight("#e2b677", 20, 28, 1.5);
    this.memoryLight.position.set(-4, 3.2, 8);
    this.memoryLight.castShadow = quality !== "low";
    this.scene.add(this.memoryLight);
    const moonLight = new THREE.PointLight("#d99b4c", quality === "low" ? 5 : 9, 13, 1.7);
    moonLight.position.set(2, 2.4, -18.5);
    this.proceduralDressing.add(moonLight);
    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color: "#0b302d",
      roughness: 0.12,
      metalness: 0.12,
      transmission: 0.08,
      transparent: true,
      opacity: 0.9,
    });

    this.buildDebugSkeleton();
    this.buildPreloadedArchitecture();
    if (fallbackEnabled) this.buildFallbackArchitecture();
    this.buildGroundAndWater();
    this.buildDressing();
    this.buildMemoryLayers();
    this.moonGateMaterial = new THREE.MeshStandardMaterial({
      name: "TYX_MAT_MoonGate_Memory",
      color: "#9d8a69",
      emissive: "#6d4b18",
      emissiveIntensity: 2.1,
      roughness: 0.48,
      metalness: 0.04,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    this.buildMoonGateMemoryFrame();
    this.buildFacelessOwner();
    this.buildGuidanceMarker();
    this.rain = this.buildRain(quality === "high" ? 2200 : quality === "stable" ? 1100 : 480);
    this.proceduralDressing.add(this.rain, this.wifeLayer, this.gardenerLayer, this.facelessOwner, this.guidanceMarker);
    this.facelessOwner.visible = false;
    this.guidanceMarker.visible = false;

    this.interactables = tingYuXuanLayout.interactables.map((item) => ({
      ...item,
      memoryIds: [...item.memoryIds],
      position: new THREE.Vector3(...item.position),
    }));
  }

  static async create(layers: MemoryLayer[], quality: "high" | "stable" | "low", renderer: THREE.WebGPURenderer) {
    const loader = await RuntimeAssetLoader.create(renderer);
    const fallbackEnabled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fallbackArchitecture") === "1";
    const primaryIds = [...new Set(tingYuXuanLayout.placements.filter((placement) => placement.load === "preload").map((placement) => placement.assetId))];
    await Promise.all(primaryIds.map((id) => loader.load(id)));
    if (fallbackEnabled) await loader.load("tyx-arch-greybox-fallback-a");
    return new TingYuXuanScene(layers, quality, loader, fallbackEnabled);
  }

  async loadDeferredAssets(zones: LayoutZone[]) {
    const allowedZones = new Set(zones);
    const placements = tingYuXuanLayout.placements.filter((placement) =>
      placement.load === "deferred"
      && allowedZones.has(placement.zone)
      && !this.loadedDeferredPlacementIds.has(placement.id)
      && !this.pendingDeferredPlacementIds.has(placement.id));

    if (placements.length === 0) return;
    if (!this.materialHydrationPromise) {
      this.materialHydrationPromise = hydrateUnifiedMaterials(this.materials, (url) => this.assetLoader.loadTexture(url));
    }

    placements.forEach((placement) => this.pendingDeferredPlacementIds.add(placement.id));
    const ids = [...new Set(placements.map((placement) => placement.assetId))] as RuntimeAssetId[];
    try {
      await Promise.all([
        ...ids.map((id) => this.assetLoader.load(id)),
        this.materialHydrationPromise,
      ]);
      placements.forEach((placement) => {
        const object = placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement);
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = this.quality === "high" && placement.zone !== "water-court";
          child.receiveShadow = this.quality !== "low";
        });
        this.visualAssets.add(object);
        this.loadedDeferredPlacementIds.add(placement.id);
      });
    } finally {
      placements.forEach((placement) => this.pendingDeferredPlacementIds.delete(placement.id));
    }
  }

  async ensureAreaAssets(point: { x: number; z: number }) {
    const allowed = new Set<LayoutZone>(TINGYUXUAN_RUNTIME_ZONES);
    const zones = resolveLayoutZonesForPoint(point).filter((zone) => allowed.has(zone));
    const signature = zones.slice().sort().join("|");
    if (signature === this.lastAreaSignature && zones.every((zone) =>
      tingYuXuanLayout.placements
        .filter((placement) => placement.load === "deferred" && placement.zone === zone)
        .every((placement) => this.loadedDeferredPlacementIds.has(placement.id)))) return;
    await this.loadDeferredAssets(zones);
    this.lastAreaSignature = signature;
  }

  private buildPreloadedArchitecture() {
    tingYuXuanLayout.placements.filter((placement) => placement.load === "preload").forEach((placement) => {
      const object = placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement);
      object.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow = this.quality === "high";
        child.receiveShadow = this.quality !== "low";
      });
      this.visualAssets.add(object);
    });
  }

  private buildFallbackArchitecture() {
    tingYuXuanFallbackPlacements.forEach((placement) => {
      this.gameplaySkeleton.add(placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement));
    });
  }

  private buildDebugSkeleton() {
    const debugEnabled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugLayout") === "1";
    const colliderMaterial = new THREE.MeshBasicMaterial({ color: "#36d684", wireframe: true, transparent: true, opacity: 0.35 });
    const triggerMaterial = new THREE.MeshBasicMaterial({ color: "#e8b84b", wireframe: true, transparent: true, opacity: 0.65 });
    tingYuXuanLayout.colliders.forEach((collider) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...collider.halfExtents.map((value) => value * 2) as [number, number, number]), colliderMaterial);
      mesh.name = `Collider_${collider.id}`;
      mesh.position.set(...collider.center);
      mesh.visible = debugEnabled;
      this.gameplaySkeleton.add(mesh);
    });
    tingYuXuanLayout.triggers.forEach((trigger) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...trigger.halfExtents.map((value) => value * 2) as [number, number, number]), triggerMaterial);
      mesh.name = `Trigger_${trigger.id}`;
      mesh.position.set(...trigger.center);
      mesh.visible = debugEnabled;
      this.gameplaySkeleton.add(mesh);
    });
    this.gameplaySkeleton.visible = debugEnabled || this.fallbackEnabled;
  }

  private buildGroundAndWater() {
    const ground = new THREE.Mesh(new THREE.BoxGeometry(46, 0.18, 78), this.materials["mud-wet"]);
    ground.position.set(2, -0.13, 3);
    ground.receiveShadow = true;
    this.proceduralDressing.add(ground);

    const makePath = (name: string, size: [number, number], position: [number, number]) => {
      const path = new THREE.Mesh(new THREE.BoxGeometry(size[0], 0.035, size[1]), this.materials["stone-wet"]);
      path.name = name;
      path.position.set(position[0], 0.005, position[1]);
      path.receiveShadow = true;
      this.proceduralDressing.add(path);
    };
    if (this.fallbackEnabled) {
      makePath("Path_Front", [4, 16], [0, 23]);
      makePath("Path_West_Court", [12, 7], [-6, 12]);
      makePath("Path_West_Run", [3.2, 16], [-8, 4]);
      makePath("Path_Cross_Run", [10, 3.2], [-3, -4]);
      makePath("Path_Loop_Run", [3.2, 17], [2, -13]);
    }

    const water = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.06, 13.8), this.waterMaterial);
    water.name = "WaterCourt_Pond";
    water.position.set(10, 0.05, -29);
    this.proceduralDressing.add(water);
    const pondFloor = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.12, 14.2), this.materials["stone-moss"]);
    pondFloor.position.set(10, -0.22, -29);
    this.proceduralDressing.add(pondFloor);

    const bankMaterial = this.materials["stone-wet"];
    const banks: Array<[string, [number, number, number], [number, number, number]]> = [
      ["PondBank_West", [4.55, 0.03, -29], [0.72, 0.22, 15.1]],
      ["PondBank_East", [15.45, 0.03, -29], [0.72, 0.22, 15.1]],
      ["PondBank_North", [10, 0.03, -21.55], [11.5, 0.22, 0.72]],
      ["PondBank_South", [10, 0.03, -36.45], [11.5, 0.22, 0.72]],
    ];
    banks.forEach(([name, position, size]) => {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(...size), bankMaterial);
      bank.name = name;
      bank.position.set(...position);
      bank.receiveShadow = true;
      this.proceduralDressing.add(bank);
    });

    const rippleMaterial = new THREE.MeshBasicMaterial({ color: "#8bb8ab", transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
    for (const [index, x, z, scale] of [[0, 7.2, -25.8, 1], [1, 11.2, -30.8, 1.35], [2, 13.7, -34, 0.85]] as const) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.39, 40), rippleMaterial.clone());
      ring.name = `WaterRipple_${index}`;
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.095, z);
      ring.scale.setScalar(scale);
      this.waterRipples.add(ring);
    }
    this.proceduralDressing.add(this.waterRipples);
  }

  private buildDressing() {
    const lanternMaterial = this.materials["wood-painted-old"];
    for (const [x, z] of [[0, 27], [0, 20], [-8, 10], [-8, 2], [2, -8], [2, -16]] as const) {
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.52, 12), lanternMaterial);
      lantern.position.set(x - 1.15, 2.45, z);
      this.proceduralDressing.add(lantern);
      const light = new THREE.PointLight("#d98a43", this.quality === "low" ? 3.5 : 7, 7, 1.9);
      light.position.set(x - 1.1, 2.25, z);
      this.proceduralDressing.add(light);
    }

    const addSlab = (name: string, x: number, z: number, sx = 1.35, sz = 0.78, rotation = 0) => {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.05, sz), this.materials["stone-wet"]);
      slab.name = name;
      slab.position.set(x, 0.035, z);
      slab.rotation.y = rotation;
      slab.receiveShadow = true;
      this.proceduralDressing.add(slab);
    };

    [
      [3.0, -22.6, -0.18], [4.2, -23.1, -0.26], [5.3, -23.8, -0.35],
      [6.25, -24.6, -0.28], [7.15, -25.25, -0.12],
    ].forEach(([x, z, rotation], index) => addSlab(`WaterApproach_${index}`, x, z, 1.45, 0.82, rotation));

    [
      [8.8, -20.2, 0.35], [10.1, -19.55, 0.45], [11.25, -18.75, 0.58],
      [12.25, -17.8, 0.68], [13.2, -16.8, 0.78],
    ].forEach(([x, z, rotation], index) => addSlab(`RockeryPath_${index}`, x, z, 1.25, 0.7, rotation));

    for (let index = 0; index < 5; index += 1) addSlab(`NorthCourt_${index}`, 10, 6.5 + index * 1.25, 2.1, 0.88, 0);
    for (let index = 0; index < 4; index += 1) addSlab(`InnerCourt_${index}`, -7.5 - index * 1.35, 18, 1.55, 0.84, Math.PI / 2);

    const pavilionGlow = new THREE.PointLight("#d7a65c", this.quality === "low" ? 4 : 8, 18, 1.7);
    pavilionGlow.position.set(10, 3.2, -31.5);
    this.proceduralDressing.add(pavilionGlow);
    const waterFill = new THREE.PointLight("#4d8179", this.quality === "low" ? 2.5 : 5, 16, 1.8);
    waterFill.position.set(9.5, 1.2, -27.5);
    this.proceduralDressing.add(waterFill);

  }

  private buildMemoryLayers() {
    const dryChannel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.055, 12), this.materials["stone-old"]);
    dryChannel.position.set(-8.95, 0.11, 5.5);
    this.wifeLayer.add(dryChannel);
    const nameSlip = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.025, 0.78), new THREE.MeshStandardMaterial({ color: "#b49d72", emissive: "#493413", emissiveIntensity: 1.1 }));
    nameSlip.position.set(-8.92, 0.16, 6.1);
    this.wifeLayer.add(nameSlip);

    const waterline = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.045, 13), new THREE.MeshStandardMaterial({ color: "#0c413b", emissive: "#082820", emissiveIntensity: 1.6, roughness: 0.08, metalness: 0.25 }));
    waterline.position.set(-8.95, 0.13, 5.4);
    this.gardenerLayer.add(waterline);
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: "#6fb49b", emissive: "#2c725d", emissiveIntensity: 2.5 });
    for (let z = 10; z >= 1; z -= 2.5) {
      const marker = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.45, 5), arrowMaterial);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(-8.94, 0.22, z);
      this.gardenerLayer.add(marker);
    }
    for (let repeat = 0; repeat < 3; repeat += 1) {
      const glyph = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.27, 24), new THREE.MeshBasicMaterial({ color: "#729a83", transparent: true, opacity: 0.72, side: THREE.DoubleSide }));
      glyph.position.set(3.72, 1.35, -11.8 - repeat * 2.1);
      glyph.rotation.y = -Math.PI / 2;
      this.gardenerLayer.add(glyph);
    }
  }

  private buildMoonGateMemoryFrame() {
    // Memory-only highlight: the real Courtyard Park geometry remains the architectural gate.
    const gate = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.045, 12, 56), this.moonGateMaterial);
    gate.name = "wife-moon-gate-memory-frame";
    gate.position.set(2, 1.45, -20.76);
    this.wifeLayer.add(gate);
    const darkness = new THREE.Mesh(new THREE.CircleGeometry(1.13, 48), new THREE.MeshBasicMaterial({ color: "#020504", transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    darkness.position.set(2, 1.45, -20.72);
    this.gardenerLayer.add(darkness);
  }

  private buildGuidanceMarker() {
    const material = new THREE.MeshBasicMaterial({ color: "#dfbd70", transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false });
    const outer = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.49, 40), material);
    outer.rotation.x = -Math.PI / 2;
    outer.position.y = 0.04;
    const inner = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.2, 32), material.clone());
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.055;
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.12, 1.55, 16, 1, true), new THREE.MeshBasicMaterial({ color: "#e4c67e", transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.y = 0.78;
    this.guidanceMarker.add(outer, inner, beam);
  }

  private buildFacelessOwner() {
    const robe = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 1.05, 6, 14), new THREE.MeshStandardMaterial({ color: "#070807", roughness: 0.92 }));
    robe.position.y = 0.85;
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 18, 12), new THREE.MeshStandardMaterial({ color: "#d0c9ae", roughness: 0.55, emissive: "#332d23", emissiveIntensity: 0.4 }));
    face.scale.set(0.75, 1, 0.55);
    face.position.y = 1.75;
    this.facelessOwner.add(robe, face);
  }

  private buildRain(count: number) {
    const random = mulberry32(0x7159a11);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -18 + random() * 40;
      positions[index * 3 + 1] = random() * 8;
      positions[index * 3 + 2] = 34 - random() * 74;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#9bb8b7", size: 0.035, transparent: true, opacity: 0.46, depthWrite: false }));
  }

  setMemory(memory: MemoryId) {
    this.memory = memory;
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.wifeLayer.visible = memory === "wife";
    this.gardenerLayer.visible = memory === "gardener";
    this.scene.background = new THREE.Color(layer.visual.fog);
    this.scene.fog = new THREE.FogExp2(layer.visual.fog, memory === "gardener" ? 0.038 : 0.022);
    this.memoryLight.color.set(layer.visual.keyLight);
    this.memoryLight.intensity = memory === "gardener" ? 14 : 20;
    this.waterMaterial.color.set(memory === "gardener" ? "#0b453c" : "#0b302d");
    this.waterMaterial.roughness = memory === "gardener" ? 0.08 : 0.16;
    this.moonGateMaterial.emissive.set(memory === "wife" ? "#72501e" : "#07100b");
  }

  setOwnerVisible(visible: boolean, position?: THREE.Vector3) {
    this.facelessOwner.visible = visible;
    if (position) this.facelessOwner.position.copy(position);
  }

  setGuidanceTarget(position?: THREE.Vector3) {
    this.guidanceMarker.visible = Boolean(position);
    if (position) this.guidanceMarker.position.set(position.x, 0, position.z);
  }

  update(delta: number, player: THREE.Vector3, chasing: boolean) {
    this.elapsed += delta;
    const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let index = 0; index < positions.count; index += 1) {
      let y = positions.getY(index) - delta * 8;
      if (y < 0) y = 5.5 + (index % 31) / 15;
      positions.setY(index, y);
    }
    positions.needsUpdate = true;
    if (this.guidanceMarker.visible) {
      const pulse = 1 + Math.sin(this.elapsed * 3.2) * 0.08;
      this.guidanceMarker.scale.set(pulse, 1, pulse);
      this.guidanceMarker.rotation.y = this.elapsed * 0.35;
    }
    this.waterMaterial.opacity = 0.865 + Math.sin(this.elapsed * 0.55) * 0.025;
    this.waterRipples.children.forEach((child, index) => {
      const phase = (this.elapsed * 0.34 + index * 0.8) % 2.4;
      const scale = 0.8 + phase * 0.55;
      child.scale.setScalar(scale);
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity = Math.max(0, 0.18 * (1 - phase / 2.4));
    });
    if (chasing) {
      this.facelessOwner.visible = true;
      const direction = player.clone().setY(0).sub(this.facelessOwner.position);
      const distance = direction.length();
      if (distance > 0.01) this.facelessOwner.position.add(direction.normalize().multiplyScalar(delta * 2.35));
      this.facelessOwner.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  ownerDistance(player: THREE.Vector3) { return this.facelessOwner.position.distanceTo(player); }
  activeMemory() { return this.memory; }
  visibleModelNames() { return this.visualAssets.children.map((child) => child.name); }
  loadedAssetIds() { return this.assetLoader.loadedAssetIds(); }
  loadedAssetBytes() { return this.assetLoader.loadedByteEstimate(); }

  dispose() {
    this.assetLoader.dispose();
    disposeObject(this.scene);
  }
}
