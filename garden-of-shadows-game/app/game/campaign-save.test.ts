import { describe, expect, it } from "vitest";
import {
  SAVE_KEY,
  createCheckpoint,
  createDefaultSave,
  createNewGameSave,
  loadCampaignSave,
  normalizeSave,
  resetGardenSave,
  restartFromPrologue,
  storeCampaignSave,
} from "./campaign-save";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("campaign save v3", () => {
  it("uses one current save key and reset removes it", () => {
    const storage = new MemoryStorage();
    storeCampaignSave(createDefaultSave(), storage);
    expect(SAVE_KEY).toBe("garden-of-shadows.save.v3");
    expect(storage.getItem(SAVE_KEY)).not.toBeNull();
    resetGardenSave(storage);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("recovers from corrupt JSON as a clean new game", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVE_KEY, "not-json");
    const save = loadCampaignSave(storage);
    expect(save.schemaVersion).toBe(3);
    expect(save.unlockedChapters).toEqual(["prologue-rain"]);
  });

  it("normalizes duplicate current-schema progress without changing the chapter", () => {
    const source = createDefaultSave();
    source.activeCheckpoint = createCheckpoint("west-corridor-loop", "wife");
    source.activeCheckpoint.earnedFlags = ["a", "a"];
    source.activeCheckpoint.contradictions = ["water", "water"];
    const normalized = normalizeSave(source);
    expect(normalized.activeCheckpoint.chapterId).toBe("west-corridor-loop");
    expect(normalized.activeCheckpoint.earnedFlags).toEqual(["a"]);
    expect(normalized.activeCheckpoint.contradictions).toEqual(["water"]);
  });

  it("rejects unknown chapter ids instead of silently reanchoring them", () => {
    expect(() => createCheckpoint("unknown-chapter")).toThrow("Unknown campaign chapter");
  });

  it("uses canonical Master Scene anchors for every campaign chapter", () => {
    expect(createCheckpoint("prologue-rain").anchorId).toBe("ROUTE_01_START");
    expect(createCheckpoint("west-corridor-loop", "wife").anchorId).toBe("ROUTE_02_A_ENTRY");
    expect(createCheckpoint("north-tower-ledger", "wife").anchorId).toBe("ROUTE_05_B_MAIN_COURT");
    expect(createCheckpoint("missing-room", "gardener").anchorId).toBe("ROUTE_06_B_NORTHEAST_LINK");
    expect(createCheckpoint("deleted-person").anchorId).toBe("B_CHILD_BOX");
    expect(createCheckpoint("you-did-not-return").anchorId).toBe("ROUTE_04_A_EAST_EXIT");
    expect(createCheckpoint("fifth-tingyuxuan", "zhaoying").anchorId).toBe("ROUTE_01_START");
  });

  it("loading an existing save preserves the seen tutorial state for Continue", () => {
    const storage = new MemoryStorage();
    const source = createDefaultSave();
    source.tutorial.controls = { seen: true };
    storeCampaignSave(source, storage);
    expect(loadCampaignSave(storage).tutorial.controls).toEqual({ seen: true });
  });

  it("starts a new game with only settings preserved", () => {
    const source = createDefaultSave();
    source.completedChapters = ["prologue-rain", "west-corridor-loop"];
    source.unlockedChapters = ["prologue-rain", "west-corridor-loop", "north-tower-ledger"];
    source.endingIds = ["domestic"];
    source.tutorial.controls = { seen: true };
    source.settings.masterVolume = 0.35;

    const fresh = createNewGameSave(source);
    expect(fresh.completedChapters).toEqual([]);
    expect(fresh.unlockedChapters).toEqual(["prologue-rain"]);
    expect(fresh.endingIds).toEqual([]);
    expect(fresh.activeCheckpoint.chapterId).toBe("prologue-rain");
    expect(fresh.tutorial.controls).toEqual({ seen: false });
    expect(fresh.settings.masterVolume).toBe(0.35);
  });

  it("restarting from the prologue has the same clean campaign boundary as New Game", () => {
    const source = createDefaultSave();
    source.completedChapters = ["prologue-rain", "west-corridor-loop", "north-tower-ledger"];
    source.activeCheckpoint.earnedFlags = ["north.evidence.sixth-cup"];
    source.tutorial.controls = { seen: true };
    source.settings.guidanceAssist = false;

    const restarted = restartFromPrologue(source);
    expect(restarted.completedChapters).toEqual([]);
    expect(restarted.unlockedChapters).toEqual(["prologue-rain"]);
    expect(restarted.activeCheckpoint.earnedFlags).toEqual([]);
    expect(restarted.tutorial.controls).toEqual({ seen: false });
    expect(restarted.settings.guidanceAssist).toBe(false);
  });
});
