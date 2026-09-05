import { describe, expect, it } from "vitest";
import { northObjectives } from "../manifests/north-tower-objectives";
import { westObjectives } from "../manifests/west-onboarding";
import { getGameplayAnchor } from "./tingyuxuan-gameplay-map";
import { getLayoutTrigger, interactablePosition } from "./tingyuxuan-layout";
import { resolveObjectiveStepPosition } from "./objective-target";

describe("TASK-022 objective target single source", () => {
  it("resolves trigger, interactable and anchor targets from their canonical world definitions", () => {
    const westArrival = westObjectives[0].steps[0];
    const westWall = westObjectives[1].steps[0];
    const northCup = northObjectives[0].steps[0];

    expect(resolveObjectiveStepPosition(westArrival)).toEqual(getLayoutTrigger("front-hall-to-west").center);
    expect(resolveObjectiveStepPosition(westWall)).toEqual(interactablePosition("waterline-direction"));
    expect(resolveObjectiveStepPosition(northCup)).toEqual(getGameplayAnchor("B_TEA_TABLE").position);
  });

  it("keeps non-spatial instruction steps targetless", () => {
    expect(resolveObjectiveStepPosition(westObjectives[1].steps[1])).toBeUndefined();
  });
});
