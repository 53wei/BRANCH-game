import { createCheckpoint, createDefaultSave } from "./campaign-save";
import { markTutorialSeen } from "./tutorial-state";
import type { CampaignSave, MemoryId } from "./types";

export const QA_FIRST_RUN_QUERY = "devFirstRun";
export const QA_CHAPTER_QUERY = "devChapter";
export const QA_START_KEY = "garden-of-shadows.qa.first-run-start.v1";

export const QA_CHAPTERS = [
  ["prologue-rain", "序章 · 回园"],
  ["west-corridor-loop", "第一章 · 不存在的路"],
  ["north-tower-ledger", "第二章 · 多出来的人"],
  ["missing-room", "第三章 · 不存在的房间"],
  ["deleted-person", "第四章 · 被删掉的人"],
  ["you-did-not-return", "第五章 · 今晚你没回来"],
  ["fifth-tingyuxuan", "终章 · 第五种听雨轩"],
] as const;

export type QaChapterId = (typeof QA_CHAPTERS)[number][0];

type SmokeConfig = { memoryId: MemoryId };

const SMOKE_CONFIG: Record<QaChapterId, SmokeConfig> = {
  "prologue-rain": { memoryId: "baseline" },
  "west-corridor-loop": { memoryId: "wife" },
  "north-tower-ledger": { memoryId: "wife" },
  "missing-room": { memoryId: "gardener" },
  "deleted-person": { memoryId: "baseline" },
  "you-did-not-return": { memoryId: "zhaoying" },
  "fifth-tingyuxuan": { memoryId: "zhaoying" },
};

export const isQaChapterId = (value: string): value is QaChapterId => value in SMOKE_CONFIG;

/**
 * Creates an in-memory chapter smoke save. Callers must never persist this save
 * to the formal SAVE_KEY. Keeping construction pure makes that boundary testable.
 */
export function createIsolatedQaChapterSave(chapterId: QaChapterId): CampaignSave {
  const base = markTutorialSeen(createDefaultSave());
  const config = SMOKE_CONFIG[chapterId];
  return {
    ...base,
    unlockedChapters: [...new Set([...base.unlockedChapters, chapterId])],
    activeCheckpoint: createCheckpoint(chapterId, config.memoryId),
  };
}
