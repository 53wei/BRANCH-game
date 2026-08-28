import { describe, expect, it } from "vitest";
import { westCorridorChapter } from "../manifests/west-corridor";
import { westObjectives } from "../manifests/west-onboarding";
import { getLayoutAnchor, getLayoutTrigger, interactablePosition, resolveLayoutTriggerDestination } from "./tingyuxuan-layout";

describe("west chapter full-route contract on TingYuXuan", () => {
  it("keeps the playable sequence wired from entrance through both contradictions to the moon-gate escape", () => {
    expect(westObjectives.map((objective) => objective.id)).toEqual([
      "west-arrival",
      "west-waterline",
      "west-loop",
      "west-escape",
    ]);
    expect(westObjectives[0].steps[0].targetPosition).toEqual([...getLayoutAnchor("west-courtyard").position]);
    expect(westObjectives[1].steps[0].targetPosition).toEqual(interactablePosition("waterline-direction"));
    expect(westObjectives[1].steps.at(-1)?.targetPosition).toEqual(interactablePosition("waterline-direction"));
    expect(westObjectives[2].steps[0].targetPosition).toEqual(interactablePosition("corridor-count"));
    expect(westObjectives[2].steps[1].targetPosition).toEqual(interactablePosition("corridor-count"));
    expect(westObjectives[3].steps[0].targetPosition).toEqual(interactablePosition("wife-moon-gate"));
  });

  it("requires two independent testimonies for both contradictions before trust and chase", () => {
    expect(westCorridorChapter.contradictions).toHaveLength(2);
    for (const contradiction of westCorridorChapter.contradictions) {
      expect(contradiction.requiredIndependentTestimonies).toEqual(["wife", "gardener"]);
      expect(contradiction.confirmedByDefault).toBe(false);
    }
    const trust = westCorridorChapter.trustNodes[0];
    expect(trust.prerequisiteFlags).toEqual(["west.contradiction.waterline", "west.contradiction.loop"]);
    expect(westCorridorChapter.chaseSegments[0].triggerFlags).toEqual(["west.trust.decided"]);
  });

  it("keeps gardener looping and wife escaping at the same physical gate without breaking the continuous route", () => {
    const gardenerTrigger = getLayoutTrigger("gardener-corridor-loop");
    const wifeTrigger = getLayoutTrigger("wife-moon-gate-exit");
    expect(gardenerTrigger.destinationAnchorId).toBe("west-courtyard");
    expect(wifeTrigger.destinationAnchorId).toBe("west-safe-courtyard");
    expect(resolveLayoutTriggerDestination("gardener-corridor-loop", "gardener", { x: 2, y: 1.2, z: -20.25 })?.id).toBe("west-courtyard");
    expect(resolveLayoutTriggerDestination("wife-moon-gate-exit", "wife", { x: 2, y: 1.2, z: -21.75 })?.id).toBe("west-safe-courtyard");
    expect(westCorridorChapter.chaseSegments[0].startAnchor).toBe("loop-seventh-window");
    expect(westCorridorChapter.chaseSegments[0].safeAnchor).toBe("wife-moon-gate");
  });
});
