import * as THREE from "three/webgpu";

export type CharacterAnimationStateId = "idle" | "walk" | "run" | "inspect" | "interact";

export class CharacterAnimationState {
  private readonly actions = new Map<CharacterAnimationStateId, THREE.AnimationAction>();
  private active?: CharacterAnimationStateId;

  constructor(private readonly mixer: THREE.AnimationMixer, clips: Partial<Record<CharacterAnimationStateId, THREE.AnimationClip>>) {
    (Object.entries(clips) as Array<[CharacterAnimationStateId, THREE.AnimationClip]>).forEach(([id, clip]) => {
      this.actions.set(id, mixer.clipAction(clip));
    });
  }

  play(next: CharacterAnimationStateId, fadeSeconds = 0.18): boolean {
    if (next === this.active) return false;
    const nextAction = this.actions.get(next);
    if (!nextAction) return false;
    const previousAction = this.active ? this.actions.get(this.active) : undefined;
    previousAction?.fadeOut(fadeSeconds);
    nextAction.reset().fadeIn(fadeSeconds).play();
    this.active = next;
    return true;
  }

  update(deltaSeconds: number): void {
    this.mixer.update(deltaSeconds);
  }

  dispose(): void {
    this.mixer.stopAllAction();
  }
}

