import type { ChapterCompletePayload, CheckpointState } from "../types";

export const createChapterCompletePayload = (chapterId: string, checkpoint: CheckpointState): ChapterCompletePayload => ({
  chapterId,
  earnedFlags: checkpoint.earnedFlags,
  contradictions: checkpoint.contradictions,
  trustDecision: checkpoint.trustDecisions["west-water-motive"],
});
