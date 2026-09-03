import { describe, expect, it } from "vitest";
import { northTowerChapter } from "./north-tower-ledger";

describe("chapter 02: fifth person evidence", () => {
  it("uses domestic, documentary and pictorial cognition dimensions", () => {
    expect(northTowerChapter.memories.map((memory) => memory.id)).toEqual(["wife", "accountant", "painter"]);
  });

  it("contains the V4.1 three-channel fifth-person causal chain", () => {
    expect(northTowerChapter.puzzleGraph.nodes.map((node) => node.id)).toEqual([
      "sixth-used-cup",
      "modified-departure-record",
      "framed-rain-figure",
      "fifth-person-gate",
    ]);
    expect(northTowerChapter.puzzleGraph.nodes.at(-1)?.prerequisites).toEqual([
      "north.evidence.sixth-cup",
      "north.evidence.departure-record",
      "north.evidence.rain-figure",
    ]);
    expect(northTowerChapter.completionFlags).toContain("north.fifth-person.confirmed");
  });

  it("runs chapter 02 inside the final Master Scene B zone", () => {
    expect(northTowerChapter.spawnAnchor).toBe("ROUTE_05_B_MAIN_COURT");
    expect(northTowerChapter.assetPack.preload).toContain("/assets/fidelity/TYX_Master_Scene.glb");
    expect(northTowerChapter.assetPack.deferred).toEqual([]);
    expect(northTowerChapter.completionFlags).toContain("campaign.route.b-investigation-complete");
  });

  it("does not restore the deprecated Trust, time-travel or separate North Tower whitebox route", () => {
    expect(northTowerChapter.trustNodes).toEqual([]);
    expect(northTowerChapter.chaseSegments).toEqual([]);
    expect(northTowerChapter.puzzleGraph.nodes.flatMap((node) => [node.id, node.interaction].join(" ")).join(" ")).not.toMatch(/trust|过去移动假山|时间穿越|二层账房/i);
  });
});
