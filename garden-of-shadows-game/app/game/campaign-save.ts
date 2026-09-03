import type { CampaignSave, CheckpointState, GameSettings, MemoryId } from "./types";
import { TINGYUXUAN_LAYOUT_VERSION, tingYuXuanLayout } from "./runtime/tingyuxuan-layout";
import { createDefaultMechanicSaveState } from "./mechanics/types";
import { cognitionForMemory, normalizeMechanicSaveState } from "./mechanics/save";

export const SAVE_KEY = "garden-of-shadows.save.v2";

export const DEFAULT_SETTINGS: GameSettings = {
  quality: "high",
  renderer: "auto",
  stableCamera: false,
  subtitles: true,
  guidanceAssist: true,
  masterVolume: 0.8,
  dialogueSpeed: "normal",
};

const MASTER_SCENE_CHAPTER_ANCHORS: Readonly<Record<string, string>> = {
  "prologue-rain": "ROUTE_01_START",
  "west-corridor-loop": "ROUTE_02_A_ENTRY",
  "north-tower-ledger": "ROUTE_05_B_MAIN_COURT",
  "missing-room": "ROUTE_06_B_NORTHEAST_LINK",
};

const defaultAnchorForChapter = (chapterId: string) => MASTER_SCENE_CHAPTER_ANCHORS[chapterId] ?? `${chapterId}-entry`;

export const createCheckpoint = (chapterId = "prologue-rain", memoryId: MemoryId = "baseline"): CheckpointState => {
  const anchorId = defaultAnchorForChapter(chapterId);
  return {
    schemaVersion: 2,
    layoutVersion: chapterId === "west-corridor-loop" ? TINGYUXUAN_LAYOUT_VERSION : "campaign-v2",
    chapterId,
    anchorId,
    memoryId,
    mechanics: { ...createDefaultMechanicSaveState(), currentCognition: cognitionForMemory(memoryId), safeAnchorId: anchorId },
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
  schemaVersion: 2,
  activeCheckpoint: createCheckpoint(),
  completedChapters: [],
  unlockedChapters: ["prologue-rain"],
  endingIds: [],
  settings: DEFAULT_SETTINGS,
  tutorial: { controls: { seen: false, autoShow: true } },
});

/** Start a real new campaign while preserving user-owned settings only. */
export const createNewGameSave = (current: Pick<CampaignSave, "settings">): CampaignSave => ({
  ...createDefaultSave(),
  settings: { ...current.settings },
});

/** Restart the complete campaign from the prologue without resetting preferences. */
export const restartFromPrologue = (current: CampaignSave): CampaignSave => ({
  ...createDefaultSave(),
  settings: { ...current.settings },
});

const unique = <T,>(values: T[]) => [...new Set(values)];
const stringList = (value: unknown): string[] => Array.isArray(value) ? unique(value.filter((item): item is string => typeof item === "string")) : [];
const recordOfStringLists = (value: unknown): Record<string, string[]> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, stringList(item)]));
};
const recordOfNonNegativeNumbers = (value: unknown): Record<string, number> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([, item]) => typeof item === "number" && Number.isFinite(item) && item >= 0)
    .map(([key, item]) => [key, item as number]));
};

export function normalizeSave(value: unknown): CampaignSave {
  if (!value || typeof value !== "object") return createDefaultSave();
  const candidate = value as Partial<CampaignSave>;
  if (candidate.schemaVersion !== 2 || !candidate.activeCheckpoint) return createDefaultSave();
  const base = createDefaultSave();
  const rawCheckpoint = candidate.activeCheckpoint;
  const legacyTingYuXuan = rawCheckpoint.chapterId === "west-corridor-loop" && rawCheckpoint.layoutVersion !== TINGYUXUAN_LAYOUT_VERSION;
  const knownAnchor = tingYuXuanLayout.anchors.some((anchor) => anchor.id === rawCheckpoint.anchorId);
  const masterSceneChapter = rawCheckpoint.chapterId in MASTER_SCENE_CHAPTER_ANCHORS;
  const reanchor = legacyTingYuXuan || (masterSceneChapter && !knownAnchor);
  const resolvedAnchorId = reanchor
    ? (knownAnchor ? rawCheckpoint.anchorId : defaultAnchorForChapter(rawCheckpoint.chapterId))
    : rawCheckpoint.anchorId;
  const mechanics = normalizeMechanicSaveState(rawCheckpoint.mechanics, cognitionForMemory(rawCheckpoint.memoryId));
  const safeAnchorKnown = tingYuXuanLayout.anchors.some((anchor) => anchor.id === mechanics.safeAnchorId);
  return {
    ...base,
    ...candidate,
    schemaVersion: 2,
    completedChapters: unique(candidate.completedChapters ?? []),
    unlockedChapters: unique(["prologue-rain", ...(candidate.unlockedChapters ?? [])]),
    endingIds: unique(candidate.endingIds ?? []),
    settings: { ...DEFAULT_SETTINGS, ...(candidate.settings ?? {}) },
    tutorial: {
      controls: {
        seen: candidate.tutorial?.controls?.seen === true,
        autoShow: candidate.tutorial?.controls?.autoShow !== false,
      },
    },
    activeCheckpoint: {
      ...base.activeCheckpoint,
      ...rawCheckpoint,
      schemaVersion: 2,
      layoutVersion: legacyTingYuXuan ? TINGYUXUAN_LAYOUT_VERSION : (rawCheckpoint.layoutVersion ?? "campaign-v2"),
      anchorId: resolvedAnchorId,
      position: reanchor ? undefined : rawCheckpoint.position,
      yaw: reanchor ? undefined : rawCheckpoint.yaw,
      mechanics: {
        ...mechanics,
        safeAnchorId: masterSceneChapter && !safeAnchorKnown ? resolvedAnchorId : (mechanics.safeAnchorId ?? resolvedAnchorId),
      },
      reconstructionTrace: {
        discoveredOptionalEvidence: stringList(rawCheckpoint.reconstructionTrace?.discoveredOptionalEvidence),
        solvedWithCognition: recordOfStringLists(rawCheckpoint.reconstructionTrace?.solvedWithCognition),
        cognitionUsage: recordOfNonNegativeNumbers(rawCheckpoint.reconstructionTrace?.cognitionUsage),
        anchoredFragments: stringList(rawCheckpoint.reconstructionTrace?.anchoredFragments),
        preservedContradictions: stringList(rawCheckpoint.reconstructionTrace?.preservedContradictions),
        finalAssemblyFragments: stringList(rawCheckpoint.reconstructionTrace?.finalAssemblyFragments),
      },
      finalAssemblyState: {
        factSkeletonFlags: stringList(rawCheckpoint.finalAssemblyState?.factSkeletonFlags),
        selectedFragments: stringList(rawCheckpoint.finalAssemblyState?.selectedFragments),
        endingLens: rawCheckpoint.finalAssemblyState?.endingLens,
        complete: rawCheckpoint.finalAssemblyState?.complete === true,
      },
      earnedFlags: unique(rawCheckpoint.earnedFlags ?? []),
      contradictions: unique(rawCheckpoint.contradictions ?? []),
      observedBy: rawCheckpoint.observedBy ?? {},
      trustDecisions: rawCheckpoint.trustDecisions ?? {},
      nameAnchors: unique(rawCheckpoint.nameAnchors ?? []),
      chaseProgress: rawCheckpoint.chaseProgress ?? {},
      objectiveProgress: rawCheckpoint.objectiveProgress ?? {},
      seenDialogueLines: unique(rawCheckpoint.seenDialogueLines ?? []),
      hintLevels: rawCheckpoint.hintLevels ?? {},
      pointerLockPending: rawCheckpoint.pointerLockPending ?? false,
    },
  };
}

export function loadCampaignSave(storage: Pick<Storage, "getItem"> | undefined = typeof window === "undefined" ? undefined : window.localStorage): CampaignSave {
  if (!storage) return createDefaultSave();
  try {
    const raw = storage.getItem(SAVE_KEY);
    return raw ? normalizeSave(JSON.parse(raw)) : createDefaultSave();
  } catch {
    return createDefaultSave();
  }
}

export function storeCampaignSave(save: CampaignSave, storage: Pick<Storage, "setItem"> | undefined = typeof window === "undefined" ? undefined : window.localStorage): void {
  if (!storage) return;
  storage.setItem(SAVE_KEY, JSON.stringify(normalizeSave(save)));
}

export function resetGardenSave(storage: Pick<Storage, "removeItem"> | undefined = typeof window === "undefined" ? undefined : window.localStorage): void {
  storage?.removeItem(SAVE_KEY);
}
