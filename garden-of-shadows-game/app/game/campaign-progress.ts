import { campaignManifest, getChapter } from "./manifests/campaign";
import type { CampaignSave, CheckpointState, EndingId } from "./types";

const unique = <T,>(values: readonly T[]) => [...new Set(values)];

export const canonicalChapterCompletionFlag = (chapterId: string) => `${chapterId}.complete`;

export const nextChapterId = (chapterId: string): string | undefined => {
  const index = campaignManifest.chapterOrder.indexOf(chapterId);
  return index >= 0 ? campaignManifest.chapterOrder[index + 1] : undefined;
};

/**
 * TASK-023 campaign progression closure.
 * Every runtime submits its final checkpoint here so chapter flags, unlocks and
 * optional finale ending state cannot drift between seven separate components.
 */
export const completeCampaignChapter = (
  save: CampaignSave,
  chapterId: string,
  checkpoint: CheckpointState,
  endingId?: EndingId,
): CampaignSave => {
  const chapter = getChapter(chapterId);
  if (!chapter) throw new Error(`Unknown campaign chapter: ${chapterId}`);
  if (checkpoint.chapterId !== chapterId) throw new Error(`Checkpoint chapter mismatch: ${checkpoint.chapterId} !== ${chapterId}`);
  if (endingId && chapterId !== "fifth-tingyuxuan") throw new Error("Ending ids can only be recorded by the finale");
  const following = nextChapterId(chapterId);
  const activeCheckpoint: CheckpointState = {
    ...checkpoint,
    earnedFlags: unique([...checkpoint.earnedFlags, ...chapter.completionFlags]),
    updatedAt: new Date().toISOString(),
  };
  return {
    ...save,
    activeCheckpoint,
    completedChapters: unique([...save.completedChapters, chapterId]),
    unlockedChapters: following ? unique([...save.unlockedChapters, following]) : unique(save.unlockedChapters),
    endingIds: endingId ? unique([...save.endingIds, endingId]) : unique(save.endingIds),
  };
};
