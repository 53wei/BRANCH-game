import type { CampaignSave, CheckpointState, GameSettings, MemoryId } from "./types";

export const SAVE_KEY = "garden-of-shadows.save.v2";

export const DEFAULT_SETTINGS: GameSettings = {
  quality: "high",
  renderer: "auto",
  stableCamera: false,
  subtitles: true,
  masterVolume: 0.8,
  dialogueSpeed: "normal",
};

export const createCheckpoint = (chapterId = "prologue-rain", memoryId: MemoryId = "baseline"): CheckpointState => ({
  schemaVersion: 2,
  chapterId,
  anchorId: `${chapterId}-entry`,
  memoryId,
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
});

export const createDefaultSave = (): CampaignSave => ({
  schemaVersion: 2,
  activeCheckpoint: createCheckpoint(),
  completedChapters: [],
  unlockedChapters: ["prologue-rain", "west-corridor-loop"],
  endingIds: [],
  settings: DEFAULT_SETTINGS,
});

const unique = <T,>(values: T[]) => [...new Set(values)];

export function normalizeSave(value: unknown): CampaignSave {
  if (!value || typeof value !== "object") return createDefaultSave();
  const candidate = value as Partial<CampaignSave>;
  if (candidate.schemaVersion !== 2 || !candidate.activeCheckpoint) return createDefaultSave();
  const base = createDefaultSave();
  return {
    ...base,
    ...candidate,
    schemaVersion: 2,
    completedChapters: unique(candidate.completedChapters ?? []),
    unlockedChapters: unique(["prologue-rain", "west-corridor-loop", ...(candidate.unlockedChapters ?? [])]),
    endingIds: unique(candidate.endingIds ?? []),
    settings: { ...DEFAULT_SETTINGS, ...(candidate.settings ?? {}) },
    activeCheckpoint: {
      ...base.activeCheckpoint,
      ...candidate.activeCheckpoint,
      schemaVersion: 2,
      earnedFlags: unique(candidate.activeCheckpoint.earnedFlags ?? []),
      contradictions: unique(candidate.activeCheckpoint.contradictions ?? []),
      observedBy: candidate.activeCheckpoint.observedBy ?? {},
      trustDecisions: candidate.activeCheckpoint.trustDecisions ?? {},
      nameAnchors: unique(candidate.activeCheckpoint.nameAnchors ?? []),
      chaseProgress: candidate.activeCheckpoint.chaseProgress ?? {},
      objectiveProgress: candidate.activeCheckpoint.objectiveProgress ?? {},
      seenDialogueLines: unique(candidate.activeCheckpoint.seenDialogueLines ?? []),
      hintLevels: candidate.activeCheckpoint.hintLevels ?? {},
      pointerLockPending: candidate.activeCheckpoint.pointerLockPending ?? false,
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
