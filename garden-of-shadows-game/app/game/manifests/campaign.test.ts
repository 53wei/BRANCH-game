import { describe, expect, it } from "vitest";
import assetManifest from "../../../docs/assets/asset-manifest.json";
import { campaignManifest } from "./campaign";

describe("campaign manifest", () => {
  it("matches the V5.0 Master-map prologue + five chapters + finale structure", () => {
    expect(campaignManifest.chapters).toHaveLength(7);
    expect(campaignManifest.chapterOrder).toEqual([
      "prologue-rain",
      "west-corridor-loop",
      "north-tower-ledger",
      "missing-room",
      "deleted-person",
      "you-did-not-return",
      "fifth-tingyuxuan",
    ]);
    expect(new Set(campaignManifest.chapterOrder).size).toBe(7);
    expect(campaignManifest.chapters.map((chapter) => chapter.index)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(campaignManifest.chapters.map((chapter) => chapter.title)).toEqual([
      "序章·回园",
      "第一章·不存在的路",
      "第二章·多出来的人",
      "第三章·不存在的房间",
      "第四章·被删掉的人",
      "第五章·今晚你没回来",
      "终章·第五种听雨轩",
    ]);
  });

  it("ships all seven chapters as playable routes", () => {
    expect(campaignManifest.chapters.every((chapter) => chapter.status === "playable")).toBe(true);
  });

  it("uses the five V5 ending names while keeping one shared fact set", () => {
    expect(Object.keys(campaignManifest.endingRules)).toEqual(["domestic", "spatial", "documentary", "pictorial", "composite"]);
    expect(Object.values(campaignManifest.endingRules).map((rule) => rule.title)).toEqual(["家还记得你", "路还在", "纸上有你", "画外之人", "第五种听雨轩"]);
    expect(campaignManifest.endingRules.composite.description).not.toContain("True Ending");
    for (const [id, rule] of Object.entries(campaignManifest.endingRules)) {
      expect(rule.requiredFlags).toContain("fifth-tingyuxuan.complete");
      expect(rule.requiredFlags).toContain(`finale.lens.${id}`);
    }
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
