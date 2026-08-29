import type { AnchorSlot, BorrowableConfig, BorrowedObjectState, CognitionId, MechanicSaveState } from "./types";

export interface BorrowRuntimeBindings {
  createBorrowedObject(state: Readonly<BorrowedObjectState>): void;
  destroyBorrowedObject(objectId: string): void;
  setBorrowedObjectAnchored(objectId: string, anchored: boolean): void;
}

export class BorrowAnchorController {
  private readonly configs = new Map<string, BorrowableConfig>();
  private borrowed?: BorrowedObjectState;
  private slot: AnchorSlot = { borrowedObjectId: null };

  constructor(configs: readonly BorrowableConfig[], private readonly bindings: BorrowRuntimeBindings) {
    configs.forEach((config) => {
      if (this.configs.has(config.id)) throw new Error(`Duplicate borrowable: ${config.id}`);
      this.configs.set(config.id, config);
    });
  }

  get borrowedObject(): Readonly<BorrowedObjectState> | undefined {
    return this.borrowed ? { ...this.borrowed } : undefined;
  }

  get anchorSlot(): Readonly<AnchorSlot> {
    return { ...this.slot };
  }

  borrow(borrowableId: string, cognition: CognitionId, targetAnchorId: string): Readonly<BorrowedObjectState> {
    const config = this.configs.get(borrowableId);
    if (!config) throw new Error(`Unknown borrowable: ${borrowableId}`);
    if (config.sourceCognition !== cognition) throw new Error(`${borrowableId} is not present in ${cognition}`);
    if (!config.allowedTargetAnchors.includes(targetAnchorId)) throw new Error(`Anchor ${targetAnchorId} does not accept ${borrowableId}`);
    if (this.borrowed) this.destroyCurrent();
    this.borrowed = {
      borrowedObjectId: config.id,
      sourceCognition: config.sourceCognition,
      runtimePrefabId: config.runtimePrefabId,
      collisionPrefabId: config.collisionPrefabId,
      targetAnchorId,
      anchored: false,
    };
    this.bindings.createBorrowedObject(this.borrowed);
    return { ...this.borrowed };
  }

  anchor(): Readonly<AnchorSlot> {
    if (!this.borrowed) throw new Error("Nothing has been borrowed");
    if (this.slot.borrowedObjectId && this.slot.borrowedObjectId !== this.borrowed.borrowedObjectId) {
      throw new Error("The single anchor slot is occupied");
    }
    this.borrowed.anchored = true;
    this.slot = {
      borrowedObjectId: this.borrowed.borrowedObjectId,
      sourceCognition: this.borrowed.sourceCognition,
      targetAnchorId: this.borrowed.targetAnchorId,
    };
    this.bindings.setBorrowedObjectAnchored(this.borrowed.borrowedObjectId, true);
    return { ...this.slot };
  }

  unanchor(): void {
    if (!this.borrowed || !this.slot.borrowedObjectId) return;
    this.borrowed.anchored = false;
    this.bindings.setBorrowedObjectAnchored(this.borrowed.borrowedObjectId, false);
    this.slot = { borrowedObjectId: null };
  }

  onCognitionSwitch(): void {
    if (this.borrowed && !this.borrowed.anchored) this.destroyCurrent();
  }

  reset(): void {
    this.destroyCurrent();
    this.slot = { borrowedObjectId: null };
  }

  restore(state: Pick<MechanicSaveState, "borrowedObject" | "anchorSlot">): void {
    this.reset();
    if (!state.borrowedObject?.anchored || !state.anchorSlot.borrowedObjectId) return;
    if (!this.configs.has(state.borrowedObject.borrowedObjectId)) return;
    this.borrowed = { ...state.borrowedObject, anchored: true };
    this.slot = { ...state.anchorSlot };
    this.bindings.createBorrowedObject(this.borrowed);
    this.bindings.setBorrowedObjectAnchored(this.borrowed.borrowedObjectId, true);
  }

  serialize(): Pick<MechanicSaveState, "borrowedObject" | "anchorSlot"> {
    return {
      borrowedObject: this.borrowed ? { ...this.borrowed } : undefined,
      anchorSlot: { ...this.slot },
    };
  }

  private destroyCurrent(): void {
    if (this.borrowed) this.bindings.destroyBorrowedObject(this.borrowed.borrowedObjectId);
    this.borrowed = undefined;
    this.slot = { borrowedObjectId: null };
  }
}

