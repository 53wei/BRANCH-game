import { describe, expect, it } from "vitest";
import { createDefaultSave, loadCampaignSave, normalizeSave, resetGardenSave, SAVE_KEY, storeCampaignSave } from "./campaign-save";
import { TINGYUXUAN_LAYOUT_VERSION } from "./runtime/tingyuxuan-layout";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("campaign save v2", () => {
  it("uses a new key and leaves the legacy key untouched", () => {
    const storage = new MemoryStorage();
    storage.setItem("undying-world.game.save.v1", "legacy");
    const save = createDefaultSave();
    storeCampaignSave(save, storage);
    resetGardenSave(storage);
    expect(SAVE_KEY).toBe("garden-of-shadows.save.v2");
    expect(storage.getItem("undying-world.game.save.v1")).toBe("legacy");
  });

  it("recovers from corrupt JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, "not-json");
    expect(loadCampaignSave(storage).schemaVersion).toBe(2);
    expect(loadCampaignSave(storage).unlockedChapters).toContain("west-corridor-loop");
  });

  it("deduplicates checkpoint progress", () => {
    const source = createDefaultSave();
    source.activeCheckpoint.earnedFlags = ["a", "a"];
    source.activeCheckpoint.contradictions = ["water", "water"];
    const normalized = normalizeSave(source);
    expect(normalized.activeCheckpoint.earnedFlags).toEqual(["a"]);
    expect(normalized.activeCheckpoint.contradictions).toEqual(["water"]);
  });

  it("adds V0.1R onboarding defaults to an older v2 save", () => {
    const source = createDefaultSave() as unknown as Record<string, unknown>;
    const checkpoint = source.activeCheckpoint as Record<string, unknown>;
    delete checkpoint.objectiveProgress;
    delete checkpoint.seenDialogueLines;
    delete checkpoint.hintLevels;
    delete checkpoint.pointerLockPending;
    const normalized = normalizeSave(source);
    expect(normalized.activeCheckpoint.objectiveProgress).toEqual({});
    expect(normalized.activeCheckpoint.seenDialogueLines).toEqual([]);
    expect(normalized.activeCheckpoint.hintLevels).toEqual({});
    expect(normalized.settings.dialogueSpeed).toBe("normal");
  });

  it("keeps story progress but reanchors an older west-corridor layout", () => {
    const source = createDefaultSave();
    source.activeCheckpoint = {
      ...source.activeCheckpoint,
      chapterId: "west-corridor-loop",
      anchorId: "loop-seventh-window",
      layoutVersion: "west-corridor-v0.1r",
      position: [3.7, 0.9, -27],
      earnedFlags: ["west.contradiction.waterline"],
      contradictions: ["waterline-direction"],
      trustDecisions: { "west-water-motive": "protect" },
    };
    const normalized = normalizeSave(source);
    expect(normalized.activeCheckpoint.layoutVersion).toBe(TINGYUXUAN_LAYOUT_VERSION);
    expect(normalized.activeCheckpoint.anchorId).toBe("loop-seventh-window");
    expect(normalized.activeCheckpoint.position).toBeUndefined();
    expect(normalized.activeCheckpoint.contradictions).toEqual(["waterline-direction"]);
    expect(normalized.activeCheckpoint.trustDecisions["west-water-motive"]).toBe("protect");
  });
});
