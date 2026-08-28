import { describe, expect, it } from "vitest";
import { northTowerChapter } from "./north-tower-ledger";

describe("north tower chapter", () => {
  it("contains the complete borrowed-view causal chain", () => {
    expect(northTowerChapter.memories.map((memory) => memory.id)).toEqual(["accountant", "wife", "gardener"]);
    expect(northTowerChapter.puzzleGraph.nodes.map((node) => node.id)).toEqual([
      "remember-rockery-baseline",
      "borrow-and-anchor",
      "reach-upper-floor",
      "cross-borrowed-window",
      "move-past-rockery",
      "cross-check-evidence",
      "north-trust",
    ]);
    expect(northTowerChapter.completionFlags).toContain("north.chapter.complete");
  });

  it("requires two memories for each contradiction", () => {
    expect(northTowerChapter.contradictions).toHaveLength(2);
    for (const contradiction of northTowerChapter.contradictions) {
      expect(contradiction.requiredIndependentTestimonies).toHaveLength(2);
    }
  });

  it("offers the three GDD trust outcomes", () => {
    const trust = northTowerChapter.trustNodes[0];
    expect(trust.options.map((option) => option.id)).toEqual(["accountant", "gardener", "wife"]);
    expect(trust.prerequisiteFlags).toEqual(["north.contradiction.scratches", "north.contradiction.passage"]);
  });
});
