import { afterEach, describe, expect, it } from "vitest";
import { frontHallChapter } from "../manifests/front-hall-guest";
import { FrontHallScene } from "./FrontHallScene";

describe("front hall fourfold route", () => {
  let scene: FrontHallScene | undefined;
  afterEach(() => { scene?.dispose(); scene = undefined; });

  it("exposes each testimony mark only in its matching memory", () => {
    scene = new FrontHallScene(frontHallChapter.memories, "low");
    const base = ["front.mark.painter", "front.contradiction.painted-door", "front.contradiction.vanishing-corridor"];
    expect(scene.availableInteractables("wife", base).map((item) => item.id)).toContain("wife-jade");
    expect(scene.availableInteractables("gardener", base).map((item) => item.id)).toContain("gardener-shears");
    expect(scene.availableInteractables("accountant", base).map((item) => item.id)).toContain("accountant-page");
    expect(scene.availableInteractables("painter", []).map((item) => item.id)).toContain("painter-easel");
  });

  it("keeps the fourfold lock unavailable until all four marks exist", () => {
    scene = new FrontHallScene(frontHallChapter.memories, "low");
    expect(scene.availableInteractables("painter", ["front.mark.painter"]).map((item) => item.id)).not.toContain("fourfold-lock");
    expect(scene.availableInteractables("painter", ["front.contradiction.painted-door", "front.contradiction.vanishing-corridor", "front.mark.painter", "front.mark.wife", "front.mark.gardener", "front.mark.accountant"]).map((item) => item.id)).toContain("fourfold-lock");
  });

  it("turns the painter corridor into a one-way topology after crossing", () => {
    scene = new FrontHallScene(frontHallChapter.memories, "low");
    const trapped = { x: 0, y: 1.65, z: -6.8 };
    scene.constrain(trapped as never, "painter", -8.2);
    expect(trapped.z).toBeCloseTo(-7.08);
    const restored = { x: 0, y: 1.65, z: -6.8 };
    scene.constrain(restored as never, "wife", -8.2);
    expect(restored.z).toBeCloseTo(-6.8);
  });

  it("makes the front hall slow and the courtyard fast", () => {
    scene = new FrontHallScene(frontHallChapter.memories, "low");
    expect(scene.movementScale({ x: 0, y: 1.65, z: 4 } as never, "painter")).toBeLessThan(1);
    expect(scene.movementScale({ x: 0, y: 1.65, z: -12 } as never, "painter")).toBeGreaterThan(1);
  });
});
