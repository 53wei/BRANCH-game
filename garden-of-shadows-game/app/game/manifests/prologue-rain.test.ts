import { describe, expect, it } from "vitest";
import { prologueRainChapter } from "./prologue-rain";

describe("story-first prologue", () => {
  it("is a standalone playable chapter on ROUTE_01 and hands off to chapter one", () => {
    expect(prologueRainChapter.status).toBe("playable");
    expect(prologueRainChapter.spawnAnchor).toBe("ROUTE_01_START");
    expect(prologueRainChapter.completionFlags).toEqual(expect.arrayContaining([
      "prologue.complete",
      "prologue.dialogue.complete",
      "prologue.examiner-appointed",
    ]));
  });

  it("teaches investigation after physical traces instead of using the old tutorial opening", () => {
    expect(prologueRainChapter.puzzleGraph.nodes.map((node) => node.id)).toEqual([
      "prologue-traces",
      "prologue-entry-rule",
    ]);
    expect(prologueRainChapter.memories.map((memory) => memory.id)).toEqual(["baseline"]);
  });
});
