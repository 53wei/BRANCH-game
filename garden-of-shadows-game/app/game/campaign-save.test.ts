import { describe, expect, it } from "vitest";
import { createDefaultSave, createNewGameSave, loadCampaignSave, normalizeSave, resetGardenSave, restartFromPrologue, SAVE_KEY, storeCampaignSave } from "./campaign-save";
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
    expect(loadCampaignSave(storage).unlockedChapters).toEqual(["prologue-rain"]);
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

  it("repairs invalid current-layout Master anchors without losing logical progress", () => {
    const source = createDefaultSave();
    source.activeCheckpoint = {
      ...createDefaultSave().activeCheckpoint,
      chapterId: "north-tower-ledger",
      anchorId: "north-tower-ledger-entry",
      position: [99, 0.9, 99],
      earnedFlags: ["north.evidence.sixth-cup"],
      mechanics: { ...source.activeCheckpoint.mechanics, safeAnchorId: "north-tower-ledger-entry" },
    };
    const normalized = normalizeSave(source);
    expect(normalized.activeCheckpoint.anchorId).toBe("ROUTE_05_B_MAIN_COURT");
    expect(normalized.activeCheckpoint.mechanics.safeAnchorId).toBe("ROUTE_05_B_MAIN_COURT");
    expect(normalized.activeCheckpoint.position).toBeUndefined();
    expect(normalized.activeCheckpoint.earnedFlags).toContain("north.evidence.sixth-cup");
  });

  it("starts a new game with only the prologue unlocked and tutorial restored", () => {
    const source = createDefaultSave();
    source.completedChapters = ["prologue-rain", "west-corridor-loop"];
    source.unlockedChapters = ["prologue-rain", "west-corridor-loop", "north-tower-ledger"];
    source.endingIds = ["domestic"];
    source.tutorial.controls = { seen: true, autoShow: false };
    source.settings.masterVolume = 0.35;

    const fresh = createNewGameSave(source);
    expect(fresh.completedChapters).toEqual([]);
    expect(fresh.unlockedChapters).toEqual(["prologue-rain"]);
    expect(fresh.endingIds).toEqual([]);
    expect(fresh.activeCheckpoint.chapterId).toBe("prologue-rain");
    expect(fresh.tutorial.controls).toEqual({ seen: false, autoShow: true });
    expect(fresh.settings.masterVolume).toBe(0.35);
  });

  it("restarting from the prologue clears campaign progress without resetting preferences", () => {
    const source = createDefaultSave();
    source.completedChapters = ["prologue-rain", "west-corridor-loop", "north-tower-ledger"];
    source.unlockedChapters = ["prologue-rain", "west-corridor-loop", "north-tower-ledger", "missing-room"];
    source.activeCheckpoint.earnedFlags = ["north.evidence.sixth-cup"];
    source.tutorial.controls = { seen: true, autoShow: false };
    source.settings.guidanceAssist = false;

    const restarted = restartFromPrologue(source);
    expect(restarted.completedChapters).toEqual([]);
    expect(restarted.unlockedChapters).toEqual(["prologue-rain"]);
    expect(restarted.activeCheckpoint.earnedFlags).toEqual([]);
    expect(restarted.tutorial.controls).toEqual({ seen: false, autoShow: true });
    expect(restarted.settings.guidanceAssist).toBe(false);
  });
});
