import * as THREE from "three/webgpu";

export const INTERACTION_LAYER = 7;

export const INTERACTION_RANGE_CALIBRATION = {
  standardEvidence: 2.35,
  prologueEvidence: 2.15,
  npc: 2.4,
  viewpoint: 2.8,
  focusMultiplier: 1.7,
  standardProxyRadius: 0.72,
  npcProxyRadius: 0.78,
} as const;

export type InteractableType = "inspect" | "door" | "evidence" | "borrow" | "anchor" | "npc" | "document";

export interface InteractableDefinition {
  id: string;
  type: InteractableType;
  label: string;
  maxDistance: number;
  enabledWhen?: () => boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onInteract: () => void;
}

export interface InteractionFocus {
  definition: InteractableDefinition;
  distance: number;
  point: THREE.Vector3;
  canInteract: boolean;
}

interface RegisteredInteraction {
  definition: InteractableDefinition;
  root: THREE.Object3D;
  enabled: boolean;
  focusRoot?: THREE.Object3D;
  ownedProxy?: THREE.Mesh;
}

type CueMaterial = THREE.Material & {
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
};

interface MaterialCueSnapshot {
  material: CueMaterial;
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  opacity: number;
  transparent: boolean;
}

/**
 * Central interaction scanner.
 *
 * Formal assets register their real Object3D roots. Greybox / not-yet-modelled
 * evidence can register a point proxy, which keeps chapter logic testable without
 * inventing a visible placeholder model. Selection still happens through a
 * center-screen Raycaster on a dedicated interaction layer.
 */
export class InteractionController {
  private readonly raycaster = new THREE.Raycaster();
  private readonly registrations = new Map<string, RegisteredInteraction>();
  private cueSnapshots: MaterialCueSnapshot[] = [];
  private focused?: InteractionFocus;

  constructor() {
    this.raycaster.layers.set(INTERACTION_LAYER);
  }

  register(definition: InteractableDefinition, root: THREE.Object3D): () => void {
    return this.registerInternal(definition, root, undefined, root);
  }

  registerPoint(
    definition: InteractableDefinition,
    position: THREE.Vector3,
    radius = 0.62,
    focusRoot?: THREE.Object3D,
  ): () => void {
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 10, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    proxy.name = `InteractionProxy:${definition.id}`;
    proxy.position.copy(position);
    proxy.updateMatrixWorld(true);
    return this.registerInternal(definition, proxy, proxy, focusRoot);
  }

  private registerInternal(
    definition: InteractableDefinition,
    root: THREE.Object3D,
    ownedProxy?: THREE.Mesh,
    focusRoot?: THREE.Object3D,
  ): () => void {
    if (this.registrations.has(definition.id)) throw new Error(`Duplicate interactable: ${definition.id}`);
    root.traverse((object) => {
      object.layers.enable(INTERACTION_LAYER);
      object.userData.interactableId = definition.id;
    });
    this.registrations.set(definition.id, { definition, root, enabled: true, focusRoot, ownedProxy });
    return () => this.unregister(definition.id);
  }

  unregister(id: string): void {
    const registration = this.registrations.get(id);
    if (!registration) return;
    if (this.focused?.definition.id === id) this.transitionFocus(undefined);
    registration.root.traverse((object) => {
      object.layers.disable(INTERACTION_LAYER);
      if (object.userData.interactableId === id) delete object.userData.interactableId;
    });
    if (registration.ownedProxy) {
      registration.ownedProxy.geometry.dispose();
      const materials = Array.isArray(registration.ownedProxy.material) ? registration.ownedProxy.material : [registration.ownedProxy.material];
      materials.forEach((material) => material.dispose());
    }
    this.registrations.delete(id);
  }

  setEnabled(id: string, enabled: boolean): void {
    const registration = this.registrations.get(id);
    if (!registration) return;
    registration.enabled = enabled;
    if (!enabled && this.focused?.definition.id === id) this.transitionFocus(undefined);
  }

  focus(camera: THREE.Camera, interactionOrigin?: THREE.Vector3): InteractionFocus | undefined {
    camera.updateMatrixWorld(true);
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const roots = [...this.registrations.values()].map((registration) => {
      registration.root.updateMatrixWorld(true);
      return registration.root;
    });
    const intersections = this.raycaster.intersectObjects(roots, true);
    let nextFocus: InteractionFocus | undefined;
    for (const intersection of intersections) {
      const id = this.resolveId(intersection.object);
      if (!id) continue;
      const registration = this.registrations.get(id);
      if (!registration?.enabled || registration.definition.enabledWhen?.() === false) continue;
      const measuredDistance = interactionOrigin ? interactionOrigin.distanceTo(intersection.point) : intersection.distance;
      if (measuredDistance > registration.definition.maxDistance * INTERACTION_RANGE_CALIBRATION.focusMultiplier) continue;
      nextFocus = {
        definition: registration.definition,
        distance: measuredDistance,
        point: intersection.point.clone(),
        canInteract: measuredDistance <= registration.definition.maxDistance,
      };
      break;
    }
    this.transitionFocus(nextFocus);
    return this.focused;
  }

  interact(): boolean {
    if (!this.focused?.canInteract || this.focused.definition.enabledWhen?.() === false) return false;
    this.focused.definition.onInteract();
    return true;
  }

  current(): InteractionFocus | undefined {
    return this.focused;
  }

  clearFocus(): void {
    this.transitionFocus(undefined);
  }

  dispose(): void {
    this.transitionFocus(undefined);
    [...this.registrations.keys()].forEach((id) => this.unregister(id));
  }

  private transitionFocus(nextFocus: InteractionFocus | undefined): void {
    const previousId = this.focused?.definition.id;
    const nextId = nextFocus?.definition.id;
    if (previousId === nextId) {
      this.focused = nextFocus;
      return;
    }

    const previous = previousId ? this.registrations.get(previousId) : undefined;
    this.restoreFocusCue();
    previous?.definition.onBlur?.();
    this.focused = nextFocus;

    if (!nextId) return;
    const next = this.registrations.get(nextId);
    if (!next) return;
    this.applyFocusCue(nextId, next.focusRoot);
    next.definition.onFocus?.();
  }

  private applyFocusCue(id: string, focusRoot?: THREE.Object3D): void {
    if (!focusRoot || !focusRoot.visible) return;
    const materials = new Set<CueMaterial>();
    focusRoot.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points)) return;
      const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
      objectMaterials.forEach((material) => materials.add(material as CueMaterial));
    });

    const warmCue = new THREE.Color("#d0ad72");
    this.cueSnapshots = [...materials].map((material) => ({
      material,
      color: material.color?.clone(),
      emissive: material.emissive?.clone(),
      emissiveIntensity: material.emissiveIntensity,
      opacity: material.opacity,
      transparent: material.transparent,
    }));
    this.cueSnapshots.forEach(({ material }) => {
      if (material.emissive) {
        material.emissive.lerp(warmCue, 0.34);
        material.emissiveIntensity = Math.max((material.emissiveIntensity ?? 0) + 0.22, 0.22);
      } else if (material.color) {
        material.color.lerp(warmCue, 0.16);
      }
      if (material.transparent && material.opacity < 0.92) material.opacity = Math.min(0.92, material.opacity + 0.14);
      material.needsUpdate = true;
    });
  }

  private restoreFocusCue(): void {
    this.cueSnapshots.forEach((snapshot) => {
      snapshot.material.color?.copy(snapshot.color ?? snapshot.material.color);
      snapshot.material.emissive?.copy(snapshot.emissive ?? snapshot.material.emissive);
      if (snapshot.emissiveIntensity !== undefined) snapshot.material.emissiveIntensity = snapshot.emissiveIntensity;
      snapshot.material.opacity = snapshot.opacity;
      snapshot.material.transparent = snapshot.transparent;
      snapshot.material.needsUpdate = true;
    });
    this.cueSnapshots = [];
  }

  private resolveId(object: THREE.Object3D): string | undefined {
    let candidate: THREE.Object3D | null = object;
    while (candidate) {
      if (typeof candidate.userData.interactableId === "string") return candidate.userData.interactableId;
      candidate = candidate.parent;
    }
    return undefined;
  }
}
