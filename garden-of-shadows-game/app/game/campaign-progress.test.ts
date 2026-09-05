import { describe, expect, it } from "vitest";
import { canonicalChapterCompletionFlag, completeCampaignChapter, nextChapterId } from "./campaign-progress";
import { createCheckpoint, createDefaultSave } from "./campaign-save";
import { campaignManifest } from "./manifests/campaign";

describe("TASK-023 campaign progression contract", () => {
  it("gives every chapter one canonical completion flag", () => {
    for (const chapter of campaignManifest.chapters) {
      expect(chapter.completionFlags).toContain(canonicalChapterCompletionFlag(chapter.id));
    }
  });

  it("derives chapter order and unlocks from the campaign manifest", () => {
    expect(nextChapterId("prologue-rain")).toBe("west-corridor-loop");
    expect(nextChapterId("fifth-tingyuxuan")).toBeUndefined();

    const save = createDefaultSave();
    const checkpoint = createCheckpoint("prologue-rain", "baseline");
    const completed = completeCampaignChapter(save, "prologue-rain", checkpoint);
    expect(completed.completedChapters).toEqual(["prologue-rain"]);
    expect(completed.unlockedChapters).toEqual(["prologue-rain", "west-corridor-loop"]);
    expect(completed.activeCheckpoint.earnedFlags).toEqual(expect.arrayContaining(campaignManifest.chapters[0].completionFlags));
  });

  it("rejects a checkpoint from another chapter", () => {
    expect(() => completeCampaignChapter(createDefaultSave(), "west-corridor-loop", createCheckpoint("prologue-rain"))).toThrow("Checkpoint chapter mismatch");
  });

  it("records the finale ending without creating a fake next chapter", () => {
    const save = createDefaultSave();
    save.unlockedChapters = [...campaignManifest.chapterOrder];
    const checkpoint = createCheckpoint("fifth-tingyuxuan", "zhaoying");
    const completed = completeCampaignChapter(save, "fifth-tingyuxuan", checkpoint, "composite");
    expect(completed.completedChapters).toEqual(["fifth-tingyuxuan"]);
    expect(completed.unlockedChapters).toEqual(campaignManifest.chapterOrder);
    expect(completed.endingIds).toEqual(["composite"]);
    expect(completed.activeCheckpoint.earnedFlags).toContain("fifth-tingyuxuan.complete");
  });
});
