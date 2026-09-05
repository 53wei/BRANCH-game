import { ENDING_IDS, MEMORY_IDS, type CampaignSave, type CheckpointState, type EndingId, type GameSettings, type MemoryId } from "./types";
import { createDefaultMechanicSaveState } from "./mechanics/types";
import { cognitionForMemory, normalizeMechanicSaveState } from "./mechanics/save";
import { TINGYUXUAN_LAYOUT_VERSION } from "./runtime/tingyuxuan-layout";

export const SAVE_KEY = "garden-of-shadows.save.v3";

export const DEFAULT_SETTINGS: GameSettings = {
  quality: "high",
  renderer: "auto",
  stableCamera: false,
  subtitles: true,
  guidanceAssist: true,
  masterVolume: 0.8,
  dialogueSpeed: "normal",
  textScale: "normal",
};

const CHAPTER_ANCHORS: Readonly<Record<string, string>> = {
  "prologue-rain": "ROUTE_01_START",
  "west-corridor-loop": "ROUTE_02_A_ENTRY",
  "north-tower-ledger": "ROUTE_05_B_MAIN_COURT",
  "missing-room": "ROUTE_06_B_NORTHEAST_LINK",
  "deleted-person": "B_CHILD_BOX",
  "you-did-not-return": "ROUTE_04_A_EAST_EXIT",
  "fifth-tingyuxuan": "ROUTE_01_START",
};

const defaultAnchorForChapter = (chapterId: string): string => {
  const anchorId = CHAPTER_ANCHORS[chapterId];
  if (!anchorId) throw new Error(`Unknown campaign chapter: ${chapterId}`);
  return anchorId;
};
const unique = <T,>(values: readonly T[]) => [...new Set(values)];
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
const stringList = (value: unknown): string[] => Array.isArray(value) ? unique(value.filter((item): item is string => typeof item === "string")) : [];
const memoryId = (value: unknown): MemoryId | undefined => typeof value === "string" && MEMORY_IDS.includes(value as MemoryId) ? value as MemoryId : undefined;
const endingId = (value: unknown): EndingId | undefined => typeof value === "string" && ENDING_IDS.includes(value as EndingId) ? value as EndingId : undefined;

const stringListRecord = (value: unknown): Record<string, string[]> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stringList(item)]));
};

const memoryListRecord = (value: unknown): Record<string, MemoryId[]> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    Array.isArray(item) ? unique(item.map(memoryId).filter((entry): entry is MemoryId => entry !== undefined)) : [],
  ]));
};

const stringRecord = (value: unknown): Record<string, string> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
};

const nonNegativeNumberRecord = (value: unknown): Record<string, number> => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0));
};

const normalizeSettings = (value: unknown): GameSettings => {
  if (!isRecord(value)) return { ...DEFAULT_SETTINGS };
  return {
    quality: value.quality === "stable" || value.quality === "low" ? value.quality : "high",
    renderer: value.renderer === "webgl" ? "webgl" : "auto",
    stableCamera: value.stableCamera === true,
    subtitles: value.subtitles !== false,
    guidanceAssist: value.guidanceAssist !== false,
    masterVolume: typeof value.masterVolume === "number" && Number.isFinite(value.masterVolume)
      ? Math.max(0, Math.min(1, value.masterVolume))
      : DEFAULT_SETTINGS.masterVolume,
    dialogueSpeed: value.dialogueSpeed === "slow" || value.dialogueSpeed === "fast" || value.dialogueSpeed === "instant"
      ? value.dialogueSpeed
      : "normal",
    textScale: value.textScale === "large" ? "large" : "normal",
  };
};

const normalizePosition = (value: unknown): [number, number, number] | undefined => {
  if (!Array.isArray(value) || value.length !== 3 || !value.every((item) => typeof item === "number" && Number.isFinite(item))) return undefined;
  return [value[0] as number, value[1] as number, value[2] as number];
};

const normalizeCheckpoint = (value: unknown): CheckpointState | undefined => {
  if (!isRecord(value) || value.schemaVersion !== 3 || typeof value.chapterId !== "string" || !CHAPTER_ANCHORS[value.chapterId]) return undefined;
  const currentMemory = memoryId(value.memoryId);
  if (!currentMemory) return undefined;
  const base = createCheckpoint(value.chapterId, currentMemory);
  const reconstruction = isRecord(value.reconstructionTrace) ? value.reconstructionTrace : {};
  const assembly = isRecord(value.finalAssemblyState) ? value.finalAssemblyState : {};
  const dialogue = isRecord(value.dialogueProgress) && typeof value.dialogueProgress.sequenceId === "string" && typeof value.dialogueProgress.inkStateJson === "string"
    ? { sequenceId: value.dialogueProgress.sequenceId, inkStateJson: value.dialogueProgress.inkStateJson }
    : undefined;
  const normalizedEnding = endingId(assembly.endingLens);
  return {
    ...base,
    anchorId: typeof value.anchorId === "string" ? value.anchorId : base.anchorId,
    position: normalizePosition(value.position),
    yaw: typeof value.yaw === "number" && Number.isFinite(value.yaw) ? value.yaw : undefined,
    memoryId: currentMemory,
    mechanics: normalizeMechanicSaveState(value.mechanics, cognitionForMemory(currentMemory)),
    reconstructionTrace: {
      discoveredOptionalEvidence: stringList(reconstruction.discoveredOptionalEvidence),
      solvedWithCognition: memoryListRecord(reconstruction.solvedWithCognition),
      cognitionUsage: nonNegativeNumberRecord(reconstruction.cognitionUsage),
      anchoredFragments: stringList(reconstruction.anchoredFragments),
      preservedContradictions: stringList(reconstruction.preservedContradictions),
      finalAssemblyFragments: stringList(reconstruction.finalAssemblyFragments),
    },
    finalAssemblyState: {
      factSkeletonFlags: stringList(assembly.factSkeletonFlags),
      selectedFragments: stringList(assembly.selectedFragments),
      ...(normalizedEnding ? { endingLens: normalizedEnding } : {}),
      complete: assembly.complete === true,
    },
    earnedFlags: stringList(value.earnedFlags),
    contradictions: stringList(value.contradictions),
    observedBy: memoryListRecord(value.observedBy),
    trustDecisions: stringRecord(value.trustDecisions),
    nameAnchors: stringList(value.nameAnchors),
    chaseProgress: isRecord(value.chaseProgress)
      ? Object.fromEntries(Object.entries(value.chaseProgress).filter((entry): entry is [string, "not-started" | "active" | "escaped"] => entry[1] === "not-started" || entry[1] === "active" || entry[1] === "escaped"))
      : {},
    activeObjectiveId: typeof value.activeObjectiveId === "string" ? value.activeObjectiveId : undefined,
    objectiveStepId: typeof value.objectiveStepId === "string" ? value.objectiveStepId : undefined,
    objectiveProgress: stringListRecord(value.objectiveProgress),
    dialogueProgress: dialogue,
    seenDialogueLines: stringList(value.seenDialogueLines),
    hintLevels: nonNegativeNumberRecord(value.hintLevels),
    pointerLockPending: value.pointerLockPending === true,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : base.updatedAt,
  };
};

export const createCheckpoint = (chapterId = "prologue-rain", currentMemory: MemoryId = "baseline"): CheckpointState => {
  const anchorId = defaultAnchorForChapter(chapterId);
  return {
    schemaVersion: 3,
    layoutVersion: TINGYUXUAN_LAYOUT_VERSION,
    chapterId,
    anchorId,
    memoryId: currentMemory,
    mechanics: { ...createDefaultMechanicSaveState(), currentCognition: cognitionForMemory(currentMemory), safeAnchorId: anchorId },
    reconstructionTrace: {
      discoveredOptionalEvidence: [],
      solvedWithCognition: {},
      cognitionUsage: {},
      anchoredFragments: [],
      preservedContradictions: [],
      finalAssemblyFragments: [],
    },
    finalAssemblyState: { factSkeletonFlags: [], selectedFragments: [], complete: false },
    earnedFlags: [],
    contradictions: [],
    observedBy: {},
    trustDecisions: {},
    nameAnchors: [],
    chaseProgress: {},
    objectiveProgress: {},
    seenDialogueLines: [],
    hintLevels: {},
    pointerLockPending: false,
    updatedAt: new Date(0).toISOString(),
  };
};

export const inheritInvestigationState = (source: CheckpointState, target: CheckpointState): CheckpointState => ({
  ...target,
  reconstructionTrace: {
    discoveredOptionalEvidence: [...source.reconstructionTrace.discoveredOptionalEvidence],
    solvedWithCognition: Object.fromEntries(Object.entries(source.reconstructionTrace.solvedWithCognition).map(([key, values]) => [key, [...values]])),
    cognitionUsage: { ...source.reconstructionTrace.cognitionUsage },
    anchoredFragments: [...source.reconstructionTrace.anchoredFragments],
    preservedContradictions: [...source.reconstructionTrace.preservedContradictions],
    finalAssemblyFragments: [...source.reconstructionTrace.finalAssemblyFragments],
  },
  contradictions: [...source.contradictions],
  observedBy: Object.fromEntries(Object.entries(source.observedBy).map(([key, values]) => [key, [...values]])),
  trustDecisions: { ...source.trustDecisions },
  nameAnchors: [...source.nameAnchors],
  hintLevels: { ...source.hintLevels },
});

export const createDefaultSave = (): CampaignSave => ({
  schemaVersion: 3,
  activeCheckpoint: createCheckpoint(),
  completedChapters: [],
  unlockedChapters: ["prologue-rain"],
  endingIds: [],
  settings: { ...DEFAULT_SETTINGS },
  tutorial: { controls: { seen: false } },
});

export const createNewGameSave = (current: Pick<CampaignSave, "settings">): CampaignSave => ({
  ...createDefaultSave(),
  settings: { ...current.settings },
});

export const restartFromPrologue = (current: CampaignSave): CampaignSave => createNewGameSave(current);

export function normalizeSave(value: unknown): CampaignSave {
  if (!isRecord(value) || value.schemaVersion !== 3) return createDefaultSave();
  const checkpoint = normalizeCheckpoint(value.activeCheckpoint);
  if (!checkpoint) return createDefaultSave();
  const tutorial = isRecord(value.tutorial) && isRecord(value.tutorial.controls) ? value.tutorial.controls : {};
  return {
    schemaVersion: 3,
    activeCheckpoint: checkpoint,
    completedChapters: stringList(value.completedChapters),
    unlockedChapters: unique(["prologue-rain", ...stringList(value.unlockedChapters)]),
    endingIds: unique((Array.isArray(value.endingIds) ? value.endingIds : []).map(endingId).filter((entry): entry is EndingId => entry !== undefined)),
    settings: normalizeSettings(value.settings),
    tutorial: { controls: { seen: tutorial.seen === true } },
  };
}

export function loadCampaignSave(storage: Pick<Storage, "getItem"> | undefined = typeof window === "undefined" ? undefined : window.localStorage): CampaignSave {
  if (!storage) return createDefaultSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw ? normalizeSave(JSON.parse(raw) as unknown) : createDefaultSave();
  } catch {
    return createDefaultSave();
  }
}

export function storeCampaignSave(save: CampaignSave, storage: Pick<Storage, "setItem"> | undefined = typeof window === "undefined" ? undefined : window.localStorage): void {
  storage?.setItem(SAVE_KEY, JSON.stringify(save));
}

export function resetGardenSave(storage: Pick<Storage, "removeItem"> | undefined = typeof window === "undefined" ? undefined : window.localStorage): void {
  storage?.removeItem(SAVE_KEY);
}
