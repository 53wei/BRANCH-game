import { COGNITION_IDS, type CognitionId, type CognitionObjectDefinition, type CognitionObjectState } from "./types";

export interface CognitionBindings {
  applyObjectState(objectId: string, state: Readonly<CognitionObjectState>, cognition: CognitionId): void;
  applyColliderState?(objectId: string, enabled: boolean): void;
  applyInteractionState?(objectId: string, enabled: boolean): void;
  applyLightPreset?(preset: string | undefined, cognition: CognitionId): void;
  applyAudioPreset?(preset: string | undefined, cognition: CognitionId): void;
}

export interface CognitionTransition {
  from: CognitionId;
  to: CognitionId;
  appliedObjectIds: string[];
}

const mergeState = (definition: CognitionObjectDefinition, cognition: CognitionId): CognitionObjectState => ({
  visible: true,
  colliderEnabled: true,
  interactionEnabled: false,
  ...definition.defaultState,
  ...definition.states[cognition],
});

export class CognitionController {
  private currentValue: CognitionId;
  private readonly objects = new Map<string, CognitionObjectDefinition>();
  private readonly listeners = new Set<(transition: CognitionTransition) => void>();

  constructor(
    initial: CognitionId,
    definitions: readonly CognitionObjectDefinition[],
    private readonly bindings: CognitionBindings,
  ) {
    if (!COGNITION_IDS.includes(initial)) throw new Error(`Unsupported cognition: ${initial}`);
    definitions.forEach((definition) => {
      if (this.objects.has(definition.id)) throw new Error(`Duplicate cognition object: ${definition.id}`);
      this.objects.set(definition.id, definition);
    });
    this.currentValue = initial;
    this.apply(initial);
  }

  get current(): CognitionId {
    return this.currentValue;
  }

  stateFor(objectId: string, cognition = this.currentValue): Readonly<CognitionObjectState> {
    const definition = this.objects.get(objectId);
    if (!definition) throw new Error(`Unknown cognition object: ${objectId}`);
    return mergeState(definition, cognition);
  }

  setCognition(next: CognitionId): CognitionTransition {
    if (!COGNITION_IDS.includes(next)) throw new Error(`Unsupported cognition: ${next}`);
    const from = this.currentValue;
    this.currentValue = next;
    const transition = { from, to: next, appliedObjectIds: this.apply(next) };
    this.listeners.forEach((listener) => listener(transition));
    return transition;
  }

  reset(cognition: CognitionId): CognitionTransition {
    return this.setCognition(cognition);
  }

  subscribe(listener: (transition: CognitionTransition) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private apply(cognition: CognitionId): string[] {
    const appliedObjectIds: string[] = [];
    let lightPreset: string | undefined;
    let audioPreset: string | undefined;
    this.objects.forEach((definition) => {
      const state = mergeState(definition, cognition);
      this.bindings.applyObjectState(definition.id, state, cognition);
      this.bindings.applyColliderState?.(definition.id, state.colliderEnabled !== false);
      this.bindings.applyInteractionState?.(definition.id, state.interactionEnabled === true);
      lightPreset = state.lightPreset ?? lightPreset;
      audioPreset = state.audioPreset ?? audioPreset;
      appliedObjectIds.push(definition.id);
    });
    this.bindings.applyLightPreset?.(lightPreset, cognition);
    this.bindings.applyAudioPreset?.(audioPreset, cognition);
    return appliedObjectIds;
  }
}

