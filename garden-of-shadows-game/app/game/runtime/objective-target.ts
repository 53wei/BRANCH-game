import type { ObjectiveTargetRef, TutorialStep } from "../types";
import { getGameplayAnchor } from "./tingyuxuan-gameplay-map";
import { getLayoutTrigger, interactablePosition } from "./tingyuxuan-layout";

export type ObjectiveWorldPosition = readonly [number, number, number];

const asTuple = (value: readonly [number, number, number]): ObjectiveWorldPosition => [value[0], value[1], value[2]];

export const resolveObjectiveTargetRef = (target: ObjectiveTargetRef): ObjectiveWorldPosition => {
  if (target.kind === "anchor") return asTuple(getGameplayAnchor(target.id as Parameters<typeof getGameplayAnchor>[0]).position);
  if (target.kind === "interactable") return asTuple(interactablePosition(target.id as Parameters<typeof interactablePosition>[0]));
  return asTuple(getLayoutTrigger(target.id).center);
};

export const resolveObjectiveStepPosition = (step: TutorialStep): ObjectiveWorldPosition | undefined =>
  step.targetRef ? resolveObjectiveTargetRef(step.targetRef) : undefined;
