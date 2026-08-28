import { afterEach, describe, expect, it } from "vitest";
import { sealedPavilionChapter } from "../manifests/sealed-pavilion";
import { SealedPavilionScene } from "./SealedPavilionScene";

describe("sealed pavilion four-testimony scene", () => {
  let scene: SealedPavilionScene | undefined;
  afterEach(() => { scene?.dispose(); scene = undefined; });

  it("shows each claimed entrance only in its matching testimony", () => {
    scene = new SealedPavilionScene(sealedPavilionChapter.memories, "low");
    const flags = ["pavilion.door.confirmed"];
    expect(scene.availableInteractables("wife", flags).map((item) => item.id)).toContain("wife-entry");
    expect(scene.availableInteractables("gardener", flags).map((item) => item.id)).toContain("gardener-entry");
    expect(scene.availableInteractables("accountant", flags).map((item) => item.id)).toContain("accountant-entry");
    expect(scene.availableInteractables("painter", flags).map((item) => item.id)).toContain("painter-entry");
  });

  it("keeps the memory threshold locked until two routes are verified", () => {
    scene = new SealedPavilionScene(sealedPavilionChapter.memories, "low");
    expect(scene.availableInteractables("wife", ["pavilion.door.confirmed", "pavilion.route.wife"]).map((item) => item.id)).not.toContain("memory-threshold");
    expect(scene.availableInteractables("wife", ["pavilion.door.confirmed", "pavilion.route.wife", "pavilion.route.gardener", "pavilion.routes.ready"]).map((item) => item.id)).toContain("memory-threshold");
  });

  it("allows one body observation per testimony after entry", () => {
    scene = new SealedPavilionScene(sealedPavilionChapter.memories, "low");
    const entered = ["pavilion.entered"];
    expect(scene.availableInteractables("wife", entered).map((item) => item.id)).toContain("body-scene");
    expect(scene.availableInteractables("wife", [...entered, "pavilion.body.wife"]).map((item) => item.id)).not.toContain("body-scene");
    expect(scene.availableInteractables("gardener", [...entered, "pavilion.body.wife"]).map((item) => item.id)).toContain("body-scene");
  });

  it("unlocks the final reconstruction only after all causal evidence", () => {
    scene = new SealedPavilionScene(sealedPavilionChapter.memories, "low");
    const partial = ["pavilion.entered", "pavilion.evidence.inner-bolt", "pavilion.evidence.reverse-water"];
    expect(scene.availableInteractables("painter", partial).map((item) => item.id)).not.toContain("final-reconstruction");
    expect(scene.availableInteractables("painter", [...partial, "pavilion.evidence.vanished-exit"]).map((item) => item.id)).toContain("final-reconstruction");
  });
});
