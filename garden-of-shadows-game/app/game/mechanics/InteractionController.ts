import * as THREE from "three/webgpu";

export const INTERACTION_LAYER = 7;

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
}

export class InteractionController {
  private readonly raycaster = new THREE.Raycaster();
  private readonly registrations = new Map<string, RegisteredInteraction>();
  private focused?: InteractionFocus;

  constructor() {
    this.raycaster.layers.set(INTERACTION_LAYER);
  }

  register(definition: InteractableDefinition, root: THREE.Object3D): () => void {
    if (this.registrations.has(definition.id)) throw new Error(`Duplicate interactable: ${definition.id}`);
    root.traverse((object) => {
      object.layers.enable(INTERACTION_LAYER);
      object.userData.interactableId = definition.id;
    });
    this.registrations.set(definition.id, { definition, root, enabled: true });
    return () => this.unregister(definition.id);
  }

  unregister(id: string): void {
    const registration = this.registrations.get(id);
    if (!registration) return;
    registration.root.traverse((object) => {
      object.layers.disable(INTERACTION_LAYER);
      if (object.userData.interactableId === id) delete object.userData.interactableId;
    });
    this.registrations.delete(id);
    if (this.focused?.definition.id === id) this.focused = undefined;
  }

  setEnabled(id: string, enabled: boolean): void {
    const registration = this.registrations.get(id);
    if (!registration) return;
    registration.enabled = enabled;
    if (!enabled && this.focused?.definition.id === id) this.focused = undefined;
  }

  focus(camera: THREE.Camera): InteractionFocus | undefined {
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const roots = [...this.registrations.values()].map((registration) => registration.root);
    const intersections = this.raycaster.intersectObjects(roots, true);
    this.focused = undefined;
    for (const intersection of intersections) {
      const id = this.resolveId(intersection.object);
      if (!id) continue;
      const registration = this.registrations.get(id);
      if (!registration?.enabled || registration.definition.enabledWhen?.() === false) continue;
      if (intersection.distance > registration.definition.maxDistance) continue;
      this.focused = {
        definition: registration.definition,
        distance: intersection.distance,
        point: intersection.point.clone(),
      };
      registration.definition.onFocus?.();
      break;
    }
    return this.focused;
  }

  interact(): boolean {
    if (!this.focused) return false;
    this.focused.definition.onInteract();
    return true;
  }

  current(): InteractionFocus | undefined {
    return this.focused;
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

