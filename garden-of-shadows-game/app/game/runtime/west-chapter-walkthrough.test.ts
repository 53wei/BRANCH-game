import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { westCorridorChapter } from "../manifests/west-corridor";
import { westObjectives } from "../manifests/west-onboarding";
import { resolveObjectiveStepPosition } from "./objective-target";
import { getLayoutAnchor, getLayoutTrigger, interactablePosition, resolveLayoutTriggerDestination } from "./tingyuxuan-layout";
import { CH1_ANCHOR_TARGET, CH1_BORROW_SOURCE, CH1_REWARD_POINTS } from "./vertical-slice-content";

describe("west chapter V5 route contract on TingYuXuan", () => {
  it("keeps the playable sequence on evidence -> loop -> borrowed stepping stone -> footprint", () => {
    expect(westObjectives.map((objective) => objective.id)).toEqual([
      "west-arrival",
      "west-waterline",
      "west-loop",
    ]);
    expect(resolveObjectiveStepPosition(westObjectives[0].steps[0])).toEqual([...getLayoutTrigger("front-hall-to-west").center]);
    expect(resolveObjectiveStepPosition(westObjectives[1].steps[0])).toEqual(interactablePosition("waterline-direction"));
    expect(resolveObjectiveStepPosition(westObjectives[1].steps.at(-1)!)).toEqual(interactablePosition("waterline-direction"));
    expect(resolveObjectiveStepPosition(westObjectives[2].steps[0])).toEqual(interactablePosition("corridor-count"));
    expect(resolveObjectiveStepPosition(westObjectives[2].steps[1])).toEqual(interactablePosition("corridor-count"));
    expect(interactablePosition("corridor-count")).toEqual([...getLayoutAnchor("front-hall").position]);
    expect(interactablePosition("corridor-count")).not.toEqual([...getLayoutTrigger("gardener-corridor-loop").center]);

    expect(CH1_BORROW_SOURCE.id).toBe("wife-threshold-stone");
    expect(CH1_ANCHOR_TARGET.id).toBe("loop-break-anchor");
    expect(CH1_REWARD_POINTS.map((item) => item.id)).toEqual(["wet-footprint"]);
  });

  it("requires two independent versions and contains no retired faceless chase", () => {
    expect(westCorridorChapter.contradictions).toHaveLength(2);
    for (const contradiction of westCorridorChapter.contradictions) {
      expect(contradiction.requiredIndependentTestimonies).toEqual(["wife", "gardener"]);
      expect(contradiction.confirmedByDefault).toBe(false);
    }
    expect(westCorridorChapter.trustNodes).toEqual([]);
    expect(westCorridorChapter.chaseSegments).toEqual([]);
    expect(JSON.stringify(westCorridorChapter)).not.toContain("没有脸");
  });

  it("keeps the gardener-side loop as the physical contradiction without turning it into an escape chase", () => {
    const gardenerTrigger = getLayoutTrigger("gardener-corridor-loop");
    expect(gardenerTrigger.destinationAnchorId).toBe("A_BASELINE");
    expect(resolveLayoutTriggerDestination("gardener-corridor-loop", "gardener", { x: 1.8, y: 1.2, z: 41.2 })?.id).toBe("A_BASELINE");

    const invertNode = westCorridorChapter.puzzleGraph.nodes.find((node) => node.id === "invert-loop");
    expect(invertNode?.outputFlags).toContain("west.borrow-anchor.solved");
    expect(invertNode?.interaction).toContain("青石");
  });

  it("cannot inspect the loop before returning or borrow the wife's stone from the wrong cognition", () => {
    const runtime = readFileSync(join(process.cwd(), "app", "game", "GameRuntime.tsx"), "utf8");
    expect(runtime).toContain('!current.earnedFlags.includes("west.loop-return.seen")');
    expect(runtime).toContain('"west.loop-return.seen"');
    expect(runtime).toMatch(/memoryId === "gardener"[\s\S]{0,180}earnedFlags\.includes\("west\.borrowed-view\.ready"\)/);
    expect(runtime).toContain("resolveChapterOneObjectivePosition(checkpointRef.current, objective)");
  });
});
