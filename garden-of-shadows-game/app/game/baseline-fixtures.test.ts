import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeSave } from "./campaign-save";

const fixture = (name: string) => JSON.parse(readFileSync(join(process.cwd(), "docs", "restructure", "baseline", name), "utf8"));

describe("TASK-001 baseline save fixtures", () => {
  it("keeps the empty fixture as a real first-run campaign", () => {
    const save = normalizeSave(fixture("empty-new-game.json"));
    expect(save.activeCheckpoint.chapterId).toBe("prologue-rain");
    expect(save.activeCheckpoint.anchorId).toBe("ROUTE_01_START");
    expect(save.completedChapters).toEqual([]);
    expect(save.unlockedChapters).toEqual(["prologue-rain"]);
    expect(save.tutorial.controls).toEqual({ seen: false });
  });

  it("keeps the midpoint fixture inside chapter one without silently completing it", () => {
    const save = normalizeSave(fixture("west-midpoint.json"));
    expect(save.activeCheckpoint.chapterId).toBe("west-corridor-loop");
    expect(save.activeCheckpoint.layoutVersion).toBe("tingyuxuan-gameplay-map-v1");
    expect(save.activeCheckpoint.memoryId).toBe("wife");
    expect(save.activeCheckpoint.activeObjectiveId).toBe("west-waterline");
    expect(save.activeCheckpoint.objectiveStepId).toBe("inspect-wife");
    expect(save.completedChapters).toContain("prologue-rain");
    expect(save.completedChapters).not.toContain("west-corridor-loop");
    expect(save.unlockedChapters).toContain("west-corridor-loop");
  });
});
