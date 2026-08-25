import { describe, expect, it } from "vitest";
import assetManifest from "../../../docs/assets/asset-manifest.json";
import { campaignManifest } from "./campaign";

describe("campaign manifest", () => {
  it("contains prologue plus eight ordered chapters", () => {
    expect(campaignManifest.chapters).toHaveLength(9);
    expect(campaignManifest.chapterOrder).toEqual(campaignManifest.chapters.map((chapter) => chapter.id));
    expect(new Set(campaignManifest.chapterOrder).size).toBe(9);
    expect(campaignManifest.chapters.map((chapter) => chapter.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("only marks the implemented vertical slice as playable", () => {
    expect(campaignManifest.chapters.filter((chapter) => chapter.status === "playable").map((chapter) => chapter.id)).toEqual(["west-corridor-loop"]);
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
