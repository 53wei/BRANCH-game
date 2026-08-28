import type { CampaignSave, CheckpointState, GameSettings, MemoryId } from "./types";
import { TINGYUXUAN_LAYOUT_VERSION, tingYuXuanLayout } from "./runtime/tingyuxuan-layout";

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
  layoutVersion: chapterId === "west-corridor-loop" ? TINGYUXUAN_LAYOUT_VERSION : "campaign-v2",
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
  const rawCheckpoint = candidate.activeCheckpoint;
  const legacyTingYuXuan = rawCheckpoint.chapterId === "west-corridor-loop" && rawCheckpoint.layoutVersion !== TINGYUXUAN_LAYOUT_VERSION;
  const knownAnchor = tingYuXuanLayout.anchors.some((anchor) => anchor.id === rawCheckpoint.anchorId);
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
      ...rawCheckpoint,
      schemaVersion: 2,
      layoutVersion: legacyTingYuXuan ? TINGYUXUAN_LAYOUT_VERSION : (rawCheckpoint.layoutVersion ?? "campaign-v2"),
      anchorId: legacyTingYuXuan ? (knownAnchor ? rawCheckpoint.anchorId : "west-entry") : rawCheckpoint.anchorId,
      position: legacyTingYuXuan ? undefined : rawCheckpoint.position,
      yaw: legacyTingYuXuan ? undefined : rawCheckpoint.yaw,
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
