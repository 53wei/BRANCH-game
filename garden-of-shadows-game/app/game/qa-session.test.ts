import { describe, expect, it } from "vitest";
import { createIsolatedQaChapterSave, isQaChapterId, QA_CHAPTERS } from "./qa-session";

const formalSaveKey = "garden-of-shadows.save.v2";

describe("TASK-004 repeatable QA sessions", () => {
  it("recognizes every advertised smoke chapter and rejects arbitrary input", () => {
    for (const [id] of QA_CHAPTERS) expect(isQaChapterId(id)).toBe(true);
    expect(isQaChapterId("../../not-a-chapter")).toBe(false);
  });

  it("builds isolated smoke saves without changing first-run tutorial semantics", () => {
    const west = createIsolatedQaChapterSave("west-corridor-loop");
    expect(west.activeCheckpoint.chapterId).toBe("west-corridor-loop");
    expect(west.activeCheckpoint.anchorId).toBe("ROUTE_02_A_ENTRY");
    expect(west.tutorial.controls).toEqual({ seen: true, autoShow: false });
    expect(west.unlockedChapters).toContain("west-corridor-loop");

    const prologue = createIsolatedQaChapterSave("prologue-rain");
    expect(prologue.activeCheckpoint.anchorId).toBe("ROUTE_01_START");

    const fifth = createIsolatedQaChapterSave("you-did-not-return");
    expect(fifth.activeCheckpoint.memoryId).toBe("zhaoying");
    expect(fifth.activeCheckpoint.anchorId).toBe("ROUTE_04_A_EAST_EXIT");

    const finale = createIsolatedQaChapterSave("fifth-tingyuxuan");
    expect(finale.activeCheckpoint.memoryId).toBe("zhaoying");
    expect(finale.activeCheckpoint.anchorId).toBe("ROUTE_01_START");
  });

  it("keeps the formal storage key out of the pure smoke-save constructor", () => {
    expect(createIsolatedQaChapterSave.toString()).not.toContain(formalSaveKey);
    expect(createIsolatedQaChapterSave.toString()).not.toContain("localStorage");
  });
});
