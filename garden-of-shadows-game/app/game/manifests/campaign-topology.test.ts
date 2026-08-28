import { describe, expect, it } from "vitest";
import { campaignRoutes } from "./campaign-topology";
import { tingYuXuanLayout } from "../runtime/tingyuxuan-layout";

describe("campaign topology", () => {
  it("connects every playable chapter to the next chapter without a detached map", () => {
    for (let index = 0; index < campaignRoutes.length - 1; index += 1) {
      expect(campaignRoutes[index].nextChapterId).toBe(campaignRoutes[index + 1].chapterId);
    }
  });

  it("routes chapter two through the rockery and north tower", () => {
    const route = campaignRoutes.find((item) => item.chapterId === "north-tower-ledger");
    expect(route).toMatchObject({
      entryAnchorId: "rockery-side-route",
      transitionAnchorIds: ["north-tower-entry", "north-court"],
      exitAnchorId: "front-hall",
    });
  });

  it("uses only anchors declared by the shared TingYuXuan topology", () => {
    const declared = new Set(tingYuXuanLayout.anchors.map((anchor) => anchor.id));
    for (const route of campaignRoutes) {
      expect(declared.has(route.entryAnchorId), `${route.chapterId} entry`).toBe(true);
      expect(declared.has(route.exitAnchorId), `${route.chapterId} exit`).toBe(true);
      for (const anchorId of route.transitionAnchorIds) expect(declared.has(anchorId), `${route.chapterId} transition ${anchorId}`).toBe(true);
    }
  });
});
