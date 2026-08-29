import type {
  CognitionId,
  EvidenceDefinition,
  MechanicSaveState,
  NarrativeGateDefinition,
  PuzzleDefinition,
  BorrowableConfig,
  CognitionObjectDefinition,
  AnchorSlot,
  BorrowedObjectState,
} from "./types";
import { createDefaultMechanicSaveState } from "./types";
import { CognitionController, type CognitionBindings, type CognitionTransition as ControllerTransition } from "./CognitionController";
import { BorrowAnchorController, type BorrowRuntimeBindings } from "./BorrowAnchorController";
import { LoopController, type LoopLink, type LoopPose } from "./LoopController";
import { EvidenceLedger } from "./EvidenceLedger";
import { NarrativeGateController } from "./NarrativeGateController";
import { PuzzleController } from "./PuzzleController";

// ─── V4.1 ReconstructionProfile ───────────────────────────────────────────────

export interface ReconstructionProfile {
  cognitionUsage: Record<CognitionId, number>;
  borrowSources: Record<CognitionId, string[]>;
  anchoredSources: Record<CognitionId, string[]>;
  evidenceDiscoveryOrder: string[];
  evidenceChannelWeights: Partial<Record<string, number>>;
  reconstructionTags: string[];
}

const emptyProfile = (): ReconstructionProfile => {
  const cognitionUsage: Record<CognitionId, number> = { protagonist: 0, wife: 0, gardener: 0, accountant: 0, artist: 0 };
  const borrowSources: Record<CognitionId, string[]> = { protagonist: [], wife: [], gardener: [], accountant: [], artist: [] };
  const anchoredSources: Record<CognitionId, string[]> = { protagonist: [], wife: [], gardener: [], accountant: [], artist: [] };
  return { cognitionUsage, borrowSources, anchoredSources, evidenceDiscoveryOrder: [], evidenceChannelWeights: {}, reconstructionTags: [] };
};

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export interface MechanicsBindings {
  cognition: CognitionBindings;
  borrow: BorrowRuntimeBindings;
  applyCognitionVisual(cognition: CognitionId): void;
  restoreCognition(): void;
}

export interface MechanicsOrchestratorOptions {
  cognitionObjects: readonly CognitionObjectDefinition[];
  borrowables: readonly BorrowableConfig[];
  puzzles: readonly PuzzleDefinition[];
  evidence: readonly EvidenceDefinition[];
  narrativeGates: readonly NarrativeGateDefinition[];
  saved?: Pick<MechanicSaveState, "currentCognition" | "discoveredEvidence" | "unlockedInterpretations" | "puzzleStates" | "anchorSlot" | "borrowedObject" | "openedDoors" | "narrativeGates" | "chapterBeat" | "safeAnchorId">;
}

export class MechanicsOrchestrator {
  readonly cognition: CognitionController;
  readonly borrow: BorrowAnchorController;
  readonly loop: LoopController;
  readonly evidence: EvidenceLedger;
  readonly narrativeGate: NarrativeGateController;
  readonly puzzle: PuzzleController;
  readonly profile: ReconstructionProfile;

  private readonly bindings: MechanicsBindings;

  constructor(options: MechanicsOrchestratorOptions, bindings: MechanicsBindings) {
    this.bindings = bindings;
    this.cognition = new CognitionController(
      options.saved?.currentCognition ?? "protagonist",
      options.cognitionObjects,
      bindings.cognition,
    );
    this.borrow = new BorrowAnchorController(options.borrowables, bindings.borrow);
    this.loop = new LoopController();
    this.evidence = new EvidenceLedger(options.evidence, options.saved);
    this.narrativeGate = new NarrativeGateController(options.narrativeGates, options.saved);
    this.puzzle = new PuzzleController(options.puzzles, options.saved);
    this.profile = emptyProfile();

    // Restore saved state
    if (options.saved) {
      this.borrow.restore(options.saved);
      this.profile = emptyProfile(); // Profile is session-only; not persisted yet
    }

    // Listen for cognition changes to update profile
    this.cognition.subscribe((transition: ControllerTransition) => {
      this.profile.cognitionUsage[transition.to] = (this.profile.cognitionUsage[transition.to] ?? 0) + 1;
    });
  }

  // ─── Cognition ────────────────────────────────────────────────────────────

  get currentCognition(): CognitionId {
    return this.cognition.current;
  }

  switchCognition(next: CognitionId): ControllerTransition {
    // Borrowed objects are destroyed if not anchored (handled by BorrowAnchorController)
    this.borrow.onCognitionSwitch();
    const transition = this.cognition.setCognition(next);
    this.bindings.applyCognitionVisual(next);
    return transition;
  }

  // ─── Borrow ──────────────────────────────────────────────────────────────

  executeBorrow(borrowableId: string, targetAnchorId: string): Readonly<BorrowedObjectState> {
    const state = this.borrow.borrow(borrowableId, this.currentCognition, targetAnchorId);
    this.profile.borrowSources[this.currentCognition].push(borrowableId);
    return state;
  }

  anchor(): Readonly<AnchorSlot> {
    const slot = this.borrow.anchor();
    if (slot.borrowedObjectId && slot.sourceCognition) {
      this.profile.anchoredSources[slot.sourceCognition].push(slot.borrowedObjectId);
      this.profile.reconstructionTags.push(`anchored:${slot.sourceCognition}:${slot.borrowedObjectId}`);
    }
    return slot;
  }

  unanchor(): void {
    this.borrow.unanchor();
  }

  get borrowedObject(): Readonly<BorrowedObjectState> | undefined {
    return this.borrow.borrowedObject;
  }

  get anchorSlot(): Readonly<AnchorSlot> {
    return this.borrow.anchorSlot;
  }

  // ─── Loop ────────────────────────────────────────────────────────────────

  checkLoop(): boolean {
    // Loop links are resolved from layout; here we just check cooldown.
    // The actual link config should be provided by the layout system.
    return true;
  }

  canTraverse(link: LoopLink, pose: LoopPose, exitPosition: [number, number, number], nowMs: number): LoopPose | undefined {
    return this.loop.traverse(link, pose, exitPosition, nowMs);
  }

  // ─── Evidence ────────────────────────────────────────────────────────────

  discoverEvidence(id: string, channels: string[]): boolean {
    const isNew = this.evidence.discover(id);
    if (isNew) {
      this.profile.evidenceDiscoveryOrder.push(id);
      for (const channel of channels) {
        this.profile.evidenceChannelWeights[channel] = (this.profile.evidenceChannelWeights[channel] ?? 0) + 1;
      }
    }
    return isNew;
  }

  unlockEvidenceInterpretations(contextKeys: ReadonlySet<string>): string[] {
    return this.evidence.unlockAvailable(contextKeys);
  }

  hasEvidence(id: string): boolean {
    return this.evidence.has(id);
  }

  getDiscoveredEvidence(): EvidenceDefinition[] {
    return this.evidence.discoveredDefinitions();
  }

  // ─── Narrative Gate ──────────────────────────────────────────────────────

  evaluateNarrativeGates(earnedFlags: string[]): string[] {
    const context = {
      keys: new Set(earnedFlags),
      discoveredEvidence: this.evidence.discoveredDefinitions(),
    };
    const unlocked = this.narrativeGate.evaluate(context);
    return unlocked.map((g) => g.id);
  }

  hasNarrativeGate(id: string): boolean {
    return this.narrativeGate.has(id);
  }

  // ─── Puzzle ──────────────────────────────────────────────────────────────

  recordPuzzleToken(puzzleId: string, token: string) {
    return this.puzzle.recordToken(puzzleId, token);
  }

  getPuzzleState(puzzleId: string) {
    return this.puzzle.state(puzzleId);
  }

  resetPuzzle(puzzleId: string, reason: "manual" | "checkpoint") {
    return this.puzzle.reset(puzzleId, reason);
  }

  // ─── Serialization ──────────────────────────────────────────────────────

  serializeMechanicState(): MechanicSaveState {
    return {
      ...createDefaultMechanicSaveState(),
      currentCognition: this.cognition.current,
      ...this.evidence.serialize(),
      ...this.puzzle.serialize(),
      ...this.borrow.serialize(),
      ...this.narrativeGate.serialize(),
    };
  }
}
