import { describe, expect, it } from "vitest";
import { campaignManifest } from "./manifests/campaign";
import { westCorridorChapter } from "./manifests/west-corridor";
import { availableEndings, confirmContradiction, validatePuzzleGraph } from "./rules";

describe("narrative rules", () => {
  it("requires two independent testimonies for a spatial contradiction", () => {
    const waterline = westCorridorChapter.contradictions[0];
    expect(confirmContradiction(waterline, ["wife"])).toBe(false);
    expect(confirmContradiction(waterline, ["wife", "wife"])).toBe(false);
    expect(confirmContradiction(waterline, ["wife", "gardener"])).toBe(true);
  });

  it("keeps the hidden ending behind every contradiction and name anchor", () => {
    const base = {
      earnedFlags: ["case.unique-causal-chain", "ritual.score-found"],
      contradictions: Array.from({ length: 12 }, (_, index) => `c${index}`),
      nameAnchors: ["birth-name", "stage-name", "mother-voice"],
    };
    expect(availableEndings(campaignManifest, base)).not.toContain("river-lantern");
    expect(availableEndings(campaignManifest, { ...base, nameAnchors: [...base.nameAnchors, "self-written-name"] })).toContain("river-lantern");
  });

  it("has a resolvable west-corridor puzzle graph", () => {
    const result = validatePuzzleGraph(westCorridorChapter.puzzleGraph.nodes);
    expect(result.valid).toBe(true);
    expect(result.producedFlags).toContain("west.trust.decided");
  });
});
