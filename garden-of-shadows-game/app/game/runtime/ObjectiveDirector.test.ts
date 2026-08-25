import { describe, expect, it } from "vitest";
import { createCheckpoint } from "../campaign-save";
import { westObjectives } from "../manifests/west-onboarding";
import { ObjectiveDirector, resolveActiveObjective } from "./ObjectiveDirector";

describe("ObjectiveDirector", () => {
  it("escalates only after 60, 120 and 180 active seconds", () => {
    const director = new ObjectiveDirector();
    expect(director.tick(59, false, "west-arrival", "follow-lantern")).toBeUndefined();
    expect(director.tick(1, false, "west-arrival", "follow-lantern")).toBe(1);
    expect(director.tick(59, true, "west-arrival", "follow-lantern")).toBeUndefined();
    expect(director.tick(60, false, "west-arrival", "follow-lantern")).toBe(2);
    expect(director.tick(60, false, "west-arrival", "follow-lantern")).toBe(3);
  });

  it("resets timing when a meaningful step changes", () => {
    const director = new ObjectiveDirector();
    director.tick(61, false, "west-waterline", "inspect-wife");
    expect(director.tick(1, false, "west-waterline", "switch-gardener")).toBeUndefined();
  });

  it("resolves the task text and persisted hint", () => {
    const checkpoint = createCheckpoint("west-corridor-loop", "wife");
    checkpoint.activeObjectiveId = "west-waterline";
    checkpoint.objectiveStepId = "inspect-wife";
    checkpoint.hintLevels["west-waterline:inspect-wife"] = 2;
    const active = resolveActiveObjective(westObjectives, checkpoint);
    expect(active?.step.instruction).toBe("在夫人证词中勘验干渠");
    expect(active?.hint).toContain("金色灯影");
  });
});
