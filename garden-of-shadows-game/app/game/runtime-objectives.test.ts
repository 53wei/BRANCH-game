import { describe, expect, it } from "vitest";
import { createCheckpoint } from "./campaign-save";
import { objectiveFor as frontObjectiveFor } from "./FrontHallRuntime";
import { objectiveFor as northObjectiveFor } from "./NorthTowerRuntime";
import { objectiveFor as pavilionObjectiveFor } from "./SealedPavilionRuntime";

const northPreludeFlags = [
  "north.rockery.baseline-observed",
  "north.rockery.loop-observed",
  "north.borrowed-view.previewed",
  "north.borrowed.stone",
  "north.anchor.learned",
  "north.rockery-route.complete",
];

describe("runtime objective guidance", () => {
  it("keeps the north-tower trust decision anchored to the secret passage", () => {
    const checkpoint = createCheckpoint("north-tower-ledger", "accountant");
    checkpoint.earnedFlags = [
      ...northPreludeFlags,
      "north.reached.upper-floor",
      "north.ledger.inspected",
      "north.window.inspected",
      "north.borrowed-view.crossed",
      "north.past.trail-inspected",
      "north.rockery.moved",
      "north.present.route-open",
      "north.contradiction.scratches",
      "north.contradiction.passage",
    ];

    expect(northObjectiveFor(checkpoint)).toMatchObject({
      targetId: "secret-passage",
      timeline: "present",
      zone: "courtyard",
    });
  });

  it("guides the second north-tower observation to the other testimony", () => {
    const checkpoint = createCheckpoint("north-tower-ledger", "accountant");
    checkpoint.earnedFlags = [
      ...northPreludeFlags,
      "north.reached.upper-floor",
      "north.ledger.inspected",
      "north.window.inspected",
      "north.borrowed-view.crossed",
      "north.past.trail-inspected",
      "north.rockery.moved",
      "north.present.route-open",
    ];
    checkpoint.observedBy["window-scratches"] = ["accountant"];

    expect(northObjectiveFor(checkpoint)).toMatchObject({
      targetId: "window-scratches",
      memoryId: "wife",
    });
  });

  it("guides a fresh chapter two save through borrow and anchor before the tower", () => {
    const checkpoint = createCheckpoint("north-tower-ledger", "accountant");
    checkpoint.earnedFlags = ["north.rockery.baseline-observed", "north.rockery.loop-observed", "north.borrowed-view.previewed", "north.borrowed.stone"];

    expect(northObjectiveFor(checkpoint)).toMatchObject({
      targetId: "anchor-stone",
      zone: "rockery-route",
    });
  });

  it("guides front-hall cross-checks to the required second testimony", () => {
    const checkpoint = createCheckpoint("front-hall-guest", "painter");
    checkpoint.earnedFlags = ["front.mark.painter"];
    checkpoint.observedBy["painted-door"] = ["painter"];

    expect(frontObjectiveFor(checkpoint)).toMatchObject({
      targetId: "painted-door",
      memoryId: "accountant",
    });
  });

  it("guides the pavilion body comparison through all four testimonies", () => {
    const checkpoint = createCheckpoint("sealed-pavilion", "wife");
    checkpoint.earnedFlags = ["pavilion.door.confirmed", "pavilion.routes.ready", "pavilion.entered", "pavilion.body.wife", "pavilion.body.gardener"];

    expect(pavilionObjectiveFor(checkpoint)).toMatchObject({
      targetId: "body-scene",
      memoryId: "accountant",
    });
  });
});
