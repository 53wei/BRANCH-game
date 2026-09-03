import type { MemoryId } from "../types";
import {
  COGNITION_IDS,
  createDefaultMechanicSaveState,
  type BorrowedObjectState,
  type CognitionId,
  type MechanicSaveState,
  type PuzzleRuntimeState,
} from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const strings = (value: unknown): string[] => Array.isArray(value)
  ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
  : [];
const cognition = (value: unknown, fallback: CognitionId): CognitionId =>
  typeof value === "string" && COGNITION_IDS.includes(value as CognitionId) ? value as CognitionId : fallback;

const COGNITION_BY_MEMORY: Record<MemoryId, CognitionId> = {
  baseline: "protagonist",
  zhaoying: "protagonist",
  wife: "wife",
  gardener: "gardener",
  accountant: "accountant",
  painter: "artist",
};

export const cognitionForMemory = (memoryId: MemoryId): CognitionId => COGNITION_BY_MEMORY[memoryId];

const normalizePuzzleStates = (value: unknown): Record<string, PuzzleRuntimeState> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([id, candidate]) => {
    if (!isRecord(candidate)) return [];
    const solutionId = typeof candidate.solutionId === "string" ? candidate.solutionId : undefined;
    const worldStateId = typeof candidate.worldStateId === "string" ? candidate.worldStateId : undefined;
    return [[id, {
      tokens: strings(candidate.tokens),
      solutionId,
      worldStateId,
      solved: candidate.solved === true || Boolean(solutionId),
    } satisfies PuzzleRuntimeState]];
  }));
};

const normalizeBorrowedObject = (value: unknown): BorrowedObjectState | undefined => {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.borrowedObjectId !== "string"
    || typeof value.runtimePrefabId !== "string"
    || typeof value.collisionPrefabId !== "string"
    || typeof value.targetAnchorId !== "string"
  ) return undefined;
  return {
    borrowedObjectId: value.borrowedObjectId,
    sourceCognition: cognition(value.sourceCognition, "protagonist"),
    runtimePrefabId: value.runtimePrefabId,
    collisionPrefabId: value.collisionPrefabId,
    targetAnchorId: value.targetAnchorId,
    anchored: value.anchored === true,
  };
};

export const normalizeMechanicSaveState = (value: unknown, fallbackCognition: CognitionId): MechanicSaveState => {
  const base = createDefaultMechanicSaveState();
  if (!isRecord(value)) return { ...base, currentCognition: fallbackCognition };
  const rawAnchor = isRecord(value.anchorSlot) ? value.anchorSlot : {};
  const borrowedObject = normalizeBorrowedObject(value.borrowedObject);
  const borrowedObjectId = typeof rawAnchor.borrowedObjectId === "string" ? rawAnchor.borrowedObjectId : null;
  return {
    currentCognition: cognition(value.currentCognition, fallbackCognition),
    discoveredEvidence: strings(value.discoveredEvidence),
    unlockedInterpretations: strings(value.unlockedInterpretations),
    puzzleStates: normalizePuzzleStates(value.puzzleStates),
    anchorSlot: {
      borrowedObjectId,
      sourceCognition: rawAnchor.sourceCognition === undefined ? undefined : cognition(rawAnchor.sourceCognition, fallbackCognition),
      targetAnchorId: typeof rawAnchor.targetAnchorId === "string" ? rawAnchor.targetAnchorId : undefined,
    },
    borrowedObject,
    openedDoors: strings(value.openedDoors),
    narrativeGates: strings(value.narrativeGates),
    chapterBeat: typeof value.chapterBeat === "string" ? value.chapterBeat : undefined,
    safeAnchorId: typeof value.safeAnchorId === "string" ? value.safeAnchorId : undefined,
  };
};
