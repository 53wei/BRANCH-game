import * as THREE from "three/webgpu";
import type { MemoryId, MemoryLayer } from "../types";
import { RuntimeAssetLoader, type RuntimeAssetId } from "./RuntimeAssetLoader";
import { PLAYER_BODY_CALIBRATION } from "./player-calibration";
import { createUnifiedMaterials, hydrateUnifiedMaterials } from "./UnifiedMaterials";
import { getGameplayAnchor, resolveGameplayRegionForPoint, TINGYUXUAN_MAIN_GATE_AUDIT, tingYuXuanGameplayRegions, tingYuXuanGroundPatches, tingYuXuanRouteAnchors } from "./tingyuxuan-gameplay-map";
import { placementLoadsInZones, resolveLayoutZonesForPoint, TINGYUXUAN_RUNTIME_ZONES, tingYuXuanFallbackPlacements, tingYuXuanLayout, tingYuXuanLegacyPlacements, type LayoutCollider, type LayoutPlacement, type LayoutZone } from "./tingyuxuan-layout";
import { extractArchitectureCollisionCoverage, type ArchitectureCollisionExtraction } from "./architecture-collision";
import { extractMasterSpecialStructureCollision, type SpecialStructureCollisionExtraction } from "./special-structure-collision";

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

const createSoftGuidanceTexture = () => {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x + 0.5) / size * 2 - 1;
      const ny = (y + 0.5) / size * 2 - 1;
      const radius = Math.hypot(nx, ny);
      const ring = Math.max(0, 1 - Math.abs(radius - 0.52) / 0.34);
      const falloff = Math.max(0, 1 - radius);
      const alpha = Math.round(255 * Math.min(0.42, ring * falloff * 0.58));
      const offset = (y * size + x) * 4;
      pixels[offset] = 224;
      pixels[offset + 1] = 196;
      pixels[offset + 2] = 126;
      pixels[offset + 3] = alpha;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  return texture;
};

export class TingYuXuanScene {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(PLAYER_BODY_CALIBRATION.explorationFov, 16 / 9, PLAYER_BODY_CALIBRATION.cameraNear, 180);
  readonly gameplaySkeleton = new THREE.Group();
  readonly visualAssets = new THREE.Group();
  readonly proceduralDressing = new THREE.Group();
  readonly interactables: SceneInteractable[];
  private readonly wifeLayer = new THREE.Group();
  private readonly gardenerLayer = new THREE.Group();
  private readonly facelessOwner = new THREE.Group();
  private readonly guidanceMarker = new THREE.Group();
  private guidanceStyle: "standard" | "subtle" = "standard";
  private readonly waterRipples = new THREE.Group();
  private readonly moonGateMaterial: THREE.MeshStandardMaterial;
  private readonly waterMaterial: THREE.MeshPhysicalMaterial;
  private readonly memoryLight: THREE.PointLight;
  private readonly rangeLimitedPointLights: THREE.PointLight[] = [];
  private readonly lightWorldPosition = new THREE.Vector3();
  private readonly materials = createUnifiedMaterials();
  private rain: THREE.Points;
  private memory: MemoryId = "wife";
  private elapsed = 0;
  private readonly loadedDeferredPlacementIds = new Set<string>();
  private readonly pendingDeferredPlacementIds = new Set<string>();
  private deferredLoadQueue: Promise<void> = Promise.resolve();
  private materialHydrationPromise?: Promise<void>;
  private architectureCollisionExtraction?: ArchitectureCollisionExtraction;
  private specialStructureCollisionExtraction?: SpecialStructureCollisionExtraction;
  private lastAreaSignature = "";
  private readonly layoutDebugEnabled = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("debugOverlay") === "1"
    || new URLSearchParams(window.location.search).get("debugMap") === "1"
    || new URLSearchParams(window.location.search).get("mapAudit") === "1"
  );
  private readonly mapAuditCameraEnabled = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("debugMap") === "1"
    || new URLSearchParams(window.location.search).get("mapAudit") === "1"
  );
  private readonly runtimeGroundVisualsEnabled = typeof window !== "undefined" && (
    new URLSearchParams(window.location.search).get("runtimeGround") === "1"
    || new URLSearchParams(window.location.search).get("debugOverlay") === "1"
    || new URLSearchParams(window.location.search).get("debugMap") === "1"
  );
  private readonly performanceProfileVariant = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("profile") ?? "full" : "full";

  private constructor(
    private readonly layers: MemoryLayer[],
    private readonly quality: "high" | "stable" | "low",
    private readonly assetLoader: RuntimeAssetLoader,
    private readonly fallbackEnabled: boolean,
    private readonly legacyEnabled: boolean,
    private readonly placements: readonly LayoutPlacement[],
  ) {
    this.scene.name = "TingYuXuanScene";
    this.gameplaySkeleton.name = "gameplaySkeleton";
    this.visualAssets.name = "visualAssets";
    this.proceduralDressing.name = "proceduralDressing";
    this.scene.add(this.gameplaySkeleton, this.visualAssets, this.proceduralDressing);
    this.scene.background = new THREE.Color("#0a1715");
    this.scene.fog = new THREE.FogExp2("#142722", 0.0185);
    if (this.layoutDebugEnabled) this.scene.fog = null;
    this.camera.rotation.order = "YXZ";

    this.scene.add(new THREE.HemisphereLight("#9bbcb3", "#131b17", 2.15));
    const moonKey = new THREE.DirectionalLight("#c2d8cf", quality === "low" ? 2.05 : 3.55);
    moonKey.position.set(-12, 18, 16);
    moonKey.castShadow = quality === "high" && this.performanceProfileVariant !== "no-shadows";
    moonKey.shadow.mapSize.set(1024, 1024);
    moonKey.shadow.camera.near = 0.5;
    moonKey.shadow.camera.far = 80;
    moonKey.shadow.camera.left = -28;
    moonKey.shadow.camera.right = 28;
    moonKey.shadow.camera.top = 32;
    moonKey.shadow.camera.bottom = -32;
    this.proceduralDressing.add(moonKey);
    const courtyardFill = new THREE.PointLight("#e3b66e", quality === "low" ? 7 : 13, 34, 1.4);
    courtyardFill.position.set(0, 5.8, 22);
    this.registerRangeLimitedPointLight(courtyardFill);
    this.proceduralDressing.add(courtyardFill);
    this.memoryLight = new THREE.PointLight("#e2b677", 20, 28, 1.5);
    this.memoryLight.position.set(-4, 3.2, 8);
    this.registerRangeLimitedPointLight(this.memoryLight);
    // A shadow-casting point light renders six shadow-map faces. In the first
    // source-faithful browser capture this multiplied the untouched Siheyuan
    // into ~4.9M rendered triangles by itself. Keep the atmospheric fill while
    // the directional moon key provides the formal architecture shadow.
    this.memoryLight.castShadow = false;
    this.scene.add(this.memoryLight);
    const moonLight = new THREE.PointLight("#d99b4c", quality === "low" ? 5 : 9, 13, 1.7);
    moonLight.position.set(2, 2.4, -18.5);
    this.registerRangeLimitedPointLight(moonLight);
    this.proceduralDressing.add(moonLight);
    this.waterMaterial = new THREE.MeshPhysicalMaterial({
      color: "#0a2827",
      roughness: 0.16,
      metalness: 0,
      transmission: 0.12,
      ior: 1.333,
      thickness: 0.18,
      specularIntensity: 0.92,
      clearcoat: 0.38,
      clearcoatRoughness: 0.24,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });

    this.buildDebugSkeleton();
    this.buildPreloadedArchitecture();
    if (!this.legacyEnabled) {
      this.buildWorldEnvelope();
      this.buildPlayableGroundCover();
    }
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
    this.rain = this.buildRain(quality === "high" ? 1200 : quality === "stable" ? 700 : 360);
    this.proceduralDressing.add(this.rain, this.wifeLayer, this.gardenerLayer, this.facelessOwner, this.guidanceMarker);
    this.facelessOwner.visible = false;
    this.guidanceMarker.visible = false;
    if (this.performanceProfileVariant === "no-rain") this.rain.visible = false;
    if (["no-procedural-dressing", "master-only", "master-plus-gameplay-dressing"].includes(this.performanceProfileVariant)) {
      this.proceduralDressing.visible = false;
    }
    if (this.performanceProfileVariant === "master-only") this.gameplaySkeleton.visible = false;
    if (["no-extra-lights", "master-only"].includes(this.performanceProfileVariant)) {
      this.memoryLight.visible = false;
      this.proceduralDressing.traverse((child) => { if (child instanceof THREE.PointLight) child.visible = false; });
    }

    this.interactables = tingYuXuanLayout.interactables.map((item) => ({
      ...item,
      memoryIds: [...item.memoryIds],
      position: new THREE.Vector3(...item.position),
    }));
  }

  static async create(layers: MemoryLayer[], quality: "high" | "stable" | "low", renderer: THREE.WebGPURenderer) {
    const loader = await RuntimeAssetLoader.create(renderer);
    const params = typeof window === "undefined" ? undefined : new URLSearchParams(window.location.search);
    const fallbackEnabled = params?.get("fallbackArchitecture") === "1";
    const legacyEnabled = params?.get("legacyArchitecture") === "1";
    const placements = legacyEnabled ? tingYuXuanLegacyPlacements : tingYuXuanLayout.placements;
    const primaryIds = [...new Set(placements.filter((placement) => placement.load === "preload").map((placement) => placement.assetId))];
    await Promise.all(primaryIds.map((id) => loader.load(id)));
    if (fallbackEnabled) await loader.load("tyx-arch-greybox-fallback-a");
    const runtimeScene = new TingYuXuanScene(layers, quality, loader, fallbackEnabled, legacyEnabled, placements);
    if (!legacyEnabled) {
      // The final Master has no deferred architecture requirement on first load,
      // so the old deferred-only hydration path left Runtime Ground Patches as
      // flat debug-looking colors. Hydrate the four ground materials up front;
      // failure is non-fatal and falls back to the authored base colors.
      await hydrateUnifiedMaterials(
        runtimeScene.materials,
        (url) => loader.loadTexture(url),
        ["mud-wet", "stone-old", "stone-wet", "stone-moss"],
      ).catch(() => undefined);
    }
    return runtimeScene;
  }

  /**
   * Load and clone a licensed Runtime asset for chapter-specific visual staging.
   * Chapter runtimes must use this instead of rebuilding visible furniture/props
   * with Box/Sphere/Cylinder geometry. Gameplay colliders and invisible triggers
   * remain separate from this visual layer.
   */
  async cloneFormalAsset(id: RuntimeAssetId, nodeName?: string): Promise<THREE.Object3D> {
    await this.assetLoader.load(id);
    const object = this.assetLoader.clone(id, nodeName);
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = this.quality === "high";
      child.receiveShadow = this.quality !== "low";
    });
    return object;
  }

  private prepareFormalVisual(object: THREE.Object3D, placement: LayoutPlacement) {
    placement.hiddenNodeNames?.forEach((name) => {
      const hidden = object.getObjectByName(name);
      if (hidden) hidden.visible = false;
    });
    if (placement.assetId === "tyx-master-scene") {
      // These authored roots are the scene itself, not optional dressing.
      // Keep them explicit so future cleanup/performance passes cannot silently
      // turn the Master into an empty gameplay patch again.
      ["A_OuterGarden_Environment", "A_MountainBackdrop_Group", "A_TransitionPlanting", "A_ExpandedBoundary", "B_CoreGarden_Primary"].forEach((name) => {
        const authoredRoot = object.getObjectByName(name);
        if (authoredRoot) authoredRoot.visible = true;
      });
      const auditNodeName = process.env.NODE_ENV === "development" && typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("auditMasterNode")
        : undefined;
      if (auditNodeName) {
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          let cursor: THREE.Object3D | null = child;
          let matches = false;
          while (cursor && cursor !== object) {
            if (cursor.name === auditNodeName) matches = true;
            cursor = cursor.parent;
          }
          child.visible = matches;
        });
      }
    }
    const clonedMaterials = new Map<THREE.Material, THREE.Material>();
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = this.legacyEnabled && this.quality === "high" && placement.assetId !== "tyx-nat-quaternius-set-a";
      child.receiveShadow = this.legacyEnabled && this.quality !== "low";
      const sourceMaterials = Array.isArray(child.material) ? child.material : [child.material];
      const prepared = sourceMaterials.map((source) => {
        const cached = clonedMaterials.get(source);
        if (cached) return cached;
        const material = source.clone();
        if (material instanceof THREE.MeshStandardMaterial && !material.transparent) {
          const name = material.name.toLowerCase();
          const foliage = /leaf|grass|plant|foliage|flower|bush/.test(name);
          material.roughness = foliage
            ? Math.max(0.48, material.roughness)
            : Math.max(0.2, Math.min(0.82, material.roughness * 0.74));
          material.envMapIntensity = foliage ? 0.8 : 1.15;
          material.needsUpdate = true;
        }
        clonedMaterials.set(source, material);
        return material;
      });
      child.material = Array.isArray(child.material) ? prepared : prepared[0];
    });
    return object;
  }

  async loadDeferredAssets(zones: LayoutZone[]) {
    const allowedZones = new Set(zones);
    const placements = this.placements.filter((placement) =>
      placement.load === "deferred"
      && placementLoadsInZones(placement, allowedZones)
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
        const object = this.prepareFormalVisual(
          placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement),
          placement,
        );
        this.visualAssets.add(object);
        this.loadedDeferredPlacementIds.add(placement.id);
      });
    } finally {
      placements.forEach((placement) => this.pendingDeferredPlacementIds.delete(placement.id));
    }
  }

  async ensureAreaAssets(point: { x: number; z: number }) {
    const request = this.deferredLoadQueue.then(async () => {
      const allowed = new Set<LayoutZone>(TINGYUXUAN_RUNTIME_ZONES);
      const zones = resolveLayoutZonesForPoint(point).filter((zone) => allowed.has(zone));
      const signature = zones.slice().sort().join("|");
      const activeZones = new Set<LayoutZone>(zones);
      const allAreaPlacementsLoaded = this.placements
        .filter((placement) => placement.load === "deferred" && placementLoadsInZones(placement, activeZones))
        .every((placement) => this.loadedDeferredPlacementIds.has(placement.id));
      if (signature === this.lastAreaSignature && allAreaPlacementsLoaded) return;
      await this.loadDeferredAssets(zones);
      this.lastAreaSignature = signature;
    });
    this.deferredLoadQueue = request.catch(() => undefined);
    return request;
  }

  private buildPreloadedArchitecture() {
    this.placements.filter((placement) => placement.load === "preload").forEach((placement) => {
      const object = this.prepareFormalVisual(
        placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement),
        placement,
      );
      this.visualAssets.add(object);
    });
  }

  private buildFallbackArchitecture() {
    tingYuXuanFallbackPlacements.forEach((placement) => {
      this.gameplaySkeleton.add(placeObject(this.assetLoader.clone(placement.assetId, placement.nodeName), placement));
    });
  }

  private buildDebugSkeleton() {
    const debugEnabled = this.layoutDebugEnabled;
    const boundaryMaterial = new THREE.MeshBasicMaterial({ color: "#21d4e8", wireframe: true, transparent: true, opacity: 0.76 });
    const architectureMaterial = new THREE.MeshBasicMaterial({ color: "#36d684", wireframe: true, transparent: true, opacity: 0.58 });
    const groundMaterial = new THREE.MeshBasicMaterial({ color: "#7f8c82", wireframe: true, transparent: true, opacity: 0.2 });
    const lockMaterial = new THREE.MeshBasicMaterial({ color: "#ed5b4f", wireframe: true, transparent: true, opacity: 0.72 });
    const memoryWallMaterial = new THREE.MeshBasicMaterial({ color: "#b56cff", wireframe: true, transparent: true, opacity: 0.78 });
    const triggerMaterial = new THREE.MeshBasicMaterial({ color: "#e8b84b", wireframe: true, transparent: true, opacity: 0.65 });
    tingYuXuanLayout.colliders.forEach((collider) => {
      const material = collider.category === "world-boundary" ? boundaryMaterial
        : collider.category === "architecture" ? architectureMaterial
          : collider.category === "memory-wall" ? memoryWallMaterial
            : collider.category === "progression-lock" ? lockMaterial
              : groundMaterial;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(...collider.halfExtents.map((value) => value * 2) as [number, number, number]), material);
      mesh.name = `Collider_${collider.id}`;
      mesh.position.set(...collider.center);
      mesh.rotation.y = collider.rotationY ?? 0;
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
    const regionColors = { AREA_A: "#4aa3ff", AREA_B: "#efbd4d", AREA_C: "#70db72" } as const;
    tingYuXuanGameplayRegions.forEach((region) => {
      const material = new THREE.MeshBasicMaterial({ color: regionColors[region.id], wireframe: true, transparent: true, opacity: 0.52 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(region.halfExtents[0] * 2, 0.08, region.halfExtents[1] * 2), material);
      mesh.name = `Region_${region.id}`;
      mesh.position.set(region.center[0], 0.08, region.center[1]);
      mesh.visible = debugEnabled;
      this.gameplaySkeleton.add(mesh);
    });
    const routePoints = tingYuXuanRouteAnchors.map((anchor) => new THREE.Vector3(anchor.position[0], 0.18, anchor.position[2]));
    const entranceRoute = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints.slice(0, 2)), new THREE.LineBasicMaterial({ color: "#ffe25d" }));
    entranceRoute.name = "Route_01_02_Entrance";
    entranceRoute.visible = debugEnabled;
    const remainingRoute = new THREE.Line(new THREE.BufferGeometry().setFromPoints(routePoints.slice(1)), new THREE.LineBasicMaterial({ color: "#ff4b3e" }));
    remainingRoute.name = "Route_02_07";
    remainingRoute.visible = debugEnabled;
    this.gameplaySkeleton.add(entranceRoute, remainingRoute);
    tingYuXuanRouteAnchors.forEach((anchor) => {
      const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.34, 1.4, 12), new THREE.MeshBasicMaterial({ color: "#ff6458", transparent: true, opacity: 0.88 }));
      marker.name = `Anchor_${anchor.id}`;
      marker.position.set(anchor.position[0], 0.7, anchor.position[2]);
      marker.visible = debugEnabled;
      this.gameplaySkeleton.add(marker);
    });
    const gateBounds = TINGYUXUAN_MAIN_GATE_AUDIT.bounds;
    const gateBoundsMesh = new THREE.Mesh(
      new THREE.BoxGeometry(...gateBounds.size),
      new THREE.MeshBasicMaterial({ color: "#f5f7ff", wireframe: true, transparent: true, opacity: 0.82 }),
    );
    gateBoundsMesh.name = "Audit_TYX_MAIN_GATE_SOUTH_Bounds";
    gateBoundsMesh.position.set(...TINGYUXUAN_MAIN_GATE_AUDIT.center);
    gateBoundsMesh.visible = debugEnabled;
    const gateCenter = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 10), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
    gateCenter.name = "Audit_TYX_MAIN_GATE_SOUTH_Center";
    gateCenter.position.set(TINGYUXUAN_MAIN_GATE_AUDIT.center[0], 0.28, TINGYUXUAN_MAIN_GATE_AUDIT.center[2]);
    gateCenter.visible = debugEnabled;
    const insideDirection = new THREE.ArrowHelper(
      new THREE.Vector3(...TINGYUXUAN_MAIN_GATE_AUDIT.insideNormal),
      gateCenter.position,
      2.4,
      "#ffe25d",
      0.45,
      0.24,
    );
    insideDirection.name = "Audit_MainGate_InsideNormal";
    insideDirection.visible = debugEnabled;
    this.gameplaySkeleton.add(gateBoundsMesh, gateCenter, insideDirection);
    this.gameplaySkeleton.visible = debugEnabled || this.fallbackEnabled;
  }

  private buildWorldEnvelope() {
    const centerX = -8;
    const centerZ = 27.5;
    const random = mulberry32(0x5a17f1e1);

    // Sky is overhead only. The horizon is deliberately occupied by terrain,
    // mountain ridges and a distant tree line so the player never reads the
    // world edge as a cylindrical wall of stars.
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(88, 48, 24),
      new THREE.MeshBasicMaterial({
        color: "#0b1b21",
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    );
    sky.name = "WorldEnvelope_NightSky";
    sky.position.set(centerX, 0, centerZ);
    this.proceduralDressing.add(sky);

    // It is a rainy night, so stars are sparse and only visible through breaks
    // in the cloud cover rather than reading as a clear-sky planetarium.
    const starCount = this.quality === "high" ? 190 : this.quality === "stable" ? 125 : 75;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const azimuth = random() * Math.PI * 2;
      const elevation = 0.2 + Math.pow(random(), 0.72) * 1.15;
      const radius = 76 + random() * 5;
      starPositions[index * 3] = centerX + Math.cos(azimuth) * Math.cos(elevation) * radius;
      starPositions[index * 3 + 1] = Math.sin(elevation) * radius;
      starPositions[index * 3 + 2] = centerZ + Math.sin(azimuth) * Math.cos(elevation) * radius;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: "#c7d9d5",
        size: this.quality === "high" ? 0.15 : 0.11,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      }),
    );
    stars.name = "WorldEnvelope_Stars";
    stars.frustumCulled = false;
    this.proceduralDressing.add(stars);

    const moonGroup = new THREE.Group();
    moonGroup.name = "WorldEnvelope_Moon";
    moonGroup.position.set(centerX - 34, 40, centerZ - 58);
    const moon = new THREE.Mesh(
      new THREE.CircleGeometry(2.7, 48),
      new THREE.MeshBasicMaterial({ color: "#dfe8dd", transparent: true, opacity: 0.94, depthWrite: false, fog: false, side: THREE.DoubleSide }),
    );
    moon.name = "MoonDisc";
    const moonHalo = new THREE.Mesh(
      new THREE.CircleGeometry(5.6, 48),
      new THREE.MeshBasicMaterial({ color: "#9fbab4", transparent: true, opacity: 0.08, depthWrite: false, fog: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
    );
    moonHalo.name = "MoonHalo";
    moonGroup.add(moonHalo, moon);
    moonGroup.lookAt(centerX, 11, centerZ);
    this.proceduralDressing.add(moonGroup);

    const buildRidge = (name: string, radius: number, baseHeight: number, peakHeight: number, color: string, seedOffset: number) => {
      const ridgeRandom = mulberry32(0x31a4c5 + seedOffset);
      const segments = 96;
      const positions: number[] = [];
      const indices: number[] = [];
      for (let index = 0; index <= segments; index += 1) {
        const theta = index / segments * Math.PI * 2;
        const localRadius = radius + (ridgeRandom() - 0.5) * 4.5;
        const rolling = Math.sin(theta * 3.1 + seedOffset) * 2.1 + Math.sin(theta * 7.3 + 0.8) * 1.25;
        const topY = baseHeight + rolling + Math.pow(ridgeRandom(), 2.2) * peakHeight;
        const x = centerX + Math.cos(theta) * localRadius;
        const z = centerZ + Math.sin(theta) * localRadius;
        positions.push(x, -1.8, z, x, topY, z);
        if (index < segments) {
          const base = index * 2;
          indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      const ridge = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, side: THREE.DoubleSide }),
      );
      ridge.name = name;
      ridge.receiveShadow = true;
      this.proceduralDressing.add(ridge);
    };
    buildRidge("WorldEnvelope_MountainBack", 66, 7.5, 10.5, "#08110f", 3);
    buildRidge("WorldEnvelope_MountainFront", 56, 5.1, 6.8, "#0d1b17", 11);

    const treeCount = this.quality === "high" ? 110 : this.quality === "stable" ? 78 : 48;
    const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.2, 1, 6);
    const crownGeometry = new THREE.IcosahedronGeometry(1, 1);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#111711", roughness: 1, metalness: 0 });
    const crownMaterial = new THREE.MeshStandardMaterial({ color: "#10231a", roughness: 0.98, metalness: 0 });
    const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, treeCount);
    const crowns = new THREE.InstancedMesh(crownGeometry, crownMaterial, treeCount);
    trunks.name = "WorldEnvelope_ForestTrunks";
    crowns.name = "WorldEnvelope_ForestCrowns";
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    for (let index = 0; index < treeCount; index += 1) {
      const theta = random() * Math.PI * 2;
      const radius = 43 + random() * 10;
      const height = 4.3 + random() * 4.8;
      const width = 1.45 + random() * 1.4;
      const x = centerX + Math.cos(theta) * radius;
      const z = centerZ + Math.sin(theta) * radius;
      quaternion.setFromEuler(new THREE.Euler(0, random() * Math.PI * 2, (random() - 0.5) * 0.08));
      position.set(x, height * 0.32, z);
      scale.set(1, height * 0.64, 1);
      matrix.compose(position, quaternion, scale);
      trunks.setMatrixAt(index, matrix);
      position.set(x + (random() - 0.5) * 0.5, height * 0.78, z + (random() - 0.5) * 0.5);
      scale.set(width, height * 0.33, width * (0.78 + random() * 0.32));
      matrix.compose(position, quaternion, scale);
      crowns.setMatrixAt(index, matrix);
    }
    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
    trunks.castShadow = false;
    crowns.castShadow = false;
    trunks.receiveShadow = true;
    crowns.receiveShadow = true;
    this.proceduralDressing.add(trunks, crowns);
  }

  private buildPlayableGroundCover() {
    const textureSize = 64;
    const random = mulberry32(0x1a7d51d);
    const pixels = new Uint8Array(textureSize * textureSize * 4);
    for (let index = 0; index < textureSize * textureSize; index += 1) {
      const grain = Math.floor((random() - 0.5) * 18);
      const moss = random() > 0.78 ? 8 : 0;
      pixels[index * 4] = Math.max(24, 47 + grain - moss);
      pixels[index * 4 + 1] = Math.max(28, 52 + grain + moss);
      pixels[index * 4 + 2] = Math.max(20, 37 + Math.floor(grain * 0.55));
      pixels[index * 4 + 3] = 255;
    }
    const texture = new THREE.DataTexture(pixels, textureSize, textureSize, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(22, 22);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const material = new THREE.MeshStandardMaterial({
      name: "TYX_MAT_ProceduralEarthCover",
      map: texture,
      bumpMap: texture,
      bumpScale: 0.032,
      color: "#8a8870",
      roughness: 0.97,
      metalness: 0,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(92, 92), material);
    ground.name = "WorldGround_ProceduralEarthCover";
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(-8, 0.012, 27.5);
    ground.receiveShadow = true;
    ground.renderOrder = -4;
    this.proceduralDressing.add(ground);
  }

  private buildGroundAndWater() {
    if (!this.legacyEnabled) {
      // In the final Master path, the authored terrain/paving is the visual truth.
      // Runtime ground boxes remain in Rapier for stable walking, but must not
      // cover the Blender-authored surface with flat rectangular meshes during
      // normal gameplay. They can still be rendered explicitly for diagnostics.
      if (this.runtimeGroundVisualsEnabled) {
        tingYuXuanGroundPatches.forEach((patch) => {
          const ground = new THREE.Mesh(new THREE.BoxGeometry(patch.size[0], patch.thickness, patch.size[1]), this.materials[patch.material]);
          ground.name = `GroundPatch_${patch.id}`;
          ground.position.set(...patch.center);
          ground.rotation.y = patch.rotationY ?? 0;
          ground.receiveShadow = true;
          ground.userData.groundPatchLayer = patch.layer;
          ground.userData.gameplayRegion = patch.regionId;
          this.proceduralDressing.add(ground);
        });
      }
      return;
    }

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
    const pavilionDeck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 3.8), this.materials["stone-wet"]);
    pavilionDeck.name = "PavilionStoneDeck";
    pavilionDeck.position.set(10, 0.02, -32);
    pavilionDeck.receiveShadow = true;
    this.proceduralDressing.add(pavilionDeck);

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
    if (!this.legacyEnabled) {
      ["ROUTE_01_START", "ROUTE_04_A_EAST_EXIT", "ROUTE_06_B_NORTHEAST_LINK"].forEach((id, index) => {
        const anchor = getGameplayAnchor(id as Parameters<typeof getGameplayAnchor>[0]);
        const light = new THREE.PointLight(index >= 4 ? "#90b7a8" : "#d98a43", this.quality === "low" ? 3 : 6.5, 8, 1.9);
        light.name = `LanternLight_${id}`;
        light.userData.baseIntensity = light.intensity;
        light.userData.flickerPhase = index * 0.73;
        light.position.set(anchor.position[0] - 0.8, 2.25, anchor.position[2]);
        this.registerRangeLimitedPointLight(light);
        this.proceduralDressing.add(light);
      });
      const cEntryFill = new THREE.PointLight("#4d8179", this.quality === "low" ? 2.5 : 5, 18, 1.8);
      cEntryFill.name = "CEntry_WaterFill";
      cEntryFill.position.set(-22, 1.2, 12.5);
      this.registerRangeLimitedPointLight(cEntryFill);
      this.proceduralDressing.add(cEntryFill);
      this.buildMasterGroundSeams();
      return;
    }

    for (const [x, z] of [[0, 27], [0, 20], [-8, 10], [-8, 2], [2, -8], [2, -16]] as const) {
      // The old CylinderGeometry lantern body read as a floating black proxy
      // against the source-faithful architecture. Keep only the authored
      // atmosphere light until a real lantern asset is selected.
      const light = new THREE.PointLight("#d98a43", this.quality === "low" ? 3.5 : 7, 7, 1.9);
      light.name = `LanternLight_${x}_${z}`;
      light.userData.baseIntensity = light.intensity;
      light.userData.flickerPhase = (Math.abs(x * 17 + z * 11) % 19) * 0.37;
      light.position.set(x - 1.1, 2.25, z);
      this.registerRangeLimitedPointLight(light);
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
      [7.35, -28.65, -0.12], [8.05, -29.45, -0.48], [8.85, -30.15, -0.62], [9.55, -30.75, -0.7],
    ].forEach(([x, z, rotation], index) => addSlab(`PavilionCauseway_${index}`, x, z, 1.35, 0.76, rotation));

    [
      [8.8, -20.2, 0.35], [10.1, -19.55, 0.45], [11.25, -18.75, 0.58],
      [12.25, -17.8, 0.68], [13.2, -16.8, 0.78],
    ].forEach(([x, z, rotation], index) => addSlab(`RockeryPath_${index}`, x, z, 1.25, 0.7, rotation));

    for (let index = 0; index < 5; index += 1) addSlab(`NorthCourt_${index}`, 10, 6.5 + index * 1.25, 2.1, 0.88, 0);
    for (let index = 0; index < 4; index += 1) addSlab(`InnerCourt_${index}`, -7.5 - index * 1.35, 18, 1.55, 0.84, Math.PI / 2);

    const pavilionGlow = new THREE.PointLight("#d7a65c", this.quality === "low" ? 4 : 8, 18, 1.7);
    pavilionGlow.position.set(10, 3.2, -31.5);
    this.registerRangeLimitedPointLight(pavilionGlow);
    this.proceduralDressing.add(pavilionGlow);
    const waterFill = new THREE.PointLight("#4d8179", this.quality === "low" ? 2.5 : 5, 16, 1.8);
    waterFill.position.set(9.5, 1.2, -27.5);
    this.registerRangeLimitedPointLight(waterFill);
    this.proceduralDressing.add(waterFill);

  }

  private buildMasterGroundSeams() {
    const random = mulberry32(0x51ea0f);
    const regions = [
      { center: [7, 42.5] as const, half: [12, 13.5] as const },
      { center: [-5, 24] as const, half: [11, 7] as const },
      { center: [-18.5, 16.5] as const, half: [6.5, 4.5] as const },
    ];
    const tuftCount = this.quality === "high" ? 108 : this.quality === "stable" ? 64 : 30;
    const tufts = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.11, 0.34, 5),
      new THREE.MeshStandardMaterial({ color: "#24382a", roughness: 0.94, metalness: 0 }),
      tuftCount,
    );
    tufts.name = "GroundSeam_Tufts";
    const matrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    for (let index = 0; index < tuftCount; index += 1) {
      const region = regions[index % regions.length];
      const edge = index % 4;
      const edgeNoise = (random() - 0.5) * 0.85;
      let x = region.center[0];
      let z = region.center[1];
      if (edge < 2) {
        x += (random() * 2 - 1) * region.half[0];
        z += (edge === 0 ? -region.half[1] : region.half[1]) + edgeNoise;
      } else {
        x += (edge === 2 ? -region.half[0] : region.half[0]) + edgeNoise;
        z += (random() * 2 - 1) * region.half[1];
      }
      position.set(x, 0.17, z);
      rotation.setFromAxisAngle(up, random() * Math.PI * 2);
      const size = 0.65 + random() * 0.9;
      scale.set(size, 0.72 + random() * 0.7, size);
      matrix.compose(position, rotation, scale);
      tufts.setMatrixAt(index, matrix);
    }
    tufts.instanceMatrix.needsUpdate = true;
    tufts.receiveShadow = true;
    this.proceduralDressing.add(tufts);

    const stoneCount = this.quality === "high" ? 48 : this.quality === "stable" ? 30 : 14;
    const stones = new THREE.InstancedMesh(
      new THREE.DodecahedronGeometry(0.13, 0),
      new THREE.MeshStandardMaterial({ color: "#46504a", roughness: 0.88, metalness: 0.02 }),
      stoneCount,
    );
    stones.name = "GroundSeam_Stones";
    for (let index = 0; index < stoneCount; index += 1) {
      const region = regions[(index + 1) % regions.length];
      const side = index % 4;
      const inset = 0.25 + random() * 0.75;
      let x = region.center[0];
      let z = region.center[1];
      if (side < 2) {
        x += (random() * 2 - 1) * region.half[0];
        z += (side === 0 ? -region.half[1] : region.half[1]) + (random() - 0.5) * inset;
      } else {
        x += (side === 2 ? -region.half[0] : region.half[0]) + (random() - 0.5) * inset;
        z += (random() * 2 - 1) * region.half[1];
      }
      position.set(x, 0.07, z);
      rotation.setFromEuler(new THREE.Euler(random() * 0.35, random() * Math.PI * 2, random() * 0.35));
      const sx = 0.55 + random() * 1.1;
      scale.set(sx, 0.45 + random() * 0.55, 0.65 + random() * 1.2);
      matrix.compose(position, rotation, scale);
      stones.setMatrixAt(index, matrix);
    }
    stones.instanceMatrix.needsUpdate = true;
    stones.castShadow = this.quality === "high";
    stones.receiveShadow = true;
    this.proceduralDressing.add(stones);

    // Thin wet stains visually bridge the authored GLB ground and the Runtime
    // patches. They never participate in physics; this is deliberately a render
    // layer so collision can stay simple and reliable.
    const stainCount = this.quality === "high" ? 34 : this.quality === "stable" ? 22 : 10;
    const stains = new THREE.InstancedMesh(
      new THREE.CircleGeometry(0.72, 18),
      new THREE.MeshBasicMaterial({ color: "#10231e", transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }),
      stainCount,
    );
    stains.name = "GroundSeam_WetStains";
    const stainRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    for (let index = 0; index < stainCount; index += 1) {
      const region = regions[index % regions.length];
      const edge = index % 4;
      let x = region.center[0];
      let z = region.center[1];
      if (edge < 2) {
        x += (random() * 2 - 1) * Math.max(1, region.half[0] - 0.6);
        z += (edge === 0 ? -region.half[1] : region.half[1]) + (random() - 0.5) * 1.05;
      } else {
        x += (edge === 2 ? -region.half[0] : region.half[0]) + (random() - 0.5) * 1.05;
        z += (random() * 2 - 1) * Math.max(1, region.half[1] - 0.6);
      }
      position.set(x, 0.055 + (index % 3) * 0.002, z);
      scale.set(0.6 + random() * 1.4, 0.65 + random() * 1.1, 1);
      matrix.compose(position, stainRotation, scale);
      stains.setMatrixAt(index, matrix);
    }
    stains.instanceMatrix.needsUpdate = true;
    stains.renderOrder = 2;
    this.proceduralDressing.add(stains);

    const leafCount = this.quality === "high" ? 72 : this.quality === "stable" ? 40 : 18;
    const leaves = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.16, 0.36),
      new THREE.MeshBasicMaterial({ color: "#59472c", transparent: true, opacity: 0.54, depthWrite: false, side: THREE.DoubleSide }),
      leafCount,
    );
    leaves.name = "GroundSeam_FallenLeaves";
    for (let index = 0; index < leafCount; index += 1) {
      const region = regions[(index + 2) % regions.length];
      const edge = index % 4;
      let x = region.center[0];
      let z = region.center[1];
      if (edge < 2) {
        x += (random() * 2 - 1) * region.half[0];
        z += (edge === 0 ? -region.half[1] : region.half[1]) + (random() - 0.5) * 1.3;
      } else {
        x += (edge === 2 ? -region.half[0] : region.half[0]) + (random() - 0.5) * 1.3;
        z += (random() * 2 - 1) * region.half[1];
      }
      position.set(x, 0.072, z);
      rotation.setFromEuler(new THREE.Euler(-Math.PI / 2 + (random() - 0.5) * 0.08, random() * Math.PI * 2, (random() - 0.5) * 0.08));
      const leafScale = 0.55 + random() * 0.85;
      scale.set(leafScale, leafScale, leafScale);
      matrix.compose(position, rotation, scale);
      leaves.setMatrixAt(index, matrix);
    }
    leaves.instanceMatrix.needsUpdate = true;
    leaves.renderOrder = 3;
    this.proceduralDressing.add(leaves);
  }

  private buildMemoryLayers() {
    if (!this.legacyEnabled) {
      // The same spot must read as two mutually exclusive pieces of topology,
      // not merely as a color grade. Wife: a continuous wall. Gardener: a worn
      // mossy service path with footprints leading through it.
      const sealedWall = new THREE.Mesh(new THREE.BoxGeometry(3.15, 1.55, 0.24), this.materials["stone-old"]);
      sealedWall.name = "Wife_SealedSidePath";
      sealedWall.position.set(4.1, 0.78, 42.9);
      sealedWall.rotation.y = -0.78;
      sealedWall.castShadow = true;
      sealedWall.receiveShadow = true;
      this.wifeLayer.add(sealedWall);
      const rainScuff = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.88), new THREE.MeshStandardMaterial({ color: "#584c36", roughness: 0.96 }));
      rainScuff.name = "Wife_RainScuff";
      rainScuff.position.set(4.05, 0.16, 42.85);
      this.wifeLayer.add(rainScuff);

      const sidePath = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.045, 6.4), this.materials["stone-moss"]);
      sidePath.name = "Gardener_SidePath";
      sidePath.position.set(4.1, 0.13, 42.9);
      sidePath.rotation.y = -2.35;
      sidePath.receiveShadow = true;
      this.gardenerLayer.add(sidePath);
      // The side path itself is the clue. Do not stack engineering arrows/rings on top of it;
      // progressive guidance is handled by TASK-040's delayed soft marker.
      return;
    }

    const dryChannel = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.055, 12), this.materials["stone-old"]);
    dryChannel.position.set(-8.95, 0.11, 5.5);
    this.wifeLayer.add(dryChannel);
    const nameSlip = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.025, 0.78), new THREE.MeshStandardMaterial({ color: "#b49d72", emissive: "#493413", emissiveIntensity: 1.1 }));
    nameSlip.position.set(-8.92, 0.16, 6.1);
    this.wifeLayer.add(nameSlip);

    const waterline = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.045, 13), new THREE.MeshStandardMaterial({ color: "#0c413b", emissive: "#082820", emissiveIntensity: 1.6, roughness: 0.08, metalness: 0.25 }));
    waterline.position.set(-8.95, 0.13, 5.4);
    this.gardenerLayer.add(waterline);
    // Legacy memory also exposes the altered surface directly; no arrow/ring overlays.
  }

  private buildMoonGateMemoryFrame() {
    // Memory-only highlight: the real Courtyard Park geometry remains the architectural gate.
    const gate = new THREE.Mesh(new THREE.TorusGeometry(1.24, 0.045, 12, 56), this.moonGateMaterial);
    gate.name = "wife-moon-gate-memory-frame";
    gate.position.set(this.legacyEnabled ? 2 : 1.9, 1.45, this.legacyEnabled ? -20.76 : 31.2);
    this.wifeLayer.add(gate);
    const darkness = new THREE.Mesh(new THREE.CircleGeometry(1.13, 48), new THREE.MeshBasicMaterial({ color: "#020504", transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
    darkness.position.set(this.legacyEnabled ? 2 : 1.9, 1.45, this.legacyEnabled ? -20.72 : 31.16);
    this.gardenerLayer.add(darkness);
  }

  private buildGuidanceMarker() {
    const material = new THREE.MeshBasicMaterial({
      map: createSoftGuidanceTexture(),
      transparent: true,
      opacity: 0.46,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const patch = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.35), material);
    patch.name = "Guidance_SoftPatch";
    patch.rotation.x = -Math.PI / 2;
    patch.position.y = 0.035;





    this.guidanceMarker.add(patch);
  }

  private buildFacelessOwner() {
    // Formal gameplay must never synthesize a human from Capsule/Sphere primitives.
    // Keep only the chase/threat anchor until a licensed authored character is registered.
    this.facelessOwner.name = "FacelessOwner_ThreatAnchor";





  }

  private buildRain(count: number) {
    const random = mulberry32(0x7159a11);
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      positions[index * 3] = -34 + random() * 53;
      positions[index * 3 + 1] = random() * 8;
      positions[index * 3 + 2] = 57 - random() * 58;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return new THREE.Points(geometry, new THREE.PointsMaterial({ color: "#9bb8b7", size: 0.035, transparent: true, opacity: 0.46, depthWrite: false }));
  }

  setRainEnabled(enabled: boolean) {
    this.rain.visible = enabled;
  }

  setMemory(memory: MemoryId) {
    this.memory = memory;
    const layer = this.layers.find((item) => item.id === memory) ?? this.layers[0];
    this.wifeLayer.visible = memory === "wife";
    this.gardenerLayer.visible = memory === "gardener";
    this.scene.background = new THREE.Color(layer.visual.fog);
    this.scene.fog = this.layoutDebugEnabled ? null : new THREE.FogExp2(layer.visual.fog, memory === "gardener" ? 0.038 : 0.022);
    this.memoryLight.color.set(layer.visual.keyLight);
    this.memoryLight.intensity = memory === "gardener" ? 14 : 20;
    this.waterMaterial.color.set(memory === "gardener" ? "#0e3530" : "#0a2827");
    this.waterMaterial.roughness = memory === "gardener" ? 0.11 : 0.16;
    this.moonGateMaterial.emissive.set(memory === "wife" ? "#72501e" : "#07100b");
  }

  setOwnerVisible(visible: boolean, position?: THREE.Vector3) {
    this.facelessOwner.visible = visible;
    if (position) this.facelessOwner.position.copy(position);
  }

  setGuidanceTarget(position?: THREE.Vector3, style: "standard" | "subtle" = "standard") {
    this.guidanceMarker.visible = Boolean(position);
    this.guidanceStyle = style;
    const patch = this.guidanceMarker.getObjectByName("Guidance_SoftPatch") as THREE.Mesh | undefined;
    if (patch) (patch.material as THREE.MeshBasicMaterial).opacity = style === "subtle" ? 0.22 : 0.46;
    if (position) this.guidanceMarker.position.set(position.x, 0, position.z);
  }

  registerRangeLimitedPointLight(light: THREE.PointLight) {
    if (!this.rangeLimitedPointLights.includes(light)) this.rangeLimitedPointLights.push(light);
    const disabledByProfile = ["no-extra-lights", "master-only"].includes(this.performanceProfileVariant);
    light.userData.baseIntensity = Number(light.userData.baseIntensity ?? light.intensity);
    light.userData.runtimeLightFactor = disabledByProfile ? 0 : 1;
    // Keep the light object visible for the whole session. Toggling PointLight
    // visibility changes the renderer light set and can trigger a new shader /
    // WebGPU pipeline compile exactly when the player enters a lit area. Fade the
    // numeric intensity instead so the shader layout stays stable after startup.
    light.visible = !disabledByProfile;
    if (disabledByProfile) light.intensity = 0;
  }

  update(delta: number, player: THREE.Vector3, chasing: boolean) {
    this.elapsed += delta;
    if (!["no-extra-lights", "master-only"].includes(this.performanceProfileVariant)) {
      this.rangeLimitedPointLights.forEach((light) => {
        light.getWorldPosition(this.lightWorldPosition);
        const cutoff = light.distance > 0 ? light.distance + 0.5 : Number.POSITIVE_INFINITY;
        const distance = this.lightWorldPosition.distanceTo(player);
        const fadeStart = Number.isFinite(cutoff) ? Math.max(0, cutoff * 0.72) : 0;
        const targetFactor = !Number.isFinite(cutoff)
          ? 1
          : distance >= cutoff
            ? 0
            : distance <= fadeStart
              ? 1
              : 1 - (distance - fadeStart) / Math.max(0.001, cutoff - fadeStart);
        const previousFactor = Number(light.userData.runtimeLightFactor ?? targetFactor);
        const smoothing = 1 - Math.exp(-delta * 7.5);
        const factor = previousFactor + (targetFactor - previousFactor) * smoothing;
        light.userData.runtimeLightFactor = factor;
        if (!light.name.startsWith("LanternLight_")) {
          const base = Number(light.userData.baseIntensity ?? light.intensity);
          light.intensity = base * factor;
        }
      });
    }
    if (this.rain.visible && this.proceduralDressing.visible) {
      const positions = this.rain.geometry.getAttribute("position") as THREE.BufferAttribute;
      for (let index = 0; index < positions.count; index += 1) {
        let y = positions.getY(index) - delta * 8;
        if (y < 0) y = 5.5 + (index % 31) / 15;
        positions.setY(index, y);
      }
      positions.needsUpdate = true;
    }
    if (this.guidanceMarker.visible) {
      const baseScale = this.guidanceStyle === "subtle" ? 0.72 : 1;
      const pulse = baseScale + Math.sin(this.elapsed * 3.2) * (this.guidanceStyle === "subtle" ? 0.035 : 0.08);
      this.guidanceMarker.scale.set(pulse, 1, pulse);
      this.guidanceMarker.rotation.y = this.elapsed * 0.35;
    }
    this.proceduralDressing.children.forEach((child) => {
      if (!(child instanceof THREE.PointLight) || !child.name.startsWith("LanternLight_")) return;
      const base = Number(child.userData.baseIntensity ?? child.intensity);
      const phase = Number(child.userData.flickerPhase ?? 0);
      const runtimeFactor = Number(child.userData.runtimeLightFactor ?? 1);
      child.intensity = base * runtimeFactor * (0.94 + Math.sin(this.elapsed * 5.7 + phase) * 0.035 + Math.sin(this.elapsed * 2.1 + phase * 0.7) * 0.02);
    });
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
    if (this.mapAuditCameraEnabled) {
      this.camera.position.set(-8, 76, 27.5);
      this.camera.up.set(0, 0, -1);
      this.camera.fov = 48;
      this.camera.near = 0.1;
      this.camera.far = 180;
      this.camera.lookAt(-8, 0, 27.5);
      this.camera.updateProjectionMatrix();
    }
  }

  ownerDistance(player: THREE.Vector3) { return this.facelessOwner.position.distanceTo(player); }
  activeMemory() { return this.memory; }
  profileVariant() { return this.performanceProfileVariant; }
  profileStats() {
    const materials = new Set<THREE.Material>();
    const textures = new Set<THREE.Texture>();
    let lights = 0;
    let shadowCasters = 0;
    const visibleInHierarchy = (object: THREE.Object3D) => {
      let cursor: THREE.Object3D | null = object;
      while (cursor) {
        if (!cursor.visible) return false;
        cursor = cursor.parent;
      }
      return true;
    };
    this.scene.traverse((child) => {
      if (!visibleInHierarchy(child)) return;
      if (child instanceof THREE.Light) lights += 1;
      if (child.castShadow) shadowCasters += 1;
      if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) return;
      const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
      childMaterials.forEach((material) => {
        materials.add(material);
        Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) textures.add(value); });
      });
    });
    return { materials: materials.size, textures: textures.size, lights, shadowCasters };
  }
  private ensureArchitectureCollisionExtraction(): ArchitectureCollisionExtraction {
    if (this.architectureCollisionExtraction) return this.architectureCollisionExtraction;
    const visualRoot = this.legacyEnabled ? new THREE.Group() : this.visualAssets;
    this.architectureCollisionExtraction = extractArchitectureCollisionCoverage(visualRoot, tingYuXuanLayout.colliders);
    const { colliders, audit } = this.architectureCollisionExtraction;
    if (audit.warningThresholdExceeded) {
      console.warn(`[TASK-017] Generated ${colliders.length} Master architecture colliders; warning threshold is ${audit.warningThreshold}. No colliders were truncated.`);
    }
    if (this.layoutDebugEnabled && !this.legacyEnabled) {
      const material = new THREE.MeshBasicMaterial({ color: "#00ff9d", wireframe: true, transparent: true, opacity: 0.72 });
      colliders.forEach((collider) => {
        const mesh = new THREE.Mesh(
          new THREE.BoxGeometry(
            collider.halfExtents[0] * 2,
            collider.halfExtents[1] * 2,
            collider.halfExtents[2] * 2,
          ),
          material,
        );
        mesh.name = `GeneratedCollider_${collider.id}`;
        mesh.position.set(...collider.center);
        mesh.rotation.y = collider.rotationY ?? 0;
        mesh.userData.debugOnly = true;
        this.gameplaySkeleton.add(mesh);
      });
    }
    return this.architectureCollisionExtraction;
  }

  architectureCollisionBoxes(): readonly LayoutCollider[] {
    return this.ensureArchitectureCollisionExtraction().colliders;
  }

  architectureCollisionAudit() {
    return this.ensureArchitectureCollisionExtraction().audit;
  }

  private ensureSpecialStructureCollisionExtraction(): SpecialStructureCollisionExtraction {
    if (this.specialStructureCollisionExtraction) return this.specialStructureCollisionExtraction;
    this.specialStructureCollisionExtraction = extractMasterSpecialStructureCollision(this.visualAssets, tingYuXuanLayout.colliders);
    if (this.layoutDebugEnabled && !this.legacyEnabled) {
      const material = new THREE.MeshBasicMaterial({ color: "#ff6dd1", wireframe: true, transparent: true, opacity: 0.78 });
      this.specialStructureCollisionExtraction.colliders.forEach((collider) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(collider.vertices), 3));
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(collider.indices), 1));
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `SpecialStructureCollider_${collider.id}`;
        mesh.userData.debugOnly = true;
        this.gameplaySkeleton.add(mesh);
      });
    }
    return this.specialStructureCollisionExtraction;
  }

  specialStructureCollisionMeshes() {
    return this.ensureSpecialStructureCollisionExtraction().colliders;
  }

  specialStructureCollisionAudit() {
    return this.ensureSpecialStructureCollisionExtraction().audit;
  }

  visibleModelNames() { return this.visualAssets.children.map((child) => child.name); }
  loadedAssetIds() { return this.assetLoader.loadedAssetIds(); }
  loadedAssetBytes() { return this.assetLoader.loadedByteEstimate(); }
  architectureMode() { return this.legacyEnabled ? "legacy" : "master"; }

  dispose() {
    this.assetLoader.dispose();
    disposeObject(this.scene);
  }
}
