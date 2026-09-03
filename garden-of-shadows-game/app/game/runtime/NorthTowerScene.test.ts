import { afterEach, describe, expect, it } from "vitest";
import { northTowerChapter } from "../manifests/north-tower-ledger";
import { NorthTowerScene } from "./NorthTowerScene";

describe("chapter 02 evidence whitebox", () => {
  let scene: NorthTowerScene | undefined;

  afterEach(() => {
    scene?.dispose();
    scene = undefined;
  });

  it("gates the evidence route by chapter progress and cognition", () => {
    scene = new NorthTowerScene(northTowerChapter.memories, "low");

    expect(scene.availableInteractables("wife", "lower", [], false).map((item) => item.id)).toContain("sixth-teacup");
    expect(scene.availableInteractables("wife", "lower", ["north.evidence.sixth-cup"], false).map((item) => item.id)).toContain("north-stairs");

    const upperFlags = ["north.evidence.sixth-cup", "north.reached.upper-floor"];
    expect(scene.availableInteractables("accountant", "upper", upperFlags, false).map((item) => item.id)).toContain("departure-record");
    expect(scene.availableInteractables("wife", "upper", upperFlags, false).map((item) => item.id)).not.toContain("departure-record");
  });

  it("requires the painter cognition and aligned view for the image channel", () => {
    scene = new NorthTowerScene(northTowerChapter.memories, "low");
    const flags = ["north.evidence.sixth-cup", "north.reached.upper-floor", "north.evidence.departure-record"];

    expect(scene.availableInteractables("painter", "upper", flags, false).map((item) => item.id)).not.toContain("artist-viewpoint");
    expect(scene.availableInteractables("accountant", "upper", flags, true).map((item) => item.id)).not.toContain("artist-viewpoint");
    expect(scene.availableInteractables("painter", "upper", flags, true).map((item) => item.id)).toContain("artist-viewpoint");
  });

  it("only exposes the synthesis board after all three evidence channels", () => {
    scene = new NorthTowerScene(northTowerChapter.memories, "low");
    const completeEvidence = [
      "north.evidence.sixth-cup",
      "north.reached.upper-floor",
      "north.evidence.departure-record",
      "north.evidence.rain-figure",
    ];
    expect(scene.availableInteractables("wife", "upper", completeEvidence, false).map((item) => item.id)).toContain("fifth-person-board");
  });
});
