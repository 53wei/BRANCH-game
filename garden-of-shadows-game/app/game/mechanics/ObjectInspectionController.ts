import * as THREE from "three/webgpu";

export type InspectionObjectKind = "shoe" | "umbrella" | "key" | "box" | "stone" | "evidence";

export interface InspectionHotspotDefinition {
  id: string;
  label: string;
  fact: string;
  /** Local-space outward direction that must face the player before the detail can be recorded. */
  localDirection: readonly [number, number, number];
  facingThreshold?: number;
}

export interface ObjectInspectionDefinition {
  id: string;
  kind: InspectionObjectKind;
  title: string;
  source: THREE.Object3D;
  hotspots?: readonly InspectionHotspotDefinition[];
  initialRotation?: readonly [number, number, number];
  hideWorldSource?: boolean;
  onObserve?: (hotspot: InspectionHotspotDefinition) => void;
}

export interface ObjectInspectionSnapshot {
  id: string;
  kind: InspectionObjectKind;
  title: string;
  zoom: number;
  activeHotspot?: InspectionHotspotDefinition;
  hotspots: readonly InspectionHotspotDefinition[];
  observedHotspotIds: readonly string[];
  complete: boolean;
}

const cloneInspectionMaterials = (root: THREE.Object3D) => {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points)) return;
    const original = Array.isArray(object.material) ? object.material : [object.material];
    const cloned = original.map((material) => {
      const copy = material.clone();
      copy.depthTest = false;
      copy.depthWrite = false;
      return copy;
    });
    object.material = Array.isArray(object.material) ? cloned : cloned[0];
    object.renderOrder = 1001;
  });
};

const disposeInspectionMaterials = (root: THREE.Object3D) => {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose());
  });
};

/**
 * Places a material-safe clone in front of the existing investigation camera.
 * The world camera never teleports, so closing the view restores the exact pose.
 */
export class ObjectInspectionController {
  private readonly stage = new THREE.Group();
  private readonly pivot = new THREE.Group();
  private definition?: ObjectInspectionDefinition;
  private clone?: THREE.Object3D;
  private sourceWasVisible = true;
  private baseScale = 1;
  private zoomValue = 1;
  private readonly observed = new Set<string>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
  ) {
    this.stage.name = "ObjectInspection_CameraStage";
    this.pivot.name = "ObjectInspection_ObjectPivot";
    this.stage.position.set(0, -0.02, -1.42);
    this.stage.add(this.pivot);
    const key = new THREE.DirectionalLight("#f0d8aa", 2.35);
    key.position.set(-1.4, 1.6, 2.4);
    const fill = new THREE.AmbientLight("#789087", 1.65);
    this.stage.add(key, fill);
  }

  get active(): boolean {
    return Boolean(this.definition);
  }

  open(definition: ObjectInspectionDefinition): ObjectInspectionSnapshot {
    this.close();
    if (!this.camera.parent) this.scene.add(this.camera);
    this.definition = definition;
    this.observed.clear();
    this.zoomValue = 1;

    const clone = definition.source.clone(true);
    clone.name = `InspectionClone:${definition.id}`;
    clone.visible = true;
    clone.position.set(0, 0, 0);
    clone.rotation.set(0, 0, 0);
    clone.scale.set(1, 1, 1);
    cloneInspectionMaterials(clone);
    clone.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const largestAxis = Math.max(size.x, size.y, size.z, 0.001);
    this.baseScale = 0.82 / largestAxis;
    clone.position.copy(center).multiplyScalar(-1);
    this.clone = clone;
    this.pivot.rotation.set(...(definition.initialRotation ?? [0, 0, 0]));
    this.pivot.scale.setScalar(this.baseScale);
    this.pivot.add(clone);
    this.camera.add(this.stage);

    this.sourceWasVisible = definition.source.visible;
    if (definition.hideWorldSource !== false) definition.source.visible = false;
    return this.snapshot();
  }

  rotate(deltaYaw: number, deltaPitch: number): ObjectInspectionSnapshot | undefined {
    if (!this.definition) return undefined;
    this.pivot.rotation.y += deltaYaw;
    this.pivot.rotation.x = THREE.MathUtils.clamp(this.pivot.rotation.x + deltaPitch, -1.08, 1.08);
    return this.snapshot();
  }

  zoomBy(delta: number): ObjectInspectionSnapshot | undefined {
    if (!this.definition) return undefined;
    this.zoomValue = THREE.MathUtils.clamp(this.zoomValue + delta, 0.72, 1.55);
    this.pivot.scale.setScalar(this.baseScale * this.zoomValue);
    return this.snapshot();
  }

  observeActiveHotspot(): InspectionHotspotDefinition | undefined {
    const hotspot = this.resolveActiveHotspot();
    if (!hotspot || this.observed.has(hotspot.id)) return undefined;
    this.observed.add(hotspot.id);
    this.definition?.onObserve?.(hotspot);
    return hotspot;
  }

  snapshot(): ObjectInspectionSnapshot {
    if (!this.definition) throw new Error("No object is being inspected.");
    const hotspots = this.definition.hotspots ?? [];
    return {
      id: this.definition.id,
      kind: this.definition.kind,
      title: this.definition.title,
      zoom: this.zoomValue,
      activeHotspot: this.resolveActiveHotspot(),
      hotspots,
      observedHotspotIds: [...this.observed],
      complete: hotspots.every((hotspot) => this.observed.has(hotspot.id)),
    };
  }

  close(): void {
    if (this.definition && this.definition.hideWorldSource !== false) {
      this.definition.source.visible = this.sourceWasVisible;
    }
    if (this.clone) {
      this.pivot.remove(this.clone);
      disposeInspectionMaterials(this.clone);
    }
    this.camera.remove(this.stage);
    this.clone = undefined;
    this.definition = undefined;
    this.observed.clear();
    this.zoomValue = 1;
  }

  dispose(): void {
    this.close();
  }

  private resolveActiveHotspot(): InspectionHotspotDefinition | undefined {
    if (!this.definition) return undefined;
    const rotation = new THREE.Quaternion().setFromEuler(this.pivot.rotation);
    const towardCamera = new THREE.Vector3(0, 0, 1);
    return (this.definition.hotspots ?? [])
      .filter((hotspot) => !this.observed.has(hotspot.id))
      .map((hotspot) => ({
        hotspot,
        facing: new THREE.Vector3(...hotspot.localDirection).normalize().applyQuaternion(rotation).dot(towardCamera),
      }))
      .filter(({ hotspot, facing }) => facing >= (hotspot.facingThreshold ?? 0.82))
      .sort((a, b) => b.facing - a.facing)[0]?.hotspot;
  }
}
