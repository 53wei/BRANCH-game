import { afterEach, describe, expect, it } from "vitest";
import { frontHallChapter } from "../manifests/front-hall-guest";
import { FrontHallScene } from "./FrontHallScene";

describe("front hall fourfold route", () => {
  let scene: FrontHallScene | undefined;
  afterEach(() => { scene?.dispose(); scene = undefined; });

  it("exposes each testimony mark only in its matching memory", () => {
    scene = new FrontHallScene(frontHallChapter.memories, "low");
    const base = ["front.mark.painter"];
    expect(scene.availableInteractables("wife", base).map((item) => item.id)).toContain("wife-jade");
    expect(scene.availableInteractables("gardener", base).map((item) => item.id)).toContain("gardener-shears");
    expect(scene.availableInteractables("accountant", base).map((item) => item.id)).toContain("accountant-page");
    expect(scene.availableInteractables("painter", []).map((item) => item.id)).toContain("painter-easel");
  });

  it("keeps the fourfold lock unavailable until all four marks exist", () => {
    scene = new FrontHallScene(frontHallChapter.memories, "low");
    expect(scene.availableInteractables("painter", ["front.mark.painter"]).map((item) => item.id)).not.toContain("fourfold-lock");
    expect(scene.availableInteractables("painter", ["front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"]).map((item) => item.id)).toContain("fourfold-lock");
  });
});
