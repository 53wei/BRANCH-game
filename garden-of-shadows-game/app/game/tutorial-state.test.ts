import { describe, expect, it } from "vitest";
import { createDefaultSave, createNewGameSave, restartFromPrologue } from "./campaign-save";
import { markTutorialSeen, shouldShowTutorial } from "./tutorial-state";

describe("TASK-024 tutorial boundary", () => {
  it("shows tutorial for a clean campaign and stops after it is acknowledged", () => {
    const fresh = createDefaultSave();
    expect(shouldShowTutorial(fresh)).toBe(true);
    expect(shouldShowTutorial(markTutorialSeen(fresh))).toBe(false);
  });

  it("New Game and Restart both restore first-run tutorial state while preserving settings", () => {
    const current = markTutorialSeen(createDefaultSave());
    current.settings.masterVolume = 0.35;

    const fresh = createNewGameSave(current);
    const restarted = restartFromPrologue(current);

    expect(shouldShowTutorial(fresh)).toBe(true);
    expect(shouldShowTutorial(restarted)).toBe(true);
    expect(fresh.settings.masterVolume).toBe(0.35);
    expect(restarted.settings.masterVolume).toBe(0.35);
  });

  it("Continue preserves an acknowledged tutorial", () => {
    const current = markTutorialSeen(createDefaultSave());
    expect(shouldShowTutorial(current)).toBe(false);
  });
});
