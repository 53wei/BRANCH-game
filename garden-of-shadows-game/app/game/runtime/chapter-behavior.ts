import type { ChapterCompletePayload, CheckpointState } from "../types";

export type ChaseOutcome = "active" | "escaped" | "failed";

export const resolveChaseOutcome = ({
  reachedExit,
  ownerDistance,
  elapsedMs,
}: {
  reachedExit: boolean;
  ownerDistance: number;
  elapsedMs: number;
}): ChaseOutcome => {
  if (reachedExit) return "escaped";
  if (ownerDistance < 1.15 || elapsedMs > 42_000) return "failed";
  return "active";
};

export const createChapterCompletePayload = (chapterId: string, checkpoint: CheckpointState): ChapterCompletePayload => ({
  chapterId,
  earnedFlags: checkpoint.earnedFlags,
  contradictions: checkpoint.contradictions,
  trustDecision: checkpoint.trustDecisions["west-water-motive"],
});
