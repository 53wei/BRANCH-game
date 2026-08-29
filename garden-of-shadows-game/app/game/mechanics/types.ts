export const COGNITION_IDS = ["protagonist", "wife", "gardener", "accountant", "artist"] as const;

export type CognitionId = (typeof COGNITION_IDS)[number];
export type Vec3Tuple = readonly [number, number, number];
export type EvidenceChannel = "space" | "object" | "document" | "image" | "testimony" | "audio";

export interface CognitionObjectState {
  visible?: boolean;
  position?: Vec3Tuple;
  rotation?: Vec3Tuple;
  scale?: Vec3Tuple;
  materialVariant?: string;
  colliderEnabled?: boolean;
  interactionEnabled?: boolean;
  lightPreset?: string;
  audioPreset?: string;
}

export interface CognitionObjectDefinition {
  id: string;
  baseAssetId?: string;
  defaultState?: CognitionObjectState;
  states: Partial<Record<CognitionId, CognitionObjectState>>;
  borrowable?: BorrowableConfig;
  reconstructionTags?: string[];
}

export interface BorrowableConfig {
  id: string;
  sourceCognition: CognitionId;
  runtimePrefabId: string;
  collisionPrefabId: string;
  allowedTargetAnchors: string[];
}

export interface BorrowedObjectState {
  borrowedObjectId: string;
  sourceCognition: CognitionId;
  runtimePrefabId: string;
  collisionPrefabId: string;
  targetAnchorId: string;
  anchored: boolean;
}

export interface AnchorSlot {
  borrowedObjectId: string | null;
  sourceCognition?: CognitionId;
  targetAnchorId?: string;
}

export interface EvidenceInterpretation {
  id: string;
  unlockCondition?: string;
  text: string;
}

export interface EvidenceDefinition {
  id: string;
  channel: EvidenceChannel;
  observableFacts: readonly string[];
  narrativeTags: readonly string[];
  interpretations: readonly EvidenceInterpretation[];
}

export interface NarrativeGateDefinition {
  id: string;
  requiredAll?: readonly string[];
  requiredAny?: readonly (readonly string[])[];
  minEvidenceChannels?: number;
  evidenceScope?: readonly string[];
  unlockBeat: string;
}

export type PuzzleResetPolicy = "manual" | "checkpoint" | "never";

export interface PuzzleSolution {
  id: string;
  requiredTokens: readonly string[];
  worldStateId: string;
}

export interface PuzzleDefinition {
  id: string;
  inputs: readonly string[];
  worldStates: readonly string[];
  solutions: readonly PuzzleSolution[];
  evidenceRewards: readonly string[];
  resetPolicy: PuzzleResetPolicy;
}

export interface PuzzleRuntimeState {
  tokens: string[];
  solutionId?: string;
  worldStateId?: string;
  solved: boolean;
}

export interface MechanicSaveState {
  currentCognition: CognitionId;
  discoveredEvidence: string[];
  unlockedInterpretations: string[];
  puzzleStates: Record<string, PuzzleRuntimeState>;
  anchorSlot: AnchorSlot;
  borrowedObject?: BorrowedObjectState;
  openedDoors: string[];
  narrativeGates: string[];
  chapterBeat?: string;
  safeAnchorId?: string;
}

export const createDefaultMechanicSaveState = (): MechanicSaveState => ({
  currentCognition: "protagonist",
  discoveredEvidence: [],
  unlockedInterpretations: [],
  puzzleStates: {},
  anchorSlot: { borrowedObjectId: null },
  openedDoors: [],
  narrativeGates: [],
});

