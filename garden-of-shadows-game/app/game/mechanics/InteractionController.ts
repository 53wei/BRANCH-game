import * as THREE from "three/webgpu";

export const INTERACTION_LAYER = 7;

export const INTERACTION_RANGE_CALIBRATION = {
  standardEvidence: 2.35,
  prologueEvidence: 2.15,
  npc: 2.4,
  viewpoint: 2.8,
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
  onInteract: () => void;
}

export interface InteractionFocus {
  definition: InteractableDefinition;
  distance: number;
  point: THREE.Vector3;
}

interface RegisteredInteraction {
  definition: InteractableDefinition;
  root: THREE.Object3D;
  enabled: boolean;
  ownedProxy?: THREE.Mesh;
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
  private focused?: InteractionFocus;

  constructor() {
    this.raycaster.layers.set(INTERACTION_LAYER);
  }

  register(definition: InteractableDefinition, root: THREE.Object3D): () => void {
    return this.registerInternal(definition, root);
  }

  registerPoint(definition: InteractableDefinition, position: THREE.Vector3, radius = 0.62): () => void {
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 10, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    proxy.name = `InteractionProxy:${definition.id}`;
    proxy.position.copy(position);
    proxy.updateMatrixWorld(true);
    return this.registerInternal(definition, proxy, proxy);
  }

  private registerInternal(definition: InteractableDefinition, root: THREE.Object3D, ownedProxy?: THREE.Mesh): () => void {
    if (this.registrations.has(definition.id)) throw new Error(`Duplicate interactable: ${definition.id}`);
    root.traverse((object) => {
      object.layers.enable(INTERACTION_LAYER);
      object.userData.interactableId = definition.id;
    });
    this.registrations.set(definition.id, { definition, root, enabled: true, ownedProxy });
    return () => this.unregister(definition.id);
  }

  unregister(id: string): void {
    const registration = this.registrations.get(id);
    if (!registration) return;
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
    if (this.focused?.definition.id === id) this.focused = undefined;
  }

  setEnabled(id: string, enabled: boolean): void {
    const registration = this.registrations.get(id);
    if (!registration) return;
    registration.enabled = enabled;
    if (!enabled && this.focused?.definition.id === id) this.focused = undefined;
  }

  focus(camera: THREE.Camera, interactionOrigin?: THREE.Vector3): InteractionFocus | undefined {
    camera.updateMatrixWorld(true);
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const roots = [...this.registrations.values()].map((registration) => {
      registration.root.updateMatrixWorld(true);
      return registration.root;
    });
    const intersections = this.raycaster.intersectObjects(roots, true);
    this.focused = undefined;
    for (const intersection of intersections) {
      const id = this.resolveId(intersection.object);
      if (!id) continue;
      const registration = this.registrations.get(id);
      if (!registration?.enabled || registration.definition.enabledWhen?.() === false) continue;
      const measuredDistance = interactionOrigin ? interactionOrigin.distanceTo(intersection.point) : intersection.distance;
      if (measuredDistance > registration.definition.maxDistance) continue;
      this.focused = {
        definition: registration.definition,
        distance: measuredDistance,
        point: intersection.point.clone(),
      };
      registration.definition.onFocus?.();
      break;
    }
    return this.focused;
  }

  interact(): boolean {
    if (!this.focused || this.focused.definition.enabledWhen?.() === false) return false;
    this.focused.definition.onInteract();
    return true;
  }

  current(): InteractionFocus | undefined {
    return this.focused;
  }

  clearFocus(): void {
    this.focused = undefined;
  }

  dispose(): void {
    [...this.registrations.keys()].forEach((id) => this.unregister(id));
    this.focused = undefined;
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
