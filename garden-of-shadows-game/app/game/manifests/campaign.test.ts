import { describe, expect, it } from "vitest";
import assetManifest from "../../../docs/assets/asset-manifest.json";
import { campaignManifest } from "./campaign";

describe("campaign manifest", () => {
  it("contains the final prologue, four chapters and finale structure", () => {
    expect(campaignManifest.chapters).toHaveLength(6);
    expect(campaignManifest.chapterOrder).toEqual(campaignManifest.chapters.map((chapter) => chapter.id));
    expect(new Set(campaignManifest.chapterOrder).size).toBe(6);
    expect(campaignManifest.chapters.map((chapter) => chapter.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("marks the first three chapter prototypes as playable", () => {
    expect(campaignManifest.chapters.filter((chapter) => chapter.status === "playable").map((chapter) => chapter.id)).toEqual(["west-corridor-loop", "north-tower-ledger", "front-hall-guest"]);
  });

  it("does not ship an approved asset without release metadata", () => {
    const approved = assetManifest.filter((asset) => asset.status === "approved");
    expect(approved.length).toBeGreaterThan(0);
    for (const asset of approved) {
      expect(asset.sourceUrl).toBeTruthy();
      expect(asset.license).toBeTruthy();
      expect(asset.webDistribution).toBe("allowed");
      expect(asset.integritySha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });
});
