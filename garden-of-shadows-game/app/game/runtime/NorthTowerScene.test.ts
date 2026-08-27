import { afterEach, describe, expect, it } from "vitest";
import { northTowerChapter } from "../manifests/north-tower-ledger";
import { NorthTowerScene } from "./NorthTowerScene";

describe("north tower playable route", () => {
  let scene: NorthTowerScene | undefined;

  afterEach(() => {
    scene?.dispose();
    scene = undefined;
  });

  it("exposes each interaction required by the chapter route", () => {
    scene = new NorthTowerScene(northTowerChapter.memories, "low");

    expect(scene.availableInteractables("accountant", "present", "lower", false).map((item) => item.id)).toContain("north-stairs");
    expect(scene.availableInteractables("accountant", "present", "upper", false).map((item) => item.id)).toContain("borrowed-window");
    expect(scene.availableInteractables("accountant", "past", "courtyard", false).map((item) => item.id)).toEqual(expect.arrayContaining(["borrowed-window-return", "past-rockery"]));
    expect(scene.availableInteractables("accountant", "present", "courtyard", true).map((item) => item.id)).toEqual(expect.arrayContaining(["window-scratches", "secret-passage"]));
  });

  it("uses the intended independent testimony pair for each clue", () => {
    scene = new NorthTowerScene(northTowerChapter.memories, "low");

    expect(scene.availableInteractables("wife", "present", "courtyard", true).map((item) => item.id)).toContain("window-scratches");
    expect(scene.availableInteractables("wife", "present", "courtyard", true).map((item) => item.id)).not.toContain("secret-passage");
    expect(scene.availableInteractables("gardener", "present", "courtyard", true).map((item) => item.id)).toContain("secret-passage");
  });
});
