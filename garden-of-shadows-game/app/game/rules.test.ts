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

  it("exposes the five reconstruction lenses without a hidden true-ending", () => {
    const base = {
      earnedFlags: [
        "fifth-tingyuxuan.complete",
        "finale.lens.domestic",
        "finale.lens.spatial",
        "finale.lens.documentary",
        "finale.lens.pictorial",
        "finale.lens.composite",
      ],
      contradictions: Array.from({ length: 12 }, (_, index) => `c${index}`),
      nameAnchors: ["birth-name", "stage-name", "mother-voice"],
    };
    expect(availableEndings(campaignManifest, base)).toEqual(["domestic", "spatial", "documentary", "pictorial", "composite"]);
  });

  it("has a resolvable west-corridor puzzle graph", () => {
    const result = validatePuzzleGraph(westCorridorChapter.puzzleGraph.nodes);
    expect(result.valid).toBe(true);
    expect(result.producedFlags).toContain("west.contradiction.loop");
    expect(result.producedFlags).toContain("west.portal.escaped");
    expect(result.producedFlags).not.toContain("west.trust.decided");
  });
});
